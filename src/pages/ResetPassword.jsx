import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { resetPassword } from "../service/auth.service";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const otp = location.state?.otp || "";

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({ password: "", confirmPassword: "" });
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setApiError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.password.trim()) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])/.test(formData.password)
    ) {
      newErrors.password =
        "Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt";
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    setSuccessMsg("");
    try {
      await resetPassword({ email, otp, newPassword: formData.password });
      setSuccessMsg("Đổi mật khẩu thành công!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setApiError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .reset-wrapper {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background-color: #f0f4ff;
        }

        .reset-card {
          width: 100%;
          max-width: 440px;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          padding: clamp(24px, 6vw, 48px) clamp(20px, 6vw, 40px);
          border: 1px solid #ddd;
        }

        .reset-title {
          font-size: clamp(1.4rem, 5vw, 1.75rem);
          font-weight: 600;
          color: #0d6efd;
          text-align: center;
          margin-bottom: 0.4rem;
        }

        .reset-subtitle {
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
          font-size: clamp(1rem, 3vw, 1.1rem);
          font-weight: 600;
          color: #333;
          margin-bottom: 0.35rem;
        }

        .required-star { color: #dc3545; }

        /* ── Input ── */
        .form-input {
          width: 100%;
          padding: 0.6rem 0.85rem;
          padding-right: 2.6rem;
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

        /* ── Password wrapper ── */
        .password-wrapper {
          position: relative;
        }

        .eye-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #6c757d;
          font-size: 1rem;
          line-height: 1;
          user-select: none;
          background: none;
          border: none;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .eye-toggle:focus-visible {
          outline: 2px solid #0d6efd;
          border-radius: 4px;
        }

        /* ── Field error ── */
        .field-error {
          font-size: 0.78rem;
          color: #dc3545;
          margin-top: 0.3rem;
          min-height: 1em;
        }

        .field-group { margin-bottom: 0.5rem; }

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
          .reset-card { border-radius: 12px; padding: 20px 14px; }
        }
      `}</style>

      <div className="reset-wrapper">
        <div className="reset-card">
          <h2 className="reset-title">Đặt Lại Mật Khẩu</h2>
          <p className="reset-subtitle">
            Nhập mật khẩu mới cho tài khoản của bạn
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

            {/* ── New password ── */}
            <div className="field-group">
              <label htmlFor="password" className="form-label">
                Mật khẩu mới <span className="required-star">*</span>
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={`form-input${errors.password ? " is-error" : ""}`}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu mới"
                  autoComplete="new-password"
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <i
                    className={showPassword ? "bi bi-eye" : "bi bi-eye-slash"}
                  />
                </button>
              </div>
              {errors.password && (
                <div id="password-error" className="field-error" role="alert">
                  {errors.password}
                </div>
              )}
            </div>

            {/* ── Confirm password ── */}
            <div className="field-group">
              <label htmlFor="confirmPassword" className="form-label">
                Xác nhận mật khẩu <span className="required-star">*</span>
              </label>
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`form-input${errors.confirmPassword ? " is-error" : ""}`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu mới"
                  autoComplete="new-password"
                  aria-describedby={
                    errors.confirmPassword ? "confirm-error" : undefined
                  }
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={
                    showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                  }
                >
                  <i
                    className={
                      showConfirmPassword ? "bi bi-eye" : "bi bi-eye-slash"
                    }
                  />
                </button>
              </div>
              {errors.confirmPassword && (
                <div id="confirm-error" className="field-error" role="alert">
                  {errors.confirmPassword}
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
                "Đặt Lại Mật Khẩu"
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

export default ResetPassword;
