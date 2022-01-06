import { task } from "hardhat/config";
import { parseUnits } from "ethers/lib/utils";
//import { ethers } from "hardhat";
//import { hexConcat } from "@ethersproject/bytes";

task("cancel", "Cancel trade on platform")
.addParam("index", "NFT index")
.setAction(async (taskArgs, hre) => {
    const [addr1, addr2, ...addrs] = await hre.ethers.getSigners();

    const nerf = await hre.ethers.getContractAt("Nerf", process.env.NERF_ADDR as string);
    const token = await hre.ethers.getContractAt("ERC20", process.env.TOKEN_ADDR as string);
    const nft = await hre.ethers.getContractAt("NFT", process.env.NFT_ADDR as string);

    const cancelTrade = await nerf.connect(addr1).cancel(taskArgs.index);
    await cancelTrade.wait();

    console.log('cancel task Done!'); 
});