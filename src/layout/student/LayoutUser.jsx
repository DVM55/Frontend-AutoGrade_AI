import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";

const LayoutUser = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <div style={{ position: "sticky", top: 0, zIndex: 1000 }}>
        <Header />
      </div>
      <main className="flex-grow-1">
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutUser;
