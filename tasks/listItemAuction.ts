import { task } from "hardhat/config";
import { parseUnits } from "ethers/lib/utils";
//import { ethers } from "hardhat";
//import { hexConcat } from "@ethersproject/bytes";

task("listitemauction", "List item to auction on platform")
.addParam("index", "NFT index")
.addParam("price", "prime price for token")
.addParam("step", "step price")
.setAction(async (taskArgs, hre) => {
    const [addr1, addr2, ...addrs] = await hre.ethers.getSigners();

    const nerf = await hre.ethers.getContractAt("Nerf", process.env.NERF_ADDR as string);
    const token = await hre.ethers.getContractAt("ERC20", process.env.TOKEN_ADDR as string);
    const nft = await hre.ethers.getContractAt("NFT", process.env.NFT_ADDR as string);

    const decimals = await token.decimals();
    const getApprove1NFT = await nft.connect(addr1).approve(nerf.address, taskArgs.index);
    await getApprove1NFT.wait();
    const listItem = await nerf.connect(addr1).listItemOnAuction(taskArgs.index, parseUnits(taskArgs.price, decimals), taskArgs.step);
    await listItem.wait();

    console.log('listitemauction task Done!'); 
});