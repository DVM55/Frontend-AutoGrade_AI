import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../service/auth.service";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setFieldError("");
    setApiError("");
  };

  const validate = () => {
    if (!email.trim()) {
      setFieldError("Email không được để trống");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setFieldError("Email không hợp lệ");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    setSuccessMsg("");
    try {
      await forgotPassword({ email });
      setSuccessMsg("Đã gửi mã OTP đến email của bạn!");
      setTimeout(() => {
        navigate("/verify-otp", { state: { email } });
      }, 1500);
    } catch (error) {
      setApiError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .forgot-wrapper {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background-color: #f0f4ff;
        }

        .forgot-card {
          width: 100%;
          max-width: 440px;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          padding: clamp(24px, 6vw, 48px) clamp(20px, 6vw, 40px);
          border: 1px solid #ddd;
        }

        .forgot-title {
          font-size: clamp(1.4rem, 5vw, 1.75rem);
          font-weight: 600;
          color: #0d6efd;
          text-align: center;
          margin-bottom: 0.4rem;
        }

        .forgot-subtitle {
          font-size: clamp(1rem, 3vw, 1.1rem);
          text-align: center;
          color: #6c757d;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        /* ── Alert banners ── */
        .alert-banner {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.65rem 0.85rem;
          border-radius: 8px;
          font-size: clamp(0.78rem, 2.8vw, 0.85rem);
          line-height: 1.5;
          margin-bottom: 1rem;
          word-break: break-word;
        }

        .alert-banner.alert-error {
          background-color: #fff5f5;
          border: 1px solid #f5c2c7;
          color: #842029;
        }

        .alert-banner.alert-success {
          background-color: #f0fff4;
          border: 1px solid #b2dfdb;
          color: #1a5c3a;
        }

        .alert-icon { flex-shrink: 0; }

        /* ── Form label ── */
        .form-label {
          display: block;
          font-size: clamp(1rem, 2.8vw, 1.1rem);
          font-weight: 600;
          color: #333;
          margin-bottom: 0.35rem;
        }

        .required-star { color: #dc3545; }

        /* ── Input ── */
        .form-input {
          width: 100%;
          padding: 0.6rem 0.85rem;
          font-size: clamp(1rem, 3vw, 1.1rem);
          border: 1px solid #dee2e6;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          color: #212529;
          background: #fff;
          box-sizing: border-box;
          -webkit-appearance: none;
          appearance: none;
        }

        .form-input:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.15);
        }

        .form-input.is-error {
          border-color: #dc3545;
          box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.12);
        }

        /* ── Field-level error ── */
        .field-error {
          font-size: 0.78rem;
          color: #dc3545;
          margin-top: 0.3rem;
          min-height: 1em;
        }

        .field-group { margin-bottom: 1.25rem; }

        /* ── Submit button ── */
        .btn-submit {
          width: 100%;
          padding: 0.7rem 1rem;
          font-size: clamp(1rem, 3vw, 1.1rem);
          font-weight: 600;
          border-radius: 10px;
          background-color: #0d6efd;
          border: none;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: background-color 0.2s, opacity 0.2s;
          margin-bottom: 1rem;
        }

        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .btn-submit:not(:disabled):hover { background-color: #0b5ed7; }

        /* ── Spinner ── */
        .spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Back link ── */
        .back-link {
          display: block;
          text-align: center;
          font-size: clamp(1rem, 3vw, 1.1rem);
          color: #0d6efd;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .back-link:hover { opacity: 0.75; }

        @media (max-width: 360px) {
          .forgot-card { border-radius: 12px; padding: 20px 14px; }
        }
      `}</style>

      <div className="forgot-wrapper">
        <div className="forgot-card">
          <h2 className="forgot-title">Quên Mật Khẩu</h2>
          <p className="forgot-subtitle">
            Nhập email của bạn để tiến hành đặt lại mật khẩu
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* ── Success banner ── */}
            {successMsg && (
              <div
                className="alert-banner alert-success"
                role="status"
                aria-live="polite"
              >
                <span className="alert-icon">✓</span>
                <span>{successMsg}</span>
              </div>
            )}

            {/* ── API error banner ── */}
            {apiError && (
              <div
                className="alert-banner alert-error"
                role="alert"
                aria-live="assertive"
              >
                <span className="alert-icon">⚠</span>
                <span>{apiError}</span>
              </div>
            )}

            {/* ── Email field ── */}
            <div className="field-group">
              <label htmlFor="email" className="form-label">
                Email <span className="required-star">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input${fieldError ? " is-error" : ""}`}
                value={email}
                onChange={handleChange}
                placeholder="example@email.com"
                autoComplete="email"
                aria-describedby={fieldError ? "email-error" : undefined}
              />
              {fieldError && (
                <div id="email-error" className="field-error" role="alert">
                  {fieldError}
                </div>
              )}
            </div>

            {/* ── Submit ── */}
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Đang xử lý...
                </>
              ) : (
                "Gửi Email"
              )}
            </button>

            {/* ── Back ── */}
            <span
              className="back-link"
              onClick={() => navigate("/login")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate("/login")}
            >
              ← Quay lại đăng nhập
            </span>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
