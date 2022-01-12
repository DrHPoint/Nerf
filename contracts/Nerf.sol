//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.1;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./NFT.sol";
import "./ERC20.sol";

contract Nerf is AccessControl {
    
    address public tokenAddress;
    address public nftAddress;
    mapping (uint256 => Order) orders;
    
    constructor(address _tokenAddress, address _nftAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        tokenAddress = _tokenAddress;
        nftAddress = _nftAddress;
    }

    struct Order {
        address owner;
        uint256 price;
        bool actual;
    }

    event ListItem(uint256 _itemId, address _itemOwner, uint256 _itemPrice);
    event BuyItem(uint256 _itemId, address _newOwner);
    event CancelTrade(uint256 _itemId, address _itemOwner);

    function createItem(uint256 _itemId) external { 
        NFT(nftAddress).mint(msg.sender, _itemId);
    }

    function listItem(uint256 _itemId, uint256 _price) external { 
        require(NFT(nftAddress).ownerOf(_itemId) == msg.sender, "User has no rights to this token");
        NFT(nftAddress).transferFrom(msg.sender, address(this), _itemId);
        orders[_itemId] = Order(msg.sender, _price, true);
        emit ListItem(_itemId, msg.sender, _price);
    }

    function buyItem(uint256 _itemId) external { 
        require(orders[_itemId].actual, "Order isnt actual");
        require(ERC20(tokenAddress).transferFrom(msg.sender, orders[_itemId].owner, orders[_itemId].price));
        NFT(nftAddress).safeTransferFrom(address(this), msg.sender, _itemId);
        orders[_itemId].actual = false;
        emit BuyItem(_itemId, msg.sender);
    }

    function cancel(uint256 _itemId) external { 
        require(orders[_itemId].actual, "Order isnt actual");
        NFT(nftAddress).safeTransferFrom(address(this), msg.sender, _itemId);
        orders[_itemId].actual = false;
        emit CancelTrade(_itemId, msg.sender);
    }

    function listItemOnAuction() external {

    }

    function makeBid() external {

    }

    function finishAuction() external {
        
    }

    function cancelAuction() external {
        
    }
}