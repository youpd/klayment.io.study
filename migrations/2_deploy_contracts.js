const fs = require('fs')
const TransactionData = artifacts.require('./TransactionData.sol')

module.exports = function (deployer) {
  deployer.deploy(TransactionData)
  .then(() => {
      if (TransactionData._json){
          fs.writeFile('deployedABI', JSON.stringify(TransactionData._json.abi), (err) => {
              if (err) throw err;
              console.log("파일에 ABI 입력 성공");

          }
          )

          fs.writeFile('deployedAddress', TransactionData.address, (err)=> {
              if (err) throw err;
              console.log("파일에 주소 입력 성공");
          })


      }
  })
}
