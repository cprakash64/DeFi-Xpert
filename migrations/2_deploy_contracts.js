const YieldOptimization = artifacts.require("YieldOptimization");

module.exports = function(deployer) {
  const priceFeedAddress = "0xe7656e23fE8077D438aEfbec2fAbDf2D8e070C4f"; // Replace with actual Chainlink price feed address on Polygon
  deployer.deploy(YieldOptimization, priceFeedAddress);
};
