import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import SideBar from "./SideBar";

const Layout = () => {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {/* Sidebar */}
      <SideBar />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main
        style={{
          marginLeft: "250px",
          marginTop: "70px",
          padding: "30px",
          minHeight: "calc(100vh - 70px)",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
