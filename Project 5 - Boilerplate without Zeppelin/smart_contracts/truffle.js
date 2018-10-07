/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */
var HDWalletProvider = require("truffle-hdwallet-provider"); 
//var mnemonic = "reveal warm asset wet imitate dizzy misery off subway ginger public pattern";
var mnemonic = "cry snake lobster rabbit vessel lonely liar stairs move idle exotic matter"
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 4500000, 
      gasPrice: 20000000000,
      gasLimit: 6721975
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3/99b545f4df62408c95dcf680f6e1414a') 
      },
      network_id: 4,
      gas: 4500000, 
      gasPrice: 10000000000,
    }
  }
};
