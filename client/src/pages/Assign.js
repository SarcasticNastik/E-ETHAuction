import { useContext } from "react";
// import Box from "@mui/material/Box";
// import Paper from "@mui/material/Paper";

import { MANUFACTURERS, SUPPLIERS } from "../constants";
import { MarketContext } from "../App";
import { useNavigate } from "react-router-dom";
// import { Grid } from "@mui/material";

export default function Assign() {
  // Create two row layout
  // two papers in one row : TATA and MARUTI
  // three papers in one row : VEDANTA, MRF, CEAT
  //
  // TATA and MARUTI are manufacturer
  // VEDANTA, MRF, CEAT are suppliers
  const { blockchain, curAccount } = useContext(MarketContext);
  const navigate = useNavigate();
  const assign = async (num, type) => {
    let a = "";
    if (type === 0)
      a = await blockchain.contract.methods
        .assignManufacturer(num)
        .send({ from: curAccount.account });
    else
      a = await blockchain.contract.methods
        .assignSupplier(num)
        .send({ from: curAccount.account });
    console.log(a);
    navigate(type === 0 ? "/bid" : "/market");
  };
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
      <div style={{ fontSize: "24px" }}>Please Assign Yourself</div>
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
        <div style={{ fontSize: "20px", marginBottom: "10px" }}>
          Manufacturer
        </div>
        <div
          style={{
            borderRadius: "5px",
            width: "100%",
            padding: "10px",
            boxSizing: "border-box",
            cursor: "pointer",
            margin: "10px",
            background: "rgba(255, 105, 120,1)",
            color: "white",
            fontSize: "14px",
          }}
          onClick={() => assign(MANUFACTURERS.TATA, 0)}
        >
          TATA
        </div>
        <div
          style={{
            borderRadius: "5px",
            width: "100%",
            padding: "10px",
            boxSizing: "border-box",
            cursor: "pointer",
            margin: "10px",
            background: "rgba(255, 105, 120,1)",
            color: "white",
            fontSize: "14px",
          }}
          onClick={() => assign(MANUFACTURERS.MARUTI, 0)}
        >
          MARUTI
        </div>
      </div>
      <div
        style={{
          borderRadius: "5px",
          width: "500px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          // margin: "30px",
          padding: "40px 25px ",

          boxShadow: "0 0 3px 0 rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ fontSize: "20px", marginBottom: "10px" }}>Supplier</div>
        <div
          style={{
            borderRadius: "5px",
            width: "100%",
            padding: "10px",
            boxSizing: "border-box",
            cursor: "pointer",
            margin: "10px",
            background: "rgba(255, 105, 120,1)",
            color: "white",
            fontSize: "14px",
          }}
          onClick={() => assign(SUPPLIERS.VEDANTA, 1)}
        >
          VEDANTA
        </div>
        <div
          style={{
            borderRadius: "5px",
            width: "100%",
            padding: "10px",
            boxSizing: "border-box",
            cursor: "pointer",
            margin: "10px",
            background: "rgba(255, 105, 120,1)",
            color: "white",
            fontSize: "14px",
          }}
          onClick={() => assign(SUPPLIERS.MRF, 1)}
        >
          MRF
        </div>
        <div
          style={{
            borderRadius: "5px",
            width: "100%",
            padding: "10px",
            boxSizing: "border-box",
            cursor: "pointer",
            margin: "10px",
            background: "rgba(255, 105, 120,1)",
            color: "white",
            fontSize: "14px",
          }}
          onClick={() => assign(SUPPLIERS.CEAT, 1)}
        >
          CEAT
        </div>
      </div>
    </div>
    // <Box sx={{ flexGrow: 1 }}>
    //   <h1>Please Assign yourself</h1>
    //   <Grid container spacing={2}>
    //     <Grid item xs={6}>
    //       <Paper
    //         onClick={() => assign(MANUFACTURERS.TATA, 0)}
    //         sx={{ p: 2, textAlign: "center" }}
    //       >
    //         TATA
    //       </Paper>
    //     </Grid>
    //     <Grid item xs={6}>
    //       <Paper
    //         onClick={() => assign(MANUFACTURERS.MARUTI, 0)}
    //         sx={{ p: 2, textAlign: "center" }}
    //       >
    //         MARUTI
    //       </Paper>
    //     </Grid>
    //     <Grid item xs={4}>
    //       <Paper
    //         onClick={() => assign(SUPPLIERS.VEDANTA, 1)}
    //         sx={{ p: 2, textAlign: "center" }}
    //       >
    //         VEDANTA
    //       </Paper>
    //     </Grid>
    //     <Grid item xs={4}>
    //       <Paper
    //         onClick={() => assign(SUPPLIERS.MRF, 1)}
    //         sx={{ p: 2, textAlign: "center" }}
    //       >
    //         MRF
    //       </Paper>
    //     </Grid>
    //     <Grid item xs={4}>
    //       <Paper
    //         onClick={() => assign(SUPPLIERS.CEAT, 1)}
    //         sx={{ p: 2, textAlign: "center" }}
    //       >
    //         CEAT
    //       </Paper>
    //     </Grid>
    //   </Grid>
    // </Box>
  );
}
