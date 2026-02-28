import React, { useState } from "react";
import { toast } from "react-toastify";
import { changePassword } from "../../service/account.service";

const rules = [
  { label: "Ít nhất 8 ký tự", test: (v) => v.length >= 8 },
  { label: "Có chữ hoa (A-Z)", test: (v) => /[A-Z]/.test(v) },
  { label: "Có chữ thường (a-z)", test: (v) => /[a-z]/.test(v) },
  { label: "Có số (0-9)", test: (v) => /[0-9]/.test(v) },
  { label: "Có ký tự đặc biệt (@#$%^&+=)", test: (v) => /[@#$%^&+=]/.test(v) },
];

const PasswordInput = ({ label, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold" style={{ fontSize: 14 }}>
        {label}
      </label>

      <div className="input-group">
        <input
          type={show ? "password" : "text"}
          className="form-control"
          style={{
            borderRadius: "8px 0 0 8px",
            fontSize: 14,
            borderRight: "none",
          }}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />

        <button
          type="button"
          className="btn"
          style={{
            borderRadius: "0 8px 8px 0",
            border: "1px solid #dee2e6",
            borderLeft: "none",
            background: "#fff",
          }}
          onClick={() => setShow((s) => !s)}
          tabIndex={-1}
        >
          <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"}`} />
        </button>
      </div>
    </div>
  );
};

const Password = () => {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  /* ===== PASSWORD RULE CHECK ===== */
  const newPwdRules = rules.map((r) => ({
    ...r,
    passed: r.test(form.newPassword),
  }));

  const allRulesPassed = newPwdRules.every((r) => r.passed);

  /* ===== CONFIRM CHECK ===== */
  const confirmMatch =
    form.confirmPassword && form.newPassword === form.confirmPassword;

  const confirmError =
    form.confirmPassword && form.newPassword !== form.confirmPassword;

  /* ===== NEW != OLD CHECK ===== */
  const sameAsOld =
    form.oldPassword &&
    form.newPassword &&
    form.oldPassword === form.newPassword;

  /* ===== FORM VALID ===== */
  const isValid =
    form.oldPassword.trim() && allRulesPassed && confirmMatch && !sameAsOld;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (sameAsOld) {
      toast.error("Mật khẩu mới không được trùng mật khẩu hiện tại");
      return;
    }

    if (!isValid) return;

    try {
      setLoading(true);

      await changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });

      toast.success("Đổi mật khẩu thành công");

      setForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      const msg = err?.response?.data?.message || "Đổi mật khẩu thất bại";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-start py-5 px-3">
      <div className="card border-2 shadow w-100" style={{ maxWidth: 480 }}>
        {/* HEADER */}
        <div
          className="card-header border-0 px-4 pt-4 pb-3"
          style={{ background: "transparent" }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: 44, height: 44, background: "#e8f0fe" }}
            >
              <i
                className="bi bi-shield-lock-fill"
                style={{ fontSize: 20, color: "#1a73e8" }}
              />
            </div>
            <div>
              <h5 className="fw-bold mb-0" style={{ fontSize: 17 }}>
                Đổi mật khẩu
              </h5>
              <span className="text-muted" style={{ fontSize: 13 }}>
                Cập nhật mật khẩu tài khoản của bạn
              </span>
            </div>
          </div>
        </div>

        <div className="card-body px-4 pb-4">
          <form onSubmit={handleSubmit} noValidate>
            {/* OLD PASSWORD */}
            <PasswordInput
              label="Mật khẩu hiện tại"
              value={form.oldPassword}
              onChange={set("oldPassword")}
              placeholder="Nhập mật khẩu hiện tại"
            />

            {/* NEW PASSWORD */}
            <PasswordInput
              label="Mật khẩu mới"
              value={form.newPassword}
              onChange={set("newPassword")}
              placeholder="Nhập mật khẩu mới"
            />

            {sameAsOld && (
              <div className="text-danger mb-3" style={{ fontSize: 12 }}>
                Mật khẩu mới không được trùng với mật khẩu hiện tại
              </div>
            )}

            {/* RULE CHECK */}
            {form.newPassword && (
              <div className="mb-3 rounded-3" style={{ background: "#f8f9fa" }}>
                <div className="d-flex flex-column gap-1">
                  {newPwdRules.map((r) => (
                    <div
                      key={r.label}
                      className="d-flex align-items-center gap-2"
                      style={{ fontSize: 13 }}
                    >
                      <i
                        className={`bi ${
                          r.passed ? "bi-check-circle-fill" : "bi-circle"
                        }`}
                        style={{
                          color: r.passed ? "#0f9d58" : "#bdc1c6",
                          fontSize: 14,
                        }}
                      />
                      <span
                        style={{
                          color: r.passed ? "#0f9d58" : "#5f6368",
                        }}
                      >
                        {r.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONFIRM PASSWORD */}
            <div className="mb-3">
              <label
                className="form-label fw-semibold"
                style={{ fontSize: 14 }}
              >
                Xác nhận mật khẩu mới
              </label>

              <div className="input-group">
                <input
                  type="password"
                  className={`form-control border-end-0 ${
                    confirmError ? "is-invalid" : confirmMatch ? "is-valid" : ""
                  }`}
                  style={{ borderRadius: "8px 0 0 8px", fontSize: 14 }}
                  placeholder="Nhập lại mật khẩu mới"
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                />

                <span
                  className={`input-group-text border-start-0 ${
                    confirmError
                      ? "border-danger"
                      : confirmMatch
                        ? "border-success"
                        : ""
                  }`}
                  style={{ borderRadius: "0 8px 8px 0", background: "#fff" }}
                >
                  {confirmMatch ? (
                    <i className="bi bi-check-lg text-success" />
                  ) : confirmError ? (
                    <i className="bi bi-x-lg text-danger" />
                  ) : (
                    <i className="bi bi-lock text-muted" />
                  )}
                </span>
              </div>

              {confirmError && (
                <div className="text-danger mt-1" style={{ fontSize: 12 }}>
                  Mật khẩu xác nhận không khớp
                </div>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 mt-2"
              style={{
                borderRadius: 10,
                height: 44,
                fontSize: 14,
                fontWeight: 600,
              }}
              disabled={!isValid || loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle" />
                  Cập nhật mật khẩu
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Password;
