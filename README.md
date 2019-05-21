# Course C Materials

## Prerequisites

### Machine to run dashboard and go-ipfs

TODO

### Dedicated Wifi

TODO

### Configration

#### js-ipfs-http-client

TODO

#### js-ipfs

- customize bootstrap nodes and add one from LAN
- (optional) add ws-star?

#### go-ipfs configuration

- `ipfs config`
  - Remove friction by lifting CORS restrictions on API port: add `*` to `API.HTTPHeaders.Access-Control-Allow-Origin`
  - Enable Websockets transport: add `/ip4/0.0.0.0/tcp/4042/ws` to `Addresses.Swarm`
     - This enables us to use mentioned node as a bootstrap
