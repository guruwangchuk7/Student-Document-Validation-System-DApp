import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * @title Deploy CertificateRegistry
 * @dev Deploys the CertificateRegistry contract for educational certificate verification.
 */
const deployCertificateRegistry: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("CertificateRegistry", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract
  const certificateRegistry = await hre.ethers.getContract<Contract>("CertificateRegistry", deployer);
  const owner = await certificateRegistry.owner();
  console.log("📜 CertificateRegistry owner:", owner);
};

export default deployCertificateRegistry;
deployCertificateRegistry.tags = ["CertificateRegistry"];
