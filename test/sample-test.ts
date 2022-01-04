import { expect } from "chai";
import { Contract, ContractFactory, Signer, utils } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { hexConcat } from "@ethersproject/bytes";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

let Nerf : ContractFactory;
let nerf : Contract;
let ERC20 : ContractFactory;
let token : Contract;
let NFT : ContractFactory;
let nft : Contract;
let owner: SignerWithAddress;
let addr1: SignerWithAddress;
let addr2: SignerWithAddress;
let addr3: SignerWithAddress;

describe("Hermes", function () {

  beforeEach(async () => {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    ERC20 = await ethers.getContractFactory("ERC20");
    token = await ERC20.connect(owner).deploy("Doctor", "WHO", 18);
    NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.connect(owner).deploy();
    Nerf = await ethers.getContractFactory("Nerf");
    nerf = await Nerf.connect(owner).deploy(token.address, nft.address);
  });

  describe("Item", () => {
    it("Create and Trade Item", async () => {
      await token.deployed();
      await nft.deployed();
      await nerf.deployed();
      const setMinterRole = await nft.connect(owner).setMinterRole(nerf.address);
      await setMinterRole.wait();
      const decimals = await token.decimals();
      const mint = await token.connect(owner).mint(addr2.address, parseUnits("100", decimals));
      await mint.wait();
      const createItem546 = await nerf.connect(addr1).createItem(546);
      await createItem546.wait();
      const getApprove1NFT = await nft.connect(addr1).approve(nerf.address, 546);
      await getApprove1NFT.wait();
      const listItem546 = await nerf.connect(addr1).listItem(546, parseUnits("100", decimals));
      await listItem546.wait();
      const getApprove2Token = await token.connect(addr2).approve(nerf.address, parseUnits("100", decimals));
      await getApprove2Token.wait();
      const tradeItem546 = await nerf.connect(addr2).buyItem(546);
      await tradeItem546.wait();
    });

    it("Create and cancel ", async () => {
      await token.deployed();
      await nft.deployed();
      await nerf.deployed();
      const setMinterRole = await nft.connect(owner).setMinterRole(nerf.address);
      await setMinterRole.wait();
      const decimals = await token.decimals();
      const mint = await token.connect(owner).mint(addr2.address, parseUnits("100", decimals));
      await mint.wait();
      const createItem546 = await nerf.connect(addr1).createItem(546);
      await createItem546.wait();
      const getApprove1NFT = await nft.connect(addr1).approve(nerf.address, 546);
      await getApprove1NFT.wait();
      const listItem546 = await nerf.connect(addr1).listItem(546, parseUnits("100", decimals));
      await listItem546.wait();
      const cancelTrade = await nerf.connect(addr1).cancel(546);
      await cancelTrade.wait();
    });

  });

  describe("Check errors", () => {
    it("List with no rights", async () => {
      await token.deployed();
      await nft.deployed();
      await nerf.deployed();
      const setMinterRole = await nft.connect(owner).setMinterRole(nerf.address);
      await setMinterRole.wait();
      const decimals = await token.decimals();
      const mint = await token.connect(owner).mint(addr2.address, parseUnits("100", decimals));
      await mint.wait();
      const createItem546 = await nerf.connect(addr1).createItem(546);
      await createItem546.wait();
      const getApprove1NFT = await nft.connect(addr1).approve(nerf.address, 546);
      await getApprove1NFT.wait();
      const listItem546 = await nerf.connect(addr1).listItem(546, parseUnits("100", decimals));
      await listItem546.wait();
      await expect(nerf.connect(addr2).listItem(546, parseUnits("100", decimals))).to.be.revertedWith("User has no rights to this token");
    });

    it("try trade after cancel", async () => {
      await token.deployed();
      await nft.deployed();
      await nerf.deployed();
      const setMinterRole = await nft.connect(owner).setMinterRole(nerf.address);
      await setMinterRole.wait();
      const decimals = await token.decimals();
      const mint = await token.connect(owner).mint(addr2.address, parseUnits("100", decimals));
      await mint.wait();
      const createItem546 = await nerf.connect(addr1).createItem(546);
      await createItem546.wait();
      const getApprove1NFT = await nft.connect(addr1).approve(nerf.address, 546);
      await getApprove1NFT.wait();
      const listItem546 = await nerf.connect(addr1).listItem(546, parseUnits("100", decimals));
      await listItem546.wait();
      const cancelTrade = await nerf.connect(addr1).cancel(546);
      await cancelTrade.wait();
      const getApprove2Token = await token.connect(addr2).approve(nerf.address, parseUnits("100", decimals));
      await getApprove2Token.wait();
      await expect(nerf.connect(addr2).buyItem(546)).to.be.revertedWith("Order isnt actual");
    });

    it("try trade without tokens", async () => {
      await token.deployed();
      await nft.deployed();
      await nerf.deployed();
      const setMinterRole = await nft.connect(owner).setMinterRole(nerf.address);
      await setMinterRole.wait();
      const decimals = await token.decimals();
      const createItem546 = await nerf.connect(addr1).createItem(546);
      await createItem546.wait();
      const getApprove1NFT = await nft.connect(addr1).approve(nerf.address, 546);
      await getApprove1NFT.wait();
      const listItem546 = await nerf.connect(addr1).listItem(546, parseUnits("100", decimals));
      await listItem546.wait();
      const getApprove2Token = await token.connect(addr2).approve(nerf.address, parseUnits("100", decimals));
      await getApprove2Token.wait();
      await expect(nerf.connect(addr2).buyItem(546)).to.be.reverted;
    });

    it("try cancel after trade", async () => {
      await token.deployed();
      await nft.deployed();
      await nerf.deployed();
      const setMinterRole = await nft.connect(owner).setMinterRole(nerf.address);
      await setMinterRole.wait();
      const decimals = await token.decimals();
      const mint = await token.connect(owner).mint(addr2.address, parseUnits("100", decimals));
      await mint.wait();
      const createItem546 = await nerf.connect(addr1).createItem(546);
      await createItem546.wait();
      const getApprove1NFT = await nft.connect(addr1).approve(nerf.address, 546);
      await getApprove1NFT.wait();
      const listItem546 = await nerf.connect(addr1).listItem(546, parseUnits("100", decimals));
      await listItem546.wait();
      const getApprove2Token = await token.connect(addr2).approve(nerf.address, parseUnits("100", decimals));
      await getApprove2Token.wait();
      const tradeItem546 = await nerf.connect(addr2).buyItem(546);
      await tradeItem546.wait();
      await expect(nerf.connect(addr1).cancel(546)).to.be.revertedWith("Order isnt actual");
    });
  });

});
