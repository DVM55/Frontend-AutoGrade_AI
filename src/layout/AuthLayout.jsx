import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

/* ─────────────────────────────────────────
   AuthLayout – wraps pages that share the
   marketing header (login, register, …)
───────────────────────────────────────── */
const AuthLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Trang chủ", path: "/trang-chu" },
    { label: "Tính năng", path: "/feature" },
    { label: "Tin tức", path: "/new" },
    { label: "Liên hệ", path: "/contact" },
  ];

  // exact match — mỗi link chỉ active đúng route của nó
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`        /* ═══ HEADER ═══ */
        .edu-header {
          position: sticky;
          top: 0;
          z-index: 100;
          height: var(--header-h);
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          box-shadow: 0 2px 12px rgba(13,110,253,0.07);
        }

        .edu-header__inner {
          max-width: 1200px;
          margin: 0 auto;
          height: 100%;
          display: flex;
          align-items: center;
          padding: 0 clamp(16px, 4vw, 32px);
          gap: 1rem;
          line-height: 1;
        }

        /* Brand */
        .edu-brand {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          text-decoration: none;
          flex-shrink: 0;
          cursor: pointer;
        }

        .edu-brand__icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #0d6efd 0%, #6ea8fe 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 8px rgba(13,110,253,0.3);
        }

        .edu-brand__icon svg { width: 20px; height: 20px; }

        .edu-brand__name {
          font-size: 1.2rem;
          font-weight: 800;
          letter-spacing: -0.3px;
          color: var(--blue);
          line-height: 1;
          display: flex;
          align-items: center;
        }

        .edu-brand__name span { color: var(--text); }

        /* Desktop nav (centre) */
        .edu-nav {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .edu-nav li {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          align-items: center;
        }

        .edu-nav__link {
          font-size: 1rem;
          font-weight: 600;
          color: var(--muted);
          padding: 0.45rem 0.9rem;
          border-radius: 8px;
          cursor: pointer;
          transition: color 0.18s, background 0.18s;
          white-space: nowrap;
          position: relative;
          line-height: 1;
          display: inline-flex;
          align-items: center;
        }

        .edu-nav__link::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: calc(100% - 1.8rem);
          height: 2px;
          background: var(--blue);
          border-radius: 2px;
          transition: transform 0.2s;
        }

        .edu-nav__link:hover { color: var(--blue); background: var(--blue-soft); }

        .edu-nav__link.is-active {
          color: var(--blue);
        }

        /* Auth buttons */
        .edu-auth {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: 700;
          padding: 0.45rem 1.1rem;
          border-radius: 9px;
          cursor: pointer;
          border: none;
          transition: all 0.18s;
          white-space: nowrap;
          line-height: 1;
          vertical-align: middle;
        }

        .btn-outline {
          background: transparent;
          border: 1.5px solid var(--blue);
          color: var(--blue);
        }

        .btn-outline:hover { background: var(--blue-soft); }

        .btn-primary {
          background: var(--blue);
          color: #fff;
          box-shadow: 0 2px 8px rgba(13,110,253,0.28);
        }

        .btn-primary:hover {
          background: var(--blue-dark);
          box-shadow: 0 4px 14px rgba(13,110,253,0.38);
          transform: translateY(-1px);
        }

        /* Hamburger */
        .edu-hamburger {
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

        .edu-hamburger:hover { background: var(--blue-soft); }

        /* ═══ MOBILE DRAWER ═══ */
        .edu-drawer {
          display: none;
          position: fixed;
          inset: var(--header-h) 0 0 0;
          z-index: 99;
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(2px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s;
        }

        .edu-drawer.is-open {
          opacity: 1;
          pointer-events: all;
        }

        .edu-drawer__panel {
          background: var(--surface);
          width: min(320px, 85vw);
          height: 100%;
          padding: 1.5rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(.4,0,.2,1);
          box-shadow: 4px 0 24px rgba(0,0,0,0.1);
        }

        .edu-drawer.is-open .edu-drawer__panel {
          transform: translateX(0);
        }

        .edu-drawer__link {
          font-size: 1rem;
          font-weight: 600;
          color: var(--muted);
          padding: 0.75rem 1rem;
          border-radius: 10px;
          cursor: pointer;
          transition: color 0.15s, background 0.15s;
        }

        .edu-drawer__link:hover,
        .edu-drawer__link.is-active {
          color: var(--blue);
          background: var(--blue-soft);
        }

        .edu-drawer__divider {
          height: 1px;
          background: var(--border);
          margin: 0.75rem 0;
        }

        .edu-drawer__auth {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .edu-drawer__auth .btn {
          width: 100%;
          padding: 0.65rem 1rem;
          font-size: 1rem;
        }

        /* ═══ RESPONSIVE ═══ */
        @media (max-width: 768px) {
          .edu-nav       { display: none; }
          .edu-auth      { display: none; }
          .edu-hamburger { display: flex; }
          .edu-drawer    { display: block; }
        }

        /* ═══ PAGE WRAPPER ═══ */
        .edu-page {
          min-height: calc(100dvh - var(--header-h));
        }
      `}</style>

      {/* ═══════ HEADER ═══════ */}
      <header className="edu-header">
        <div className="edu-header__inner">
          {/* Brand – left */}
          <div className="edu-brand" onClick={() => navigate("/")}>
            <div className="edu-brand__icon">
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
            <div className="edu-brand__name">
              Edu<span>cation</span>
            </div>
          </div>

          {/* Nav – centre */}
          <nav className="edu-nav">
            {navLinks.map((link) => (
              <div
                key={link.path}
                className={`edu-nav__link${isActive(link.path) ? " is-active" : ""}`}
                onClick={() => navigate(link.path)}
              >
                {link.label}
              </div>
            ))}
          </nav>

          {/* Auth – right */}
          <div className="edu-auth">
            <button
              className="btn btn-outline"
              onClick={() => navigate("/login")}
            >
              Đăng nhập
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/register")}
            >
              Đăng ký
            </button>
          </div>

          {/* Hamburger (mobile only) */}
          <button
            className="edu-hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
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
      </header>

      {/* ═══════ MOBILE DRAWER ═══════ */}
      <div
        className={`edu-drawer${menuOpen ? " is-open" : ""}`}
        onClick={(e) => e.target === e.currentTarget && setMenuOpen(false)}
      >
        <div className="edu-drawer__panel">
          {navLinks.map((link) => (
            <div
              key={link.path}
              className={`edu-drawer__link${isActive(link.path) ? " is-active" : ""}`}
              onClick={() => {
                navigate(link.path);
                setMenuOpen(false);
              }}
            >
              {link.label}
            </div>
          ))}
          <div className="edu-drawer__divider" />
          <div className="edu-drawer__auth">
            <button
              className="btn btn-outline"
              onClick={() => {
                navigate("/login");
                setMenuOpen(false);
              }}
            >
              Đăng nhập
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                navigate("/register");
                setMenuOpen(false);
              }}
            >
              Đăng ký
            </button>
          </div>
        </div>
      </div>

      {/* ═══════ PAGE CONTENT (Login, Register, …) ═══════ */}
      <main className="edu-page">
        <Outlet />
      </main>
    </>
  );
};

export default AuthLayout;
