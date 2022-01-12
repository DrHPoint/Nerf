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
      const artist1 = await nerf.connect(owner).getArtistRole(addr1.address);
      await artist1.wait();
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
      const artist1 = await nerf.connect(owner).getArtistRole(addr1.address);
      await artist1.wait();
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
      const artist1 = await nerf.connect(owner).getArtistRole(addr1.address);
      await artist1.wait();
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
      const artist1 = await nerf.connect(owner).getArtistRole(addr1.address);
      await artist1.wait();
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
      const artist1 = await nerf.connect(owner).getArtistRole(addr1.address);
      await artist1.wait();
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
      const artist1 = await nerf.connect(owner).getArtistRole(addr1.address);
      await artist1.wait();
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

    it("try cancel without rights", async () => {
      await token.deployed();
      await nft.deployed();
      await nerf.deployed();
      const setMinterRole = await nft.connect(owner).setMinterRole(nerf.address);
      await setMinterRole.wait();
      const decimals = await token.decimals();
      const mint = await token.connect(owner).mint(addr2.address, parseUnits("100", decimals));
      await mint.wait();
      const artist1 = await nerf.connect(owner).getArtistRole(addr1.address);
      await artist1.wait();
      const createItem546 = await nerf.connect(addr1).createItem(546);
      await createItem546.wait();
      const getApprove1NFT = await nft.connect(addr1).approve(nerf.address, 546);
      await getApprove1NFT.wait();
      const listItem546 = await nerf.connect(addr1).listItem(546, parseUnits("100", decimals));
      await listItem546.wait();
      await expect(nerf.connect(addr2).cancel(546)).to.be.revertedWith("User has no rights to this token");
    });
  });


  describe("Item (second part)", () => {
    it("Create Item and list on Auction", async () => {
      await token.deployed();
      await nft.deployed();
      await nerf.deployed();
      const setMinterRole = await nft.connect(owner).setMinterRole(nerf.address);
      await setMinterRole.wait();
      const decimals = await token.decimals();
      const mint = await token.connect(owner).mint(addr2.address, parseUnits("200", decimals));
      await mint.wait();
      const mint3 = await token.connect(owner).mint(addr3.address, parseUnits("300", decimals));
      await mint3.wait();
      const artist1 = await nerf.connect(owner).getArtistRole(addr1.address);
      await artist1.wait();
      const createItem546 = await nerf.connect(addr1).createItem(546);
      await createItem546.wait();
      const getApprove1NFT = await nft.connect(addr1).approve(nerf.address, 546);
      await getApprove1NFT.wait();
      const listItem546 = await nerf.connect(addr1).listItemOnAuction(546, parseUnits("100", decimals), parseUnits("1", decimals));
      await listItem546.wait();
      const getApprove2Token = await token.connect(addr2).approve(nerf.address, parseUnits("101", decimals));
      await getApprove2Token.wait();
      const Bid546_2 = await nerf.connect(addr2).makeBid(546, parseUnits("101", decimals));
      await Bid546_2.wait();
      const getApprove3Token = await token.connect(addr3).approve(nerf.address, parseUnits("102", decimals));
      await getApprove3Token.wait();
      const Bid546_3 = await nerf.connect(addr3).makeBid(546, parseUnits("102", decimals));
      await Bid546_3.wait();
      await ethers.provider.send("evm_increaseTime", [3 * 86400]);
      await ethers.provider.send("evm_mine", []);
      const finish = await nerf.connect(addr1).finishAuction(546);
      await finish.wait();

    });

    it("Create Item and list on Auction with cancel after 3 days", async () => {
      await token.deployed();
      await nft.deployed();
      await nerf.deployed();
      const setMinterRole = await nft.connect(owner).setMinterRole(nerf.address);
      await setMinterRole.wait();
      const decimals = await token.decimals();
      const mint = await token.connect(owner).mint(addr2.address, parseUnits("200", decimals));
      await mint.wait();
      const mint3 = await token.connect(owner).mint(addr3.address, parseUnits("300", decimals));
      await mint3.wait();
      const artist1 = await nerf.connect(owner).getArtistRole(addr1.address);
      await artist1.wait();
      const createItem546 = await nerf.connect(addr1).createItem(546);
      await createItem546.wait();
      const getApprove1NFT = await nft.connect(addr1).approve(nerf.address, 546);
      await getApprove1NFT.wait();
      const listItem546 = await nerf.connect(addr1).listItemOnAuction(546, parseUnits("100", decimals), parseUnits("1", decimals));
      await listItem546.wait();
      await ethers.provider.send("evm_increaseTime", [3 * 86400]);
      await ethers.provider.send("evm_mine", []);
      const finish = await nerf.connect(addr1).cancelAuction(546);
      await finish.wait();
    });

    it("Create Item and list on Auction with cancel after 3 days + 2 bids", async () => {
      await token.deployed();
      await nft.deployed();
      await nerf.deployed();
      const setMinterRole = await nft.connect(owner).setMinterRole(nerf.address);
      await setMinterRole.wait();
      const decimals = await token.decimals();
      const mint = await token.connect(owner).mint(addr2.address, parseUnits("200", decimals));
      await mint.wait();
      const mint3 = await token.connect(owner).mint(addr3.address, parseUnits("300", decimals));
      await mint3.wait();
      const artist1 = await nerf.connect(owner).getArtistRole(addr1.address);
      await artist1.wait();
      const createItem546 = await nerf.connect(addr1).createItem(546);
      await createItem546.wait();
      const getApprove1NFT = await nft.connect(addr1).approve(nerf.address, 546);
      await getApprove1NFT.wait();
      const listItem546 = await nerf.connect(addr1).listItemOnAuction(546, parseUnits("100", decimals), parseUnits("1", decimals));
      await listItem546.wait();
      const getApprove2Token = await token.connect(addr2).approve(nerf.address, parseUnits("101", decimals));
      await getApprove2Token.wait();
      const Bid546_2 = await nerf.connect(addr2).makeBid(546, parseUnits("101", decimals));
      await Bid546_2.wait();
      const getApprove3Token = await token.connect(addr3).approve(nerf.address, parseUnits("102", decimals));
      await getApprove3Token.wait();
      const Bid546_3 = await nerf.connect(addr3).makeBid(546, parseUnits("102", decimals));
      await Bid546_3.wait();
      await ethers.provider.send("evm_increaseTime", [3 * 86400]);
      await ethers.provider.send("evm_mine", []);
      const finish = await nerf.connect(addr1).cancelAuction(546);
      await finish.wait();
    });

  });

  describe("Check errors (second part)", () => {
    it("List to auction with no rights", async () => {
      await token.deployed();
      await nft.deployed();
      await nerf.deployed();
      const setMinterRole = await nft.connect(owner).setMinterRole(nerf.address);
      await setMinterRole.wait();
      const decimals = await token.decimals();
      const mint = await token.connect(owner).mint(addr2.address, parseUnits("200", decimals));
      await mint.wait();
      const mint3 = await token.connect(owner).mint(addr3.address, parseUnits("300", decimals));
      await mint3.wait();
      const artist1 = await nerf.connect(owner).getArtistRole(addr1.address);
      await artist1.wait();
      const createItem546 = await nerf.connect(addr1).createItem(546);
      await createItem546.wait();
      const getApprove1NFT = await nft.connect(addr1).approve(nerf.address, 546);
      await getApprove1NFT.wait();
      await expect(nerf.connect(addr2).listItemOnAuction(546, parseUnits("100", decimals), parseUnits("1", decimals))).to.be.revertedWith("User has no rights to this token");
    });

    it("try bid after cancel auction", async () => {
      await token.deployed();
      await nft.deployed();
      await nerf.deployed();
      const setMinterRole = await nft.connect(owner).setMinterRole(nerf.address);
      await setMinterRole.wait();
      const decimals = await token.decimals();
      const mint = await token.connect(owner).mint(addr2.address, parseUnits("200", decimals));
      await mint.wait();
      const mint3 = await token.connect(owner).mint(addr3.address, parseUnits("300", decimals));
      await mint3.wait();
      const artist1 = await nerf.connect(owner).getArtistRole(addr1.address);
      await artist1.wait();
      const createItem546 = await nerf.connect(addr1).createItem(546);
      await createItem546.wait();
      const getApprove1NFT = await nft.connect(addr1).approve(nerf.address, 546);
      await getApprove1NFT.wait();
      const listItem546 = await nerf.connect(addr1).listItemOnAuction(546, parseUnits("100", decimals), parseUnits("1", decimals));
      await listItem546.wait();
      await ethers.provider.send("evm_increaseTime", [3 * 86400]);
      await ethers.provider.send("evm_mine", []);
      const finish = await nerf.connect(addr1).cancelAuction(546);
      await finish.wait();
      await expect(nerf.connect(addr3).makeBid(546, parseUnits("102", decimals))).to.be.revertedWith("Auction is over");
    });

    it("try bid with owner user", async () => {
      await token.deployed();
      await nft.deployed();
      await nerf.deployed();
      const setMinterRole = await nft.connect(owner).setMinterRole(nerf.address);
      await setMinterRole.wait();
      const decimals = await token.decimals();
      const mint = await token.connect(owner).mint(addr1.address, parseUnits("200", decimals));
      await mint.wait();
      const artist1 = await nerf.connect(owner).getArtistRole(addr1.address);
      await artist1.wait();
      const createItem546 = await nerf.connect(addr1).createItem(546);
      await createItem546.wait();
      const getApprove1NFT = await nft.connect(addr1).approve(nerf.address, 546);
      await getApprove1NFT.wait();
      const listItem546 = await nerf.connect(addr1).listItemOnAuction(546, parseUnits("100", decimals), parseUnits("1", decimals));
      await listItem546.wait();
      const getApprove1Token = await token.connect(addr1).approve(nerf.address, parseUnits("101", decimals));
      await getApprove1Token.wait();
      await expect(nerf.connect(addr1).makeBid(546, parseUnits("101", decimals))).to.be.revertedWith("User has rights to this token");
    });

    it("Bid less than the minimum raise", async () => {
      await token.deployed();
      await nft.deployed();
      await nerf.deployed();
      const setMinterRole = await nft.connect(owner).setMinterRole(nerf.address);
      await setMinterRole.wait();
      const decimals = await token.decimals();
      const mint = await token.connect(owner).mint(addr2.address, parseUnits("200", decimals));
      await mint.wait();
      const artist1 = await nerf.connect(owner).getArtistRole(addr1.address);
      await artist1.wait();
      const createItem546 = await nerf.connect(addr1).createItem(546);
      await createItem546.wait();
      const getApprove1NFT = await nft.connect(addr1).approve(nerf.address, 546);
      await getApprove1NFT.wait();
      const listItem546 = await nerf.connect(addr1).listItemOnAuction(546, parseUnits("100", decimals), parseUnits("1", decimals));
      await listItem546.wait();
      const getApprove2Token = await token.connect(addr2).approve(nerf.address, parseUnits("100", decimals));
      await getApprove2Token.wait();
      await expect(nerf.connect(addr2).makeBid(546, parseUnits("100", decimals))).to.be.revertedWith("Bid less than the minimum raise");
    });

    it("Make bid without approve", async () => {
      await token.deployed();
      await nft.deployed();
      await nerf.deployed();
      const setMinterRole = await nft.connect(owner).setMinterRole(nerf.address);
      await setMinterRole.wait();
      const decimals = await token.decimals();
      const mint = await token.connect(owner).mint(addr2.address, parseUnits("200", decimals));
      await mint.wait();
      const artist1 = await nerf.connect(owner).getArtistRole(addr1.address);
      await artist1.wait();
      const createItem546 = await nerf.connect(addr1).createItem(546);
      await createItem546.wait();
      const getApprove1NFT = await nft.connect(addr1).approve(nerf.address, 546);
      await getApprove1NFT.wait();
      const listItem546 = await nerf.connect(addr1).listItemOnAuction(546, parseUnits("100", decimals), parseUnits("1", decimals));
      await listItem546.wait();
      await expect(nerf.connect(addr2).makeBid(546, parseUnits("101", decimals))).to.be.reverted;
    });

    it("Try finish auction with one bid", async () => {
      await token.deployed();
      await nft.deployed();
      await nerf.deployed();
      const setMinterRole = await nft.connect(owner).setMinterRole(nerf.address);
      await setMinterRole.wait();
      const decimals = await token.decimals();
      const mint = await token.connect(owner).mint(addr2.address, parseUnits("200", decimals));
      await mint.wait();
      const artist1 = await nerf.connect(owner).getArtistRole(addr1.address);
      await artist1.wait();
      const createItem546 = await nerf.connect(addr1).createItem(546);
      await createItem546.wait();
      const getApprove1NFT = await nft.connect(addr1).approve(nerf.address, 546);
      await getApprove1NFT.wait();
      const listItem546 = await nerf.connect(addr1).listItemOnAuction(546, parseUnits("100", decimals), parseUnits("1", decimals));
      await listItem546.wait();
      const getApprove2Token = await token.connect(addr2).approve(nerf.address, parseUnits("101", decimals));
      await getApprove2Token.wait();
      const Bid546_2 = await nerf.connect(addr2).makeBid(546, parseUnits("101", decimals));
      await Bid546_2.wait();
      await ethers.provider.send("evm_increaseTime", [3 * 86400]);
      await ethers.provider.send("evm_mine", []);
      await expect(nerf.connect(addr1).finishAuction(546)).to.be.revertedWith("Not enough bids to finish auction");
    });

    it("Try finish auction without rights", async () => {
      await token.deployed();
      await nft.deployed();
      await nerf.deployed();
      const setMinterRole = await nft.connect(owner).setMinterRole(nerf.address);
      await setMinterRole.wait();
      const decimals = await token.decimals();
      const mint = await token.connect(owner).mint(addr2.address, parseUnits("200", decimals));
      await mint.wait();
      const artist1 = await nerf.connect(owner).getArtistRole(addr1.address);
      await artist1.wait();
      const createItem546 = await nerf.connect(addr1).createItem(546);
      await createItem546.wait();
      const getApprove1NFT = await nft.connect(addr1).approve(nerf.address, 546);
      await getApprove1NFT.wait();
      const listItem546 = await nerf.connect(addr1).listItemOnAuction(546, parseUnits("100", decimals), parseUnits("1", decimals));
      await listItem546.wait();
      const getApprove2Token = await token.connect(addr2).approve(nerf.address, parseUnits("101", decimals));
      await getApprove2Token.wait();
      const Bid546_2 = await nerf.connect(addr2).makeBid(546, parseUnits("101", decimals));
      await Bid546_2.wait();
      await ethers.provider.send("evm_increaseTime", [3 * 86400]);
      await ethers.provider.send("evm_mine", []);
      await expect(nerf.connect(addr3).finishAuction(546)).to.be.revertedWith("User has no rights to this token");
    });

    it("Try finish auction after finish", async () => {
      await token.deployed();
      await nft.deployed();
      await nerf.deployed();
      const setMinterRole = await nft.connect(owner).setMinterRole(nerf.address);
      await setMinterRole.wait();
      const decimals = await token.decimals();
      const mint = await token.connect(owner).mint(addr2.address, parseUnits("200", decimals));
      await mint.wait();
      const mint3 = await token.connect(owner).mint(addr3.address, parseUnits("300", decimals));
      await mint3.wait();
      const artist1 = await nerf.connect(owner).getArtistRole(addr1.address);
      await artist1.wait();
      const createItem546 = await nerf.connect(addr1).createItem(546);
      await createItem546.wait();
      const getApprove1NFT = await nft.connect(addr1).approve(nerf.address, 546);
      await getApprove1NFT.wait();
      const listItem546 = await nerf.connect(addr1).listItemOnAuction(546, parseUnits("100", decimals), parseUnits("1", decimals));
      await listItem546.wait();
      const getApprove2Token = await token.connect(addr2).approve(nerf.address, parseUnits("101", decimals));
      await getApprove2Token.wait();
      const Bid546_2 = await nerf.connect(addr2).makeBid(546, parseUnits("101", decimals));
      await Bid546_2.wait();
      const getApprove3Token = await token.connect(addr3).approve(nerf.address, parseUnits("102", decimals));
      await getApprove3Token.wait();
      const Bid546_3 = await nerf.connect(addr3).makeBid(546, parseUnits("102", decimals));
      await Bid546_3.wait();
      await ethers.provider.send("evm_increaseTime", [3 * 86400]);
      await ethers.provider.send("evm_mine", []);
      const finish = await nerf.connect(addr1).finishAuction(546);
      await finish.wait();
      await expect(nerf.connect(addr1).finishAuction(546)).to.be.revertedWith("Auction already is over");
    });

    it("Try finish auction ahead of time", async () => {
      await token.deployed();
      await nft.deployed();
      await nerf.deployed();
      const setMinterRole = await nft.connect(owner).setMinterRole(nerf.address);
      await setMinterRole.wait();
      const decimals = await token.decimals();
      const mint = await token.connect(owner).mint(addr2.address, parseUnits("200", decimals));
      await mint.wait();
      const mint3 = await token.connect(owner).mint(addr3.address, parseUnits("300", decimals));
      await mint3.wait();
      const artist1 = await nerf.connect(owner).getArtistRole(addr1.address);
      await artist1.wait();
      const createItem546 = await nerf.connect(addr1).createItem(546);
      await createItem546.wait();
      const getApprove1NFT = await nft.connect(addr1).approve(nerf.address, 546);
      await getApprove1NFT.wait();
      const listItem546 = await nerf.connect(addr1).listItemOnAuction(546, parseUnits("100", decimals), parseUnits("1", decimals));
      await listItem546.wait();
      const getApprove2Token = await token.connect(addr2).approve(nerf.address, parseUnits("101", decimals));
      await getApprove2Token.wait();
      const Bid546_2 = await nerf.connect(addr2).makeBid(546, parseUnits("101", decimals));
      await Bid546_2.wait();
      const getApprove3Token = await token.connect(addr3).approve(nerf.address, parseUnits("102", decimals));
      await getApprove3Token.wait();
      const Bid546_3 = await nerf.connect(addr3).makeBid(546, parseUnits("102", decimals));
      await Bid546_3.wait();
      await expect(nerf.connect(addr1).finishAuction(546)).to.be.revertedWith("Auction isnt over");
    });
  });

});
