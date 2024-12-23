"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import "./style.css";
import { abi } from "../../hardhat/artifacts/contracts/YourContract.sol/Betting.json"; // Убедитесь, что ABI контракта указан правильно

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Замените на адрес вашего контракта

function Home() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [betAmount, setBetAmount] = useState("");
  const [outcome, setOutcome] = useState("1");
  const [winningOutcome, setWinningOutcome] = useState("1");
  const [statusMessage, setStatusMessage] = useState("");
  const [betDetails, setBetDetails] = useState(null);

  const _provider = new ethers.providers.Web3Provider(window.ethereum);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    try {
      await _provider.send("eth_requestAccounts", []);
      const _signer = _provider.getSigner();
      const _contract = new ethers.Contract(contractAddress, abi, _signer);

      setProvider(_provider);
      setSigner(_signer);
      setContract(_contract);

      setStatusMessage("Wallet connected successfully!");
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to connect wallet.");
    }
  };

  const placeBet = async () => {
    if (!contract) return alert("Connect your wallet first!");

    try {
      const tx = await contract.placeBet(outcome, {
        value: ethers.utils.parseEther(betAmount),
      });
      await tx.wait();
      setStatusMessage(`Bet placed successfully. Transaction hash: ${tx.hash}`);
    } catch (error) {
      console.error(error);
      setStatusMessage(`Error placing bet: ${error.message}`);
    }
  };

  const closeBetting = async () => {
    if (!contract) return alert("Connect your wallet first!");

    try {
      const tx = await contract.closeBetting(winningOutcome);
      await tx.wait();
      setStatusMessage(`Betting closed. Winner declared. Transaction hash: ${tx.hash}`);
    } catch (error) {
      console.error(error);
      setStatusMessage(`Error closing betting: ${error.message}`);
    }
  };

  const fetchBetDetails = async () => {
    if (!contract) return alert("Connect your wallet first!");

    try {
      const details = await contract.getBetDetails();
      setBetDetails(details);
      setStatusMessage("Bet details fetched successfully.");
    } catch (error) {
      console.error(error);
      setStatusMessage(`Error fetching bet details: ${error.message}`);
    }
  };

  return (
    <div className="App">
      <h1>Прежде чем начать делать ставки, давай подключим кошелек)</h1>
      <button className="wallet" onClick={connectWallet}>Подключить кошелек</button>
      <p>{statusMessage}</p>

      <h2>Выбери команду, за которую будешь голосовать и сделай ставку</h2>
      <input
        type="number"
        placeholder="Введите ставку (ETH)"
        value={betAmount}
        onChange={(e) => setBetAmount(e.target.value)}
      />
      <select value={outcome} onChange={(e) => setOutcome(e.target.value)}>
        <option value="1">Team A</option>
        <option value="2">Team B</option>
      </select>
      <button onClick={placeBet}>Поставить</button>

      <h2>Закрыть ставки (Только обладающим правами)</h2>
      <select
        value={winningOutcome}
        onChange={(e) => setWinningOutcome(e.target.value)}
      >
        <option value="1">Team A</option>
        <option value="2">Team B</option>
      </select>
      <button onClick={closeBetting}>Закрыть ставки</button>

      <h2>Получить детали по ставкам</h2>
      <button onClick={fetchBetDetails}>Просмотр деталей</button>
      {betDetails && (
        <pre>
          {JSON.stringify(
            {
              betTeamA: {
                bettor: betDetails[0].bettor,
                amount: ethers.utils.formatEther(betDetails[0].amount),
              },
              betTeamB: {
                bettor: betDetails[1].bettor,
                amount: ethers.utils.formatEther(betDetails[1].amount),
              },
              status: betDetails[2],
              winningOutcome: betDetails[3],
            },
            null,
            2
          )}
        </pre>
      )}
    </div>
  );
}

export default Home;