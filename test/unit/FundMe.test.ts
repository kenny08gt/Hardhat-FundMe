import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { BigNumber } from "ethers"
import { deployments, ethers, getNamedAccounts } from "hardhat"
import { FundMe, MockV3Aggregator } from "../../typechain-types"

describe("FundMe", function () {
    let fundMe: FundMe
    let deployer: SignerWithAddress
    let mockV3Aggregator: MockV3Aggregator
    const sendValue: BigNumber = ethers.utils.parseEther("1")
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

    describe("fund", function () {
        it("Fails if you dont send enough ETH", async function () {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })

        it("Updated the amount funded ta structure", async () => {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.addressToAmountFunded(
                deployer.address
            )

            assert.equal(response.toString(), sendValue.toString())
        })

        it("Adds funder to array of funders", async () => {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.funders(0)
            assert.equal(funder, deployer.address)
        })
    })

    describe("withdraw", function () {
        beforeEach(async () => {
            await fundMe.fund({ value: sendValue })
        })

        it("withdraw ETH from a single founder", async () => {
            //arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer.address
            )
            //act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            const gasCost: BigNumber = transactionReceipt.gasUsed.mul(
                transactionReceipt.effectiveGasPrice
            )

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer.address
            )

            //assert
            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })

        it("Allows us to withdraw with multiple funders", async function () {
            //arrange
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }

            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer.address
            )

            //act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            const gasCost: BigNumber = transactionReceipt.gasUsed.mul(
                transactionReceipt.effectiveGasPrice
            )

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer.address
            )

            //assert
            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )

            // Make sure the funders are reset properly
            await expect(fundMe.funders(0)).to.be.reverted

            for (let i = 1; i < 6; i++) {
                assert.equal(
                    (
                        await fundMe.addressToAmountFunded(accounts[i].address)
                    ).toString(),
                    "0"
                )
            }
        })

        it("Only allows the owner to withdraw", async function () {
            const accounts = await ethers.getSigners()
            const attacker: SignerWithAddress = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)

            await expect(attackerConnectedContract.withdraw()).to.be.reverted
        })
    })

    describe("getVersion", function () {
        it("Should get the version of the priceFeed", async () => {
            const version = await fundMe.getVersion()
            assert.equal(version.toString(), "0")
        })
    })

    describe("fallback", function () {
        it("Test fallback function", async () => {
            const tx = deployer.sendTransaction({
                to: fundMe.address,
                data: "0x",
                gasLimit: 30000000,
            })

            await expect(tx).to.revertedWith("You need to spend more ETH!")
        })
    })

    describe("receive", function () {
        it("Test receive function", async () => {
            await expect(
                fundMe.fund({
                    value: "1000",
                })
            ).to.revertedWith("You need to spend more ETH!")
        })
    })
})
