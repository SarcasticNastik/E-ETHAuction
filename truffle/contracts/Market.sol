// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

/**
@title Supply Chain Management for Car Production and Distribution
@notice This contract is responsible for setting up the 
market for first-price auction for car components, used by 
the companies to manufacture cars which can be bought by 
customers.
@author Aman Rojjha, VJS Pranavasri
 */
contract Market {
    /**
    @notice Abstract representation for body/ wheel 
     */
    struct Supply {
        SUPPLIERS supplier;
        MANUFACTURERS manufacturer;
        bytes32 id;
    }

    /**
    @notice Struct to store data of suppliers 
     */
    struct Supplier {
        Supply[] supply;
        uint256 supplyCount;
        // store cost in wei
        uint256 cost;
    }

    /**
    @notice Struct for manufacturer and specifications of related fields
     */
    struct Manufacturer {
        int256 numWheels;
        int256 numBodies;
        int256 numCars;
        Supply[] bodies;
        Supply[] wheels;
        uint256 price;
        Car[] cars;
    }

    /**
  @notice Abstract representation of Car
   */
    struct Car {
        MANUFACTURERS manufacturer;
        address escrow;
        Supply wheel;
        Supply body;
        bytes32 id;
    }

    /**
    This enum specifies the available suppliers
     */
    enum SUPPLIERS {
        NULL,
        VEDANTA,
        MRF,
        CEAT
    }

    /**
    This enum specifies the available manufacturers
     */
    enum MANUFACTURERS {
        NULL,
        TATA,
        MARUTI
    }

    /**
    This enum specifies the types of supplies
     */
    enum SUPPLIES {
        NULL,
        WHEELS,
        BODIES
    }

    /**
    This enum tracks the auction status
     */
    enum AUCTION_STATUS {
        NOT_STARTED,
        PENDING_BID,
        PENDING_VERIFICATION,
        CAN_START,
        AUCTION_ENDED
    }

    /// @notice Mapping of suppliers enum to supplier
    mapping(SUPPLIERS => Supplier) suppliers;
    mapping(MANUFACTURERS => Manufacturer) manufacturers;

    /// @notice Mapping of manufacturers to escrow address
    mapping(uint256 => address payable) manufacturerOwners;
    mapping(address => uint256) manufacturerOwnersAddress;

    /// @notice Mapping of suppliers to escrow address
    mapping(uint256 => address payable) supplierOwners;
    mapping(address => uint256) supplierOwnersAddress;

    /// @notice Mapping for address to customer
    mapping(address => Car[]) customers;

    /// @notice Mapping of hashed bids
    mapping(MANUFACTURERS => mapping(SUPPLIERS => bytes32)) hashedBids;

    /// @notice Mapping of revealed bids
    mapping(MANUFACTURERS => mapping(SUPPLIERS => int256[2])) currentBids;

    /// @notice Auction status
    AUCTION_STATUS auctionStatus;

    /// @notice Seed for generating new id's
    uint256 global_seed;

    /// @notice Escrow Address
    address payable immutable escrow;

    /**
    @notice Initialize the contract properly. Set the calling function 
    address as escrow and initialize the auction status.
     */
    constructor() {
        escrow = payable(msg.sender);
        // Initialize bids, both values to -1
        currentBids[MANUFACTURERS.TATA][SUPPLIERS.VEDANTA] = [-1, -1];
        currentBids[MANUFACTURERS.TATA][SUPPLIERS.MRF] = [-1, -1];
        currentBids[MANUFACTURERS.MARUTI][SUPPLIERS.VEDANTA] = [-1, -1];
        currentBids[MANUFACTURERS.MARUTI][SUPPLIERS.CEAT] = [-1, -1];

        // Initialize auction status
        auctionStatus = AUCTION_STATUS.NOT_STARTED;

        // Initialize global_seed to 0
        global_seed = 0;
    }

    /**
    @notice Check if manufacturer can buy from supplier
    @param _supplier Supplier specified
     */
    function isSupportedSupplier(SUPPLIERS _supplier)
        public
        view
        returns (bool)
    {
        // If supplier is MRF, manufacturer has to be TATA
        if (_supplier == SUPPLIERS.MRF) {
            // "!TATA NO MRF"
            require(
                manufacturerOwnersAddress[msg.sender] ==
                    uint256(MANUFACTURERS.TATA)
            );
        }
        // If supplier is CEAT, manufacturer has to be MARUTI
        else if (_supplier == SUPPLIERS.CEAT) {
            // "!MARUTI NO CEAT"
            require(
                manufacturerOwnersAddress[msg.sender] ==
                    uint256(MANUFACTURERS.MARUTI)
            );
        }
        return true;
    }

    /**
    @notice Check ownership of message sender 
    @dev msg.sender should be escrow of any of the manufacturers or suppliers
    @param _owner address to be checked
     */
    function checkIfAlreadyOwner(address _owner) public view {
        require(escrow != payable(_owner));
        for (uint256 i = 0; i < 2; i++) {
            // You are already an escrow of a manufacturer
            require(manufacturerOwners[i] != _owner);
        }

        for (uint256 i = 0; i < 3; i++) {
            // "You are already an escrow of a supplier"
            require(supplierOwners[i] != _owner);
        }
    }

    /**
    @notice Create new 32-byte hash values
    @param _id Seed id for generating new data
    @return ABI-encoded Keccak256 hash of the provided paramteres
     */
    function generateHash(uint256 _id) private pure returns (bytes32) {
        return keccak256(abi.encodePacked("THIS IS SALT", _id));
    }

    /**
    @notice Create digest for a secret-bid placed by some manufacturer.
    @param _supplier Supplier
    @param quantity Number of items bid
    @param price price of each item bid
    @return ABI-encoded Keccak256 hash of provided parameters
     */
    function generateBidHash(
        SUPPLIERS _supplier,
        uint256 quantity,
        uint256 price
    ) public view returns (bytes32) {
        return keccak256(abi.encode(msg.sender, _supplier, quantity, price));
    }

    /**
    @notice Binds id to a given supplier
    @param supplier Supplier id
     */
    function assignSupplier(SUPPLIERS supplier) public {
        // Check if supplier is one of the three suppliers
        // "Supplier not found"
        require(
            supplier == SUPPLIERS.VEDANTA ||
                supplier == SUPPLIERS.MRF ||
                supplier == SUPPLIERS.CEAT
        );

        // Check if supplier is already assigned to someone else
        // "Supplier is already assigned to someone else"
        require(supplierOwners[uint256(supplier)] == address(0));

        // Check if already assigned to msg.sender
        // "You are already own this supplier"
        require(supplierOwners[uint256(supplier)] != msg.sender);

        // Check if msg.sender is escrow of manufacturer or supplier
        checkIfAlreadyOwner(msg.sender);

        // Assign supplier to msg.sender
        supplierOwners[uint256(supplier)] = payable(msg.sender);
        supplierOwnersAddress[msg.sender] = uint256(supplier);
    }

    /**
    @notice Assign Manufacturer their address
    @param manufacturer Manufacturer
     */
    function assignManufacturer(MANUFACTURERS manufacturer) public {
        // Check if manufacturer is one of the two manufacturers
        // "Manufacturer not found"
        require(
            manufacturer == MANUFACTURERS.TATA ||
                manufacturer == MANUFACTURERS.MARUTI
        );

        // Check if manufacturer is already assigned to someone else
        // "Manufacturer is already assigned to someone else"
        require(manufacturerOwners[uint256(manufacturer)] == address(0));

        // Check if already assigned to msg.sender
        // "You are already own this manufacturer"
        require(manufacturerOwners[uint256(manufacturer)] != msg.sender);

        // Check if msg.sender is escrow of manufacturer or supplier
        checkIfAlreadyOwner(msg.sender);

        // Assign manufacturer to msg.sender
        manufacturerOwners[uint256(manufacturer)] = payable(msg.sender);
        manufacturerOwnersAddress[msg.sender] = uint256(manufacturer);
    }

    /**
    @notice Check if owner
     */
    function isOwner() public view returns (bool) {
        return msg.sender == escrow;
    }

    /**
    @notice manufacturer number for the message sender (if any)
     */
    function getManufacturerNumber() public view returns (uint256) {
        // If msg.sender is in manufacturerOwners, return manufacturer number
        if (manufacturerOwnersAddress[msg.sender] != 0) {
            return manufacturerOwnersAddress[msg.sender];
        } else {
            return uint256(MANUFACTURERS.NULL);
        }
    }

    /**
    @notice supplier number for the message sender (if any)
     */
    function getSupplierNumber() public view returns (uint256) {
        // If msg.sender is in supplierOwnersAddress, return the value of the key
        if (supplierOwnersAddress[msg.sender] != 0) {
            return supplierOwnersAddress[msg.sender];
        } else {
            return uint256(SUPPLIERS.NULL);
        }
    }

    /**
    @notice Update supply details given supply quantity and cost
    @param _supply supply quantity
    @param _cost cost of the supply
     */
    function updateSupply(uint256 _supply, uint256 _cost) public {
        require(supplierOwnersAddress[msg.sender] != 0);

        // Update supply and cost of supplier
        suppliers[SUPPLIERS(getSupplierNumber())].supplyCount += _supply;
        suppliers[SUPPLIERS(getSupplierNumber())].cost = _cost;

        // If mrf and ceat supply is SUPPLIES.WHEELS
        // Otherwise, supply is SUPPLIES.BODIES
        SUPPLIES supply = SUPPLIES.BODIES;
        if (
            getSupplierNumber() == uint256(SUPPLIERS.MRF) ||
            getSupplierNumber() == uint256(SUPPLIERS.CEAT)
        ) {
            supply = SUPPLIES.WHEELS;
        }
        // Create _supply new supply objects and add to the supply array
        for (uint256 i = 0; i < _supply; i++) {
            uint256 curId = ++global_seed;
            Supply memory newSupply = Supply(
                SUPPLIERS(getSupplierNumber()),
                MANUFACTURERS.NULL,
                generateHash(curId)
            );
            suppliers[SUPPLIERS(getSupplierNumber())].supply.push(newSupply);
        }
    }

    /**
    @notice manufacture new cars
    @param cost Manufacturing cost for cars
     */
    function manufactureCars(uint256 cost) public {
        require(manufacturerOwnersAddress[msg.sender] != 0);
        manufacturers[MANUFACTURERS(getManufacturerNumber())].price = cost;
        Manufacturer storage curManufacturer = manufacturers[
            MANUFACTURERS(getManufacturerNumber())
        ];
        int256 possibleCars = curManufacturer.numBodies <
            curManufacturer.numWheels
            ? curManufacturer.numBodies
            : curManufacturer.numWheels;
        // Create cars
        for (int256 i = 0; i < possibleCars; i++) {
            uint256 curId = ++global_seed;
            Supply memory tempBody = curManufacturer.bodies[
                uint256(--curManufacturer.numBodies)
            ];
            curManufacturer.bodies.pop();
            Supply memory tempWheel = curManufacturer.wheels[
                uint256(--curManufacturer.numWheels)
            ];
            curManufacturer.wheels.pop();
            curManufacturer.cars.push(
                Car(
                    MANUFACTURERS(getManufacturerNumber()),
                    address(0),
                    tempWheel,
                    tempBody,
                    generateHash(curId)
                )
            );
            curManufacturer.numCars++;
        }
    }

    /**
    @notice Public getter function for supply of a supplier
    @dev https://stackoverflow.com/questions/58258808/data-location-must-be-memory-for-return-parameter-in-function-but-none-was-gi
    @param _supplier Supplier
    @return Supply count and cost of the supplier
     */
    //
    function getSupply(uint256 _supplier)
        public
        view
        returns (uint256[2] memory)
    {
        // Check if supplier is one of the three suppliers
        // "Supplier not found"
        require(
            _supplier == uint256(SUPPLIERS.VEDANTA) ||
                _supplier == uint256(SUPPLIERS.MRF) ||
                _supplier == uint256(SUPPLIERS.CEAT)
        );
        // Return supply of supplier
        return [
            suppliers[SUPPLIERS(_supplier)].supplyCount,
            suppliers[SUPPLIERS(_supplier)].cost
        ];
    }

    /**
    @notice Getter function for manufacturer supply
    @return Manufacturer number of cars, remaining bodies and remaining wheels
     */
    function getManufacturerSupply() public view returns (int256[3] memory) {
        return [
            manufacturers[MANUFACTURERS(getManufacturerNumber())].numCars,
            manufacturers[MANUFACTURERS(getManufacturerNumber())].numBodies,
            manufacturers[MANUFACTURERS(getManufacturerNumber())].numWheels
        ];
    }

    /**
    @notice Getter function for getting auction status
    @return Auction status 
    */
    function getAuctionStatus() public view returns (uint256) {
        return uint256(auctionStatus);
    }

    /**
    @notice Getter function for car price for a given manufacturer
    @param _manufacturer Manufacturer
    @return price of a car for a given manufacturer
     */
    function getCars(MANUFACTURERS _manufacturer)
        public
        view
        returns (uint256[2] memory)
    {
        return [
            uint256(manufacturers[_manufacturer].numCars),
            manufacturers[_manufacturer].price
        ];
    }

    /**
    @notice Getter function for car price for a given manufacturer
    @param _manufacturer Manufacturer
    @return price of a car for a given manufacturer
     */
    function getManufacturerCars(MANUFACTURERS _manufacturer)
        public
        view
        returns (Car[] memory)
    {
        return manufacturers[_manufacturer].cars;
    }

    /**
    @notice Getter function for bodies for a given manufacturer
    @param _manufacturer Manufacturer
    @return price of a car for a given manufacturer
     */
    function getManufacturerBodies(MANUFACTURERS _manufacturer)
        public
        view
        returns (Supply[] memory)
    {
        return manufacturers[_manufacturer].bodies;
    }

    /**
    @notice Getter function for wheels for a given manufacturer
    @param _manufacturer Manufacturer
    @return price of a car for a given manufacturer
     */
    function getManufacturerWheels(MANUFACTURERS _manufacturer)
        public
        view
        returns (Supply[] memory)
    {
        return manufacturers[_manufacturer].wheels;
    }

    /**
    @notice Buy Cars from manufacturer
    @param _manufacturer Manufacturer from which car is bought
     */
    function buyCar(MANUFACTURERS _manufacturer) public payable {
        // Check if manufacturer is one of the three manufacturers
        // "Manufacturer not found"
        require(
            _manufacturer == MANUFACTURERS.MARUTI ||
                _manufacturer == MANUFACTURERS.TATA
        );
        // Check if manufacturer has cars
        require(manufacturers[_manufacturer].numCars > 0);
        // Check msg.value is greater than or equal to car price
        require(msg.value >= manufacturers[_manufacturer].price);

        // Transfer price to manufacturer
        payThis(
            manufacturerOwners[uint256(_manufacturer)],
            manufacturers[_manufacturer].price
        );

        // Transfer car to buyer
        Car memory car = manufacturers[_manufacturer].cars[
            uint256(--manufacturers[_manufacturer].numCars)
        ];
        manufacturers[_manufacturer].cars.pop();
        car.escrow = msg.sender;
        customers[msg.sender].push(car);
    }

    /**
    @notice Getter function to return Hashed bids
    @param _manufacturer Manufacturer
    @param _supplier Supplier
    @return Hashed bids
     */
    function getHashedBids(MANUFACTURERS _manufacturer, SUPPLIERS _supplier)
        public
        view
        returns (bytes32)
    {
        return hashedBids[_manufacturer][_supplier];
    }

    /**
    @notice Getter function to return Revealed bids
    @param _manufacturer Manufacturer
    @param _supplier Supplier
    @return Revealed bids
     */
    function getBids(MANUFACTURERS _manufacturer, SUPPLIERS _supplier)
        public
        view
        returns (int256[2] memory)
    {
        return currentBids[_manufacturer][_supplier];
    }

    /**
    @notice Getter function to return cars for the message sender 
     */
    function getMyCars() public view returns (Car[] memory) {
        return customers[msg.sender];
    }

    /**
    @notice Secret Bids by a given manufacturer for a given supply, provided the commitment
    @param supplier Supplier on whose supply the quantity and amount is bid
    @param hashedBid Hashed Commitment 
     */
    function secretBid(uint256 supplier, bytes32 hashedBid) public {
        require(auctionStatus == AUCTION_STATUS.PENDING_BID, "Bidding done");
        require(
            supplier == uint256(SUPPLIERS.VEDANTA) ||
                supplier == uint256(SUPPLIERS.MRF) ||
                supplier == uint256(SUPPLIERS.CEAT)
        );
        require(manufacturerOwnersAddress[msg.sender] != 0);
        // Check if bid is already placed
        require(
            hashedBids[MANUFACTURERS(manufacturerOwnersAddress[msg.sender])][
                SUPPLIERS(supplier)
            ] == 0x00
        );
        hashedBids[MANUFACTURERS(manufacturerOwnersAddress[msg.sender])][
            SUPPLIERS(supplier)
        ] = hashedBid;
    }

    /**
    @notice Changes `auction_status` to reveal bid
     */
    // function secretBidDone() public {
    //     require(msg.sender == escrow);
    //     require(auctionStatus == AUCTION_STATUS.PENDING_BID);
    //     auctionStatus = AUCTION_STATUS.PENDING_VERIFICATION;
    // }

    function changeAuctionStatus(uint256 _auctionStatus) public {
        require(msg.sender == escrow);
        // require(uint(auctionStatus) == _auctionStatus - 1);
        auctionStatus = AUCTION_STATUS(_auctionStatus);
    }

    /**
    @notice Reveal bids for manufacturer
    @param _supplier Supplier to bid to
    @param _quantity Quantity of supply to bid
    @param _price Price of each supply to bid
     */
    function bid(
        uint256 _supplier,
        uint256 _quantity,
        int256 _price
    ) public payable {
        // Require that auction status is PENDING_VERIFICATION
        require(
            auctionStatus == AUCTION_STATUS.PENDING_VERIFICATION,
            "Bidding not done"
        );
        require(
            generateBidHash(SUPPLIERS(_supplier), _quantity, uint256(_price)) ==
                hashedBids[MANUFACTURERS(getManufacturerNumber())][
                    SUPPLIERS(_supplier)
                ],
            "Invalid bid"
        );
        require(manufacturerOwnersAddress[msg.sender] != 0);
        // Check if supplier is one of the three suppliers
        // "Supplier not found"
        require(
            _supplier == uint256(SUPPLIERS.VEDANTA) ||
                _supplier == uint256(SUPPLIERS.MRF) ||
                _supplier == uint256(SUPPLIERS.CEAT)
        );
        isSupportedSupplier(SUPPLIERS(_supplier));
        // Check if quantity is less than or equal to supply of supplier
        // "Quantity is greater than supply"
        require(_quantity <= suppliers[SUPPLIERS(_supplier)].supplyCount);
        // Check if price is greater than or equal to cost of supplier
        // "Price is less than cost"
        require(uint256(_price) >= suppliers[SUPPLIERS(_supplier)].cost);
        // "You don't have enough ether to bid"
        require(msg.value >= uint256(_price));

        // Check if manufacturer is already bidding for this supplier
        MANUFACTURERS currentManufacturer = MANUFACTURERS(
            getManufacturerNumber()
        );

        // "You are already bidding for this supplier"
        require(
            currentBids[currentManufacturer][SUPPLIERS(_supplier)][0] == -1
        );

        // Update currentBids
        currentBids[currentManufacturer][SUPPLIERS(_supplier)][0] = int256(
            _quantity
        );
        currentBids[currentManufacturer][SUPPLIERS(_supplier)][1] = _price;

        // To implement escrow we need an escrow mapping who will take payment from manufacturer
        // Transfer quantity*price from msg.sender to escrow
        // escrow.transfer(_quantity*uint(_price));
        payThis(escrow, _quantity * uint256(_price));
    }

    /**
    @notice Change `auction_state` after revealing bids
     */
    // function revealBid() public {
    //     require(msg.sender == escrow);
    //     require(auctionStatus == AUCTION_STATUS.PENDING_VERIFICATION);
    //     auctionStatus = AUCTION_STATUS.CAN_START;
    // }

    /**
    @return Escrow Balance
     */
    function getEscrowBalance() public view returns (uint256) {
        return escrow.balance;
    }

    /**
    @notice pay to address from senders address
    @param addr Receiver address of transaction
    @param price Amount to transfer
     */
    function payThis(address payable addr, uint256 price) public payable {
        if (price > 0) {
            require(msg.value >= price, "Not enough ether");
            addr.transfer(price);
        }
    }

    /**
    @notice Get supplier of a given supply
    @param supplyType Supply type
    @param supplyNum Index of the supply
    @return Supplier Number
     */
    function getSupplierFromSupply(uint256 supplyType, uint256 supplyNum)
        public
        view
        returns (uint256)
    {
        if (supplyType == uint256(SUPPLIES.BODIES)) {
            return
                uint256(
                    manufacturers[MANUFACTURERS(getManufacturerNumber())]
                        .bodies[supplyNum]
                        .supplier
                );
        } else {
            return
                uint256(
                    manufacturers[MANUFACTURERS(getManufacturerNumber())]
                        .wheels[supplyNum]
                        .supplier
                );
        }
    }

    /**
    @notice Get manufacturer alloted to a given supply
    @param supplyType Supply type
    @param supplyNum Index of the supply
    @return Manufacturer Number
     */
    function getManufacturerFromSupply(uint256 supplyType, uint256 supplyNum)
        public
        view
        returns (uint256)
    {
        if (supplyType == uint256(SUPPLIES.BODIES)) {
            return
                uint256(
                    manufacturers[MANUFACTURERS(getManufacturerNumber())]
                        .bodies[supplyNum]
                        .manufacturer
                );
        } else {
            return
                uint256(
                    manufacturers[MANUFACTURERS(getManufacturerNumber())]
                        .wheels[supplyNum]
                        .manufacturer
                );
        }
    }

    /**
    @notice Get supply id of given supply
    @param supplyType Supply type
    @param supplyNum Index of the supply
    @return Supply 32-byte ID
     */
    function getSupplyIDFromSupply(uint256 supplyType, uint256 supplyNum)
        public
        view
        returns (bytes32)
    {
        if (supplyType == uint256(SUPPLIES.BODIES)) {
            return
                manufacturers[MANUFACTURERS(getManufacturerNumber())]
                    .bodies[supplyNum]
                    .id;
        } else {
            return
                manufacturers[MANUFACTURERS(getManufacturerNumber())]
                    .wheels[supplyNum]
                    .id;
        }
    }

    /**
    @notice Initiate Auction
     */
    function auction() public payable {
        // Require that auction status is CAN_START
        require(
            auctionStatus == AUCTION_STATUS.CAN_START,
            "Auction cannot be started"
        );

        require(msg.sender == escrow);
        // Check if maruti has bid
        // "Maruti has not bid"
        require(
            currentBids[MANUFACTURERS.MARUTI][SUPPLIERS.VEDANTA][0] != -1 &&
                currentBids[MANUFACTURERS.MARUTI][SUPPLIERS.CEAT][0] != -1
        );

        // Check if tata has bid
        // "Tata has not bid"
        require(
            currentBids[MANUFACTURERS.TATA][SUPPLIERS.VEDANTA][0] != -1 &&
                currentBids[MANUFACTURERS.TATA][SUPPLIERS.MRF][0] != -1
        );

        // possibleCars for each manufacturer is number of pairs of wheels and bodies
        uint256[3] memory possibleCars = [uint256(0), uint256(0), uint256(0)];

        // Maruti
        possibleCars[uint256(MANUFACTURERS.MARUTI)] = currentBids[
            MANUFACTURERS.MARUTI
        ][SUPPLIERS.VEDANTA][0] <
            currentBids[MANUFACTURERS.MARUTI][SUPPLIERS.CEAT][0]
            ? uint256(currentBids[MANUFACTURERS.MARUTI][SUPPLIERS.VEDANTA][0])
            : uint256(currentBids[MANUFACTURERS.MARUTI][SUPPLIERS.CEAT][0]);

        // Tata
        possibleCars[uint256(MANUFACTURERS.TATA)] = currentBids[
            MANUFACTURERS.TATA
        ][SUPPLIERS.VEDANTA][0] <
            currentBids[MANUFACTURERS.TATA][SUPPLIERS.MRF][0]
            ? uint256(currentBids[MANUFACTURERS.TATA][SUPPLIERS.VEDANTA][0])
            : uint256(currentBids[MANUFACTURERS.TATA][SUPPLIERS.MRF][0]);

        int256[4] memory curSupplies = [
            int256(0),
            int256(suppliers[SUPPLIERS.VEDANTA].supplyCount),
            int256(suppliers[SUPPLIERS.MRF].supplyCount),
            int256(suppliers[SUPPLIERS.CEAT].supplyCount)
        ];
        // mapping memory (MANUFACTURERS => int) numBodies;
        int256[3] memory numBodies = [int256(0), int256(0), int256(0)];
        int256[3] memory numWheels = [int256(0), int256(0), int256(0)];

        uint256 majority = uint256(MANUFACTURERS.MARUTI);
        uint256 wheelS = uint256(SUPPLIERS.CEAT);
        uint256 minority = uint256(MANUFACTURERS.TATA);
        uint256 wheelM = uint256(SUPPLIERS.MRF);
        if (
            possibleCars[uint256(MANUFACTURERS.MARUTI)] <
            possibleCars[uint256(MANUFACTURERS.TATA)]
        ) {
            majority = uint256(MANUFACTURERS.TATA);
            wheelS = uint256(SUPPLIERS.MRF);
            minority = uint256(MANUFACTURERS.MARUTI);
            wheelM = uint256(SUPPLIERS.CEAT);
        }

        numBodies[majority] += int256(possibleCars[majority]);
        numWheels[majority] += int256(possibleCars[majority]);
        curSupplies[uint256(SUPPLIERS.VEDANTA)] -= int256(
            possibleCars[majority]
        );
        curSupplies[wheelS] -= int256(possibleCars[majority]);

        // Decrease currentBids
        currentBids[MANUFACTURERS(majority)][SUPPLIERS.VEDANTA][0] -= int256(
            possibleCars[majority]
        );
        currentBids[MANUFACTURERS(majority)][SUPPLIERS(wheelS)][0] -= int256(
            possibleCars[majority]
        );

        int256 remainingPossible = curSupplies[uint256(SUPPLIERS.VEDANTA)] >
            curSupplies[wheelM]
            ? curSupplies[wheelM]
            : curSupplies[uint256(SUPPLIERS.VEDANTA)];
        if (remainingPossible > int256(possibleCars[minority])) {
            numBodies[minority] += int256(possibleCars[minority]);
            numWheels[minority] += int256(possibleCars[minority]);
            curSupplies[uint256(SUPPLIERS.VEDANTA)] =
                curSupplies[uint256(SUPPLIERS.VEDANTA)] -
                int256(possibleCars[minority]);
            curSupplies[wheelM] -= int256(possibleCars[minority]);

            // Decrease currentBids
            currentBids[MANUFACTURERS(minority)][SUPPLIERS.VEDANTA][
                0
            ] -= int256(possibleCars[minority]);
            currentBids[MANUFACTURERS(minority)][SUPPLIERS(wheelM)][
                0
            ] -= int256(possibleCars[minority]);
        } else {
            numBodies[minority] += remainingPossible;
            numWheels[minority] += remainingPossible;
            curSupplies[uint256(SUPPLIERS.VEDANTA)] -= remainingPossible;
            curSupplies[wheelM] -= remainingPossible;
            // Decrease currentBids
            currentBids[MANUFACTURERS(minority)][SUPPLIERS.VEDANTA][
                0
            ] -= remainingPossible;
            currentBids[MANUFACTURERS(minority)][SUPPLIERS(wheelM)][
                0
            ] -= remainingPossible;
        }

        // Perform profit optimisation here
        if (curSupplies[uint256(SUPPLIERS.VEDANTA)] > 0) {
            if (
                currentBids[MANUFACTURERS(majority)][SUPPLIERS.VEDANTA][0] <
                currentBids[MANUFACTURERS(minority)][SUPPLIERS.VEDANTA][0]
            ) {
                // Replace majority with minority and vice versa
                uint256 temp = majority;
                majority = minority;
                minority = temp;
                temp = wheelS;
                wheelS = wheelM;
                wheelM = temp;
            }
            numBodies[majority] += curSupplies[uint256(SUPPLIERS.VEDANTA)] >
                currentBids[MANUFACTURERS(majority)][SUPPLIERS.VEDANTA][0]
                ? currentBids[MANUFACTURERS(majority)][SUPPLIERS.VEDANTA][0]
                : curSupplies[uint256(SUPPLIERS.VEDANTA)];
            curSupplies[uint256(SUPPLIERS.VEDANTA)] -= numBodies[majority];
            currentBids[MANUFACTURERS(majority)][SUPPLIERS.VEDANTA][
                0
            ] -= numBodies[majority];
            if (curSupplies[uint256(SUPPLIERS.VEDANTA)] > 0) {
                numBodies[minority] += curSupplies[uint256(SUPPLIERS.VEDANTA)] >
                    currentBids[MANUFACTURERS(minority)][SUPPLIERS.VEDANTA][0]
                    ? currentBids[MANUFACTURERS(minority)][SUPPLIERS.VEDANTA][0]
                    : curSupplies[uint256(SUPPLIERS.VEDANTA)];
                curSupplies[uint256(SUPPLIERS.VEDANTA)] -= numBodies[minority];
                currentBids[MANUFACTURERS(minority)][SUPPLIERS.VEDANTA][
                    0
                ] -= numBodies[minority];
            }
        }

        if (curSupplies[wheelS] > 0) {
            numWheels[majority] += curSupplies[wheelS] >
                currentBids[MANUFACTURERS(majority)][SUPPLIERS(wheelS)][0]
                ? currentBids[MANUFACTURERS(majority)][SUPPLIERS(wheelS)][0]
                : curSupplies[wheelS];
            curSupplies[wheelS] -= numWheels[majority];
            currentBids[MANUFACTURERS(majority)][SUPPLIERS(wheelS)][
                0
            ] -= numWheels[majority];
        }

        if (curSupplies[wheelM] > 0) {
            numWheels[minority] += curSupplies[wheelM] >
                currentBids[MANUFACTURERS(minority)][SUPPLIERS(wheelM)][0]
                ? currentBids[MANUFACTURERS(minority)][SUPPLIERS(wheelM)][0]
                : curSupplies[wheelM];
            curSupplies[wheelM] -= numWheels[minority];
            currentBids[MANUFACTURERS(minority)][SUPPLIERS(wheelM)][
                0
            ] -= numWheels[minority];
        }

        // Send final bodies and wheels to respective manufacturers
        for (int256 i = 0; i < numBodies[majority]; i++) {
            Supply memory temp = suppliers[SUPPLIERS.VEDANTA].supply[
                suppliers[SUPPLIERS.VEDANTA].supply.length - 1
            ];
            temp.manufacturer = MANUFACTURERS(majority);
            suppliers[SUPPLIERS.VEDANTA].supply.pop();
            suppliers[SUPPLIERS.VEDANTA].supplyCount--;
            manufacturers[MANUFACTURERS(majority)].bodies.push(temp);
            manufacturers[MANUFACTURERS(majority)].numBodies++;
        }

        for (int256 i = 0; i < numBodies[minority]; i++) {
            Supply memory temp = suppliers[SUPPLIERS.VEDANTA].supply[
                suppliers[SUPPLIERS.VEDANTA].supply.length - 1
            ];
            temp.manufacturer = MANUFACTURERS(minority);
            suppliers[SUPPLIERS.VEDANTA].supply.pop();
            suppliers[SUPPLIERS.VEDANTA].supplyCount--;
            manufacturers[MANUFACTURERS(minority)].bodies.push(temp);
            manufacturers[MANUFACTURERS(minority)].numBodies++;
        }

        for (int256 i = 0; i < numWheels[majority]; i++) {
            Supply memory temp = suppliers[SUPPLIERS(wheelS)].supply[
                suppliers[SUPPLIERS(wheelS)].supply.length - 1
            ];
            temp.manufacturer = MANUFACTURERS(majority);
            suppliers[SUPPLIERS(wheelS)].supply.pop();
            suppliers[SUPPLIERS(wheelS)].supplyCount--;
            manufacturers[MANUFACTURERS(majority)].wheels.push(temp);
            manufacturers[MANUFACTURERS(majority)].numWheels++;
        }

        for (int256 i = 0; i < numWheels[minority]; i++) {
            Supply memory temp = suppliers[SUPPLIERS(wheelM)].supply[
                suppliers[SUPPLIERS(wheelM)].supply.length - 1
            ];
            temp.manufacturer = MANUFACTURERS(minority);
            suppliers[SUPPLIERS(wheelM)].supply.pop();
            suppliers[SUPPLIERS(wheelM)].supplyCount--;
            manufacturers[MANUFACTURERS(minority)].wheels.push(temp);
            manufacturers[MANUFACTURERS(minority)].numWheels++;
        }

        // Check if current bids exist and send back money
        int256 amount = currentBids[MANUFACTURERS.MARUTI][SUPPLIERS.VEDANTA][
            0
        ] * currentBids[MANUFACTURERS.MARUTI][SUPPLIERS.VEDANTA][1];
        if (amount > 0) {
            payThis(
                manufacturerOwners[uint256(MANUFACTURERS.MARUTI)],
                uint256(amount)
            );
        }
        amount =
            currentBids[MANUFACTURERS.TATA][SUPPLIERS.VEDANTA][0] *
            currentBids[MANUFACTURERS.TATA][SUPPLIERS.VEDANTA][1];
        if (amount > 0) {
            payThis(
                manufacturerOwners[uint256(MANUFACTURERS.TATA)],
                uint256(amount)
            );
        }

        amount =
            currentBids[MANUFACTURERS.MARUTI][SUPPLIERS.CEAT][0] *
            currentBids[MANUFACTURERS.MARUTI][SUPPLIERS.CEAT][1];
        if (amount > 0) {
            payThis(
                manufacturerOwners[uint256(MANUFACTURERS.MARUTI)],
                uint256(amount)
            );
        }

        amount =
            currentBids[MANUFACTURERS.TATA][SUPPLIERS.MRF][0] *
            currentBids[MANUFACTURERS.TATA][SUPPLIERS.MRF][1];
        if (amount > 0) {
            payThis(
                manufacturerOwners[uint256(MANUFACTURERS.TATA)],
                uint256(amount)
            );
        }

        // // Sending to vedanta
        // amount = numBodiesMaruti * currentBids[MANUFACTURERS.MARUTI][SUPPLIERS.VEDANTA][1] + numBodiesTata * currentBids[MANUFACTURERS.TATA][SUPPLIERS.VEDANTA][1];
        amount =
            numBodies[majority] *
            currentBids[MANUFACTURERS(majority)][SUPPLIERS.VEDANTA][1] +
            numBodies[minority] *
            currentBids[MANUFACTURERS(minority)][SUPPLIERS.VEDANTA][1];
        if (amount > 0) {
            payThis(
                supplierOwners[uint256(SUPPLIERS.VEDANTA)],
                uint256(amount)
            );
        }

        // // Sending to majority wheels
        // amount = numWheelsTata * currentBids[MANUFACTURERS.TATA][SUPPLIERS.MRF][1];
        amount =
            numWheels[majority] *
            currentBids[MANUFACTURERS(majority)][SUPPLIERS(wheelS)][1];
        if (amount > 0) {
            payThis(supplierOwners[wheelS], uint256(amount));
        }

        // // Sending to ceat
        // amount = numWheelsMar * currentBids[MANUFACTURERS.MARUTI][SUPPLIERS.CEAT][1];
        amount =
            numWheels[minority] *
            currentBids[MANUFACTURERS(minority)][SUPPLIERS(wheelM)][1];
        if (amount > 0) {
            payThis(supplierOwners[uint256(wheelM)], uint256(amount));
        }

        currentBids[MANUFACTURERS.TATA][SUPPLIERS.VEDANTA] = [-1, -1];
        currentBids[MANUFACTURERS.TATA][SUPPLIERS.MRF] = [-1, -1];
        currentBids[MANUFACTURERS.MARUTI][SUPPLIERS.VEDANTA] = [-1, -1];
        currentBids[MANUFACTURERS.MARUTI][SUPPLIERS.CEAT] = [-1, -1];

        // Reset hashed bids
        hashedBids[MANUFACTURERS.TATA][SUPPLIERS.VEDANTA] = 0x0;
        hashedBids[MANUFACTURERS.TATA][SUPPLIERS.MRF] = 0x0;
        hashedBids[MANUFACTURERS.MARUTI][SUPPLIERS.VEDANTA] = 0x0;
        hashedBids[MANUFACTURERS.MARUTI][SUPPLIERS.CEAT] = 0x0;

        auctionStatus = AUCTION_STATUS.NOT_STARTED;
    }
}
