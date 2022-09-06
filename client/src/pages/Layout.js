import { useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TopBar from "../components/TopBar";

import Assign from "../pages/Assign";

import { MarketContext } from "../App";

const Layout = () => {
  const Home = () => <h1>Your address: {curAccount.account}</h1>;
  const Market = () => <h1>Market</h1>;
  const Bid = () => <h1>Bid</h1>;
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
        {assigned && <Route path="/market" element={<Market />} />}
        {curAccount.isManufacturer && <Route path="/bid" element={<Bid />} />}
        {curAccount.isOwner && <Route path="/auction" element={<Auction />} />}
        {/* Default redirect */}
        <Route path="*" element={<h1>404: Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
};
export default Layout;
