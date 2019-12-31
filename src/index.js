import Caver from "caver-js";
import {spinner, Spinner} from "spin.js"

const config = {
  rpcURL : 'https://api.baobab.klaytn.net:8651'
}

const cav = new Caver(config.rpcURL);
const agContract = new cav.klay.Contract(DEPLOYED_ABI, DEPLOYED_ADDRESS);

const hub_uniqueid = new Map();
const uniqueid_hub = new Map();

const taskqueue = new Array();
const taskstate = new Array();

let hub_wallets = cav.klay.accounts.wallet.create();

// generateRandom = function (min, max) {
//   var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
//   return ranNum;
// }


const App = {
  auth:{
    accessType: 'keystore',
    keystore: '',
    password: ''
  },

 
  start: async function () {

    const walletfromSession = sessionStorage.getItem('walletInstance');

    if(walletfromSession) {
      try{
        cav.klay.accounts.wallet.add(JSON.parse(walletfromSession));
        this.changeUI(JSON.parse(walletfromSession));


      } catch (e){
        sessionStorage.removeItem('walletInstance');


      }

    }

  },

  handleImport: async function () {

    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0]);
    fileReader.onload = (event) => {
      try{

        if (!this.checkValidKeystore(event.target.result)){
          $('#message').text('유효하지 않는 파일');
          return;

        }
        this.auth.keystore = event.target.result;
        $('#message').text('keystore 통과 비밀번호를 입력하세요');
        document.querySelector('#input-password').focus();



      }catch (event){
        $('#message').text('유효하지 않는 파일');
        return;

      }
    }

  },

  handlePassword: async function () {

    this.auth.password = event.target.value;


  },

  handleLogin: async function () {
    if (this.auth.accessType === 'keystore'){

      try{
        const privateKey = cav.klay.accounts.decrypt(this.auth.keystore, this.auth.password).privateKey;
        this.integrateWallet(privateKey);




      }catch (e){
        $('#message').text('비밀번호가 일치하지 않습니다.');


      }
    }

  },


  

  _set_account_manage : async function(_unique_id, _offer_address, _klay_cost, _fee_ratio, _time_length, _hub_address, _hub_pk) {
    const walletInstance = this.getWallet();

    const A = await agContract.methods.make_account(
      unique_id,
      _offer_address, 
      _klay_cost, 
      _fee_ratio, 
      _time_length,
      _hub_address,
      _hub_pk).send({
      from: _offer_address,
      gas: '500000',
    })
      .once('transactionHash', (txHash) => {
        console.log(`
          txHash: ${txHash}
          `
        )
      });

  },

  _set_virtual_account : async function(_unique_id, _offer_address, _klay_cost, _fee_ratio, _time_length) {
    
    const walletInstance = this.getWallet();
    console.log(_unique_id);
    
    console.log(_offer_address);

    console.log(_klay_cost);

    console.log(_fee_ratio);

    console.log(_time_length);


    const newAccount = await cav.klay.accounts.create();

    console.log(newAccount['address']);
    console.log(newAccount['privateKey']);

    const virtual_account = await agContract.methods._set_virtual_account(
      _unique_id,
      _offer_address, 
      _klay_cost, 
      _fee_ratio, 
      _time_length,
      newAccount['address'],
      newAccount['privateKey']).send({
      from: walletInstance.address,
      gas: '5000000',
    })
      .once('transactionHash', (txHash) => {
        console.log(`
          txHash: ${txHash}
          `
        )
      });
      console.log(virtual_account);

      await this._hubwallet_add(newAccount['privateKey'],_unique_id);



  },


  _set_remain : async function(_unique_id, _remain) {
    const walletInstance = this.getWallet();

    console.log(_remain);

    const set_remain = await agContract.methods._set_remain(
      _unique_id,
      _remain).send({
      from: walletInstance.address,
      gas: '50000',
    })
      .once('transactionHash', (txHash) => {
        console.log(`
          txHash: ${txHash}
          `
        )
      });
      console.log(set_remain);



  },


  _get_virtual_account : async function(_unique_id) {

    // console.log(_unique_id);

    const virtual_account = await agContract.methods._get_virtual_account(_unique_id).call();

    // console.log(virtual_account);

    return virtual_account;


  },

  _set_verify : async function(_unique_id) {

    const walletInstance = this.getWallet();

    const set_verify = await agContract.methods._set_verify(
      _unique_id,
      ).send({
      from: walletInstance.address,
      gas: '50000',
    })
      .once('transactionHash', (txHash) => {
        console.log(`
          txHash: ${txHash}
          `
        )
      });
      console.log(set_verify);


  },

  _chk_verify : async function(_unique_id) {

    // console.log(_unique_id);

    const chk_verify = await agContract.methods._chk_verify(_unique_id).call();

    // console.log(chk_verify);

    return chk_verify;


  },

  _chk_verify_bycost : async function(_unique_id) {

    // console.log(_unique_id);

    const chk_verify = await agContract.methods._chk_verify_bycost(_unique_id).call();

    // console.log(chk_verify);

    return chk_verify;


  },

  _chk_verify_bytime : async function(_unique_id) {

    // console.log(_unique_id);

    const chk_verify = await agContract.methods._chk_verify_bytime(_unique_id).call();

    // console.log(chk_verify);

    return chk_verify;


  },

  _hubwallet_add : async function(hub_pk, _unique_id) {

    const hubwallet_state = hub_wallets.add(hub_pk);

    hub_uniqueid.set(hub_pk,_unique_id);
    uniqueid_hub.set(_unique_id,hub_pk);

    console.log(hubwallet_state['index']);
  },

  _hubwallet_remove : async function(hub_pk) {

    const hubwallet_state = hub_wallets.remove(hub_pk);

    console.log(hubwallet_state['index']);

  },

  _get_balance : async function(hub_address) {

    const Klay_balance = await cav.klay.getBalance(hub_address);

    // console.log(Klay_balance);

    return Klay_balance;
  },


  _transfer_klay : async function(_from_address,_to_address,_klay){


    console.log(_klay);
    const sendtrans = await cav.klay.sendTransaction({
      type: 'VALUE_TRANSFER',
      from: hub_wallets[_from_address].address,
      to: _to_address,
      gas: '300000',
      value: _klay,
      //value: cav.utils.toPeb(String(_klay),'KLAY'),
    }).once('transactionHash', (txHash) => {
      console.log(`
        txHash: ${txHash}
        `
      )
    });

    console.log(sendtrans);
  },





   Test1: async function () {
    const walletInstance = this.getWallet();
    const A = await agContract.methods.owned().send({
      from: walletInstance.address,
      gas: '500000',
    })
      .once('transactionHash', (txHash) => {
        console.log(`
          Sending a transaction... (Call contract's function 'plus')
          txHash: ${txHash}
          `
        )
      });

    console.log(A);
  },

  Test2 : async function() {
    const newAccount = cav.klay.accounts.create();

    console.log(newAccount);

    this._hubwallet_add(newAccount['privateKey'],Math.random());

    return newAccount['address'];
  },


  Test3 : async function() {


    const from_pk = '0x59156c88f079e05ada9f80d3d0ea39c4d49a14e9d8be9e9e2a74f3c022eef99f';
    const from_address = '0x054133c25ae30f22428484ad85dff84bc21274a9';

    const to_pk ='0x54806c9520a6db088c416ef136b6f1ae1082774532097de6f414ac83aa169667';
    const to_address = '0x87249d8d7a9154282cb74978410857ae0668db78';

    // this._hubwallet_add(from_pk,Math.random());

    // console.log(hub_wallets);

    // const before = this._get_balance(from_address);
    // console.log(before);

    // this._transfer_klay(from_address,to_address,1);

    const after = await this._get_balance(from_address);
    console.log(cav.utils.fromPeb((after)));

  },

  rnd_range : async function(n1, n2){
      return Math.floor( (Math.random() * (n2 - n1 + 1)) + n1 );
  },


  make_account : async function() {

    const _unique_id = await this.rnd_range(10,100000);
    const _offer_address = (await cav.klay.accounts.create())['address'];
    const _cost = await cav.utils.toPeb("0.5",'KLAY') ;
    const _fee = 100;
    const _time_length = await this.rnd_range(60,600);

    this._set_virtual_account(_unique_id,_offer_address,_cost,_fee,_time_length);

    taskqueue[Math.max(taskqueue.length,1)] = _unique_id;
    taskstate[Math.max(taskstate.length,1)] = 1;


  },


  verify_chk : async function(_unique_id, index) {

    // verify step





    const virtual_account = await this._get_virtual_account(_unique_id);

    const _offer_address = virtual_account['offer_address']

    const _current_cost = virtual_account['cost'];
    const _current_remain = virtual_account['cost_remain'];
    const _hub_address = (await cav.klay.accounts.privateKeyToAccount(virtual_account['middle_pk']))['address'];


    const chked_cost = await this._chk_verify_bycost(_unique_id);
    const chked_time = await this._chk_verify_bytime(_unique_id);

    console.log(chked_cost);
    console.log(chked_time);
    

    const chked = await this._chk_verify(_unique_id);

    console.log(chked);
    console.log(index);
    console.log(virtual_account);
    
    console.log(_hub_address);

    if (chked == false){
      

      if (chked_cost ==false){

      const set_verify = await this._set_verify(_unique_id);

      taskstate[index] = 2;

      this._transfer_klay(_hub_address,_offer_address,_current_cost );

      console.log(taskstate) 
      }else if(chked_time == false){

        console.log("time out")
      }



    }




    // const _current_balance = await cav.utils.fromPeb((await this._get_balance(_hub_address)));
    const _current_balance = ((await this._get_balance(_hub_address)));

    if (_current_remain != _current_balance){

      (await this._set_remain(_unique_id, _current_balance));
    }



    // console.log(_current_cost);

    // console.log(_current_remain);

    // console.log(_hub_address);

    // console.log(_current_balance);





    // console.log(virtual_account);
  },

  verify_chks : async function() {

    // console.log(taskqueue);

    const len = taskqueue.length;
    for(var i=1; i<len+1; i++){
      
      if (taskstate[i] == 1){

        const virtual_account = await this.verify_chk(taskqueue[i],i); 
      }
      
    }


    // console.log(virtual_account);
  },



  


  // Test2: async function () {
  //   const walletInstance = this.getWallet();
  //   const newAccount = cav.klay.accounts.create();

    
  //   console.log(newAccount);
  //   console.log(newAccount['privateKey']);

  //   return newAccount['privateKey'];
  // },

  // Test3: async function () {
  //   const newAccount_pk = await this.Test2();
  //   console.log(newAccount_pk);
  //   const Account_info = cav.klay.accounts.privateKeyToAccount('0xf6553a54a67da702baf4fd8a4dd66c3dd6cd49423eba3b33096925bed00f4b46');

    
  //   console.log(Account_info);
  //   // console.log(newAccount['address']);

  //   return Account_info;
  // },

  // Test4: async function() {

  //   const Acc_info = await this.Test3();
  //   console.log('debug_test')
  //   console.log(Acc_info);
  //   console.log('0x06e82542ab70eb2be64364a70caa7c0dfd98cb42');
  //   console.log(cav.utils.toPeb(10, 'KLAY'));
  //   console.log(100);
  //   console.log(Acc_info['address']);
  //   console.log(Acc_info['privateKey']);
    
  //   const walletInstance = this.getWallet();

  //   const A = await agContract.methods.make_account(1,'0x06e82542ab70eb2be64364a70caa7c0dfd98cb42', 100, 100, 60, Acc_info['address'],Acc_info['privateKey'] ).send({
  //     from: walletInstance.address,
  //     gas: '500000',
  //   })
  //     .once('transactionHash', (txHash) => {
  //       console.log(`
  //         txHash: ${txHash}
  //         `
  //       )
  //     });



  //   console.log(A);
  // },

  // Test5: async function() {

  //   const A = await agContract.methods._view_account(1).call();
  //   const B = await agContract.methods._view_verify_time(1).call();


  //   console.log(A);
  //   console.log(B);
  // },




  handleImport: async function () {

    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0]);
    fileReader.onload = (event) => {
      try{

        if (!this.checkValidKeystore(event.target.result)){
          $('#message').text('유효하지 않는 파일');
          return;

        }
        this.auth.keystore = event.target.result;
        $('#message').text('keystore 통과 비밀번호를 입력하세요');
        document.querySelector('#input-password').focus();



      }catch (event){
        $('#message').text('유효하지 않는 파일');
        return;

      }
    }

  },

  handlePassword: async function () {

    this.auth.password = event.target.value;


  },

  handleLogin: async function () {
    if (this.auth.accessType === 'keystore'){

      try{
        const privateKey = cav.klay.accounts.decrypt(this.auth.keystore, this.auth.password).privateKey;
        this.integrateWallet(privateKey);




      }catch (e){
        $('#message').text('비밀번호가 일치하지 않습니다.');


      }
    }

  },

  handleLogout: async function () {

    this.removeWallet();
    location.reload();

  },

  generateNumbers: async function () {

    var num1 = Math.floor((Math.random()*50)+10);

    var num2 = Math.floor((Math.random()*50)+10);

    sessionStorage.setItem('result', num1 + num2);

    $('#start').hide();
    $('#num1').text(num1);
    $('#num2').text(num2);
    $('#question').show();
    document.querySelector('#answer').focus();

    this.showTimer();

    
    


  },

  deposit: async function () {
    var spinner = this.showSpinner();
    const walletInstance = this.getWallet();
    if (walletInstance){
      if (await this.callOwner() !== walletInstance.address) return;
      else{
        var amount = $('#amount').val();
        if(amount){
          agContract.methods.deposit().send({
              from: walletInstance.address,
              gas: '250000',
              value: cav.utils.toPeb(amount, 'KLAY')
            })
            .once('transactionHash', (txHash) => {
            console.log('txHash: ${txHash}');
          })
        .once('receipt', (receipt) => {
          console.log('(#${receipt.blockNumber})', receipt);
          spinner.stop();
          alert(amount + " KLAY 를 송금했습니다.");
          location.reload();


        })
        .once('error', (error) => {
          alert(error.message);
        });
      }

      return;
    }
  }


  },

  callOwner: async function () {

    return await agContract.methods.owner().call();

  },

  callContractBalance: async function () {
    return await agContract.methods.getBalance().call();

  },

  getWallet: function () {
    if(cav.klay.accounts.wallet.length) {
      return cav.klay.accounts.wallet[0];
    }

  },

  checkValidKeystore: function (keystore) {
    const parsedKeystore = JSON.parse(keystore);
    const isValidKeystore = parsedKeystore.version &&
    parsedKeystore.id &&
    parsedKeystore.address &&
    parsedKeystore.crypto;

    return isValidKeystore;

  },

  integrateWallet: function (privateKey) {
    const walletInstance = cav.klay.accounts.privateKeyToAccount(privateKey);
    cav.klay.accounts.wallet.add(walletInstance);
    sessionStorage.setItem('walletInstance', JSON.stringify(walletInstance));
    this.changeUI(walletInstance);
  },

  reset: function () {

    this.auth={
      keystore: '',
      password: ''
    };

  },

  removeWallet: function () {

    cav.klay.accounts.wallet.clear();
    sessionStorage.removeItem('walletInstance');
    this.reset();


  }
};

window.App = App;

window.addEventListener("load", function () {
  App.start();
});

var opts = {
  lines: 10, // The number of lines to draw
  length: 30, // The length of each line
  width: 17, // The line thickness
  radius: 45, // The radius of the inner circle
  scale: 1, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  color: '#5bc0de', // CSS color or array of colors
  fadeColor: 'transparent', // CSS color or array of colors
  speed: 1, // Rounds per second
  rotate: 0, // The rotation offset
  animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
  direction: 1, // 1: clockwise, -1: counterclockwise
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  className: 'spinner', // The CSS class to assign to the spinner
  top: '50%', // Top position relative to parent
  left: '50%', // Left position relative to parent
  shadow: '0 0 1px transparent', // Box-shadow for the lines
  position: 'absolute' // Element positioning
};