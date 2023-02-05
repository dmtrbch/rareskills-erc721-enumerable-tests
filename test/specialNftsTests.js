const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = ethers;

function revertReason(reason) {
  return `VM Exception while processing transaction: reverted with reason string '${reason}'`;
}

describe("Special NFTs", async function () {
  let myNftContract = null;
  let specialNftsContract = null;
  let accounts = null;
  const FIRST_USER_ID = 1;
  const ATTACKER_ID = 9;
  const RANGE = 20;

  beforeEach(async function () {
    accounts = await ethers.getSigners();

    const MyNftContractFactory = await ethers.getContractFactory("MyNft");
    myNftContract = await MyNftContractFactory.deploy();
    await myNftContract.deployed();

    const SpecialNftsFactory = await ethers.getContractFactory("SpecialNfts");
    specialNftsContract = await SpecialNftsFactory.deploy(
      myNftContract.address
    );
    await specialNftsContract.deployed();
  });

  describe("MyNft: safeMint", async function () {
    it("should allow the owner of the contract to mint NFT", async function () {
      const tokenId = 1;

      await expect(
        myNftContract.safeMint(accounts[FIRST_USER_ID].address, tokenId)
      ).to.not.be.reverted;

      expect(await myNftContract.ownerOf(tokenId))
        .to.be.a("string")
        .equal(accounts[FIRST_USER_ID].address);
    });

    it("should revert the transaction if the account that tries to mint the NFT is not the owner", async function () {
      const tokenId = 2;

      await expect(
        myNftContract
          .connect(accounts[ATTACKER_ID])
          .safeMint(accounts[FIRST_USER_ID].address, tokenId)
      ).to.be.revertedWith(revertReason("Ownable: caller is not the owner"));
    });

    it("should revert the transaction if tokenId is not in range [1..20]", async function () {
      const tokenId = 0;

      await expect(
        myNftContract.safeMint(accounts[FIRST_USER_ID].address, tokenId)
      ).to.be.revertedWith(revertReason("tokenId must be in range [1..20]"));
    });
  });

  describe("SpecialNfts: specialNftsCount", async function () {
    it("should return the total number of special NFTs for a given address when all the NFTs within [1..20] range are minted to this address", async function () {
      const maxPrimeNumbersForGivenRange = 8;

      for (let i = 0; i < RANGE; i++) {
        const tokenId = i + 1;

        const tx = await myNftContract.safeMint(
          accounts[FIRST_USER_ID].address,
          tokenId
        );

        await tx.wait();
      }

      expect(
        await specialNftsContract.specialNftsCount(
          accounts[FIRST_USER_ID].address
        )
      ).to.be.equal(
        // eslint-disable-next-line new-cap
        new BigNumber.from(maxPrimeNumbersForGivenRange.toString())
      );
    });

    it("should return 0 if address has no special NFTs (prime tokenIds)", async function () {
      const tokenIds = [1, 4];

      for (let i = 0; i < tokenIds.length; i++) {
        const tx = await myNftContract.safeMint(
          accounts[FIRST_USER_ID].address,
          tokenIds[i]
        );

        await tx.wait();
      }

      expect(
        await specialNftsContract.specialNftsCount(
          accounts[FIRST_USER_ID].address
        )
      ).to.be.equal(
        // eslint-disable-next-line new-cap
        new BigNumber.from(0)
      );
    });
  });
});
