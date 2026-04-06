import { useState } from "react";
import Footer from "../layout/Footer";
import zaloQR from "../assets/maQR.jpg";

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e = {};
    if (!formData.fullName.trim()) e.fullName = "Vui lòng nhập họ tên";
    if (!formData.email.trim()) e.email = "Vui lòng nhập email";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      e.email = "Email không hợp lệ";
    if (!formData.message.trim()) e.message = "Vui lòng nhập nội dung";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({ fullName: "", email: "", message: "" });
    setErrors({});
  };

  return (
    <>
      <style>{`
        .cp {
          background: #f8faff;
          min-height: calc(100dvh - var(--header-h));
        }

        .cp-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px clamp(16px, 4vw, 40px);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
        }

        @media (max-width: 768px) {
          .cp-inner { grid-template-columns: 1fr; gap: 32px; }
        }

        /* ── Trái: Form ── */
        .cp-form-card {
          background: #fff;
          border-radius: 20px;
          padding: 40px 36px;
          border: 1px solid var(--border);
          box-shadow: 0 4px 24px rgba(13,110,253,0.06);
        }

        .cp-form-card h2 {
          font-size: 1.7rem;
          font-weight: 800;
          color: #1a1d23;
          margin-bottom: 4px;
          display: inline-block;
          position: relative;
        }

        .cp-form-card h2::after {
          content: '';
          display: block;
          width: 36px;
          height: 3px;
          background: var(--blue);
          border-radius: 2px;
          margin-top: 8px;
        }

        .cp-form-card > p {
          font-size: 1rem;
          color: #6c757d;
          margin: 14px 0 28px;
        }

        .cp-field { margin-bottom: 14px; }

        .cp-input {
          width: 100%;
          padding: 11px 14px;
          font-size: 1rem;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          outline: none;
          color: #1a1d23;
          background: #fff;
          font-family: inherit;
          transition: border-color 0.18s, box-shadow 0.18s;
          box-sizing: border-box;
        }

        .cp-input::placeholder { color: #b0b7c3; }
        .cp-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(13,110,253,0.1); }
        .cp-input.err { border-color: #dc3545; }

        textarea.cp-input { resize: vertical; min-height: 130px; line-height: 1.6; }

        .cp-error { font-size: 0.75rem; color: #dc3545; margin-top: 4px; }

        .cp-btn {
          width: 100%;
          padding: 13px;
          background: var(--blue);
          color: #fff;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: inherit;
          transition: background 0.18s, transform 0.18s, box-shadow 0.18s;
          margin-top: 8px;
          box-shadow: 0 4px 14px rgba(13,110,253,0.28);
          box-sizing: border-box;
        }

        .cp-btn:hover:not(:disabled) {
          background: var(--blue-dark);
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(13,110,253,0.36);
        }
        .cp-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Thành công */
        .cp-success {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; padding: 40px 0; gap: 14px;
          animation: fadeUp 0.4s ease;
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .cp-success-icon {
          width: 64px; height: 64px; background: #10b981; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 20px rgba(16,185,129,0.3);
        }
        .cp-success-icon svg { width: 32px; height: 32px; stroke: #fff; stroke-width: 2.5; }
        .cp-success h3 { font-size: 1.2rem; font-weight: 700; color: #1a1d23; }
        .cp-success p  { font-size: 1rem; color: #6c757d; max-width: 280px; line-height: 1.6; }
        .cp-back {
          padding: 8px 24px; border-radius: 8px;
          border: 1.5px solid var(--blue); color: var(--blue);
          background: transparent; cursor: pointer;
          font-size: 1rem; font-weight: 700; font-family: inherit;
          transition: background 0.15s;
        }
        .cp-back:hover { background: var(--blue-soft); }

        /* ── Phải: Thông tin ── */
        .cp-info-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cp-contact-list {
          background: #fff;
          border-radius: 20px;
          border: 1px solid var(--border);
          padding: 8px 0;
          box-shadow: 0 4px 24px rgba(13,110,253,0.06);
        }

        .cp-contact-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 24px;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.15s;
        }

        .cp-contact-row:last-child { border-bottom: none; }
        .cp-contact-row:hover { background: #f8faff; }

        .cp-contact-ico {
          width: 44px; height: 44px;
          background: var(--blue-soft);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          color: var(--blue);
        }

        .cp-contact-ico svg { width: 20px; height: 20px; }

        .cp-contact-label {
          font-size: 1rem;
          font-weight: 600;
          color: #6c757d;
          
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }

        .cp-contact-val {
          font-size: 1rem;
          color: #383a3b;
          word-break: break-word;
        }

        /* ── Responsive 480px ── */
        @media (max-width: 480px) {
          .cp-form-card {
            padding: 28px 20px;
            border-radius: 16px;
          }

          .cp-form-card h2 { font-size: 1.35rem; }

          .cp-contact-row {
            padding: 14px 16px;
            gap: 12px;
          }

          .cp-contact-ico {
            width: 38px; height: 38px;
            border-radius: 10px;
          }

          .cp-contact-ico svg { width: 18px; height: 18px; }

          .cp-contact-val { font-size: 1rem; }
          .cp-contact-label { font-size: 1rem; }
        }
      `}</style>

      <div className="cp">
        <div className="cp-inner">
          {/* ── Trái: Form ── */}
          <div className="cp-form-card">
            <h2>Liên hệ</h2>
            <p>Hãy liên hệ nếu bạn có bất kỳ thắc mắc nào</p>

            {submitted ? (
              <div className="cp-success">
                <div className="cp-success-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3>Gửi thành công!</h3>
                <p>
                  Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng{" "}
                  <strong>24 giờ</strong>.
                </p>
                <button className="cp-back" onClick={handleReset}>
                  Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="cp-field">
                  <input
                    className={`cp-input${errors.fullName ? " err" : ""}`}
                    name="fullName"
                    placeholder="Họ và tên"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                  {errors.fullName && (
                    <div className="cp-error">{errors.fullName}</div>
                  )}
                </div>
                <div className="cp-field">
                  <input
                    type="email"
                    className={`cp-input${errors.email ? " err" : ""}`}
                    name="email"
                    placeholder="Email của bạn"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <div className="cp-error">{errors.email}</div>
                  )}
                </div>
                <div className="cp-field">
                  <textarea
                    className={`cp-input${errors.message ? " err" : ""}`}
                    name="message"
                    placeholder="Nội dung tin nhắn"
                    value={formData.message}
                    onChange={handleChange}
                  />
                  {errors.message && (
                    <div className="cp-error">{errors.message}</div>
                  )}
                </div>
                <button type="submit" className="cp-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner" /> Đang gửi...
                    </>
                  ) : (
                    "GỬI TIN NHẮN"
                  )}
                </button>
              </form>
            )}
          </div>

          {/* ── Phải: Thông tin ── */}
          <div className="cp-info-panel">
            <div className="cp-contact-list">
              {/* Địa chỉ */}
              <div className="cp-contact-row">
                <div className="cp-contact-ico">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <div className="cp-contact-label">Địa chỉ</div>
                  <div className="cp-contact-val">
                    150 Triều Khúc, Thanh Xuân, Hà Nội
                  </div>
                </div>
              </div>

              {/* Hotline */}
              <div className="cp-contact-row">
                <div className="cp-contact-ico">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.12 1.2 2 2 0 012.11 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z" />
                  </svg>
                </div>
                <div>
                  <div className="cp-contact-label">Hotline</div>
                  <div className="cp-contact-val">0869426394</div>
                </div>
              </div>

              {/* Email */}
              <div className="cp-contact-row">
                <div className="cp-contact-ico">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <div className="cp-contact-label">Email</div>
                  <div className="cp-contact-val">
                    duongvanmanh11052003@gmail.com
                  </div>
                </div>
              </div>

              {/* Zalo QR */}
              <div
                style={{ padding: "20px 24px", borderTop: "1px solid #f1f5f9" }}
              >
                <div className="cp-contact-label" style={{ marginBottom: 12 }}>
                  Zalo
                </div>
                <img
                  src={zaloQR}
                  alt="Mã QR Zalo"
                  style={{
                    width: 180,
                    height: 180,
                    borderRadius: 12,
                    display: "block",
                    border: "1px solid #e9ecef",
                    maxWidth: "100%",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Contact;
