export interface networkConfigItem {
    ethUsdPriceFeed?: string
    blockConfirmations?: number
}
export interface networkConfigInfo {
    [key: string]: networkConfigItem
}

const networkConfig: networkConfigInfo = {
    goerli: {
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
        blockConfirmations: 6,
    },
}

export const developmentChain = ["hardhat", "localhost"]
