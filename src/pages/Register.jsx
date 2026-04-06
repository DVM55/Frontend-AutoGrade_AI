import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../service/auth.service";

const ROLES = [
  {
    value: "USER",
    label: "Học Sinh",
    icon: "bi bi-person-fill",
    desc: "Học viên tham gia làm bài thi trắc nghiệm.",
  },
  {
    value: "TEACHER",
    label: "Giáo Viên",
    icon: "bi bi-person-workspace",
    desc: "Tạo và quản lý Exam online. Xây dựng ngân hàng câu hỏi.",
  },
];

const Register = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState("select-role"); // "select-role" | "form"
  const [selectedRole, setSelectedRole] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
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
    if (!formData.username.trim()) {
      newErrors.username = "Họ và tên không được để trống";
    } else if (formData.username.length < 3) {
      newErrors.username = "Họ và tên phải có ít nhất 3 ký tự";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
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
      await register({ ...formData, role: selectedRole.value });
      setSuccessMsg("Đăng ký thành công!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setApiError(
        "Đăng ký thất bại: " + (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const roleInfo = ROLES.find((r) => r.value === selectedRole?.value);

  /* ── UI ── */
  return (
    <>
      <style>{`
        .register-wrapper {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background-color: #f0f4ff;
        }

        .register-card {
          width: 100%;
          max-width: 440px;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          padding: clamp(24px, 6vw, 48px) clamp(20px, 6vw, 40px);
          border: 1px solid #ddd;
        }

        .register-title {
          font-size: clamp(1.4rem, 5vw, 1.75rem);
          font-weight: 600;
          color: #0d6efd;
          text-align: center;
          margin-bottom: 0.4rem;
        }

        .register-subtitle {
          font-size: clamp(1rem, 3vw, 1.1rem);
          text-align: center;
          color: #6c757d;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        /* ── Role selection ── */
        .role-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .role-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1.25rem 0.75rem;
          border: 1.5px solid #dee2e6;
          border-radius: 12px;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          text-align: center;
          background: #fff;
          user-select: none;
        }

        .role-card:hover {
          border-color: #0d6efd;
          box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.12);
        }

        .role-card.selected {
          border-color: #0d6efd;
          background: #f0f4ff;
          box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.15);
        }

        .role-icon {
          font-size: 2rem;
          color: #0d6efd;
          line-height: 1;
        }

        .role-label {
          font-size: clamp(1rem, 3vw, 1.1rem);
          font-weight: 600;
          color: #212529;
        }

        .role-desc {
          font-size: clamp(0.9rem, 2.5vw, 1rem);
          color: #6c757d;
          line-height: 1.4;
        }

        .btn-continue {
          width: 100%;
          padding: 0.7rem 1rem;
          font-size: clamp(1rem, 3vw, 1.1rem);
          font-weight: 600;
          border-radius: 10px;
          background-color: #0d6efd;
          border: none;
          color: #fff;
          cursor: pointer;
          transition: background-color 0.2s, opacity 0.2s;
          margin-bottom: 1rem;
        }

        .btn-continue:disabled { opacity: 0.45; cursor: not-allowed; }
        .btn-continue:not(:disabled):hover { background-color: #0b5ed7; }

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

        .password-wrapper { position: relative; }
        .password-wrapper .form-input { padding-right: 2.6rem; }

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

        .login-row {
          text-align: center;
          font-size: clamp(1rem, 3vw, 1.1rem);
          color: #6c757d;
        }

        .login-link {
          color: #0d6efd;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .login-link:hover { opacity: 0.75; }

        @media (max-width: 360px) {
          .register-card { border-radius: 12px; padding: 20px 14px; }
          .role-grid { gap: 0.6rem; }
          .role-card { padding: 1rem 0.5rem; }
        }
      `}</style>

      <div className="register-wrapper">
        <div className="register-card">
          {/* ══════════ STEP 1: ROLE SELECTION ══════════ */}
          {step === "select-role" && (
            <>
              <h2 className="register-title">Đăng Ký Tài Khoản</h2>
              <p className="register-subtitle">
                Bạn muốn đăng ký với tư cách nào?
              </p>

              <div className="role-grid">
                {ROLES.map((role) => (
                  <div
                    key={role.value}
                    className={`role-card${selectedRole?.value === role.value ? " selected" : ""}`}
                    onClick={() => setSelectedRole(role)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedRole?.value === role.value}
                    onKeyDown={(e) =>
                      e.key === "Enter" && setSelectedRole(role)
                    }
                  >
                    <i className={`${role.icon} role-icon`} />
                    <span className="role-label">{role.label}</span>
                    <span className="role-desc">{role.desc}</span>
                  </div>
                ))}
              </div>

              <button
                className="btn-continue"
                disabled={!selectedRole}
                onClick={() => selectedRole && setStep("form")}
              >
                Tiếp Tục
              </button>

              <div className="login-row">
                <span>Đã có tài khoản? </span>
                <span
                  className="login-link"
                  onClick={() => navigate("/login")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate("/login")}
                >
                  Đăng nhập ngay
                </span>
              </div>
            </>
          )}

          {/* ══════════ STEP 2: FORM ══════════ */}
          {step === "form" && (
            <>
              <h2 className="register-title">Đăng Ký Tài Khoản</h2>

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

                {/* ── Họ và tên ── */}
                <div className="field-group">
                  <label htmlFor="username" className="form-label">
                    Họ và tên <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className={`form-input${errors.username ? " is-error" : ""}`}
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên"
                    autoComplete="name"
                  />
                  {errors.username && (
                    <div className="field-error" role="alert">
                      {errors.username}
                    </div>
                  )}
                </div>

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
                    placeholder="example@email.com"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <div className="field-error" role="alert">
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* ── Mật khẩu ── */}
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
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="eye-toggle"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                    >
                      <i
                        className={
                          showPassword ? "bi bi-eye" : "bi bi-eye-slash"
                        }
                      />
                    </button>
                  </div>
                  {errors.password && (
                    <div className="field-error" role="alert">
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* ── Xác nhận mật khẩu ── */}
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
                      placeholder="Nhập lại mật khẩu"
                      autoComplete="new-password"
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
                    <div className="field-error" role="alert">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                {/* ── Submit ── */}
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                  style={{ marginTop: "18px" }}
                >
                  {loading ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đăng Ký"
                  )}
                </button>

                <div className="login-row">
                  <span>Đã có tài khoản? </span>
                  <span
                    className="login-link"
                    onClick={() => navigate("/login")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && navigate("/login")}
                  >
                    Đăng nhập ngay
                  </span>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Register;
