import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getProfile } from "../../service/account.service";
import { useLocation, useNavigate } from "react-router-dom";
import avatarImg from "../../assets/avatarImg.png";

const Header = () => {
  const [hasNotif, setHasNotif] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { label: "Lớp", path: "/user/class" },
    { label: "Lịch sử nộp bài", path: "/user/history" },
    { label: "Chatbot", path: "/user/chatbot" },
  ];

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
    <>
      <style>{`
        /* ═══ HEADER ═══ */
        .user-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          height: var(--header-h);
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          box-shadow: 0 2px 12px rgba(13, 110, 253, 0.07);
        }

        .user-header__inner {
          max-width: 1400px;
          margin: 0 auto;
          height: 100%;
          display: flex;
          align-items: center;
          padding: 0 clamp(10px, 3vw, 32px);
          gap: 0.5rem;
        }

        /* ── Brand ── */
        .user-brand {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          text-decoration: none;
          flex-shrink: 0;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }

        .user-brand__icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #0d6efd 0%, #6ea8fe 100%);
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 8px rgba(13, 110, 253, 0.3);
          flex-shrink: 0;
        }

        .user-brand__icon svg { width: 18px; height: 18px; }

        .user-brand__name {
          font-size: clamp(1.1rem, 4vw, 1.2rem);
          font-weight: 800;
          letter-spacing: -0.3px;
          color: var(--blue);
          line-height: 1;
        }

        .user-brand__name span { color: var(--text); }

        /* ── Centre nav ── */
        .user-nav {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .user-nav__link {
          font-size: 1rem;
          font-weight: 600;
          color: var(--muted);
          padding: 0.45rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          background: none;
          border: none;
          transition: color 0.18s, background 0.18s;
          white-space: nowrap;
          line-height: 1;
          display: inline-flex;
          align-items: center;
        }

        
        .user-nav__link.is-active { color: var(--blue);  }

        /* ── Right controls ── */
        .user-header__right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-left: auto;
          flex-shrink: 0;
        }

        .notif-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: var(--muted);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }

        .notif-btn:hover { background: var(--blue-soft); color: var(--blue); }

        .notif-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 9px;
          height: 9px;
          background: #e53e3e;
          border-radius: 50%;
          border: 2px solid var(--surface);
        }

        .header-divider {
          width: 1px;
          height: 28px;
          background: var(--border);
          flex-shrink: 0;
        }

        /* ── Avatar dropdown ── */
        #avatar-dropdown-wrap { position: relative; }

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
          border-color: var(--border);
          background: var(--blue-soft);
        }

        .avatar-ring {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid var(--border);
          flex-shrink: 0;
        }

        .avatar-ring img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .avatar-name {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .avatar-chevron {
          font-size: 16px;
          color: var(--muted);
          transition: transform 0.2s;
        }

        .avatar-chevron.open { transform: rotate(180deg); }

        /* ── Dropdown panel ── */
        .avatar-dropdown {
          position: fixed;
          top: var(--header-h);
          right: 8px;
          width: min(230px, calc(100vw - 16px));
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          box-shadow: 0 8px 32px rgba(13, 110, 253, 0.12), 0 2px 8px rgba(0,0,0,0.08);
          padding: 6px;
          z-index: 1001;
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
          border-bottom: 1px solid var(--border);
          margin-bottom: 4px;
        }

        .dropdown-header__avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid var(--blue-soft);
          flex-shrink: 0;
        }

        .dropdown-header__avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .dropdown-header__info { overflow: hidden; }

        .dropdown-header__name {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-header__email {
          font-size: 0.9rem;
          color: var(--muted);
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
          font-size: 1rem;
          color: var(--text);
          cursor: pointer;
          text-align: left;
          transition: background 0.15s, color 0.15s;
        }

        .dropdown-item:hover { background: var(--blue-soft); color: var(--blue); }
        .dropdown-item i { font-size: 1rem; color: var(--muted); width: 18px; text-align: center; transition: color 0.15s; }
        .dropdown-item:hover i { color: var(--blue); }

        .dropdown-item.danger { color: #c0392b; }
        .dropdown-item.danger:hover { background: #fff5f5; color: #c0392b; }
        .dropdown-item.danger i { color: #c0392b; }

        .dropdown-divider { height: 1px; background: var(--border); margin: 4px 0; }

        /* ── Hamburger ── */
        .user-hamburger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          color: var(--text);
          transition: background 0.15s;
          margin-left: auto;
        }

        .user-hamburger:hover { background: var(--blue-soft); }

        /* ═══ MOBILE DRAWER ═══ */
        .user-drawer {
          display: none;
          position: fixed;
          inset: var(--header-h) 0 0 0;
          z-index: 999;
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(2px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s;
        }

        .user-drawer.is-open {
          opacity: 1;
          pointer-events: all;
        }

        .user-drawer__panel {
          background: var(--surface);
          width: min(300px, 85vw);
          height: 100%;
          padding: 1.25rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(.4,0,.2,1);
          box-shadow: 4px 0 24px rgba(0,0,0,0.1);
        }

        .user-drawer.is-open .user-drawer__panel {
          transform: translateX(0);
        }

        /* drawer user info */
        .user-drawer__user {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 4px 0.5rem 14px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 6px;
        }

        .user-drawer__avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid var(--border);
          flex-shrink: 0;
        }

        .user-drawer__avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .user-drawer__info { overflow: hidden; }

        .user-drawer__name {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-drawer__email {
          font-size: 0.85rem;
          color: var(--muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
        }

        .user-drawer__link {
          font-size: 1rem;
          font-weight: 600;
          color: var(--muted);
          padding: 0.7rem 1rem;
          border-radius: 10px;
          cursor: pointer;
          transition: color 0.15s, background 0.15s;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .user-drawer__link:hover,
        .user-drawer__link.is-active {
          color: var(--blue);
          background: var(--blue-soft);
        }

        .user-drawer__link i {
          font-size: 1rem;
          width: 18px;
          text-align: center;
        }

        .user-drawer__divider {
          height: 1px;
          background: var(--border);
          margin: 0.5rem 0;
        }

        .user-drawer__link.danger { color: #c0392b; }
        .user-drawer__link.danger:hover { background: #fff5f5; }

        /* ═══ RESPONSIVE ═══ */
        @media (max-width: 768px) {
          .user-nav        { display: none; }
          .header-divider  { display: none; }
          #avatar-dropdown-wrap { display: none; }
          .user-hamburger  { display: flex; }
          .user-drawer     { display: block; }
          .notif-btn       { width: 34px; height: 34px; }
        }

        @media (max-width: 320px) {
          .user-brand__name { display: none; }
        }
      `}</style>

      <header className="user-header">
        <div className="user-header__inner">
          {/* Brand */}
          <button
            className="user-brand"
            onClick={() => navigate("/user/class")}
          >
            <div className="user-brand__icon">
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
            <div className="user-brand__name">
              Edu<span>cation</span>
            </div>
          </button>

          {/* Centre nav – desktop */}
          <nav className="user-nav">
            {navLinks.map((link) => (
              <button
                key={link.path}
                className={`user-nav__link${isActive(link.path) ? " is-active" : ""}`}
                onClick={() => navigate(link.path)}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right controls */}
          <div className="user-header__right">
            <button
              className="notif-btn"
              title="Thông báo"
              onClick={() => setHasNotif(false)}
            >
              <i className="bi bi-bell fs-5" />
              {hasNotif && <span className="notif-dot" />}
            </button>

            <div className="header-divider" />

            {/* Avatar dropdown – desktop */}
            <div id="avatar-dropdown-wrap">
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
                    <div className="dropdown-header__info">
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
                      navigate("/user/profile");
                      setShowDropdown(false);
                    }}
                  >
                    <i className="bi bi-person" /> Hồ sơ cá nhân
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/user/change-password");
                      setShowDropdown(false);
                    }}
                  >
                    <i className="bi bi-key" /> Đổi mật khẩu
                  </button>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={logout}>
                    <i className="bi bi-box-arrow-right" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>

            {/* Hamburger – mobile */}
            <button
              className="user-hamburger"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
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
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ═══ MOBILE DRAWER ═══ */}
      <div
        className={`user-drawer${menuOpen ? " is-open" : ""}`}
        onClick={(e) => e.target === e.currentTarget && setMenuOpen(false)}
      >
        <div className="user-drawer__panel">
          {/* User info */}
          <div className="user-drawer__user">
            <div className="user-drawer__avatar">
              <img
                src={user?.avatarUrl || avatarImg}
                alt="avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = avatarImg;
                }}
              />
            </div>
            <div className="user-drawer__info">
              <div className="user-drawer__name">
                {user?.fullName || user?.username || ""}
              </div>
              <div className="user-drawer__email">{user?.email || ""}</div>
            </div>
          </div>

          {/* Nav links */}
          {navLinks.map((link) => (
            <div
              key={link.path}
              className={`user-drawer__link${isActive(link.path) ? " is-active" : ""}`}
              onClick={() => {
                navigate(link.path);
                setMenuOpen(false);
              }}
            >
              <i
                className={`bi ${link.path === "/user/class" ? "bi-mortarboard" : "bi-clock-history"}`}
              />
              {link.label}
            </div>
          ))}

          <div className="user-drawer__divider" />

          {/* Account */}
          <div
            className="user-drawer__link"
            onClick={() => {
              navigate("/user/profile");
              setMenuOpen(false);
            }}
          >
            <i className="bi bi-person" /> Hồ sơ cá nhân
          </div>
          <div
            className="user-drawer__link"
            onClick={() => {
              navigate("/user/change-password");
              setMenuOpen(false);
            }}
          >
            <i className="bi bi-key" /> Đổi mật khẩu
          </div>

          <div className="user-drawer__divider" />

          <div className="user-drawer__link danger" onClick={logout}>
            <i className="bi bi-box-arrow-right" /> Đăng xuất
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
