import { Button } from "@mui/material";
import { useCallback, useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { MarketContext } from "../App";
import {
  MANUFACTURERS,
  MANUFACTURERS_NAME,
  SUPPLIERS_NAME,
} from "../constants";

export default function BuyCar() {
  const { blockchain } = useContext(MarketContext);
  const [tataCars, setTataCars] = useState(0);
  const [tataCarPrice, setTataCarPrice] = useState(0);
  const [marutiCars, setMarutiCars] = useState(0);
  const [marutiCarPrice, setMarutiCarPrice] = useState(0);
  const [myCars, setMyCars] = useState([]);

  const init = useCallback(async () => {
    let tataCarPrice = await blockchain.contract.methods
      .getCars(MANUFACTURERS.TATA)
      .call();
    let marutiCarPrice = await blockchain.contract.methods
      .getCars(MANUFACTURERS.MARUTI)
      .call();

    let cars = await blockchain.contract.methods.getMyCars().call();
    console.log(tataCarPrice, marutiCarPrice);

    setTataCars(tataCarPrice[0]);
    setTataCarPrice(tataCarPrice[1]);

    setMarutiCars(marutiCarPrice[0]);
    setMarutiCarPrice(marutiCarPrice[1]);

    setMyCars(cars);
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
          width: "100%",
          padding: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
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
          <h1>Maruti</h1>
          <h2>Price: {marutiCarPrice}</h2>
          <h2>Number of Cars: {marutiCars}</h2>
        </div>
        <div
          style={{
            width: "20%",
            padding: "10px",
            margin: "10px",
          }}
        >
          <Button
            variant="contained"
            disabled={parseInt(marutiCars) === 0}
            onClick={async () => {
              await blockchain.contract.methods
                .buyCar(MANUFACTURERS.MARUTI)
                .send({ from: blockchain.account, value: marutiCarPrice });
              Swal.fire({
                icon: "success",
                title: "Car Bought",
              }).then(() => {
                window.location.reload();
              });
            }}
          >
            {parseInt(marutiCars) === 0 ? "Out of Stock" : "Buy"}
          </Button>
        </div>
      </div>
      <div
        style={{
          width: "100%",
          padding: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
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
          <h1>Tata</h1>
          <h2>Price: {tataCarPrice}</h2>
          <h2>Number of Cars: {tataCars}</h2>
        </div>
        <div
          style={{
            width: "20%",
            padding: "10px",
            margin: "10px",
          }}
        >
          <Button
            variant="contained"
            disabled={parseInt(tataCars) === 0}
            onClick={async () => {
              await blockchain.contract.methods
                .buyCar(MANUFACTURERS.TATA)
                .send({ from: blockchain.account, value: tataCarPrice });
              Swal.fire({
                icon: "success",
                title: "Car Bought",
              }).then(() => {
                window.location.reload();
              });
            }}
          >
            {parseInt(tataCars) === 0 ? "Out of Stock" : "Buy"}
          </Button>
        </div>
      </div>
      <div
        style={{
          borderRadius: "5px",
          width: "95%",
          border: "1px solid #000",
          margin: "10px",
          padding: "10px",
        }}
      >
        <h1>My Cars</h1>
        <h2>Number of Cars: {myCars.length}</h2>
        {/* Create a horizontal scrollable list of blocks */}
        <div
          style={{
            display: "flex",
            // justifyContent: "space-between",
            flexWrap: "wrap",
            // alignItems: "center",
            flexDirection: "row",
            overflowX: "auto",
            // width: "100%",
          }}
        >
          {myCars.map((car) => (
            <div
              key={car.id}
              style={{
                borderRadius: "5px",
                // flex: "1 1 0",
                width: "60px",
                padding: "10px",
                margin: "10px",
                border: "1px solid #000",
                // Break text into multiple lines
                wordBreak: "break-all",
                cursor: "pointer",
              }}
              onClick={async () => {
                // Show car details in pop up
                console.log(car);
                Swal.fire({
                  title: "Car Details",
                  html: `<p>Manufacturer: ${
                    MANUFACTURERS_NAME[parseInt(car[0])]
                  }</p>
                    <p>Wheel Supplier: ${
                      SUPPLIERS_NAME[parseInt(car[2][0])]
                    } - ${car[2][2]}</p>
                    <p>Body Supplier: ${
                      SUPPLIERS_NAME[parseInt(car[3][0])]
                    } - ${car[3][2]}</p>
                    <p>id: ${car[4]}</p>`,
                });
              }}
            >
              <h2>{car.id}</h2>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
