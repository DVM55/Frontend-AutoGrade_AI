import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .footer {
          background: #2d2d2d;
          padding: 48px clamp(16px, 4vw, 48px) 28px;
          color: #ccc;
          
        }

        .footer__inner {
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer__top {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr;
          gap: 24px;
          padding-bottom: 32px;
          border-bottom: 1px solid #444;
          margin-bottom: 24px;
        }

        /* ── Col 1: Brand ── */
        .footer__brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          margin-bottom: 8px;
        }

        .footer__brand-icon {
          width: 36px;
          height: 36px;
          background: #444;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .footer__brand-icon svg { width: 20px; height: 20px; }

        .footer__brand-name {
          font-family: Georgia, serif;
          font-style: italic;
          font-size: 1.2rem;
          color: #fff;
          font-weight: 400;
          letter-spacing: 0.5px;
        }

        .footer__desc {
          font-size: 1rem;
          line-height: 1.7;
          color: #aaa;
         
        }

        .footer__team-link {
          font-size: 1rem;
          color: #aaa;
          text-decoration: underline;
          cursor: pointer;
          transition: color 0.15s;
        }

        .footer__team-link:hover { color: #fff; }

        /* ── Col headers ── */
        .footer__col-title {
          font-style: italic;
          font-size: 1.2rem;
          font-weight: 400;
          color: #fff;
          margin-bottom: 20px;
          font-family: Georgia, serif;
        }

        /* ── Col 2: Contact ── */
        .footer__contact-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 0px 5px;
          margin: 0;
        }

        .footer__contact-list li {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 1rem;
          color: #aaa;
          line-height: 1.5;
          word-break: break-word;
          overflow-wrap: anywhere;
          min-width: 0;
        }

        .footer__contact-list li svg {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          color: #888;
          margin-top: 4px;
        }

        /* ── Col 3: Social ── */
        .footer__socials {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .footer__social {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #aaa;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 0.15s;
          padding: 0;
        }

        .footer__social:hover { color: #fff; }
        .footer__social svg { width: 18px; height: 18px; }

        /* ── Bottom ── */
        .footer__bottom {
          font-size: 1rem;
          color: #777;
          text-align: center;
        }

        @media (max-width: 768px) {
          .footer__top { grid-template-columns: 1fr 1fr; }
          .footer__brand-col { grid-column: 1 / -1; }
        }

        @media (max-width: 480px) {
          .footer__top { grid-template-columns: 1fr; }
        }
      `}</style>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__top">
            {/* Col 1 */}
            <div className="footer__brand-col">
              <div className="footer__brand" onClick={() => navigate("/")}>
                <div className="footer__brand-icon">
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
                <div className="footer__brand-name">Education</div>
              </div>
              <p className="footer__desc">
                Nền tảng tạo bài kiểm tra trực tuyến thông minh, giúp giáo viên
                và học sinh kết nối hiệu quả hơn mỗi ngày.
              </p>
            </div>

            {/* Col 2 */}
            <div>
              <div className="footer__col-title">Liên hệ</div>
              <ul className="footer__contact-list">
                <li>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  150 Triều Khúc, Thanh Xuân, Hà Nội
                </li>
                <li>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" />
                  </svg>
                  0869426394
                </li>
                <li>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  duongvanmanh11052003@gmail.com
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <div className="footer__col-title">Theo dõi</div>
              <div className="footer__socials">
                {[
                  {
                    title: "Facebook",
                    d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
                  },
                  {
                    title: "Twitter",
                    d: "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z",
                  },
                  {
                    title: "YouTube",
                    d: "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8z M9.8 15.5V8.5l6.3 3.5z",
                  },
                  {
                    title: "Instagram",
                    d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z",
                  },
                  { title: "TikTok", d: "M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" },
                ].map((s) => (
                  <button
                    key={s.title}
                    className="footer__social"
                    title={s.title}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={s.d} />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="footer__bottom">
            © {new Date().getFullYear()} Education. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
