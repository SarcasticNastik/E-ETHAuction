import { Button } from "@mui/material";
import { useCallback, useContext, useEffect, useState } from "react";
import { MarketContext } from "../App";

export default function Supplies() {
  const { blockchain } = useContext(MarketContext);
  const [supplies, setSupplies] = useState([0, 0, 0]);

  const init = useCallback(async () => {
    let res = await blockchain.contract.methods.getManufacturerSupply().call();
    setSupplies(res);
  }, [blockchain]);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          borderRadius: "5px",
          width: "100%",
          padding: "10px",
          border: "1px solid #000",
          margin: "10px",
        }}
      >
        <h1>NumBodies</h1>
        <h2>Number of Bodies: {supplies[2]}</h2>
      </div>
      <div
        style={{
          borderRadius: "5px",
          width: "100%",
          border: "1px solid #000",
          margin: "10px",
          padding: "10px",
        }}
      >
        <h1>NumWheels</h1>
        <h2>Number of Wheels: {supplies[1]}</h2>
      </div>
      <Button
        variant="contained"
        disabled={parseInt(supplies[1]) === 0 || parseInt(supplies[2]) === 0}
        onClick={() => {
          init();
        }}
      >
        {parseInt(supplies[1]) === 0 || parseInt(supplies[2]) === 0
          ? "Not Enough Supplies"
          : "Manufacture Cars"}
      </Button>
      <div
        style={{
          borderRadius: "5px",
          width: "100%",
          border: "1px solid #000",
          margin: "10px",
          padding: "10px",
        }}
      >
        <h1>NumCars</h1>
        <h2>Number of Cars: {supplies[0]}</h2>
      </div>
    </div>
  );
}
