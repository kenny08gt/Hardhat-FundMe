import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert } from "chai"
import { deployments, ethers, getNamedAccounts } from "hardhat"
import { FundMe, MockV3Aggregator } from "../../typechain-types"

describe("FundMe", function () {
    let fundMe: FundMe
    let deployer: SignerWithAddress
    let mockV3Aggregator: MockV3Aggregator
    beforeEach(async () => {
        const accounts = await ethers.getSigners()
        deployer = accounts[0]

        await deployments.fixture(["all"])

        fundMe = await ethers.getContract("FundMe")
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
    })

    describe("constructor", function () {
        it("sets the aggregator addresses correctly", async function () {
            const response = await fundMe.priceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })
})
