// import libraries for web3
import getWeb3 from "./getWeb3.js";
import { useEffect, useState } from "react";
import Market from "./contracts/Market.json";

function App() {
  const [blockchain, setBlockchain] = useState({
    web3: null,
    accounts: null,
    contract: null,
    curAccount: null,
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
        deployedNetwork && deployedNetwork.address
      );
      web3.eth.getBalance(curAccount).then((bal) => {
        setBalance(bal);
      });    
      setBlockchain({
        web3,
        accounts,
        contract: instance,
        curAccount,
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
    };
    init();
  }, []);
  const [balance, setBalance] = useState(0);
  window.ethereum.on("accountsChanged", function (accounts) {
    // Time to reload your interface with accounts[0]!
    setBlockchain({
      ...blockchain,
      curAccount: accounts[0],
    });
    blockchain.web3.eth.getBalance(blockchain.curAccount).then((bal) => {
      setBalance(bal);
    });  
    window.location.reload();
  });
  return (
    <div className="App">
      <h1>Market</h1>
      {blockchain.web3 === null ? (
        <div>Loading Web3, accounts, and contract...</div>
      ) : (
        <div>
          <div>Current Account: {blockchain.curAccount}</div>
          <div>
            Balance: {balance}

          </div>
        </div>
      )}
    </div>
  );
}

export default App;
