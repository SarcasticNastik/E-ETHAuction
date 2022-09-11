import { useContext } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { MANUFACTURERS_NAME, SUPPLIERS_NAME } from "../constants";

import { MarketContext } from "../App";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

/**
 * NavBar Component for React website
 */
export default function ButtonAppBar() {
  const { blockchain, curAccount } = useContext(MarketContext);
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar style={{ background: "#2E3B55" }} position="static">
        <Toolbar sx={{ alignItems: "center" }}>
          <Typography
            style={{
              cursor: "pointer",
            }}
            onClick={() => {
              navigate("/");
            }}
            variant="h4"
            component="div"
          >
            MarketAuction
          </Typography>
          <div
            style={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              paddingTop: "5px",
              marginLeft: "0px",
            }}
          >
            {!curAccount.isOwner &&
              !curAccount.isManufacturer &&
              !curAccount.isSupplier && (
                <Button
                  onClick={() => {
                    navigate("/Assign");
                  }}
                  color="inherit"
                  sx={{ fontSize: "13px" }}
                >
                  Assign
                </Button>
              )}
            {curAccount.isSupplier && (
              <Button
                onClick={() => {
                  navigate("/market");
                }}
                color="inherit"
                sx={{ fontSize: "13px" }}
              >
                Market
              </Button>
            )}
            {curAccount.isManufacturer && (
              <Button
                onClick={() => {
                  navigate("/bid");
                }}
                color="inherit"
                sx={{ fontSize: "13px" }}
              >
                Bid
              </Button>
            )}
            {curAccount.isManufacturer && (
              <Button
                onClick={() => {
                  navigate("/supplies");
                }}
                color="inherit"
                sx={{ fontSize: "13px" }}
              >
                Supplies
              </Button>
            )}
            <Button
              onClick={() => {
                navigate("/buycar");
              }}
              color="inherit"
              sx={{ fontSize: "13px" }}
            >
              BuyCar
            </Button>
          </div>
          {blockchain.web3 === null ? (
            ""
          ) : (
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {curAccount.account}
            </Typography>
          )}
          {blockchain.web3 === null ? (
            // <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            // To right end
            <Typography variant="h6" component="div">
              No Account connected
            </Typography>
          ) : (
            <Typography variant="h6" component="div">
              {/* If owner show owner */}
              {curAccount.isOwner ? (
                <span style={{ color: "white" }}>Owner</span>
              ) : // If manufacturer get key from constants and show
              curAccount.isManufacturer ? (
                <span style={{ color: "white" }}>
                  {MANUFACTURERS_NAME[curAccount.manufacturerNumber]}
                </span>
              ) : // If supplier get key from constants and show
              curAccount.isSupplier ? (
                <span style={{ color: "white" }}>
                  {SUPPLIERS_NAME[curAccount.supplierNumber]}
                </span>
              ) : (
                // If not assigned show not assigned
                <span style={{ color: "white" }}>Not Assigned</span>
              )}
              <span style={{ color: "white" }}> | </span>
              WEI:
              {curAccount.balance}
            </Typography>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
