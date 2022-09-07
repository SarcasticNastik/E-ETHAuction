import { useContext, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";

import Assign from "../pages/Assign";
import Bid from "./Bid";
import SupplierMarket from "./SupplierMarket";
import { MarketContext } from "../App";

const NotFound = () => {
  const [redirect, setRedirect] = useState(5);
  const navigate = useNavigate();
  setTimeout(() => {
    if (redirect === 1) navigate("/");
    setRedirect(redirect - 1);
  }, 1000);
  return (
    <div>
      <h1>404: Not Found</h1>
      <h2>Redirecting in {redirect}</h2>
    </div>
  );
};

const Layout = () => {
  const Home = () => <h1>Your address: {curAccount.account}</h1>;
  const Auction = () => <h1>Auction</h1>;

  const { curAccount } = useContext(MarketContext);
  const assigned =
    curAccount.isOwner || curAccount.isManufacturer || curAccount.isSupplier;

  return (
    <BrowserRouter>
      <TopBar />
      <Routes>
        <Route path="/" element={<Home />} />
        {!assigned && <Route exact path="/assign" element={<Assign />} />}
        {curAccount.isSupplier && (
          <Route path="/market" element={<SupplierMarket />} />
        )}
        {curAccount.isManufacturer && <Route path="/bid" element={<Bid />} />}
        {curAccount.isOwner && <Route path="/auction" element={<Auction />} />}
        {/* Default redirect */}
        {/* Add timeout */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
export default Layout;
