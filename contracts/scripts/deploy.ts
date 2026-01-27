import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying RaffleEscrow contract...");

  // USDC addresses
  const USDC_MUMBAI = "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23"; // Mumbai testnet
  const USDC_POLYGON = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // Polygon mainnet

  const network = await ethers.provider.getNetwork();
  const usdcAddress = network.chainId === 137n ? USDC_POLYGON : USDC_MUMBAI;

  console.log(`📍 Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`💵 USDC Address: ${usdcAddress}`);

  const RaffleEscrow = await ethers.getContractFactory("RaffleEscrow");
  const raffleEscrow = await RaffleEscrow.deploy(usdcAddress);

  await raffleEscrow.waitForDeployment();

  const address = await raffleEscrow.getAddress();

  console.log("✅ RaffleEscrow deployed to:", address);
  console.log("\n📋 Next steps:");
  console.log("1. Verify contract on PolygonScan:");
  console.log(`   npx hardhat verify --network ${network.name} ${address} ${usdcAddress}`);
  console.log("2. Add contract address to your .env:");
  console.log(`   NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=${address}`);
  console.log("3. Update frontend to use escrow contract");

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
