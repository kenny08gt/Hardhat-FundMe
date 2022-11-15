import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert } from "chai"
import { BigNumber } from "ethers"
import { ethers, network } from "hardhat"
import { developmentChain } from "../../herlper-hardhat-config"
import { FundMe } from "../../typechain-types"

developmentChain.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe: FundMe
          let deployer: SignerWithAddress
          const sendValue: BigNumber = ethers.utils.parseEther("0.01")
          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              deployer = accounts[0]
              fundMe = await ethers.getContract("FundMe")
          })

          it("Allows people to fund and withdraw", async function () {
              await fundMe.fund({ value: sendValue, gasLimit: 100000 })
              await fundMe.withdraw({
                  gasLimit: 100000,
              })
              const endingFundMeBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              console.log(
                  endingFundMeBalance.toString() +
                      " should equal 0, running assert equal..."
              )
              assert.equal(endingFundMeBalance.toString(), "0")
          })
      })
