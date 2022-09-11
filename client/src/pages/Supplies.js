import { Button } from "@mui/material";
import { useCallback, useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { MarketContext } from "../App";
import { MANUFACTURERS_NAME, SUPPLIERS_NAME } from "../constants";

/**
 * Component holding a Manufacturers' Supplies i.e. Car Bodies and Wheels
 * Additionally allows for manufacturing the cars
 */
export default function Supplies() {
  const { blockchain, curAccount } = useContext(MarketContext);
  const [supplies, setSupplies] = useState([0, 0, 0]);
  const [myCars, setMyCars] = useState([]);

  const [wheels, setWheels] = useState([]);
  const [bodies, setBodies] = useState([]);

  const init = useCallback(async () => {
    let res = await blockchain.contract.methods.getManufacturerSupply().call();
    setSupplies(res);

    let cars = await blockchain.contract.methods
      .getManufacturerCars(curAccount.manufacturerNumber)
      .call();
    setMyCars(cars);

    let wheels = await blockchain.contract.methods
      .getManufacturerWheels(curAccount.manufacturerNumber)
      .call();
    setWheels(wheels);

    let bodies = await blockchain.contract.methods
      .getManufacturerBodies(curAccount.manufacturerNumber)
      .call();
    setBodies(bodies);
  }, [blockchain, curAccount]);

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
        <h2>Number of Bodies: {supplies[1]}</h2>
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
          {bodies.map((body) => (
            <div
              key={body.id}
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
                console.log(body);
                Swal.fire({
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#3085d6",
                  confirmButtonText: "Verify",
                  cancelButtonText: "Close",
                  title: "Body Details",
                  html: `<p>Supplier: ${SUPPLIERS_NAME[parseInt(body[0])]}</p>
                  <p>id: ${body.id}</p>`,
                }).then(async (res) => {
                  if (res.isConfirmed) {
                    // Verify product
                    let result = await blockchain.contract.methods
                      .verifySupply(body.id)
                      .send({ from: curAccount.address });
                    if (result) {
                      Swal.fire({
                        title: "Success",
                        text: "Product verified",
                        icon: "success",
                      });
                    } else {
                      Swal.fire({
                        title: "Error",
                        text: "Product verification failed",
                        icon: "error",
                      });
                    }
                  }
                });
              }}
            >
              <h2>{body.id}</h2>
            </div>
          ))}
        </div>
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
        <h2>Number of Wheels: {supplies[2]}</h2>
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
          {wheels.map((wheel) => (
            <div
              key={wheel.id}
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
                console.log(wheel);
                Swal.fire({
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#3085d6",
                  confirmButtonText: "Verify",
                  cancelButtonText: "Close",
                  title: "Wheel Details",
                  html: `<p>Supplier: ${SUPPLIERS_NAME[parseInt(wheel[0])]}</p>
                  <p>id: ${wheel.id}</p>`,
                }).then(async (res) => {
                  if (res.isConfirmed) {
                    // Verify product
                    let result = await blockchain.contract.methods
                      .verifySupply(wheel.id)
                      .send({ from: curAccount.address });
                    if (result) {
                      Swal.fire({
                        title: "Success",
                        text: "Product verified",
                        icon: "success",
                      });
                    } else {
                      Swal.fire({
                        title: "Error",
                        text: "Product verification failed",
                        icon: "error",
                      });
                    }
                  }
                });
              }}
            >
              <h2>{wheel.id}</h2>
            </div>
          ))}
        </div>
      </div>
      <Button
        variant="contained"
        disabled={parseInt(supplies[1]) === 0 || parseInt(supplies[2]) === 0}
        onClick={async () => {
          await blockchain.contract.methods
            .manufactureCars(1000)
            .send({ from: blockchain.account });
          Swal.fire({
            title: "Success!",
            text: "Cars manufactured successfully!",
            icon: "success",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
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
