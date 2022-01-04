const hre = require("hardhat");

async function main() {
  
  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy();

  await nft.deployed();
  
  //const Nerf = await hre.ethers.getContractFactory("Nerf");
  //const nerf = await Nerf.deploy(process.env.TOKEN_ADDR, process.env.NFT_ADDR);

  //await nerf.deployed();

  console.log("Nft deployed to:", nft.address);
  //console.log("Nerf deployed to:", nerf.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
