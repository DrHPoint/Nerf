import { task } from "hardhat/config";
import { parseUnits } from "ethers/lib/utils";
//import { ethers } from "hardhat";
//import { hexConcat } from "@ethersproject/bytes";

task("setprimetime", "Set prime time of auctionset")
.addParam("time", "New prime time")
.setAction(async (taskArgs, hre) => {
  const [addr1, addr2, ...addrs] = await hre.ethers.getSigners();

  const nerf = await hre.ethers.getContractAt("Nerf", process.env.NERF_ADDR as string);
  await nerf.connect(addr1).setPrimeTime(taskArgs.time);

  console.log('setprimetime task Done!'); 
});