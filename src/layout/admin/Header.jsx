import React, { useEffect } from "react";
import avatarImg from "../../assets/avatarImg.png";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { user, setUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header
      className="bg-white shadow-sm"
      style={{
        position: "fixed",
        top: 0,
        left: "250px",
        right: 0,
        height: "70px",
        zIndex: 1000,
        borderBottom: "1px solid #dee2e6",
      }}
    >
      <div className="d-flex justify-content-end align-items-center h-100 px-4">
        <div className="d-flex align-items-center gap-3">
          <img
            src={user?.avatarUrl || avatarImg}
            alt="User Avatar"
            className="rounded-circle"
            style={{ width: "45px", height: "45px", objectFit: "cover" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = avatarImg;
            }}
          />

          <div>
            <div className="fw-semibold" style={{ fontSize: "15px" }}>
              {user?.username || ""}
            </div>
            <div className="text-muted" style={{ fontSize: "13px" }}>
              {user?.email || ""}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            style={{
              borderRadius: "8px",
              padding: "8px 20px",
              fontSize: "14px",
            }}
          >
            <i className="bi bi-box-arrow-right"></i>
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
