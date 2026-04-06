import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import SideBar from "./SideBar";

const LayoutAdmin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1000);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1000) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen((v) => !v);

  return (
    <>
      <style>{`
        .layout-main {
          margin-left: 250px;
          margin-top: 70px;
          padding: 2rem;
          min-height: calc(100vh - 70px);
          background: #f8f9fa;
          transition: margin-left 0.28s cubic-bezier(.4,0,.2,1);
        }

        @media (max-width: 1000px) {
          .layout-main {
            margin-left: 0 !important;
            padding: 1.25rem;
          }
        }
      `}</style>

      <SideBar collapsed={!sidebarOpen} onToggle={toggleSidebar} />

      <Header onMenuToggle={toggleSidebar} />

      <main className="layout-main">
        <Outlet />
      </main>
    </>
  );
};

export default LayoutAdmin;
