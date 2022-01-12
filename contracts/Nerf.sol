//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.1;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./NFT.sol";
import "./ERC20.sol";

contract Nerf is AccessControl {
    
    uint256 private duration = 3 days;
    bytes32 public constant ARTIST_PERSON = keccak256("ARTIST_PERSON");
    address public tokenAddress;
    address public nftAddress;
    mapping (uint256 => Order) orders;
    mapping (uint256 => Auction) auctions;
    
    constructor(address _tokenAddress, address _nftAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ARTIST_PERSON, msg.sender);
        tokenAddress = _tokenAddress;
        nftAddress = _nftAddress;
    }

    modifier forFinishingAuction (uint256 _itemId) {
        require(auctions[_itemId].order.owner == msg.sender, "User has no rights to this token");
        require(auctions[_itemId].timeThreshold <= block.timestamp, "Auction isnt over");
        require(auctions[_itemId].order.actual, "Auction already is over");
        _;
    }

    struct Order {
        uint256 price;
        address owner;
        bool actual;
    }

    struct Auction {
        uint256 counter;
        uint256 timeThreshold;
        uint256 step;
        Order order;
        address current;
    }

    event ListItem(uint256 _itemId, address _itemOwner, uint256 _itemPrice);
    event BuyItem(uint256 _itemId, address _newOwner);
    event CancelTrade(uint256 _itemId, address _itemOwner);
    event ListItemOnAuction(uint256 _itemId, address _itemOwner, uint256 _itemPrice, uint256 _priceStep);
    event NewBid(uint256 _itemId, address _bidderAddress, uint256 _bid);
    event FinishAuction(uint256 _itemId, address _newOwner, uint256 _finishPrice);
    event CancelAuction(uint256 _itemId, address _itemOwner);

    function createItem(uint256 _itemId) external onlyRole(ARTIST_PERSON){ 
        NFT(nftAddress).mint(msg.sender, _itemId);
    }

    function listItem(uint256 _itemId, uint256 _price) external { 
        require(NFT(nftAddress).ownerOf(_itemId) == msg.sender, "User has no rights to this token");
        NFT(nftAddress).transferFrom(msg.sender, address(this), _itemId);
        orders[_itemId] = Order(_price, msg.sender, true);
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
        require(orders[_itemId].owner == msg.sender, "User has no rights to this token");
        require(orders[_itemId].actual, "Order isnt actual");
        NFT(nftAddress).safeTransferFrom(address(this), msg.sender, _itemId);
        orders[_itemId].actual = false;
        emit CancelTrade(_itemId, msg.sender);
    }

    function listItemOnAuction(uint256 _itemId, uint256 _price, uint256 _step) external {
        require(NFT(nftAddress).ownerOf(_itemId) == msg.sender, "User has no rights to this token");
        NFT(nftAddress).transferFrom(msg.sender, address(this), _itemId);
        auctions[_itemId] = Auction(0, block.timestamp + duration, _step, Order(_price, msg.sender, true), msg.sender);
        emit ListItemOnAuction(_itemId, msg.sender, _price, _step);
    }

    function makeBid(uint256 _itemId, uint256 _price) external {
        require(auctions[_itemId].order.actual, "Auction is over");
        require(auctions[_itemId].order.owner != msg.sender, "User has rights to this token");
        require(auctions[_itemId].order.price + auctions[_itemId].step <= _price, "Bet less than the minimum raise");
        require(ERC20(tokenAddress).transferFrom(msg.sender, address(this), _price));
        if (auctions[_itemId].counter != 0)
            ERC20(tokenAddress).transfer(auctions[_itemId].current, auctions[_itemId].order.price);
        auctions[_itemId].current = msg.sender;
        auctions[_itemId].order.price = _price;
        auctions[_itemId].counter++;
        emit NewBid(_itemId, msg.sender, _price);
    }

    function finishAuction(uint256 _itemId) external forFinishingAuction(_itemId) {
        require(auctions[_itemId].counter > 1, "Not enough bids to finish auction");
        auctions[_itemId].order.actual = false;
        ERC20(tokenAddress).transfer(auctions[_itemId].order.owner, auctions[_itemId].order.price);
        NFT(nftAddress).safeTransferFrom(address(this), auctions[_itemId].current, _itemId);
        emit FinishAuction(_itemId, auctions[_itemId].current, auctions[_itemId].order.price);
    }

    function cancelAuction(uint256 _itemId) external forFinishingAuction(_itemId) {
        auctions[_itemId].order.actual = false;
        if (auctions[_itemId].counter != 0)
            ERC20(tokenAddress).transfer(auctions[_itemId].current, auctions[_itemId].order.price);
        NFT(nftAddress).safeTransferFrom(address(this), auctions[_itemId].order.owner, _itemId);
        emit CancelAuction(_itemId, msg.sender);
    }

    function getArtistRole(address _newArtist) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ARTIST_PERSON, _newArtist);
    }
}