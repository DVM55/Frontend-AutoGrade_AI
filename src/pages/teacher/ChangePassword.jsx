import React, { useState } from "react";
import { changePassword } from "../../service/account.service";

const rules = [
  { label: "Ít nhất 8 ký tự", test: (v) => v.length >= 8 },
  { label: "Có chữ hoa (A-Z)", test: (v) => /[A-Z]/.test(v) },
  { label: "Có chữ thường (a-z)", test: (v) => /[a-z]/.test(v) },
  { label: "Có số (0-9)", test: (v) => /[0-9]/.test(v) },
  { label: "Có ký tự đặc biệt (@#$%^&+=)", test: (v) => /[@#$%^&+=]/.test(v) },
];

const ChangePassword = () => {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCfm, setShowCfm] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setApiError("");
    setSuccessMsg("");
  };

  /* ── Validate ── */
  const validate = () => {
    const e = {};
    if (!form.oldPassword.trim())
      e.oldPassword = "Mật khẩu hiện tại không được để trống";

    if (!form.newPassword.trim()) {
      e.newPassword = "Mật khẩu mới không được để trống";
    } else if (!rules.every((r) => r.test(form.newPassword))) {
      e.newPassword = "Mật khẩu mới chưa đáp ứng đủ yêu cầu bên dưới";
    } else if (form.oldPassword && form.oldPassword === form.newPassword) {
      e.newPassword = "Mật khẩu mới không được trùng mật khẩu hiện tại";
    }

    if (!form.confirmPassword.trim()) {
      e.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (form.newPassword !== form.confirmPassword) {
      e.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    setSuccessMsg("");
    try {
      await changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      setSuccessMsg("Đổi mật khẩu thành công!");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
    } catch (err) {
      setApiError(
        err?.response?.data?.message || err?.message || "Đổi mật khẩu thất bại",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Rule checklist (chỉ hiện khi đang gõ newPassword) ── */
  const newPwdRules = rules.map((r) => ({
    ...r,
    passed: r.test(form.newPassword),
  }));

  return (
    <>
      <style>{`
        .cp-wrapper {
          min-height: calc(100dvh - var(--header-h, 0px));
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          
        }

        .cp-card {
          width: 100%;
          max-width: 440px;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          padding: clamp(24px, 6vw, 48px) clamp(20px, 6vw, 40px);
          border: 1px solid #ddd;
        }

        .cp-title {
          font-size: clamp(1.4rem, 5vw, 1.75rem);
          font-weight: 600;
          color: #0d6efd;
          text-align: center;
          margin-bottom: 0.4rem;
        }

        .cp-subtitle {
          font-size: clamp(1rem, 3vw, 1.1rem);
          text-align: center;
          color: #6c757d;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        /* ── Alert banners ── */
        .cp-alert {
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
        .cp-alert.error   { background: #fff5f5; border: 1px solid #f5c2c7; color: #842029; }
        .cp-alert.success { background: #f0fff4; border: 1px solid #b2dfdb; color: #1a5c3a; }
        .cp-alert-icon    { flex-shrink: 0; }

        /* ── Labels ── */
        .cp-label {
          display: block;
          font-size: clamp(1rem, 3vw, 1.1rem);
          font-weight: 500;
          color: #333;
          margin-bottom: 0.35rem;
        }
        .cp-required { color: #dc3545; }

        /* ── Inputs ── */
        .cp-input {
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
        .cp-input:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 2px rgba(13,110,253,0.15);
        }
        .cp-input.is-error {
          border-color: #dc3545;
          box-shadow: 0 0 0 2px rgba(220,53,69,0.12);
        }

        /* ── Password wrapper ── */
        .cp-pw-wrap { position: relative; }
        .cp-eye {
          position: absolute; right: 0.75rem; top: 50%;
          transform: translateY(-50%);
          cursor: pointer; color: #6c757d; font-size: 1rem;
          line-height: 1; user-select: none;
          background: none; border: none; padding: 0;
          display: flex; align-items: center;
        }
        .cp-eye:focus-visible { outline: 2px solid #0d6efd; border-radius: 4px; }

        /* ── Field error ── */
        .cp-field-error {
          font-size: 0.78rem; color: #dc3545;
          margin-top: 0.3rem; min-height: 1em;
        }

        .cp-field-group { margin-bottom: 0.5rem; }

        /* ── Rule checklist ── */
        .cp-rules {
          margin-bottom: 1rem;
          display: flex; flex-direction: column; gap: 4px;
        }
        .cp-rule {
          display: flex; align-items: center; gap: 6px;
          font-size: clamp(0.75rem, 2.5vw, 0.8rem);
        }

        /* ── Submit ── */
        .cp-btn {
          width: 100%;
          padding: 0.7rem 1rem;
          font-size: clamp(1rem, 3vw, 1.1rem);
          font-weight: 600; border-radius: 10px;
          background-color: #0d6efd; border: none;
          color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: background-color 0.2s, opacity 0.2s;
          margin-top: 0.5rem;
        }
        .cp-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .cp-btn:not(:disabled):hover { background-color: #0b5ed7; }

        /* ── Spinner ── */
        .cp-spinner {
          width: 1rem; height: 1rem;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff; border-radius: 50%;
          animation: cp-spin 0.7s linear infinite; flex-shrink: 0;
        }
        @keyframes cp-spin { to { transform: rotate(360deg); } }

        @media (max-width: 360px) {
          .cp-card { border-radius: 12px; padding: 20px 14px; }
        }
      `}</style>

      <div className="cp-wrapper">
        <div className="cp-card">
          <h2 className="cp-title">Đổi Mật Khẩu</h2>
          <p className="cp-subtitle">Cập nhật mật khẩu tài khoản của bạn</p>

          <form onSubmit={handleSubmit} noValidate>
            {/* ── Success banner ── */}
            {successMsg && (
              <div
                className="cp-alert success"
                role="status"
                aria-live="polite"
              >
                <span className="cp-alert-icon">✓</span>
                <span>{successMsg}</span>
              </div>
            )}

            {/* ── API error banner ── */}
            {apiError && (
              <div
                className="cp-alert error"
                role="alert"
                aria-live="assertive"
              >
                <span className="cp-alert-icon">⚠</span>
                <span>{apiError}</span>
              </div>
            )}

            {/* ── Mật khẩu hiện tại ── */}
            <div className="cp-field-group">
              <label className="cp-label">
                Mật khẩu hiện tại <span className="cp-required">*</span>
              </label>
              <div className="cp-pw-wrap">
                <input
                  type={showOld ? "text" : "password"}
                  name="oldPassword"
                  className={`cp-input${errors.oldPassword ? " is-error" : ""}`}
                  value={form.oldPassword}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu hiện tại"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="cp-eye"
                  onClick={() => setShowOld((v) => !v)}
                  aria-label={showOld ? "Ẩn" : "Hiện"}
                >
                  <i className={`bi ${showOld ? "bi-eye" : "bi-eye-slash"}`} />
                </button>
              </div>
              {errors.oldPassword && (
                <div className="cp-field-error" role="alert">
                  {errors.oldPassword}
                </div>
              )}
            </div>

            {/* ── Mật khẩu mới ── */}
            <div className="cp-field-group">
              <label className="cp-label">
                Mật khẩu mới <span className="cp-required">*</span>
              </label>
              <div className="cp-pw-wrap">
                <input
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  className={`cp-input${errors.newPassword ? " is-error" : ""}`}
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu mới"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="cp-eye"
                  onClick={() => setShowNew((v) => !v)}
                  aria-label={showNew ? "Ẩn" : "Hiện"}
                >
                  <i className={`bi ${showNew ? "bi-eye" : "bi-eye-slash"}`} />
                </button>
              </div>
              {errors.newPassword && (
                <div className="cp-field-error" role="alert">
                  {errors.newPassword}
                </div>
              )}
            </div>

            {/* ── Rule checklist — ẩn khi đã đủ hết yêu cầu ── */}
            {form.newPassword && !newPwdRules.every((r) => r.passed) && (
              <div className="cp-rules">
                {newPwdRules.map((r) => (
                  <div key={r.label} className="cp-rule">
                    <i
                      className={`bi ${r.passed ? "bi-check-circle-fill" : "bi-circle"}`}
                      style={{
                        color: r.passed ? "#0f9d58" : "#bdc1c6",
                        fontSize: 14,
                      }}
                    />
                    <span style={{ color: r.passed ? "#0f9d58" : "#5f6368" }}>
                      {r.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* ── Xác nhận mật khẩu ── */}
            <div className="cp-field-group">
              <label className="cp-label">
                Xác nhận mật khẩu mới <span className="cp-required">*</span>
              </label>
              <div className="cp-pw-wrap">
                <input
                  type={showCfm ? "text" : "password"}
                  name="confirmPassword"
                  className={`cp-input${errors.confirmPassword ? " is-error" : ""}`}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu mới"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="cp-eye"
                  onClick={() => setShowCfm((v) => !v)}
                  aria-label={showCfm ? "Ẩn" : "Hiện"}
                >
                  <i className={`bi ${showCfm ? "bi-eye" : "bi-eye-slash"}`} />
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="cp-field-error" role="alert">
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              className="cp-btn"
              disabled={loading}
              style={{ marginTop: "24px" }}
            >
              {loading ? (
                <>
                  <span className="cp-spinner" aria-hidden="true" />
                  Đang xử lý...
                </>
              ) : (
                "Cập nhật mật khẩu"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;
