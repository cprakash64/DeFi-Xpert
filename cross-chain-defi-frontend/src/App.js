import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import styled, { createGlobalStyle } from 'styled-components';
import YieldOptimization from './contracts/YieldOptimization.json';

// Load environment variables
const alchemyApiKey = process.env.REACT_APP_ALCHEMY_API_KEY;

// Global styles
const GlobalStyle = createGlobalStyle`
  body {
    background: linear-gradient(90deg, #141e30, #243b55);
    color: #fff;
    font-family: 'Arial', sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
  }
`;

// Styled components
const Container = styled.div`
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0px 0px 15px 2px rgba(255, 255, 255, 0.2);
  width: 400px;
`;

const Title = styled.h1`
  font-size: 2em;
  margin-bottom: 20px;
  color: #00ffdd;
`;

const Button = styled.button`
  background: #00ffdd;
  border: none;
  border-radius: 5px;
  color: #000;
  padding: 10px 20px;
  margin: 10px;
  cursor: pointer;
  font-size: 1em;
  transition: background 0.3s;

  &:hover {
    background: #00ccb5;
  }
`;

const App = () => {
  const [account, setAccount] = useState('');
  const [latestPrice, setLatestPrice] = useState(0);
  const [historicalPrice, setHistoricalPrice] = useState(0);
  const web3 = new Web3(`https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`);

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (Web3.givenProvider) {
        try {
          const accounts = await web3.eth.requestAccounts();
          setAccount(accounts[0]);
          const networkId = await web3.eth.net.getId();
          const deployedNetwork = YieldOptimization.networks[networkId];
          if (!deployedNetwork) {
            console.error("Contract not deployed on the current network.");
            return;
          }
          const contract = new web3.eth.Contract(
            YieldOptimization.abi,
            deployedNetwork && deployedNetwork.address
          );

          // Listen to events
          contract.events.LatestPrice({}, (error, event) => {
            if (error) {
              console.error("Error receiving LatestPrice event", error);
            } else {
              console.log("LatestPrice event:", event);
              setLatestPrice(event.returnValues.price);
            }
          });

          contract.events.HistoricalPrice({}, (error, event) => {
            if (error) {
              console.error("Error receiving HistoricalPrice event", error);
            } else {
              console.log("HistoricalPrice event:", event);
              setHistoricalPrice(event.returnValues.price);
            }
          });

          await contract.methods.emitLatestPrice().send({ from: accounts[0] });
          await contract.methods.emitHistoricalPrice(100).send({ from: accounts[0] });

          const latestPrice = await contract.methods.getLatestPrice().call();
          console.log("Latest Price:", latestPrice);
          setLatestPrice(latestPrice);

          // Fetch a historical price example (roundId should be dynamic)
          const historicalPrice = await contract.methods.getHistoricalPrice(100).call();
          console.log("Historical Price:", historicalPrice);
          setHistoricalPrice(historicalPrice);
        } catch (error) {
          console.error("Failed to load blockchain data", error);
        }
      } else {
        console.error("No Web3 provider found. Please install Metamask.");
      }
    };

    loadBlockchainData();
  }, [web3.eth]);

  const provideLiquidity = async () => {
    try {
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = YieldOptimization.networks[networkId];
      if (!deployedNetwork) {
        console.error("Contract not deployed on the current network.");
        return;
      }
      const contract = new web3.eth.Contract(
        YieldOptimization.abi,
        deployedNetwork && deployedNetwork.address
      );
      await contract.methods.provideLiquidity().send({ from: account, value: web3.utils.toWei('1', 'Ether') });
      console.log("Liquidity provided successfully.");
    } catch (error) {
      console.error("Failed to provide liquidity:", error);
    }
  };

  const yieldFarm = async () => {
    try {
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = YieldOptimization.networks[networkId];
      if (!deployedNetwork) {
        console.error("Contract not deployed on the current network.");
        return;
      }
      const contract = new web3.eth.Contract(
        YieldOptimization.abi,
        deployedNetwork && deployedNetwork.address
      );
      await contract.methods.yieldFarm().send({ from: account });
      console.log("Yield farming executed successfully.");
    } catch (error) {
      console.error("Failed to execute yield farming:", error);
    }
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <Title>Cross-Chain AI-Driven DeFi Aggregator</Title>
        <p><strong>Account:</strong> {account}</p>
        <p><strong>Latest Price:</strong> {latestPrice}</p>
        <p><strong>Historical Price:</strong> {historicalPrice}</p>
        <Button onClick={provideLiquidity}>Provide Liquidity</Button>
        <Button onClick={yieldFarm}>Yield Farm</Button>
      </Container>
    </>
  );
};

export default App;
