import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getProfile } from "../../service/account.service";
import { useLocation, useNavigate } from "react-router-dom";
import avatarImg from "../../assets/avatarImg.png";

const Header = () => {
  const [hasNotif, setHasNotif] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate(); // ✅ thêm
  const location = useLocation();

  const isClassActive = location.pathname.startsWith("/user/class");

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      setUser((prev) => ({ ...prev, ...res.data }));
    } catch (error) {
      console.log("Lỗi lấy profile:", error?.response?.data);
    }
  };

  useEffect(() => {
    if (!user?.id) fetchProfile();
  }, []);

  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e) => {
      if (!e.target.closest("#avatar-dropdown-wrap")) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDropdown]);

  return (
    <nav
      className="navbar bg-white border-bottom px-4 position-relative"
      style={{ height: 60, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      {/* Logo / Brand */}
      <button
        onClick={() => navigate("/user/class")} // ✅ navigate
        className="navbar-brand d-flex align-items-center gap-2 me-0 text-decoration-none border-0 bg-transparent"
        style={{ cursor: "pointer" }}
      >
        <div
          className="rounded-2 d-flex align-items-center justify-content-center"
          style={{ width: 30, height: 30, background: "#1a73e8" }}
        >
          <i
            className="bi bi-mortarboard-fill text-white"
            style={{ fontSize: 15 }}
          />
        </div>
        <span
          className="fw-bold"
          style={{ fontSize: 16, color: "#1a1a2e", letterSpacing: -0.3 }}
        >
          Education
        </span>
      </button>

      {/* Center nav */}
      <ul className="navbar-nav flex-row h-100 position-absolute top-0 start-50 translate-middle-x">
        <li className="nav-item h-100 d-flex align-items-stretch">
          <button
            onClick={() => navigate("/user/class")}
            className="nav-link d-flex align-items-center px-4 fw-semibold position-relative border-0 bg-transparent"
            style={{
              color: isClassActive ? "#1a73e8" : "#5f6368",
              fontSize: 14,
            }}
          >
            Lớp
            {isClassActive && (
              <span
                className="position-absolute bottom-0 start-50 translate-middle-x rounded-top"
                style={{
                  height: 3,
                  width: "60%",
                  background: "#1a73e8",
                }}
              />
            )}
          </button>
        </li>
      </ul>

      {/* Right side giữ nguyên */}
      <div className="d-flex align-items-center gap-2 ms-auto">
        <button
          className="btn rounded-circle d-flex align-items-center justify-content-center position-relative p-0"
          style={{
            width: 38,
            height: 38,
            color: "#5f6368",
            background: "transparent",
            border: "none",
          }}
          title="Thông báo"
          onClick={() => setHasNotif(false)}
        >
          <i className="bi bi-bell fs-5" />
          {hasNotif && (
            <span
              className="position-absolute bg-danger rounded-circle border border-white"
              style={{ width: 9, height: 9, top: 6, right: 6 }}
            />
          )}
        </button>

        <div className="vr" style={{ height: 40, opacity: 0.3 }} />

        {/* Avatar dropdown giữ nguyên như bạn */}
        <div id="avatar-dropdown-wrap" className="position-relative">
          <button
            className="btn d-flex align-items-center gap-2 rounded-pill px-2 py-1 border-0"
            style={{ fontSize: 14, background: "transparent" }}
            onClick={() => setShowDropdown((v) => !v)}
          >
            <div
              className="rounded-circle overflow-hidden flex-shrink-0"
              style={{ width: 34, height: 34, border: "2px solid #e8eaed" }}
            >
              <img
                src={user?.avatarUrl || avatarImg}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <span
              className="fw-medium text-dark d-none d-sm-inline"
              style={{
                maxWidth: 140,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.username || ""}
            </span>
            <i
              className="bi bi-chevron-down text-secondary"
              style={{ fontSize: 11 }}
            />
          </button>

          {showDropdown && (
            <div
              className="position-absolute end-0 bg-white rounded-3 border shadow-sm py-1"
              style={{ minWidth: 220, top: "calc(100% + 8px)", zIndex: 999 }}
            >
              {/* User info */}
              <div className="px-3 py-2 border-bottom d-flex align-items-center gap-2">
                <div
                  className="rounded-circle overflow-hidden flex-shrink-0"
                  style={{ width: 40, height: 40 }}
                >
                  <img
                    src={user?.avatarUrl || avatarImg}
                    alt="avatar"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = avatarImg;
                    }}
                  />
                </div>
                <div className="overflow-hidden">
                  <div
                    className="fw-semibold text-dark text-truncate"
                    style={{ fontSize: 14 }}
                  >
                    {user?.fullName || user?.username || ""}
                  </div>
                  <div
                    className="text-muted text-truncate"
                    style={{ fontSize: 12 }}
                  >
                    {user?.email || ""}
                  </div>
                </div>
              </div>

              {/* Hồ sơ */}
              <button
                className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                style={{ fontSize: 14 }}
                onClick={() => {
                  navigate("/user/profile");
                  setShowDropdown(false);
                }}
              >
                <i className="bi bi-person text-secondary" />
                Hồ sơ cá nhân
              </button>

              <button
                className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                style={{ fontSize: 14 }}
                onClick={() => {
                  navigate("/user/change-password"); // sửa route nếu cần
                  setShowDropdown(false);
                }}
              >
                <i className="bi bi-key text-secondary" />
                Đổi mật khẩu
              </button>

              <div className="border-top my-1" />

              {/* Đăng xuất */}
              <button
                className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-danger"
                style={{ fontSize: 14 }}
                onClick={logout}
              >
                <i className="bi bi-box-arrow-right" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
