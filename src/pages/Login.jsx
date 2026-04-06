import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login as loginService } from "../service/auth.service";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setApiError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Mật khẩu không được để trống";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      await loginService(formData);
      navigate("/verify-account", {
        state: {
          ...location.state,
          email: formData.email,
        },
      });
    } catch (error) {
      setApiError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .login-wrapper {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background-color: #f0f4ff;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          padding: clamp(24px, 6vw, 48px) clamp(20px, 6vw, 40px);
          border: 1px solid #ddd;
        }

        .login-title {
          font-size: clamp(1.4rem, 5vw, 1.75rem);
          font-weight: 600;
          color: #0d6efd;
          text-align: center;
          margin-bottom: 0.6rem;
        }

        .login-subtitle {
          font-size: clamp(1rem, 3vw, 1.1rem);
          text-align: center;
          color: #6c757d;
          margin-bottom: 1rem;
        }

        /* ── Alert banner ── */
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

        .alert-icon { flex-shrink: 0; }

        /* ── Form labels ── */
        .form-label {
          display: block;
          font-size: clamp(1rem, 2.8vw, 1.1rem);
          font-weight: 600;
          color: #333;
          margin-bottom: 0.35rem;
        }

        .required-star { color: #dc3545; }

        /* ── Inputs ── */
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

        /* password wrapper */
        .password-wrapper {
          position: relative;
        }

        .password-wrapper .form-input {
          padding-right: 2.6rem;
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

        /* ── Field-level error ── */
        .field-error {
          font-size: 0.78rem;
          color: #dc3545;
          margin-top: 0.3rem;
          min-height: 1em;
        }

        .field-group { margin-bottom: 0.4rem; }

        /* ── Forgot password ── */
        .forgot-link {
          display: block;
          text-align: right;
          font-size: clamp(1rem, 2.8vw, 1.1rem);
          color: #0d6efd;
          cursor: pointer;
          margin-bottom: 0.8rem;
          transition: opacity 0.2s;
        }

        .forgot-link:hover { opacity: 0.75; }

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

        /* ── Register row ── */
        .register-row {
          text-align: center;
          font-size: clamp(1rem, 3vw, 1.1rem);
          color: #6c757d;
        }

        .register-link {
          color: #0d6efd;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .register-link:hover { opacity: 0.75; }

        @media (max-width: 360px) {
          .login-card { border-radius: 12px; padding: 20px 14px; }
        }
      `}</style>

      <div className="login-wrapper">
        <div className="login-card">
          <h2 className="login-title">Đăng Nhập</h2>
          <p className="login-subtitle">Chào mừng bạn trở lại!</p>

          <form onSubmit={handleSubmit} noValidate>
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

            {/* ── Email ── */}
            <div className="field-group">
              <label htmlFor="email" className="form-label">
                Email <span className="required-star">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input${errors.email ? " is-error" : ""}`}
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="example@email.com"
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <div id="email-error" className="field-error" role="alert">
                  {errors.email}
                </div>
              )}
            </div>

            {/* ── Password ── */}
            <div className="field-group">
              <label htmlFor="password" className="form-label">
                Mật khẩu <span className="required-star">*</span>
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={`form-input${errors.password ? " is-error" : ""}`}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  tabIndex={0}
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

            {/* ── Forgot password ── */}
            <span
              className="forgot-link"
              onClick={() => navigate("/forgot-password")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" && navigate("/forgot-password")
              }
            >
              Quên mật khẩu?
            </span>

            {/* ── Submit ── */}
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Đang xử lý...
                </>
              ) : (
                "Đăng Nhập"
              )}
            </button>

            {/* ── Register ── */}
            <div className="register-row">
              <span>Chưa có tài khoản? </span>
              <span
                className="register-link"
                onClick={() => navigate("/register")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate("/register")}
              >
                Đăng ký ngay
              </span>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
