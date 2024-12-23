// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Betting {
    enum BetStatus { Open, Closed }
    enum Outcome { None, TeamA, TeamB }

    struct Bet {
        address payable bettor;
        uint256 amount;
        Outcome outcome;
    }

    address public owner;
    BetStatus public status;
    Bet public betTeamA;
    Bet public betTeamB;
    Outcome public winningOutcome;

    event BetPlaced(address indexed bettor, uint256 amount, Outcome outcome);
    event WinnerDeclared(Outcome winner);

    constructor() {
        owner = msg.sender;
        status = BetStatus.Open;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyWhenOpen() {
        require(status == BetStatus.Open, "Betting is closed");
        _;
    }

    function placeBet(Outcome _outcome) external payable onlyWhenOpen {
        require(msg.value > 0, "Bet amount must be greater than zero");
        require(_outcome == Outcome.TeamA || _outcome == Outcome.TeamB, "Invalid outcome");

        if (_outcome == Outcome.TeamA) {
            require(betTeamA.bettor == address(0), "Bet for Team A already placed");
            betTeamA = Bet(payable(msg.sender), msg.value, _outcome);
        } else if (_outcome == Outcome.TeamB) {
            require(betTeamB.bettor == address(0), "Bet for Team B already placed");
            betTeamB = Bet(payable(msg.sender), msg.value, _outcome);
        }

        emit BetPlaced(msg.sender, msg.value, _outcome);
    }

    function closeBetting(Outcome _winningOutcome) external onlyOwner {
        require(status == BetStatus.Open, "Betting is already closed");
        status = BetStatus.Closed;
        winningOutcome = _winningOutcome;
        
        emit WinnerDeclared(winningOutcome);
        
        // Выплата выигрыша
        if (winningOutcome == Outcome.TeamA && betTeamA.bettor != address(0)) {
            betTeamA.bettor.transfer(betTeamA.amount + betTeamB.amount);
        } else if (winningOutcome == Outcome.TeamB && betTeamB.bettor != address(0)) {
            betTeamB.bettor.transfer(betTeamA.amount + betTeamB.amount);
        }
    }

    function getBetDetails() external view returns (Bet memory, Bet memory, BetStatus, Outcome) {
        return (betTeamA, betTeamB, status, winningOutcome);
    }
}