const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Betting Contract", function () {
    let Betting;
    let betting;
    let owner;
    let addr1;
    let addr2;
    

    beforeEach(async function () {
        // Получаем аккаунты
        [owner, addr1, addr2] = await ethers.getSigners();

        // Разворачиваем контракт перед каждым тестом
        Betting = await ethers.getContractFactory("Betting");
        betting = await Betting.deploy();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await betting.owner()).to.equal(owner.address);
        });

        it("Should have an initial status of Open", async function () {
            expect(await betting.status()).to.equal(0); // 0 соответствует BetStatus.Open
        });
    });

    describe("Placing Bets", function () {
        it("Should allow placing a bet for Team A", async function () {
            await betting.connect(addr1).placeBet(1, { value: 1 }); // 1 соответствует Outcome.TeamA
            const betDetails = await betting.getBetDetails();
            expect(betDetails[0].bettor).to.equal(addr1.address);
            expect(betDetails[0].amount).to.equal(1);
        });

        it("Should allow placing a bet for Team B", async function () {
            await betting.connect(addr2).placeBet(2, { value: 1 }); // 2 соответствует Outcome.TeamB
            const betDetails = await betting.getBetDetails();
            expect(betDetails[1].bettor).to.equal(addr2.address);
            expect(betDetails[1].amount).to.equal(1);
        });

        it("Should revert if trying to place a second bet for the same team", async function () {
            await betting.connect(addr1).placeBet(1, { value: 1 });
            await expect(betting.connect(addr1).placeBet(1, { value: 1 }))
                .to.be.revertedWith("Bet for Team A already placed");
        });

        it("Should revert if betting is closed", async function () {
            await betting.connect(addr1).placeBet(1, { value: 1 });
            await betting.closeBetting(1); // Закрываем ставки
            await expect(betting.connect(addr2).placeBet(2, { value: 1 }))
                .to.be.revertedWith("Betting is closed");
        });
    });

    describe("Closing Bets", function () {
        it("Should allow the owner to close betting and declare a winner", async function () {
            await betting.connect(addr1).placeBet(1, { value: 1 });
            await betting.connect(addr2).placeBet(2, { value: 2 });
            
            await expect(betting.closeBetting(1)).to.emit(betting, "WinnerDeclared").withArgs(1); // 1 соответствует Outcome.TeamA
            
            const betDetails = await betting.getBetDetails();
            expect(betDetails[0].bettor).to.equal(addr1.address);
            expect(betDetails[0].amount).to.equal(1);
            expect(betDetails[1].bettor).to.equal(addr2.address);
            expect(betDetails[1].amount).to.equal(2);
            expect(await betting.status()).to.equal(1); // 1 соответствует BetStatus.Closed
        });
        it("Should revert if non-owner tries to close betting", async function () {
          await expect(betting.connect(addr1).closeBetting(1))
              .to.be.revertedWith("Only owner can call this function");
      });
  });
});
