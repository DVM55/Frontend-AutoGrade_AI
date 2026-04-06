import React, { useState, useEffect } from "react";
import avatarImg from "../../assets/avatarImg.png";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e) => {
      if (!e.target.closest("#teacher-avatar-wrap")) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDropdown]);

  return (
    <>
      <style>{`
        .app-header {
          position: fixed;
          top: 0;
          left: 250px;
          right: 0;
          height: 70px;
          z-index: 1000;
          background: #fff;
          border-bottom: 1px solid #dee2e6;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          gap: 1rem;
        }

        .header-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          color: #495057;
          transition: background 0.15s;
        }

        .header-toggle:hover { background: #e8f0fe; color: #0d6efd; }

        .header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-left: auto;
        }

        /* ── Avatar trigger ── */
        #teacher-avatar-wrap { position: relative; }

        .avatar-trigger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 5px 10px 5px 5px;
          border-radius: 99px;
          border: 1.5px solid transparent;
          background: transparent;
          cursor: pointer;
          transition: border-color 0.18s, background 0.18s;
        }

        .avatar-trigger:hover {
          border-color: #dee2e6;
          background: #e8f0fe;
        }

        .avatar-ring {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid #e8f0fe;
          flex-shrink: 0;
        }

        .avatar-ring img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .avatar-name {
          font-size: 16px;
          font-weight: 600;
          color: #212529;
          max-width: 130px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .avatar-chevron {
          font-size: 14px;
          color: #6c757d;
          transition: transform 0.2s;
        }

        .avatar-chevron.open { transform: rotate(180deg); }

        /* ── Dropdown panel ── */
        .avatar-dropdown {
          position: fixed;
          top: 70px;
          right: 12px;
          width: min(230px, calc(100vw - 16px));
          background: #fff;
          border: 1px solid #dee2e6;
          border-radius: 14px;
          box-shadow: 0 8px 32px rgba(13,110,253,0.12), 0 2px 8px rgba(0,0,0,0.08);
          padding: 6px;
          z-index: 1100;
          animation: dropIn 0.18s ease;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .dropdown-header {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 10px 12px 12px;
          border-bottom: 1px solid #dee2e6;
          margin-bottom: 4px;
        }

        .dropdown-header__avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid #e8f0fe;
          flex-shrink: 0;
        }

        .dropdown-header__avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .dropdown-header__name {
          font-size: 16px;
          font-weight: 600;
          color: #212529;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-header__email {
          font-size: 15px;
          color: #6c757d;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 1px;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          width: 100%;
          padding: 9px 12px;
          border-radius: 8px;
          border: none;
          background: transparent;
          font-size: 16px;
          color: #212529;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s, color 0.15s;
        }

        .dropdown-item:hover { background: #e8f0fe; color: #0d6efd; }

        .dropdown-item i {
          font-size: 16px;
          color: #6c757d;
          width: 18px;
          text-align: center;
          transition: color 0.15s;
        }

        .dropdown-item:hover i { color: #0d6efd; }

        .dropdown-item.danger { color: #c0392b; }
        .dropdown-item.danger:hover { background: #fff5f5; color: #c0392b; }
        .dropdown-item.danger i { color: #c0392b; }

        .dropdown-divider {
          height: 1px;
          background: #dee2e6;
          margin: 4px 0;
        }

        /* ── Responsive ── */
        @media (max-width: 1000px) {
          .app-header { left: 0; padding: 0 1rem; }
          .header-toggle { display: flex; }
        }

        @media (max-width: 480px) {
          .avatar-name { display: none; }
          .avatar-chevron { display: none; }
          .avatar-trigger { padding: 4px; }
        }
      `}</style>

      <header className="app-header">
        {/* Hamburger */}
        <button
          className="header-toggle"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>

        {/* Right */}
        <div className="header-right">
          <div id="teacher-avatar-wrap">
            <button
              className="avatar-trigger"
              onClick={() => setShowDropdown((v) => !v)}
            >
              <div className="avatar-ring">
                <img
                  src={user?.avatarUrl || avatarImg}
                  alt="avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = avatarImg;
                  }}
                />
              </div>
              <span className="avatar-name">{user?.username || ""}</span>
              <i
                className={`bi bi-chevron-down avatar-chevron${showDropdown ? " open" : ""}`}
              />
            </button>

            {showDropdown && (
              <div className="avatar-dropdown">
                {/* Info header */}
                <div className="dropdown-header">
                  <div className="dropdown-header__avatar">
                    <img
                      src={user?.avatarUrl || avatarImg}
                      alt="avatar"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = avatarImg;
                      }}
                    />
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div className="dropdown-header__name">
                      {user?.fullName || user?.username || ""}
                    </div>
                    <div className="dropdown-header__email">
                      {user?.email || ""}
                    </div>
                  </div>
                </div>

                <button
                  className="dropdown-item"
                  onClick={() => {
                    navigate("/teacher/profile");
                    setShowDropdown(false);
                  }}
                >
                  <i className="bi bi-person" />
                  Hồ sơ cá nhân
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => {
                    navigate("/teacher/change-password");
                    setShowDropdown(false);
                  }}
                >
                  <i className="bi bi-key" />
                  Đổi mật khẩu
                </button>

                <div className="dropdown-divider" />

                <button className="dropdown-item danger" onClick={logout}>
                  <i className="bi bi-box-arrow-right" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
