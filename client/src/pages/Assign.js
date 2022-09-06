import { useContext } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

import { MANUFACTURERS, SUPPLIERS } from "../constants";
import { MarketContext } from "../App";
import { Grid } from "@mui/material";

export default function Assign() {
  // Create two row layout
  // two papers in one row : TATA and MARUTI
  // three papers in one row : VEDANTA, MRF, CEAT
  //
  // TATA and MARUTI are manufacturer
  // VEDANTA, MRF, CEAT are suppliers
  const { blockchain, curAccount } = useContext(MarketContext);
  const assign = async (num, type) => {
    let a = "";
    if (type === 0)
      a = await blockchain.contract.methods
        .assignManufacturer(num)
        .send({ from: curAccount.account });
    else
      a = blockchain.contract.methods
        .assignSupplier(num)
        .send({ from: curAccount.account });
    console.log(a);
    // window.location.reload();
  };
  return (
    <Box sx={{ flexGrow: 1 }}>
      <h1>Please Assign yourself</h1>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Paper
            onClick={() => assign(MANUFACTURERS.TATA, 0)}
            sx={{ p: 2, textAlign: "center" }}
          >
            TATA
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper
            onClick={() => assign(MANUFACTURERS.MARUTI, 0)}
            sx={{ p: 2, textAlign: "center" }}
          >
            MARUTI
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper
            onClick={() => assign(SUPPLIERS.VEDANTA, 1)}
            sx={{ p: 2, textAlign: "center" }}
          >
            VEDANTA
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper
            onClick={() => assign(SUPPLIERS.MRF, 1)}
            sx={{ p: 2, textAlign: "center" }}
          >
            MRF
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper
            onClick={() => assign(SUPPLIERS.CEAT, 1)}
            sx={{ p: 2, textAlign: "center" }}
          >
            CEAT
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
