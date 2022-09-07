// import libraries for web3
import { useEffect, useState, createContext } from "react";
import getWeb3 from "./getWeb3.js";
import Market from "./contracts/Market.json";

import PacmanLoader from "react-spinners/PacmanLoader";
import Layout from "./pages/Layout.js";

export const MarketContext = createContext();

function App() {
  const [blockchain, setBlockchain] = useState({
    web3: null,
    accounts: null,
    contract: null,
  });
  const [curAccount, setCurAccount] = useState({
    account: null,
    balance: null,
    isOwner: false,
    isManufacturer: false,
    isSupplier: false,
  });

  useEffect(() => {
    const init = async () => {
      // let web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
      // check if web3 is injected
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const curAccount = accounts[0];
      // Get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Market.networks[networkId];
      const instance = new web3.eth.Contract(
        Market.abi,
        deployedNetwork && deployedNetwork.address,
        {
          from: curAccount,
          gasPrice: "20000000000",
        }
      );
      setBlockchain({
        web3,
        accounts,
        contract: instance,
      });

      // Check if owner
      const isOwner = await instance.methods.isOwner().call({
        from: curAccount,
      });

      // check if manufacturer
      const manufacturerNumber = await instance.methods
        .getManufacturerNumber()
        .call({
          from: curAccount,
        });

      // Check if supplier
      const supplierNumber = await instance.methods.getSupplierNumber().call({
        from: curAccount,
      });

      console.log("manufacturerNumber", manufacturerNumber);
      console.log("supplierNumber", supplierNumber);
      console.log("isOwner", isOwner);

      setCurAccount({
        account: curAccount,
        balance: await web3.eth.getBalance(curAccount),
        isOwner,
        isManufacturer: manufacturerNumber > 0,
        isSupplier: supplierNumber > 0,
        manufacturerNumber: manufacturerNumber,
        supplierNumber: supplierNumber,
      });

      console.log(
        "web3",
        web3,
        "accounts",
        accounts,
        "instance",
        instance,
        "curAccount",
        curAccount
      );
      setLoading(false);
    };
    init();
  }, []);
  const [loading, setLoading] = useState(true);

  window.ethereum.on("accountsChanged", function (accounts) {
    // Time to reload your interface with accounts[0]!
    window.location.reload();
  });

  // Check if balance has changed

  const Loader = () => (
    <PacmanLoader
      color={"#36d7b7"}
      loading={loading || blockchain.web3 === null}
      size={100}
    />
  );
  return (
    <div className="App">
      <MarketContext.Provider
        value={{
          blockchain,
          setBlockchain,
          curAccount,
          setCurAccount,
        }}
      >
        {blockchain.web3 === null ? (
          <div
            style={{
              height: "90vh",
              width: "85%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Loader />
          </div>
        ) : (
          <Layout />
        )}
      </MarketContext.Provider>
    </div>
  );
}

export default App;
