// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

contract SpecialNfts {
    IERC721Enumerable immutable private myNFTContract;

    constructor(IERC721Enumerable _NFTAddress) {
        myNFTContract = _NFTAddress;
    }

    function specialNftsCount(address _owner) external view returns (uint256) {
        uint256 nftsCount = myNFTContract.balanceOf(_owner);
        uint256 specialNFTsCount;
        for (uint256 i = 0; i < nftsCount; i++) {
            uint256 _tokenId = myNFTContract.tokenOfOwnerByIndex(_owner, i);
            if (isPrime(_tokenId)) {
                specialNFTsCount++;
            }
        }
        return specialNFTsCount;
    }

    function isPrime(uint256 _num) internal pure returns (bool) {
        uint256 s = sqrt(_num);
        for (uint256 i = 2; i <= s; i++) {
            if (_num % i == 0) return false;
        }

        return _num > 1;
    }

    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
