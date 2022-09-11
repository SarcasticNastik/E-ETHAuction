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
import Swal from "sweetalert2";
import { MarketContext } from "../App";
import { MANUFACTURERS, SUPPLIERS } from "../constants";

/**
 * Page rendered for `Bid` 
 * A table with two rows and 3 columns
 */
export default function Bid() {

  const { blockchain, curAccount, auctionStatus } = useContext(MarketContext);
  const [vSupply, setVSupply] = useState(null);
  const [mSupply, setMSupply] = useState(null);
  const [cSupply, setCSupply] = useState(null);
  const [bidSupplier, setBidSupplier] = useState(SUPPLIERS.VEDANTA);
  console.log(auctionStatus);
  console.log(curAccount);
  return (
    <div
      style={{
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center">VEDANTA</TableCell>
              {curAccount.manufacturerNumber === MANUFACTURERS.TATA ? (
                <TableCell align="center">MRF</TableCell>
              ) : (
                <TableCell align="center">CEAT</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell align="center" component="th" scope="row">
                {vSupply === null ? (
                  <Typography>Click to get supply</Typography>
                ) : (
                  <Typography variant="h6" component="div" gutterBottom>
                    Current Supply: {vSupply[0]} <br />
                    Current Price: {vSupply[1]}
                  </Typography>
                )}
              </TableCell>
              {curAccount.manufacturerNumber === MANUFACTURERS.TATA ? (
                <TableCell align="center" component="th" scope="row">
                  {mSupply === null ? (
                    <Typography>Click to get supply</Typography>
                  ) : (
                    <Typography
                      align="center"
                      variant="h6"
                      component="div"
                      gutterBottom
                    >
                      Current Supply: {mSupply[0]} <br />
                      Current Price: {mSupply[1]}
                    </Typography>
                  )}
                </TableCell>
              ) : (
                <TableCell align="center" component="th" scope="row">
                  {cSupply === null ? (
                    <Typography>Click to get supply</Typography>
                  ) : (
                    <Typography variant="h6" component="div" gutterBottom>
                      Current Supply: {cSupply[0]} <br />
                      Current Price: {cSupply[1]}
                    </Typography>
                  )}
                </TableCell>
              )}
            </TableRow>
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell align="center" component="th" scope="row">
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
              {curAccount.manufacturerNumber === MANUFACTURERS.TATA ? (
                <TableCell align="center" omponent="th" scope="row">
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
              ) : (
                <TableCell align="center" component="th" scope="row">
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
              )}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create a form with a select, two inputs and button. One below the other */}
      {/* Select has options VEDANTA, MRF, CEAT */}
      {/* Two inputs are for quantity and price */}
      {/* Button is to bid */}
      {parseInt(auctionStatus) === 1 || parseInt(auctionStatus) === 2 ? (
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
              defaultValue={bidSupplier}
              value={bidSupplier}
              onChange={(e) => {
                setBidSupplier(e.target.value);
              }}
            >
              <MenuItem value={SUPPLIERS.VEDANTA}>VEDANTA</MenuItem>
              {curAccount.manufacturerNumber === MANUFACTURERS.TATA ? (
                <MenuItem value={SUPPLIERS.MRF}>MRF</MenuItem>
              ) : (
                <MenuItem value={SUPPLIERS.CEAT}>CEAT</MenuItem>
              )}
            </Select>
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel htmlFor="bid-qty">Quantity</InputLabel>
            <Input id="bid-qty" />
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel htmlFor="bid-price">Price</InputLabel>
            <Input id="bid-price" />
          </FormControl>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "2rem",
            }}
          >
            {parseInt(auctionStatus) === 1 && (
              <Button
                variant="contained"
                style={{ marginTop: "1rem" }}
                onClick={async () => {
                  let qty = parseInt(document.getElementById("bid-qty").value);
                  let price = parseInt(
                    document.getElementById("bid-price").value
                  );
                  // console.log(
                  //   bidSupplier,
                  //   document.getElementById("bid-qty").value,
                  //   document.getElementById("bid-price").value
                  // );
                  const hashedBid = await blockchain.contract.methods
                    .generateBidHash(bidSupplier, qty, price)
                    .call();
                  console.log(hashedBid);
                  console.log(bidSupplier);
                  let res = await blockchain.contract.methods
                    .secretBid(bidSupplier, hashedBid)
                    .send({
                      from: curAccount.address,
                    });
                  console.log(res);
                  Swal.fire({
                    title: "Secret Bid Placed",
                    text: "Your bid has been placed successfully",
                    icon: "success",
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                  });
                }}
              >
                Secret Bid
              </Button>
            )}
            {parseInt(auctionStatus) === 2 && (
              <Button
                variant="contained"
                style={{ marginTop: "1rem", marginLeft: "10px" }}
                onClick={async () => {
                  let qty = parseInt(document.getElementById("bid-qty").value);
                  let price = parseInt(
                    document.getElementById("bid-price").value
                  );
                  let res = await blockchain.contract.methods
                    .bid(bidSupplier, qty, price)
                    .send({
                      from: curAccount.address,
                      value: price * qty,
                    });
                  console.log(res);
                  Swal.fire({
                    title: "Bid Placed",
                    text: "Your bid has been placed successfully",
                    icon: "success",
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                  });
                }}
              >
                Bid
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            marginTop: "20px",
          }}
        >
          <h1 style={{ textAlign: "center" }}>Auction Not Started Yet</h1>
        </div>
      )}
    </div>
  );
}
