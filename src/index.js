import Caver from "caver-js";

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


const App = {
  auth:{
    accessType: 'keystore',
    keystore: '',
    password: ''
  },

 
  start: async function () {

    const walletfromSession = sessionStorage.getItem('walletInstance');

    const admin_walletInstance = sessionStorage.getItem('admin_walletInstance');

    if(walletfromSession) {
      try{
        cav.klay.accounts.wallet.add(JSON.parse(walletfromSession));
        this.changeUI(JSON.parse(walletfromSession));


      } catch (e){
        sessionStorage.removeItem('walletInstance');
      }
    }

    if(admin_walletInstance) {
        try{
          cav.klay.accounts.wallet.add(JSON.parse(admin_walletInstance));
          this.changeUI(JSON.parse(admin_walletInstance));
  
  
        } catch (e){
          sessionStorage.removeItem('admin_walletInstance');
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

  admin_handleLogin: async function () {
    if (this.auth.accessType === 'keystore'){

      try{
        const privateKey = cav.klay.accounts.decrypt(this.auth.keystore, this.auth.password).privateKey;
        this.admin_integrateWallet(privateKey);

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
      gas: '5000000',
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

    const newAccount = await cav.klay.accounts.create();

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

      await this._hubwallet_add(newAccount['privateKey'],_unique_id);

  },


  _set_remain : async function(_unique_id, _remain) {
    const admin_walletInstance = this.getWallet();
    const set_remain = await agContract.methods._set_remain(
      _unique_id,
      _remain).send({
      from: admin_walletInstance.address,
      gas: '50000',
    })
      .once('transactionHash', (txHash) => {
        console.log(`
          txHash: ${txHash}
          `
        )
      });

  },

  _set_history : async function(_unique_id, _history_address, _history_amount){
    const admin_walletInstance = this.getWallet();
    const set_history = await agContract.methods._set_history(
        _unique_id,
        _history_address,
        _history_amount
    ).send({
        from: admin_walletInstance.address,
        gas: '50000',
    }).once('transactionHash', (txHash) => {
        console.log(`
        txHash: ${txHash}
        `)
    });
  },

  _set_offer_address : async function(_unique_id, _offer_address){
    const admin_walletInstance = this.getWallet();
    const set_offer_address = await agContract.methods._set_offer_address(
        _unique_id,
        _offer_address
    ).send({
        from: admin_walletInstance.address,
        gas: '50000',
    }).once('transactionHash', (txHash) => {
        console.log(`
        txHash: ${txHash}
        `)
    });
  },

  _set_url : async function(_unique_id, _url){
    const admin_walletInstance = this.getWallet();
    const set_url = await agContract.methods._set_url(
        _unique_id,
        _url
    ).send({
        from: admin_walletInstance.address,
        gas: '50000',
    }).once('transactionHash', (txHash) => {
        console.log(`
        txHash: ${txHash}
        `)
    });
  },



  _get_virtual_account : async function(_unique_id) {

    const virtual_account = await agContract.methods._get_virtual_account(_unique_id).call();
    return virtual_account;

  },

  _set_verify : async function(_unique_id) {

    const admin_walletInstance = this.getWallet();

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

  },

  _chk_verify : async function(_unique_id) {

    const chk_verify = await agContract.methods._chk_verify(_unique_id).call();
    return chk_verify;

  },

  _chk_verify_bycost : async function(_unique_id) {

    const chk_verify = await agContract.methods._chk_verify_bycost(_unique_id).call();

    return chk_verify;

  },

  _chk_verify_bytime : async function(_unique_id) {

    const chk_verify = await agContract.methods._chk_verify_bytime(_unique_id).call();

    return chk_verify;

  },

  _hubwallet_add : async function(hub_pk, _unique_id) {

    const hubwallet_state = hub_wallets.add(hub_pk);

    hub_uniqueid.set(hub_pk,_unique_id);
    uniqueid_hub.set(_unique_id,hub_pk);

  },

  _hubwallet_remove : async function(hub_pk) {

    const hubwallet_state = hub_wallets.remove(hub_pk);

  },

  _get_balance : async function(hub_address) {

    const Klay_balance = await cav.klay.getBalance(hub_address);
    return Klay_balance;
  },

  _transfer_klay : async function(_from_address,_to_address,_klay){

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
  },

   Owner: async function () {
    const admin_walletInstance = this.getWallet();
    const A = await agContract.methods.owned().send({
      from: admin_walletInstance.address,
      gas: '500000',
    })
      .once('transactionHash', (txHash) => {
        console.log(`
          Sending a transaction... (Call contract's function 'plus')
          txHash: ${txHash}
          `
        )
      });
  },

  rnd_range : async function(n1, n2){
      return Math.floor( (Math.random() * (n2 - n1 + 1)) + n1 );
  },

  make_account : async function(_unique_id,_offer_address,_cost,_fee,_time_length) {

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
    

    const chked = await this._chk_verify(_unique_id);

    if (chked == false){

      if (chked_cost ==false){

      const set_verify = await this._set_verify(_unique_id);

      taskstate[index] = 2;

      this._transfer_klay(_hub_address,_offer_address,_current_cost );
      }else if(chked_time == false){

        console.log("time out")
      }
    }

    const _current_balance = ((await this._get_balance(_hub_address)));

    if (_current_remain != _current_balance){

      (await this._set_remain(_unique_id, _current_balance));
    }

  },

  verify_chks : async function() {

    const len = taskqueue.length;
    for(var i=1; i<len+1; i++){
      
      if (taskstate[i] == 1){

        const virtual_account = await this.verify_chk(taskqueue[i],i); 
      }
      
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

  admin_integrateWallet: function (privateKey) {
    const admin_walletInstance = cav.klay.accounts.privateKeyToAccount(privateKey);
    cav.klay.accounts.wallet.add(admin_walletInstance);
    sessionStorage.setItem('admin_walletInstance', JSON.stringify(admin_walletInstance));
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
  top: '50%', // Top position relative to parent
  left: '50%', // Left position relative to parent
  shadow: '0 0 1px transparent', // Box-shadow for the lines
  position: 'absolute' // Element positioning
};
