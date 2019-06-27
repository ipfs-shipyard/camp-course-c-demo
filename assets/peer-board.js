
  import { html, Component, render } from 'https://unpkg.com/htm@2.1.1/preact/standalone.mjs';

  async function jsonFromIPNS(id, addr) {
    try {
      // ideally: const result = await ipfs.cat(`/ipns/${id}`)
      const result = await ipfs.name.resolve(`/ipns/${id}`)
      if (result) {
        const json = await ipfs.cat(result)
        const data = JSON.parse(json.toString())
        return {
          id,
          addr,
          name: data.name,
          avatar: data.avatar ? await ipfs.cat(data.avatar) : null,
          about: data.about,
          ipns: true
        }
      }
    } catch (err) {
      return {
        id,
        addr
      }
    }
  }

  async function refreshSelf() {
    const { id, addresses } = await ipfs.id()
    const addr = addresses.find(addr => addr.includes(`/p2p-circuit/ipfs/${id}`) )
    const json = await jsonFromIPNS(id, addr)
    return json
  }

  async function refreshPeers() {
    if (!ipfs || (ipfs.isOnline && !ipfs.isOnline())) return []
    try {
      const peerInfos = await ipfs.swarm.peers()
      const peers = await Promise.all(peerInfos.map(info => jsonFromIPNS(info.peer.toJSON().id, info.addr.toString())))
      return [await refreshSelf(), ...peers]
    } catch (err) {
      console.log(`Problem while refreshing peers: ${err}`)
      return []
    }
  }

  class PeerDashboard extends Component {

    async componentDidMount() {
      const refreshData = async () => {
        const peers = await refreshPeers()
        this.setState({ peers })
      }
      refreshData()
      this.timer = setInterval(refreshData, 3000)
    }

    componentWillUnmount() {
      clearInterval(this.timer)
    }

    render({ }, { peers = [] }) {
      const peerCard = ({ id, name, avatar, addr, about, ipns }) => {
        const avatarUrl = avatar
          ? `data:image/*;base64,${avatar.toString('base64')}`
          : `https://proxy.duckduckgo.com/iu/?u=https://robohash.org/${id}.png?set=set4`
        const avatarStyle = avatar
          ? `background-image: url('${avatarUrl}');`
          : `background: no-repeat center/80% url('${avatarUrl}');`
        const cardStyle = `col peerCard ${ipns ? 'peerWithIpnsManifest' : ''}`
        return html`<div class="${cardStyle}"  title="${addr || id}">
            <div style="${avatarStyle}" class="peerAvatar"></div>
            <div class="peerDetails">
              <h1 title="${name || id}">${name || id}</h1>
              <p title="${about || '(no about)'}">${about || 'No info yet'}</p>
            </div>
          </div>`
      }
      if (!ipfs) return html`<h2>Initialize <code>ipfs</code> first :-)</h2>`
      return html`
      <section id="peerBoard" class="grid">
        ${peers.length ? '' : html`<h2>Waiting for peer discovery..</h2>`}
        ${peers.map(peerCard)}
      </section>`
    }
  }

  render(html`<${PeerDashboard} />`, document.getElementById('peerBoard-container'))
