import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [selectedFruit, setSelectedFruit] = useState("");
  const [fruitQuantity, setFruitQuantity] = useState(1);
  const [depositAmount, setDepositAmount] = useState(0);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts[0]);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({
      method: "eth_requestAccounts",
    });
    handleAccount(accounts[0]);

    // once wallet is set, we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(
      contractAddress,
      atmABI,
      signer
    );

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      try {
        const currentBalance = await atm.getBalance();
        console.log("Current Balance:", currentBalance.toNumber());
        setBalance(currentBalance.toNumber());
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
  };

  const deposit = async (amount) => {
    if (atm) {
      let tx = await atm.deposit(amount);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    }
  };

  const buyItem = async () => {
    if (atm && selectedFruit) {
      let tx = await atm.buyItem(selectedFruit);
      await tx.wait();
      getBalance();
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask to use this Mart.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your Metamask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <div>
          <label>Select Fruit:</label>
          <select
            value={selectedFruit}
            onChange={(e) => setSelectedFruit(e.target.value)}
          >
            <option value="orange">Orange</option>
            <option value="apple">Apple</option>
            <option value="mango">Mango</option>
          </select>
        </div>
        <div>
          <label>Quantity:</label>
          <input
            type="number"
            min="1"
            value={fruitQuantity}
            onChange={(e) => setFruitQuantity(e.target.value)}
          />
        </div>
        <div>
          <label>Deposit Amount (ETH):</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
        </div>
        <button onClick={() => deposit(depositAmount)}>Deposit</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <button onClick={buyItem}>Buy</button>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters Mart!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
