# E-ETH Auction
<p style="text-align:right;"> <b> Team </b> - <b> SoBers </b> <br> Aman Kumar Kashyap <br> Aman Rojjha <br> VJS Pranavasri </p>

## Code Structure

```zsh
.
├── client                                          // Frontend 
├── Documentation.md
├── Instructions.md
├── LICENSE
├── README.md
└── truffle                                         // Backend
```

## Requirements
1. [Ganache](https://trufflesuite.com/ganache/)
2. [Truffle](https://trufflesuite.com/)
3. [Metamask](https://metamask.io/)
4. [Solidity]()
5. [NPM](https://www.npmjs.com)
6. React JS
7. web3.js

---

## Instructions 
To run this project:
- Open the `truffle` directory in a terminal and execute 

```zsh
truffle compile 
truffle migrate --network development
```

- Open the `client` directory in another terminal and execute `npm start`.

---

## Workflow

### Setup Auction
1. Setup the requrirements and login to *MetaMask* wallet.
2. Setup *Ethereum Development Network* using Ganache.
3. Connect Metamask wallet to local development network. Make sure that ganache deploys the network on port $8545$.
4. Link accounts to respective *suppliers*, *manufacturers* and *customers*/ *buyers*. To link an account:
	1. Copy *PRIVATE KEY* of the account from ganache.
	2. Click on import wallet tab in Metamask extension.
	3. Paste the *PRIVATE KEY* and connect it.
	4. To assign private keys to supplier/ manufacturer, go to the **Assign** tab at the top of webpage.
5. Suppliers update respective supplies.
	1. Go to *Market* tab for respective supplier.
	2. Add quantity and price and click on update supply.

### Bidding Process
To start the bidding process, *escrow/ owner* sets *auction status* to **PENDING BID**.
#### Secret Bidding
For all *manufacturers*,
1. Enter quantity and price in *Bid* tab.
2. Click on *Secret Bid*.

#### Revealing Bids
> After all manufacturers set their secret-bids, *escrow/ owner* changes the auction status to **PENDING VERIFICATION**.

For all *manufacturers*,
1. Enter quantity and price in *Bid* tab.
2. Click on *Bid*. Values are accepted and updated respectively until input data corresponds to the previously bid values during *secret bidding*.

### Optimal Auction
> After all the manufacturers *successfully* reveal their values, *escrow/ owner* changes the auction status to **CAN START** (auction).

*Escrow/ Owner* clicks on *START AUCTION* in Home tab.

### Manufacture Cars
> Optimal auction allocates car bodies and wheels respctively.

To generate cars,  the manufactuer clicks on *Manufacture Cars* in *Supply* tab respectively.

### Customers  
To buy a car from either manufacturer:
1. Customer logs into his account in Metamask.
2. He clicks on *Buy Car* button in the *Buy Car* tab.

---

## Features 
### Secret First-Price Auction
> *Two-round* auction with secret-bids following revealing the bids.
#### Why
In case some competitor has access to others bids before the auction, he can influence/ change his respective bids for winning.
#### How
We make the auction *stateful* to differentiate between *manufactuerers* in process of *placing bids* until all *manufacturers* are done. We require each manufacturer to commit the **keccak** *hash* of their respective bid values while they place bids. Thus, other manufacturers don't have access to their bids during the auction.
#### Reveal-ation and Verification
After all the manufacturers place their *secret bids*, they can safely reveal their bids. We need to verify the revealed bids (for legitimacy in auction). We allow multiple tries for manufacturers to successfully reveal their bids (by checking corresponding hash values) and when verified, we update the acutal bid values in our auction.

### Verification of  Car Legitimacy
To verify the legitimacy of car:
- We check that *unique ID* of car doesn't match with any cars manufactured (irrespective of its ownership with *manufacturer* or a *customer*).
- In addition, we also check uniqueness of corresponding parts in the car - **wheel ID** and **body ID** with the respective *suppliers*. 

### Backend
> Refer to [[Documentation]].

Added *getter functions* for requesting values of *manufacture cars*, *supply cars*, *auction status* etc. and some other minor changes.

## Front-End
> A minimalistic UI/UX for interacting with the auction.
- In case of *suppliers*, *manufacturers* and *escrow*, we cater their use-cases with the corresponding frontend.
- Buying and verification process is as easy as clicking a single button.

---

## Test Cases
  
### Case 1 -  All bids fulfilled

- The initial supply and price of Vedanta, MRF and CEAT are set to [100, 100], [100, 200], [100, 100] respectively.

- TATA bids `10` bodies at `100` each from **Vedanta** and `5` wheels for `200` each from **MRF**

- Maruti bids `20` bodies at `200` each from **Vedanta** and `10` wheels for `200` each from **CEAT**

- On running optimal resource allocation First Maruti is allocated `10` bodies from **Vedanta** and `10` wheels from **CEAT**. Then TATA is allocated `5` bodies from **Vedanta** and `5` Wheels from **MRF**

- Now all the remaining products are allocated based on Profit optimisation, as there are sufficient supply available both Maruti and TATA get all the supplies they bid for.

- In the end TATA has `10` bodies and `5` wheels and Maruti has `20` Bodies and `10` Wheels.

- **Vedanta** has `70` bodies remaining, **MRF** has `95` wheels remaining and **CEAT** has `90` wheels remaining.

### Case 2 - Optimal Resource Allocation

-  The initial supply and price of Vedanta, MRF and CEAT are set to [10, 100], [10, 200], [10, 100] respectively.

- TATA bids `10` bodies at `100` each from **Vedanta** and `5` wheels for `200` each from **MRF**

- Maruti bids `7` bodies at `100` each from **Vedanta** and `7` wheels for `100` each from **CEAT**

- On running optimal resource allocation First Maruti is allocated `7` bodies from **Vedanta** and `7` wheels from **CEAT**. Then TATA is allocated `3` bodies from **Vedanta** and `3` Wheels from **MRF**

- Vedanta is now exhausted, No more bids are left for CEAT. **MRF** has bid for `2` more items from **TATA**, as Optimal resource is done, **MRF** allocates to **TATA**.

- In the end TATA has `3` bodies and `5` wheels and Maruti has `7` Bodies and `7` Wheels.

- **Vedanta** has `0` bodies remaining, **MRF** has `5` wheels remaining and **CEAT** has `3` wheels remaining.

### Case 3 - Optimal Resource Allocation followed by Profit Optimization

- The initial supply and price of Vedanta, MRF and CEAT are set to [15, 100], [10, 200], [10, 100] respectively.

- TATA bids `10` bodies at `100` each from **Vedanta** and `5` wheels for `200` each from **MRF**

- Maruti bids `10` bodies at `200` each from **Vedanta** and `7` wheels for `100` each from **CEAT**

- On running optimal resource allocation First Maruti is allocated `7` bodies from **Vedanta** and `7` wheels from **CEAT**. Then TATA is allocated `5` bodies from **Vedanta** and `5` Wheels from **MRF**

- **Vedanta** has `3` bodies remaining, **MRF** has `5` wheels remaining and **CEAT** has `3` wheels remaining.

- Vedanta has bids for `5` bodies at `100` from **TATA** and `3` bodies at `200` from **Maruti** , No more bids are left for CEAT and MRF.

- Vednta allocates `3` bodies to **Maruti** as that ensures the highest profit (as optimal resource allocation is done)

- In the end TATA has `5` bodies and `5` wheels and Maruti has `10` Bodies and `7` Wheels.

- **Vedanta** has `0` bodies remaining, **MRF** has `5` wheels remaining and **CEAT** has `3` wheels remaining.

---
