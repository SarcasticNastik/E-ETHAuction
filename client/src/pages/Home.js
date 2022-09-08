import { MenuItem, Select } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { MarketContext } from "../App";

export default function Home() {
  const SupplierHome = () => {
    return (
      <div>
        <h1>Supplier</h1>
        <h1>Your address: {curAccount.account}</h1>
      </div>
    );
  };

  const ManufacturerHome = () => {
    return (
      <div>
        <h1>Manufacturer</h1>
        <h1>Your address: {curAccount.account}</h1>
      </div>
    );
  };

  const OwnerHome = () => {
    useEffect(() => {
      blockchain.contract.methods
        .getAuctionStatus()
        .call()
        .then((res) => {
          console.log(res);
          setAuctionStatus(res);
        }, []);
    });
    const AUCTION_STATUS = [
      "Not Started",
      "Pending Bid",
      "Pending Verification",
      "Can Start",
      "Ended",
    ];
    return (
      <div>
        <h1>Owner</h1>
        <h1>Your address: {curAccount.account}</h1>
        <h2>Auction Status: {AUCTION_STATUS[auctionStatus]}</h2>
        {/* // Add input field and button to change auction status */}
        {/* Create a drop down */}
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={auctionStatus}
          label="Auction Status"
          onChange={(e) => {
            setAuctionStatus(e.target.value);
            blockchain.contract.methods
              .changeAuctionStatus(e.target.value)
              .send({ from: curAccount.account })
              .then((res) => {
                window.location.reload();
              });
          }}
        >
          <MenuItem value={0}>Not Started</MenuItem>
          <MenuItem value={1}>Pending Bid</MenuItem>
          <MenuItem value={2}>Pending Verification</MenuItem>
          <MenuItem value={3}>Can Start</MenuItem>
          <MenuItem value={4}>Auction Ended</MenuItem>
        </Select>
        {/* blockchain.contract.methods.changeAuctionStatus(auctionStatus, {
                from: curAccount.account,
              }); */}
      </div>
    );
  };

  const { blockchain, curAccount } = useContext(MarketContext);
  const [auctionStatus, setAuctionStatus] = useState(0);

  return (
    <div>
      {curAccount.isSupplier && <SupplierHome />}
      {curAccount.isManufacturer && <ManufacturerHome />}
      {curAccount.isOwner && <OwnerHome />}
    </div>
  );
}
