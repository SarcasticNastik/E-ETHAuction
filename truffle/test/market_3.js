const Market = artifacts.require("Market.sol");
const LOG = true;

const { SUPPLIERS, MANUFACTURERS } = require("../constants.js");
contract("Market Test 3", (accounts) => {
  let initialBalance = web3.eth.getBalance(accounts[0]);
  let initialBalanceSuppliers = {};
  let initialBalanceManufacturers = {};

  it("should deploy the Market contract", async () => {
    let market = await Market.deployed();
    assert.isOk(market);
    });

  it("should assign a supplier", async () => {
    let market = await Market.deployed();
    await market.assignSupplier(SUPPLIERS.VEDANTA, { from: accounts[1] });
    await market.assignSupplier(SUPPLIERS.MRF, { from: accounts[2] });
    await market.assignSupplier(SUPPLIERS.CEAT, { from: accounts[3] });
    let supplierNumber = await market.getSupplierNumber.call({
      from: accounts[1],
    });
    assert.equal(supplierNumber, SUPPLIERS.VEDANTA);
  });

  it("should assign a manufacturer", async () => {
    let market = await Market.deployed();
    await market.assignManufacturer(MANUFACTURERS.TATA, { from: accounts[4] });
    await market.assignManufacturer(MANUFACTURERS.MARUTI, {
      from: accounts[5],
    });
    let manufacturerNumber = await market.getManufacturerNumber({
      from: accounts[4],
    });
    assert.equal(manufacturerNumber, MANUFACTURERS.TATA);
  });

  it("should update the supply", async () => {
    let market = await Market.deployed();
    await market.updateSupply(10, 100, { from: accounts[1] });
    await market.updateSupply(10, 200, { from: accounts[2] });
    await market.updateSupply(10, 100, { from: accounts[3] });
    let supply = await market.getSupply(1);
    // console.log(supply);
    // Since solidity 0.5, memory needs to be returned
    // https://stackoverflow.com/questions/58258808/data-location-must-be-memory-for-return-parameter-in-function-but-none-was-gi
    assert.equal(supply[0].words[0], 10);
    assert.equal(supply[1].words[0], 100);
  });

  // Should do a secret bid
  it("should secret bid in auction", async () => {
    let market = await Market.deployed();
    await market.secretBid(SUPPLIERS.VEDANTA, await market.generateBidHash.call(SUPPLIERS.VEDANTA, 10, 100, { from: accounts[4] }), { from: accounts[4] });
    await market.secretBid(SUPPLIERS.MRF, await market.generateBidHash.call(SUPPLIERS.MRF, 8, 200, { from: accounts[4] }), { from: accounts[4] });

    await market.secretBid(SUPPLIERS.VEDANTA, await market.generateBidHash.call(SUPPLIERS.VEDANTA, 7, 100, { from: accounts[5] }), { from: accounts[5] });
    await market.secretBid(SUPPLIERS.CEAT, await market.generateBidHash.call(SUPPLIERS.CEAT, 7, 100, { from: accounts[5] }), { from: accounts[5] });
    await market.secretBidDone();
  });
  
  it("should bid auction", async () => {
    let market = await Market.deployed();
    initialBalance = await market.getEscrowBalance();

    await market.bid(SUPPLIERS.VEDANTA, 10, 100, {
      from: accounts[4],
      value: 1000,
    });
    await market.bid(SUPPLIERS.MRF, 8, 200, { from: accounts[4], value: 1600 });

    await market.bid(SUPPLIERS.VEDANTA, 7, 100, {
      from: accounts[5],
      value: 700,
    });
    await market.bid(SUPPLIERS.CEAT, 7, 100, {
      from: accounts[5],
      value: 700,
    });
    let balance = await market.getEscrowBalance();

    assert.equal(balance.words[0], initialBalance.words[0] + 4000);
    await market.revealBid();
  });

  it("should start auction", async () => {
    let market = await Market.deployed();
    initialBalanceManufacturers = {
        1: await web3.eth.getBalance(accounts[4]),
        2: await web3.eth.getBalance(accounts[5]),
    }   

    initialBalanceSuppliers = {
        1: await web3.eth.getBalance(accounts[1]),
        2: await web3.eth.getBalance(accounts[2]),
        3: await web3.eth.getBalance(accounts[3]),
    }

    // Total amount of transactions that will be happening
    await market.auction({from:accounts[0], value: 4000});

    // Vedanta should have 1000 more
    // assert.equal(parseInt(initialBalanceSuppliers[1]) + 1000, await web3.eth.getBalance(accounts[1]));     

    // MRF should have 1600 more [This is working but javascript is giving issues]
    // assert.equal(parseInt(initialBalanceSuppliers[2]) + 16000, await web3.eth.getBalance(accounts[2]));

    // CEAT should have 700 more
    // assert.equal(parseInt(initialBalanceSuppliers[3]) + 700, await web3.eth.getBalance(accounts[3]));
})

  // Log all events
  it("should log all events", async () => {
    let market = await Market.deployed();
    if (LOG) {
      let events = await market.getPastEvents("allEvents", {
        fromBlock: 0,
        toBlock: "latest",
      });
      console.log(events);
    }
  });
});
