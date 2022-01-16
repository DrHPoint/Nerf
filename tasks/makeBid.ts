import { task } from "hardhat/config";
import { parseUnits } from "ethers/lib/utils";
//import { ethers } from "hardhat";
//import { hexConcat } from "@ethersproject/bytes";

task("makebid", "Make bid on platform")
.addParam("index", "NFT index")
.addParam("price", "bid for token")
.setAction(async (taskArgs, hre) => {
    const [addr1, addr2, ...addrs] = await hre.ethers.getSigners();

    const nerf = await hre.ethers.getContractAt("Nerf", process.env.NERF_ADDR as string);
    const token = await hre.ethers.getContractAt("ERC20", process.env.TOKEN_ADDR as string);
    const nft = await hre.ethers.getContractAt("NFT", process.env.NFT_ADDR as string);

    const decimals = await token.decimals();
    const getApprove2Token = await token.connect(addr2).approve(nerf.address, parseUnits(taskArgs.price, decimals));
    await getApprove2Token.wait();
    const tradeItem = await nerf.connect(addr2).makeBid(taskArgs.index, parseUnits(taskArgs.price, decimals));
    await tradeItem.wait();

    console.log('makebid task Done!'); 
});