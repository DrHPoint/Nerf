import { task } from "hardhat/config";
import { parseUnits } from "ethers/lib/utils";
//import { ethers } from "hardhat";
//import { hexConcat } from "@ethersproject/bytes";

task("createitem", "Create item on platform")
.addParam("index", "NFT index")
.setAction(async (taskArgs, hre) => {
    const [addr1, addr2, ...addrs] = await hre.ethers.getSigners();

    const nerf = await hre.ethers.getContractAt("Nerf", process.env.NERF_ADDR as string);
    const createItem = await nerf.connect(addr1).createItem(taskArgs.index);
    await createItem.wait();

    console.log('createitem task Done!'); 
});