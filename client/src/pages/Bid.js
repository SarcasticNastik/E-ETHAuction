import {
  Button,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useContext, useState } from "react";
import { MarketContext } from "../App";
import { SUPPLIERS } from "../constants";

export default function Bid() {
  // A table with two rows and 3 columns
  // Each row in first column has supply data of supplier VEDANTA, MRF, CEAT respectively
  // Each row in second column has Buttons to get the supply data and bid
  // Headers are SUPPLIER_NAME.VEDANTA, SUPPLIER_NAME.MRF, SUPPLIER_NAME.CEAT

  const { blockchain } = useContext(MarketContext);
  const [vSupply, setVSupply] = useState(null);
  const [mSupply, setMSupply] = useState(null);
  const [cSupply, setCSupply] = useState(null);
  return (
    <div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>VEDANTA</TableCell>
              <TableCell>MRF</TableCell>
              <TableCell>CEAT</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {vSupply === null ? (
                  <Typography>Click to get supply</Typography>
                ) : (
                  <Typography variant="h6" component="div" gutterBottom>
                    Current Supply: {vSupply[0]} <br />
                    Current Price: {vSupply[1]}
                  </Typography>
                )}
              </TableCell>
              <TableCell component="th" scope="row">
                {mSupply === null ? (
                  <Typography>Click to get supply</Typography>
                ) : (
                  <Typography variant="h6" component="div" gutterBottom>
                    Current Supply: {mSupply[0]} <br />
                    Current Price: {mSupply[1]}
                  </Typography>
                )}
              </TableCell>
              <TableCell component="th" scope="row">
                {cSupply === null ? (
                  <Typography>Click to get supply</Typography>
                ) : (
                  <Typography variant="h6" component="div" gutterBottom>
                    Current Supply: {cSupply[0]} <br />
                    Current Price: {cSupply[1]}
                  </Typography>
                )}
              </TableCell>
            </TableRow>
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                <Button
                  variant="contained"
                  onClick={() => {
                    blockchain.contract.methods
                      .getSupply(SUPPLIERS.VEDANTA)
                      .call()
                      .then((supply) => {
                        setVSupply(supply);
                      });
                  }}
                >
                  Get Supply
                </Button>
              </TableCell>
              <TableCell component="th" scope="row">
                <Button
                  variant="contained"
                  onClick={() => {
                    blockchain.contract.methods
                      .getSupply(SUPPLIERS.MRF)
                      .call()
                      .then((supply) => {
                        setMSupply(supply);
                      });
                  }}
                >
                  Get Supply
                </Button>
              </TableCell>
              <TableCell component="th" scope="row">
                <Button
                  variant="contained"
                  onClick={() => {
                    blockchain.contract.methods
                      .getSupply(SUPPLIERS.CEAT)
                      .call()
                      .then((supply) => {
                        setCSupply(supply);
                      });
                  }}
                >
                  Get Supply
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create a form with a select, two inputs and button. One below the other */}
      {/* Select has options VEDANTA, MRF, CEAT */}
      {/* Two inputs are for quantity and price */}
      {/* Button is to bid */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "2rem",
        }}
      >
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="demo-simple-select-label">Supplier</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Supplier"
          >
            <MenuItem value={SUPPLIERS.VEDANTA}>VEDANTA</MenuItem>
            <MenuItem value={SUPPLIERS.MRF}>MRF</MenuItem>
            <MenuItem value={SUPPLIERS.CEAT}>CEAT</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel htmlFor="component-simple">Quantity</InputLabel>
          <Input id="component-simple" />
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel htmlFor="component-simple">Price</InputLabel>
          <Input id="component-simple" />
        </FormControl>
        <Button
          variant="contained"
          style={{ marginTop: "1rem" }}
          onClick={() => {}}
        >
          Bid
        </Button>
      </div>
    </div>
  );
}
