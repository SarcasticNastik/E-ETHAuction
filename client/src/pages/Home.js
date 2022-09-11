import { useContext, useEffect, useState } from "react";
import {
  Button,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import Swal from "sweetalert2";
import { MarketContext } from "../App";
import { MANUFACTURERS, SUPPLIERS, AUCTION_STATUS } from "../constants";
import { useNavigate } from "react-router-dom";
export default function Home() {
  const navigate = useNavigate();
  const { blockchain, curAccount, auctionStatus, setAuctionStatus } =
    useContext(MarketContext);

  const GeneralHome = () => {
    const [redirect, setRedirect] = useState(5);
    setTimeout(() => {
      if (redirect === 1) navigate("/assign");
      setRedirect(redirect - 1);
    }, 1000);
    return (
      <div>
        <h1>Please Assign Yourself</h1>
        <h2>Redirecting in {redirect}</h2>
      </div>
    );
  };

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

    useEffect(() => {
      updateHashedBids();
      revealBids();
    }, []);

    const updateHashedBids = async () => {
      let taVe = await blockchain.contract.methods
        .getHashedBids(MANUFACTURERS.TATA, SUPPLIERS.VEDANTA)
        .call();
      let taMr = await blockchain.contract.methods
        .getHashedBids(MANUFACTURERS.TATA, SUPPLIERS.MRF)
        .call();
      let maVe = await blockchain.contract.methods
        .getHashedBids(MANUFACTURERS.MARUTI, SUPPLIERS.VEDANTA)
        .call();
      let maCe = await blockchain.contract.methods
        .getHashedBids(MANUFACTURERS.MARUTI, SUPPLIERS.CEAT)
        .call();
      setHashedBids([
        0,
        [0, taVe, taMr, "No Participation"],
        [0, maVe, "No Participation", maCe],
      ]);
    };

    const revealBids = async () => {
      let taVe = await blockchain.contract.methods
        .getBids(MANUFACTURERS.TATA, SUPPLIERS.VEDANTA)
        .call();
      taVe = parseInt(taVe[0]) === -1 ? "Not Revealed" : taVe;
      let taMr = await blockchain.contract.methods
        .getBids(MANUFACTURERS.TATA, SUPPLIERS.MRF)
        .call();
      taMr = parseInt(taMr[0]) === -1 ? "Not Revealed" : taMr;
      let maVe = await blockchain.contract.methods
        .getBids(MANUFACTURERS.MARUTI, SUPPLIERS.VEDANTA)
        .call();
      maVe = parseInt(maVe[0]) === -1 ? "Not Revealed" : maVe;
      let maCe = await blockchain.contract.methods
        .getBids(MANUFACTURERS.MARUTI, SUPPLIERS.CEAT)
        .call();
      maCe = parseInt(maCe[0]) === -1 ? "Not Revealed" : maCe;
      setRevealedBids([
        0,
        [0, taVe, taMr, "No Participation"],
        [0, maVe, "No Participation", maCe],
      ]);
    };

    const [hashedBids, setHashedBids] = useState([
      0,
      [0, "NA", "NA", "No Participation"],
      [0, "NA", "No Participation", "NA"],
    ]);

    const [revealedBids, setRevealedBids] = useState([
      0,
      [0, "Not Revealed", "Not Revealed", "No Participation"],
      [0, "Not Revealed", "No Participation", "Not Revealed"],
    ]);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>
          <div
            style={{
              alignContent: "center",
              justifyContent: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "20px",
            }}
          >
            <h1>Owner Page</h1>
            <h2>Auction Status: {AUCTION_STATUS[auctionStatus]}</h2>
          </div>
          {/* // Add input field and button to change auction status */}
          {/* Create a drop down */}
          <label id="demo-simple-select-label">Change Status: </label>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={auctionStatus}
            label="Auction Status"
            onChange={(e) => {
              setAuctionStatus(e.target.value);
              localStorage.setItem("auctionStatus", parseInt(e.target.value));
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
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ margin: "20px 40px" }}>
            <div>
              <h2>Hashed Bids</h2>
            </div>
            <div style={{ border: "1px solid black" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>SUPPLIERS</TableCell>
                    <TableCell>TATA</TableCell>
                    <TableCell>Maruti</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Vedanta</TableCell>
                    <TableCell>
                      {hashedBids[MANUFACTURERS.TATA][SUPPLIERS.VEDANTA]}
                    </TableCell>
                    <TableCell>
                      {hashedBids[MANUFACTURERS.MARUTI][SUPPLIERS.VEDANTA]}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>MRF</TableCell>
                    <TableCell>
                      {hashedBids[MANUFACTURERS.TATA][SUPPLIERS.MRF]}
                    </TableCell>
                    <TableCell>
                      {hashedBids[MANUFACTURERS.MARUTI][SUPPLIERS.MRF]}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>CEAT</TableCell>
                    <TableCell>
                      {hashedBids[MANUFACTURERS.TATA][SUPPLIERS.CEAT]}
                    </TableCell>
                    <TableCell>
                      {hashedBids[MANUFACTURERS.MARUTI][SUPPLIERS.CEAT]}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                alignContent: "center",
                justifyContent: "center",
              }}
            >
              <Button
                variant="contained"
                onClick={() => {
                  updateHashedBids();
                  Swal.fire({
                    title: "Hashed Bids Updated",
                    icon: "success",
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                  });
                }}
              >
                Get Hashed Bids
              </Button>
            </div>
          </div>
          <div style={{ margin: "20px 40px" }}>
            <div>
              <h2>Revealed Bids</h2>
            </div>
            <div style={{ border: "1px solid black" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>SUPPLIERS</TableCell>
                    <TableCell>TATA</TableCell>
                    <TableCell>Maruti</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Vedanta</TableCell>
                    <TableCell>
                      {revealedBids[MANUFACTURERS.TATA][SUPPLIERS.VEDANTA]}
                    </TableCell>
                    <TableCell>
                      {revealedBids[MANUFACTURERS.MARUTI][SUPPLIERS.VEDANTA]}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>MRF</TableCell>
                    <TableCell>
                      {revealedBids[MANUFACTURERS.TATA][SUPPLIERS.MRF]}
                    </TableCell>
                    <TableCell>
                      {revealedBids[MANUFACTURERS.MARUTI][SUPPLIERS.MRF]}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>CEAT</TableCell>
                    <TableCell>
                      {revealedBids[MANUFACTURERS.TATA][SUPPLIERS.CEAT]}
                    </TableCell>
                    <TableCell>
                      {revealedBids[MANUFACTURERS.MARUTI][SUPPLIERS.CEAT]}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                alignContent: "center",
                justifyContent: "center",
              }}
            >
              <Button
                variant="contained"
                onClick={() => {
                  revealBids();
                  Swal.fire({
                    title: "Revealed Bids Updated",
                    icon: "success",
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                  });
                }}
              >
                Get Revealed Bids
              </Button>
            </div>
          </div>
        </div>
        <div>
          <Button
            variant="contained"
            // disabled={auctionStatus === 3}
            onClick={async () => {
              await blockchain.contract.methods.auction().send({
                from: curAccount.account,
                value:
                  parseInt(
                    revealedBids[MANUFACTURERS.TATA][SUPPLIERS.VEDANTA][0]
                  ) *
                    parseInt(
                      revealedBids[MANUFACTURERS.TATA][SUPPLIERS.VEDANTA][1]
                    ) +
                  parseInt(revealedBids[MANUFACTURERS.TATA][SUPPLIERS.MRF][0]) *
                    parseInt(
                      revealedBids[MANUFACTURERS.TATA][SUPPLIERS.MRF][1]
                    ) +
                  parseInt(
                    revealedBids[MANUFACTURERS.MARUTI][SUPPLIERS.VEDANTA][0]
                  ) *
                    parseInt(
                      revealedBids[MANUFACTURERS.MARUTI][SUPPLIERS.VEDANTA][1]
                    ) +
                  parseInt(
                    revealedBids[MANUFACTURERS.MARUTI][SUPPLIERS.CEAT][0]
                  ) *
                    parseInt(
                      revealedBids[MANUFACTURERS.MARUTI][SUPPLIERS.CEAT][1]
                    ),
              });
              Swal.fire({
                title: "Auction Completed",
                icon: "success",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
              });
            }}
          >
            Start Auction
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {curAccount.isSupplier && <SupplierHome />}
      {curAccount.isManufacturer && <ManufacturerHome />}
      {curAccount.isOwner && <OwnerHome />}
      {!curAccount.isOwner &&
        !curAccount.isManufacturer &&
        !curAccount.isSupplier && <GeneralHome />}
    </div>
  );
}
