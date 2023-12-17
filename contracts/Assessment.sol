// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

//import "hardhat/console.sol";

contract Assessment {
    address payable public owner;
    uint256 public balance;

    uint256 public applePrice = 3;
    uint256 public mangoPrice = 5;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event ItemBought(string item, uint256 price);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint256 _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint256 _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert
                InsufficientBalance({
                    balance: balance,
                    withdrawAmount: _withdrawAmount
                });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function buyItem(string memory item) public {
        uint256 itemPrice;
         if (keccak256(abi.encodePacked(item)) == keccak256(abi.encodePacked("apple"))) {
            itemPrice = applePrice;
        } else if (keccak256(abi.encodePacked(item)) == keccak256(abi.encodePacked("mango"))) {
            itemPrice = mangoPrice;
        } else {
            revert("Invalid item");
        }

        require(balance >= itemPrice, "Insufficient funds to buy item");
        balance -= itemPrice;
        emit ItemBought(item, itemPrice);
    }
}
