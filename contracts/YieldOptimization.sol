// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract YieldOptimization {
    AggregatorV3Interface internal priceFeed;

    mapping(address => uint256) public deposits;
    uint256 public totalDeposits;

    // Interest rate for yield farming (e.g., 5%)
    uint256 public constant INTEREST_RATE = 5;

    constructor(address _priceFeed) {
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function getLatestPrice() public view returns (int) {
        (, int price, , ,) = priceFeed.latestRoundData();
        return price;
    }

    function getHistoricalPrice(uint80 _roundId) public view returns (int) {
        (, int price, , ,) = priceFeed.getRoundData(_roundId);
        return price;
    }

    function provideLiquidity() public payable {
        require(msg.value > 0, "You must send some Ether");
        deposits[msg.sender] += msg.value;
        totalDeposits += msg.value;
    }

    function yieldFarm() public {
        require(deposits[msg.sender] > 0, "No deposits to yield farm");

        uint256 initialDeposit = deposits[msg.sender];
        uint256 yield = (initialDeposit * INTEREST_RATE) / 100;

        deposits[msg.sender] += yield;
        totalDeposits += yield;
    }

    event LatestPrice(int price);
    event HistoricalPrice(int price);

    function emitLatestPrice() public {
        int price = getLatestPrice();
        emit LatestPrice(price);
    }

    function emitHistoricalPrice(uint80 _roundId) public {
        int price = getHistoricalPrice(_roundId);
        emit HistoricalPrice(price);
    }
}
