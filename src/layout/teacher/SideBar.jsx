import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const SideBar = ({ collapsed, onToggle }) => {
  const menuItems = [
    { icon: "bi-book", label: "Lớp học", path: "/teacher/classes" },
    {
      icon: "bi-file-earmark-text",
      label: "Bài kiểm tra",
      path: "/teacher/exams",
    },
    {
      icon: "bi-patch-question",
      label: "Ngân hàng câu hỏi",
      path: "/teacher/question-bank",
    },
  ];

  return (
    <>
      <style>{`
        .sidebar {
          position: fixed;
          top: 0; left: 0;
          width: 250px;
          height: 100vh;
          z-index: 1001;
          background: #fff;
          border-right: 1px solid #dee2e6;
          box-shadow: 2px 0 8px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          transition: transform 0.28s cubic-bezier(.4,0,.2,1);
        }

        .sidebar.sidebar--collapsed {
          transform: translateX(-100%);
        }

        /* Overlay on mobile */
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(2px);
        }

        /* Brand */
        .sidebar__brand {
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #dee2e6;
          gap: 0.55rem;
          flex-shrink: 0;
        }

        .sidebar__brand-icon {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #0d6efd 0%, #6ea8fe 100%);
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 8px rgba(13,110,253,0.28);
          flex-shrink: 0;
        }

        .sidebar__brand-icon svg { width: 18px; height: 18px; }

        .sidebar__brand-name {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.3px;
          color: #0d6efd;
          line-height: 1;
        }

        .sidebar__brand-name span { color: #212529; }

        /* Nav links */
        .sidebar__nav { padding: 0.75rem; flex: 1; overflow-y: auto; margin-top: 0.5rem; }

        .sidebar__link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          margin-bottom: 1rem;
          color: #495057;
          font-weight: 500;
          font-size: 16px;
          transition: all 0.18s;
        }

        .sidebar__link:hover {
          background: #e8f0fe;
          color: #0d6efd;
        }

        .sidebar__link.active {
          background: #0d6efd;
          color: #fff;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(13,110,253,0.28);
        }

        .sidebar__link i { font-size: 16px; flex-shrink: 0; }

        @media (max-width: 1000px) {
          .sidebar-overlay { display: block; }
        }
      `}</style>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div
          className="sidebar-overlay"
          style={{ display: collapsed ? "none" : undefined }}
          onClick={onToggle}
        />
      )}

      <aside className={`sidebar${collapsed ? " sidebar--collapsed" : ""}`}>
        {/* Brand */}
        <div className="sidebar__brand">
          <div className="sidebar__brand-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3.33 2 8.67 2 12 0v-5" />
            </svg>
          </div>
          <div className="sidebar__brand-name">
            Edu<span>cation</span>
          </div>
        </div>

        {/* Menu */}
        <nav className="sidebar__nav">
          {menuItems.map((item, i) => (
            <NavLink
              key={i}
              to={item.path}
              className={({ isActive }) =>
                `sidebar__link${isActive ? " active" : ""}`
              }
              onClick={() => {
                if (window.innerWidth <= 1000) onToggle?.();
              }}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default SideBar;
