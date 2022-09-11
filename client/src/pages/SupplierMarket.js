import { Button, TextField, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { MarketContext } from "../App";

/**
 * Component for a supplier to view and update his supplies
 */
export default function SupplierMarket() {
  const { blockchain, curAccount } = useContext(MarketContext);
  // Add two number inputs and a update supply button
  // Also add a view only box with a getSupply button
  const [supply, setSupply] = useState(null);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          padding: "10px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          margin: "10px",
        }}
      >
        <div style={{ fontSize: "20px", margin: "10px" }}>
          {/* <h4></h4> */}
          <TextField
            id="qty"
            label="Quantity"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </div>
        <div style={{ fontSize: "20px", margin: "10px" }}>
          <TextField
            id="cost"
            label="Cost for one"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </div>
      </div>

      <Button
        sx={{
          "& > :not(style)": { m: 1, width: "25ch" },
        }}
        variant="contained"
        onClick={async () => {
          // Get the values from the input fields
          // Call the updateSupply function
          let qty = document.getElementById("qty").value;
          let cost = document.getElementById("cost").value;
          await blockchain.contract.methods
            .updateSupply(qty, cost)
            .send({ from: curAccount.account });
          setSupply([qty, cost]);
        }}
      >
        Update Supply
      </Button>
      {/* Add a Paper with a button getSupply */}
      <div
        style={{
          borderRadius: "5px",
          width: "500px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          margin: "30px",
          padding: "40px 25px ",
          boxShadow: "0 0 3px 0 rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            marginBottom: "10px",
            alignContent: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h4">Current Supply</Typography>

          {supply === null ? (
            <Typography variant="h5" component="div">
              Please click to get current supply
            </Typography>
          ) : (
            <Typography variant="h5" component="div">
              Current Supply: {supply[0]}
              <br />
              Current Price: {supply[1]}
            </Typography>
          )}
        </div>
        <Button
          variant="contained"
          onClick={async () => {
            // Get the values from the input fields
            // Call the updateSupply function
            setSupply(
              await blockchain.contract.methods
                .getSupply(curAccount.supplierNumber)
                .call()
            );
          }}
        >
          Get Supply
        </Button>
      </div>
    </div>
  );
}
