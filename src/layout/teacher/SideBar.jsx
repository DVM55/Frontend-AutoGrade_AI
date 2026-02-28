import React from "react";
import { NavLink } from "react-router-dom";

const SideBar = () => {
  const menuItems = [
    {
      icon: "bi-book",
      label: "Lớp học",
      path: "/teacher/classes",
    },
    {
      icon: "bi-file-earmark-text",
      label: "Bài kiểm tra",
      path: "/teacher/exams",
    },

    {
      icon: "bi-person-circle",
      label: "Hồ sơ cá nhân",
      path: "/teacher/profile",
    },
    {
      icon: "bi-shield-lock",
      label: "Đổi mật khẩu",
      path: "/teacher/change-password",
    },
  ];

  return (
    <div
      className="bg-white shadow"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "250px",
        height: "100vh",
        zIndex: 1001,
        borderRight: "1px solid #dee2e6",
      }}
    >
      {/* Logo */}
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          height: "70px",
          borderBottom: "1px solid #dee2e6",
        }}
      >
        <h4 className="mb-0 fw-bold text-primary">AutoGrade AI</h4>
      </div>

      {/* Menu Items */}
      <nav className="p-3">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `d-flex align-items-center gap-3 text-decoration-none p-3 rounded mb-2 ${
                isActive
                  ? "bg-primary text-white fw-bold"
                  : "text-dark hover-bg-light"
              }`
            }
            style={{ transition: "all 0.2s" }}
          >
            <i className={`bi ${item.icon} fs-5`}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default SideBar;
