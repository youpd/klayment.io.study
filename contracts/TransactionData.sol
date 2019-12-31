pragma solidity ^0.5.11;

library SafeMath {
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0) {
      return 0;
    }
    uint256 c = a * b;
    assert(c / a == b);
    return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}

contract Owner {
    
    
    address owner;
    function owned() public { owner = msg.sender; }
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    // change owner address
    function change_Owner(address forchange) public onlyOwner returns(bool chk) {
        owner = forchange;
        return (true);
    }
    // getter
    function getowner() public view returns(address current_owner) {
        return owner;
    }
    
}


// interface getter {
    
//     // function _get_blocknum() external view returns(uint256 blocknum);
    
//     function _get_virtual_account(uint256 _id) external view returns(
//         address offer_address,
//         uint256 cost,
//         uint256 fee,
//         uint256 cost_remain,
//         uint256 time_remain,
//         string memory middle_pk);
        
//     function _get_history(uint256 _id) external view returns(
//         address[] memory history_address,
//         uint256[] memory history_amount);
        
//     function _get_history_len(uint256 _id) external view returns(
//         uint256 history_address_len,
//         uint256 history_amount_len);
        
//     function _get_offer_address(uint256 _id) external view returns(
//         address offer_address);
    
//     function _get_payer_address(uint256 _id) external view returns(
//         address payer_address);
        
//     function _get_cost(uint256 _id) external view returns(
//         uint256 cost);
    
//     function _get_fee(uint256 _id) external view returns(
//         uint256 fee);
    
//     function _get_remain(uint256 _id) external view returns(
//         uint256 remain);
        
//     function _get_time_start(uint256 _id) external view returns(
//         uint256 time_start);
        
//     function _get_time_end(uint256 _id) external view returns(
//         uint256 time_end);
        
//     function _get_time_length(uint256 _id) external view returns(
//         uint256 time_length);
        
//     function _get_escrow_address(uint256 _id) external view returns(
//         address escrow_address);
        
//     function _get_escrow_pk(uint256 _id) external view returns(
//         string memory escrow_pk);
        
//     function _get_url(uint256 _id) external view returns(
//         string memory url);
        
//     function _get_state(uint256 _id) external view returns(
//         uint256 state);
    
    
// }

// interface setter {
    
    
//     function _set_virtual_account(
//     uint256 _id,
//     address _offer_address,
//     uint256 _cost,
//     uint256 _fee,
//     uint256 _time_length,
//     address _escrow_address,
//     string calldata _escrow_pk) external returns(uint256 state);
        
//     /////////////////////////////////////////////////////////////////////////////
    
//     function _set_history(uint256 _id, address _history_address, uint256 _history_amount) external  returns(
//         uint256 history_address_lenght,
//         uint256 history_amount_length
//         );
        
//     function _set_offer_address(uint256 _id, address _offer_address) external  returns(
//         address offer_address);
    
//     function _set_payer_address(uint256 _id, address _payer_address) external  returns(
//         address payer_address);
        
//     function _set_cost(uint256 _id, uint256 _cost) external  returns(
//         uint256 cost);
    
//     function _set_fee(uint256 _id, uint256 _fee) external  returns(
//         uint256 fee);
    
//     function _set_remain(uint256 _id, uint256 _remain) external  returns(
//         uint256 remain);
    
//     function _set_remain_plus(uint256 _id, uint256 _remain) external  returns(
//         uint256 remain);
        
//     function _set_escrow_address(uint256 _id, uint256 _escrow_address) external  returns(
//         address escrow_address);
        
//     function _set_escrow_pk(uint256 _id, uint256 _escrow_pk) external  returns(
//         string memory escrow_pk);
        
//     function _set_url(uint256 _id, string calldata _url) external  returns(
//         string memory url);
        
//     function _set_state(uint256 _id,uint256 _state) external returns(
//         uint256 state);
    
    
// }

// interface verify {
    
//     function _chk_verify_bycost(uint256 _id) external view returns(
//         bool _verify);
        
//     function _chk_verify_bytime(uint256 _id) external view returns(
//         bool _verify);
        
//     function _chk_verify(uint256 _id) external view returns(
//         bool _verify);
    
    
//     //
    
//     function _set_verify_bycost(uint256 _id) external returns(
//         bool chk,
//         uint256 state);
    
//     function _set_verify_bytime(uint256 _id) external returns(
//         bool chk,
//         uint256 state);
        
//     function _set_verify(uint256 _id) external returns(
//         bool chk,
//         uint256 state);
        
    
    
    
// }

contract TransactionData is Owner{
    
    using SafeMath for uint;

struct Contractinfo {
        
        uint256 state;
        // address infomation
        address offer_address;
        address payer_address;
        // cost information
        uint256 cost;
        uint256 fee;
        uint256 remain;
        // time information
        uint256 time_start;
        uint256 time_length;
        // export information
        string url;
        // hub account information
        address middle_address;
        string middle_pk;
        // history information
        address[] history_address;
        uint256[] histroy_amount;
        
    }
    
    mapping(uint256=>Contractinfo) public Cinfo;
    
// getter    

    function _get_virtual_account(uint256 _id) view public  returns(
        address offer_address,
        uint256 cost,
        uint256 fee,
        uint256 cost_remain,
        uint256 time_remain,
        string memory middle_pk){
            
            return(
                Cinfo[_id].offer_address,
                Cinfo[_id].cost,
                Cinfo[_id].fee,
                Cinfo[_id].remain,
                block.number-(Cinfo[_id].time_start+Cinfo[_id].time_length),
                Cinfo[_id].middle_pk
                );
        }


        
    function _get_history(uint256 _id) view public  returns(
        address[] memory history_address,
        uint256[] memory history_amount){
            
            return(
                Cinfo[_id].history_address,
                Cinfo[_id].histroy_amount
                );
        }
        
        
    function _get_history_len(uint256 _id) view public  returns(
        uint256 history_address_len,
        uint256 history_amount_len){
            
            return(
                Cinfo[_id].history_address.length,
                Cinfo[_id].histroy_amount.length
                );
            
        }
        
    function _get_offer_address(uint256 _id) view public  returns(
        address offer_address){
            return(
                Cinfo[_id].offer_address
                );
        }
    
    function _get_payer_address(uint256 _id) view public  returns(
        address payer_address){
            return(
                Cinfo[_id].payer_address
                );
        }
        
    function _get_cost(uint256 _id) view public  returns(
        uint256 cost){
            return(
                Cinfo[_id].cost
                );
        }
    
    function _get_fee(uint256 _id) view public  returns(
        uint256 fee){
            return(
                Cinfo[_id].fee
                );
        }
    
    function _get_remain(uint256 _id) view public  returns(
        uint256 remain){
            return(
                Cinfo[_id].remain
                );
        }
        
    function _get_time_start(uint256 _id) view public  returns(
        uint256 time_start){
            return(
                Cinfo[_id].time_start
                );
        }
        
    function _get_time_end(uint256 _id) view public  returns(
        uint256 time_end){
            return(
                Cinfo[_id].time_start+Cinfo[_id].time_length
                );
        }
        
    function _get_time_length(uint256 _id) view public  returns(
        uint256 time_length){
            return(
                Cinfo[_id].time_length
                );
        }
        
    function _get_escrow_address(uint256 _id) view public  returns(
        address escrow_address){
            return(
                Cinfo[_id].middle_address
                );
        }
        
    function _get_escrow_pk(uint256 _id) view public  returns(
        string memory escrow_pk){
            return(
                Cinfo[_id].middle_pk
                );
        }
        
    function _get_url(uint256 _id) view public  returns(
        string memory url){
            return(
                Cinfo[_id].url
                );
        }
        
    function _get_state(uint256 _id) view public  returns(
        uint256 state){
            return(
                Cinfo[_id].state
                );
        }
        
// setter    
    
    function _set_virtual_account(
    uint256 _id,
    address _offer_address,
    uint256 _cost,
    uint256 _fee,
    uint256 _time_length,
    address _escrow_address,
    string memory _escrow_pk) public onlyOwner returns(uint256 state){
        
        Cinfo[_id].state = 0;
        
        Cinfo[_id].offer_address = _offer_address;
        Cinfo[_id].cost = _cost;
        Cinfo[_id].fee = _fee;
        Cinfo[_id].remain = 0;
        
        require(!(_time_length<=0), "err_timelength below zero");
        Cinfo[_id].time_start = block.number;
        Cinfo[_id].time_length = _time_length;
        
        
        Cinfo[_id].url = "";
        Cinfo[_id].middle_address = _escrow_address;
        Cinfo[_id].middle_pk = _escrow_pk;
        
        Cinfo[_id].state = 1;
        
        return(
            Cinfo[_id].state
            );
        
    }
        
    
    function _set_history(uint256 _id, address _history_address, uint256 _history_amount) public onlyOwner returns(
        uint256 history_address_lenght,
        uint256 history_amount_length
        ){
            
            Cinfo[_id].history_address.push(_history_address);
            Cinfo[_id].histroy_amount.push(_history_amount);
            
            return(
                Cinfo[_id].history_address.length,
                Cinfo[_id].histroy_amount.length
                );
        }
        
    function _set_offer_address(uint256 _id, address _offer_address) public onlyOwner returns(
        address offer_address){
            
            Cinfo[_id].offer_address = _offer_address;
            
            return(
                Cinfo[_id].offer_address
                );
        }
    
    function _set_payer_address(uint256 _id, address _payer_address) public onlyOwner returns(
        address payer_address){
            
            Cinfo[_id].payer_address = _payer_address;
            
            return(
                Cinfo[_id].payer_address
                );
        }
        
    function _set_cost(uint256 _id, uint256 _cost)public onlyOwner returns(
        uint256 cost){
            Cinfo[_id].cost = _cost;
            
            return(
                Cinfo[_id].cost
                );
        }
    
    function _set_fee(uint256 _id, uint256 _fee) public onlyOwner returns(
        uint256 fee){
            
            Cinfo[_id].fee = _fee;
            
            return(
                Cinfo[_id].fee
                );
        }
    
    function _set_remain(uint256 _id, uint256 _remain) public onlyOwner returns(
        uint256 remain){
            
            Cinfo[_id].remain = _remain;
            
            return(
                Cinfo[_id].remain
                );
        }
        
    function _set_remain_plus(uint256 _id, uint256 _remain)public onlyOwner returns(
        uint256 remain){
            
            Cinfo[_id].remain += _remain;
            
            return(
                Cinfo[_id].remain
                );
        }
        
        
    function _set_escrow_address(uint256 _id, address _escrow_address) public onlyOwner returns(
        address escrow_address){
            
            Cinfo[_id].middle_address = _escrow_address;
            
            return(
                Cinfo[_id].middle_address
                );
        }
        
    function _set_escrow_pk(uint256 _id, string memory _escrow_pk) public onlyOwner returns(
        string memory escrow_pk){
            
            Cinfo[_id].middle_pk = _escrow_pk;
            
            return(
                Cinfo[_id].middle_pk
                );
        }
        
    function _set_url(uint256 _id, string memory _url) public onlyOwner returns(
        string memory url){
            
            Cinfo[_id].url = _url;
            
            return(
                Cinfo[_id].url
                );
        }
        
    // TO MANAGE ONLY
    function _set_state(uint256 _id,uint256 _state) public onlyOwner returns(
        uint256 state){
            
            Cinfo[_id].state = _state;
            
            return(
                Cinfo[_id].state
                );
            
        }

// verify

    function _chk_verify_bycost(uint256 _id) public view returns(
        bool _verify){
            
            if(Cinfo[_id].cost > Cinfo[_id].remain){
                
                return(true);
            }else{

                return(false);  
            }
            

        }
        
    function _chk_verify_bytime(uint256 _id) public view returns(
        bool _verify){
            
            if(Cinfo[_id].time_start+Cinfo[_id].time_length > block.number){
                return(true);
            }else{
                return(false);
        }
            }
            
            
        
    function _chk_verify(uint256 _id) external view returns(
        bool _verify){
            
            if(_chk_verify_bycost(_id)==true && _chk_verify_bytime(_id)==true){
                
                return(true);
            }else{
                return(false);
            }
            
        }
    
    
    //
    
    function _set_verify_bycost(uint256 _id) public onlyOwner returns(
        bool chk,
        uint256 state){
            
            bool chked = _chk_verify_bycost(_id);
            
            if(!chked){
                if(Cinfo[_id].state==1){
                    Cinfo[_id].state =2;
                }
            }
            
            return(chked, Cinfo[_id].state);
            
        }
    
    function _set_verify_bytime(uint256 _id) public onlyOwner returns(
        bool chk,
        uint256 state){

            bool chked = _chk_verify_bytime(_id);
            
            if(!chked){
                if(Cinfo[_id].state==1){
                    Cinfo[_id].state =2;
                }
            }
            
            return(chked, Cinfo[_id].state);
            
            
        }
        
    function _set_verify(uint256 _id) public onlyOwner returns(
        bool chk,
        uint256 state){
            
            
            bool chked = _chk_verify_bytime(_id) && _chk_verify_bycost(_id);

            if(chked){
                if(Cinfo[_id].state==1){
                    Cinfo[_id].state =2;
                }
            }
            
            return(chked, Cinfo[_id].state);            
            
        }
        

}



// // for klayment auto and manage (delegatecall system)
// contract Klayment is TransactionData {
//     // chk Overflow & Underflow;
//     using SafeMath for uint;
    
    

   
//   function get_balance_byaddress (address _address) public view returns(uint256 _balance){
       
//         return ((_address).balance);
//   }
   
   
   
//   // TO DO assembly
//   // https://solidity.readthedocs.io/en/v0.4.25/assembly.html
   
// //     uint256[] taskqueue;
// //     uint256[] taskqueue_state;

// //   function task_enqeue(uint256 _id)public onlyOwner returns(uint256 task_len){
       
// //       taskqueue.push(_id);
       
// //       return(
// //           taskqueue.length
// //           );
// //   }   
   
//     // function task_replace(uint256 _index, uint256 _id)public onlyOwner returns(uint256 )
   
// //     function queue_length{
// //       mod(len,3) random select <limimt 100 for gas
// //     }
   
// //   function running_queue{
// //       running
// //   }
    
// }


