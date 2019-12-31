// truffle.js config for klaytn.
const PrivateKeyConnector = require('connect-privkey-to-provider')
const NETWORK_ID = '1001'
const GASLIMIT = '90000000'
const URL = 'https://api.baobab.klaytn.net:8651'
const PRIVATE_KEY = '0xf6553a54a67da702baf4fd8a4dd66c3dd6cd49423eba3b33096925bed00f4b46' 

module.exports = {

    networks: {
        klaytn: {
            provider: new PrivateKeyConnector(PRIVATE_KEY, URL),
            network_id: NETWORK_ID,
            gas: GASLIMIT,
            gasPrice: null,

        }
    },

}