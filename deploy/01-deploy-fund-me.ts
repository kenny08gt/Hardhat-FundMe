import { verify } from "../utils/verify"
import { network } from "hardhat"
import {
    networkConfig,
    developmentChain,
    BLOCK_CONFIRMATIONS,
} from "../herlper-hardhat-config"
import { DeployFunction } from "hardhat-deploy/dist/types"

const deployFundMe: DeployFunction = async ({
    getNamedAccounts,
    deployments,
}) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId: number = network.config.chainId!

    let ethUsdPriceFeed
    if (developmentChain.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeed = ethUsdAggregator.address
    } else {
        ethUsdPriceFeed = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const args = [ethUsdPriceFeed]

    const fundMe = await deploy("FundMe", {
        contract: "FundMe",
        from: deployer,
        args: args, // put price feed address
        log: true,
        waitConfirmations: BLOCK_CONFIRMATIONS || 0,
    })

    log("------------------------------------------")

    if (
        !developmentChain.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
}

export default deployFundMe

deployFundMe.tags = ["all", "fundMe"]
