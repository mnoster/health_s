const web3 = require('web3')

module.exports = function (address) {
  return web3.utils.isAddress(address)
}
