const Market = artifacts.require("Market.sol");
const LOG = true;

const { SUPPLIERS, MANUFACTURERS, AUCTION_STATUS } = require("./constants.js");

contract("Market Test 1", (accounts) => {
  let initialBalance = web3.eth.getBalance(accounts[0]);
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
    await market.updateSupply(100, 100, { from: accounts[1] });
    await market.updateSupply(100, 200, { from: accounts[2] });
    await market.updateSupply(100, 100, { from: accounts[3] });
    let supply = await market.getSupply(1);
    // console.log(supply);
    // Since solidity 0.5, memory needs to be returned
    // https://stackoverflow.com/questions/58258808/data-location-must-be-memory-for-return-parameter-in-function-but-none-was-gi
    assert.equal(supply[0].words[0], 100);
    assert.equal(supply[1].words[0], 100);
  })

  // Should change auction status to PENDING_BID
  it("should start the auction", async () => {
    let market = await Market.deployed();
    await market.changeAuctionStatus(AUCTION_STATUS.PENDING_BID);
    // let auctionStatus = await market.getAuctionStatus().call();
    // assert.equal(auctionStatus, AUCTION_STATUS.PENDING_BID);
  });

  // Should do a secret bid
  it("should secret bid in auction", async () => {
    let market = await Market.deployed();
    await market.secretBid(SUPPLIERS.VEDANTA, await market.generateBidHash.call(SUPPLIERS.VEDANTA, 10, 100, { from: accounts[4] }), { from: accounts[4] });
    await market.secretBid(SUPPLIERS.MRF, await market.generateBidHash.call(SUPPLIERS.MRF, 5, 200, { from: accounts[4] }), { from: accounts[4] });

    await market.secretBid(SUPPLIERS.VEDANTA, await market.generateBidHash.call(SUPPLIERS.VEDANTA, 20, 200, { from: accounts[5] }), { from: accounts[5] });
    await market.secretBid(SUPPLIERS.CEAT, await market.generateBidHash.call(SUPPLIERS.CEAT, 10, 200, { from: accounts[5] }), { from: accounts[5] });
    await market.changeAuctionStatus(AUCTION_STATUS.PENDING_VERIFICATION);

  });

  it("should bid auction", async () => {
    let market = await Market.deployed();
    initialBalance = await market.getEscrowBalance();
    await market.bid(SUPPLIERS.VEDANTA, 10, 100, {
      from: accounts[4],
      value: 1000,
    });
    await market.bid(SUPPLIERS.MRF, 5, 200, { from: accounts[4], value: 1000 });

    await market.bid(SUPPLIERS.VEDANTA, 20, 200, {
      from: accounts[5],
      value: 4000,
    });
    await market.bid(SUPPLIERS.CEAT, 10, 200, {
      from: accounts[5],
      value: 2000,
    });
    let balance = await market.getEscrowBalance();

    assert.equal(balance.words[0], initialBalance.words[0] + 8000);
    await market.changeAuctionStatus(AUCTION_STATUS.CAN_START);
    // let auctionStatus = await market.getAuctionStatus().call();
    // assert.equal(auctionStatus, AUCTION_STATUS.CAN_START);
  });

  it("should start auction", async () => {
    let market = await Market.deployed();

    // Total amount of transactions that will be happening
    await market.auction({from:accounts[0], value: 8000});

    await market.changeAuctionStatus(AUCTION_STATUS.NOT_STARTED);
    // Log all events
  })

  it("Manufacturer can verify uniqueness", async () => {
    let market = await Market.deployed();
    let supplyID = await market.getSupplyIDFromSupply(1, 1, {from: accounts[5]});
    // let unique = await market.checkUnique(supplyID, {from: accounts[5]});
    console.log("Unique id is: ", supplyID);
    // assert.equal(supplierNumber, SUPPLIERS.CEAT);
  })

  it("Manufacturer can verify supplier", async () => {
    let market = await Market.deployed();
    let supplierNumber = await market.getSupplierFromSupply(1, 1, {from: accounts[5]});
    // console.log(supplierNumber);
    assert.equal(supplierNumber, SUPPLIERS.CEAT);
  })

  it("Manufacturer can verify owner", async () => {
    let market = await Market.deployed();
    let manufacturerNumber = await market.getManufacturerFromSupply(1, 1, {from: accounts[4]});
    // console.log(manufacturerNumber);
    assert.equal(manufacturerNumber, MANUFACTURERS.TATA);
  })

  // Manufacture cars
  it("should manufacture cars", async () => {
    let market = await Market.deployed();

    await market.manufactureCars(1000, { from: accounts[4] });
    await market.manufactureCars(2000, { from: accounts[5] });

    let manSup = await market.getManufacturerSupply({ from: accounts[4] });
    console.log(manSup);
    manSup  = await market.getManufacturerSupply({ from: accounts[5] });
    console.log(manSup);
  })

  // Get price of car as customer from accounts[6]
  it("should get price of car and buy it", async () => {
    let market = await Market.deployed();
    let price = await market.getCarPrice(MANUFACTURERS.TATA, { from: accounts[6] });
    console.log(price);
    await market.buyCar(MANUFACTURERS.TATA, { from: accounts[6], value: price });
  })

  // Check my cars
  it("should check my cars", async () => {
    let market = await Market.deployed();
    let myCars = await market.getMyCars({ from: accounts[6] });
    console.log(myCars);
  })

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
