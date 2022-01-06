import { task } from "hardhat/config";
import { parseUnits } from "ethers/lib/utils";
//import { ethers } from "hardhat";
//import { hexConcat } from "@ethersproject/bytes";

task("listitem", "List item on platform")
.addParam("index", "NFT index")
.addParam("price", "price for token")
.setAction(async (taskArgs, hre) => {
    const [addr1, addr2, ...addrs] = await hre.ethers.getSigners();

    const nerf = await hre.ethers.getContractAt("Nerf", process.env.NERF_ADDR as string);
    const token = await hre.ethers.getContractAt("ERC20", process.env.TOKEN_ADDR as string);
    const nft = await hre.ethers.getContractAt("NFT", process.env.NFT_ADDR as string);

    const decimals = await token.decimals();
    const getApprove1NFT = await nft.connect(addr1).approve(nerf.address, taskArgs.index);
    await getApprove1NFT.wait();
    const listItem = await nerf.connect(addr1).listItem(taskArgs.index, parseUnits(taskArgs.price, decimals));
    await listItem.wait();

    console.log('listitem task Done!'); 
});