import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Chatbot from "../../pages/user/Chatbot";

const LayoutUser = () => {
  return (
    <div
      style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}
    >
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Chatbot />
    </div>
  );
};

export default LayoutUser;
