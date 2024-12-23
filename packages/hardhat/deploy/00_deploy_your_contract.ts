const { deployments, getNamedAccounts } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const contract = await deploy("Betting", {
        from: deployer,
        log: true, // Логи процесса деплоя
    });

    console.log("Betting deployed at address: ${contract.address}");
};

module.exports.tags = ["Betting"];