import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import YieldOptimization from './contracts/YieldOptimization.json';

const App = () => {
  const [account, setAccount] = useState('');
  const [price, setPrice] = useState(0);
  const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');

  useEffect(() => {
    const loadBlockchainData = async () => {
      const accounts = await web3.eth.requestAccounts();
      setAccount(accounts[0]);
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = YieldOptimization.networks[networkId];
      const contract = new web3.eth.Contract(
        YieldOptimization.abi,
        deployedNetwork && deployedNetwork.address
      );
      const price = await contract.methods.getLatestPrice().call();
      setPrice(price);
    };

    loadBlockchainData();
  }, []);

  return (
    <div>
      <h1>Cross-Chain AI-Driven DeFi Aggregator</h1>
      <p>Account: {account}</p>
      <p>Latest Price: {price}</p>
    </div>
  );
};

export default App;
