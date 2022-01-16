import { task } from "hardhat/config";
import { parseUnits } from "ethers/lib/utils";
//import { ethers } from "hardhat";
//import { hexConcat } from "@ethersproject/bytes";

task("setartist", "Get artist role in Nerf", async (args, hre) => {
  const [addr1, addr2, ...addrs] = await hre.ethers.getSigners();

  const nerf = await hre.ethers.getContractAt("Nerf", process.env.NERF_ADDR as string);
  await nerf.connect(addr1).setMinterRole(addr1.address);

  console.log('setartist task Done!'); 
});