const hre = require("hardhat");

async function main() {
  // USDC addresses
  const USDC_MUMBAI = "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23"; // Mumbai testnet (deprecated)
  const USDC_AMOY = "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"; // Amoy testnet
  const USDC_POLYGON = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // Polygon mainnet
  
  const network = await hre.ethers.provider.getNetwork();
  let USDC_ADDRESS;
  if (network.chainId === 137) {
    USDC_ADDRESS = USDC_POLYGON;
  } else if (network.chainId === 80002) {
    USDC_ADDRESS = USDC_AMOY;
  } else {
    USDC_ADDRESS = USDC_MUMBAI; // fallback for Mumbai
  }
  
  console.log("🚀 Deploying RaffleEscrow contract...");
  console.log(`📍 Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`💵 USDC Address: ${USDC_ADDRESS}`);
  
  const RaffleEscrow = await hre.ethers.getContractFactory("RaffleEscrow");
  const escrow = await RaffleEscrow.deploy(USDC_ADDRESS);
  
  await escrow.deployed();
  
  console.log("✅ RaffleEscrow deployed to:", escrow.address);
  
  // Wait for block confirmations
  console.log("⏳ Waiting for block confirmations...");
  await escrow.deployTransaction.wait(5);
  
  // Verify on Polygonscan
  console.log("🔍 Verifying contract on Polygonscan...");
  try {
    await hre.run("verify:verify", {
      address: escrow.address,
      constructorArguments: [USDC_ADDRESS],
    });
    console.log("✅ Contract verified!");
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
  }
  
  console.log("\n📋 Next steps:");
  console.log("1. Add contract address to your .env:");
  console.log(`   NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=${escrow.address}`);
  console.log("2. Update frontend to use escrow contract");
  console.log("3. Test with small amounts first!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
