pragma solidity ^0.4.23;

import './ERC721Token.sol';

contract StarNotary is ERC721Token { 

    struct Star { 
        string name;
        string dec;
        string mag;
        string cent;
        string story;
    }
    
    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => bool) isStarTaken;
    mapping(uint256 => uint256) public starsForSale;

    modifier onlyOwnerOf(uint256 token) {
        require(this.ownerOf(token) == msg.sender, "Caller doesn't own this token");
        _;
    }
    function createStar(string _name, string _dec, string _mag, string _cent, string _story, uint256 _tokenId) public {
        require(checkIfStarExist(_dec, _mag, _cent) == false, "Star exist");

        Star memory newStar = Star(_name, _dec, _mag, _cent, _story);

        tokenIdToStarInfo[_tokenId] = newStar;
        isStarTaken[uint256(keccak256(_dec, _mag, _cent))] = true;

        mint(_tokenId);
    }

    function checkIfStarExist(string _dec, string _mag, string _cent) public view returns (bool) {
        return isStarTaken[uint256(keccak256(_dec, _mag, _cent))];
    }
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public onlyOwnerOf(_tokenId) { 
        //require(this.ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable { 
        require(starsForSale[_tokenId] > 0);

        uint256 starCost = starsForSale[_tokenId];

        require(this.ownerOf(_tokenId) != msg.sender);

        address starOwner = this.ownerOf(_tokenId);

        require(msg.value >= starCost);

        clearPreviousStarState(_tokenId);

        transferFromHelper(starOwner, msg.sender, _tokenId);

        if(msg.value > starCost) { 
            msg.sender.transfer(msg.value - starCost);
        }

        starOwner.transfer(starCost);
    }

    function clearPreviousStarState(uint256 _tokenId) private {
        //clear approvals 
        tokenToApproved[_tokenId] = address(0);

        //clear being on sale 
        starsForSale[_tokenId] = 0;
    }
}