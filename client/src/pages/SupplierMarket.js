import { Button, Paper, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useContext, useState } from "react";
import { MarketContext } from "../App";

export default function SupplierMarket() {
  const { blockchain, curAccount } = useContext(MarketContext);
  // Add two number inputs and a update supply button
  // Also add a view only box with a getSupply button
  const [supply, setSupply] = useState(null);

  return (
    <div>
      <Box
        component="form"
        sx={{
          "& > :not(style)": { m: 1, width: "25ch" },
        }}
        noValidate
        autoComplete="off"
      >
        <TextField
          id="qty"
          label="Quantity"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          id="cost"
          label="Cost for one"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Box>
      <Button
        sx={{
          "& > :not(style)": { m: 1, width: "25ch" },
        }}
        variant="contained"
        onClick={() => {
          // Get the values from the input fields
          // Call the updateSupply function
          let qty = document.getElementById("qty").value;
          let cost = document.getElementById("cost").value;
          blockchain.contract.methods
            .updateSupply(qty, cost)
            .send({ from: curAccount.account });
        }}
      >
        Update Supply
      </Button>

      {/* Add a Paper with a button getSupply */}
      <Paper sx={{ p: 2 }}>
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
      </Paper>
    </div>
  );
}
