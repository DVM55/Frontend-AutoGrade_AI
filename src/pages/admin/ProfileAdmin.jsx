import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateAccount, updateAvatar } from "../../service/account.service";
import { toast } from "react-toastify";
import avatarImg from "../../assets/avatarImg.png";

/* ── SVG icons ── */
const PencilIcon = ({ size = 14, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CameraIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1a73e8"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

/* ── Validate từng field ── */
const validateField = (fieldKey, value) => {
  if (fieldKey === "username") {
    if (!value || !value.trim()) return "Họ và tên không được để trống";
    if (value.trim().length < 2) return "Họ và tên phải có ít nhất 2 ký tự";
  }
  if (fieldKey === "phone") {
    if (value && value.trim()) {
      if (!/^(0|\+84)[0-9]{9}$/.test(value.trim()))
        return "Số điện thoại không hợp lệ. Phải gồm 10 chữ số và bắt đầu bằng 0 (VD: 0912345678)";
    }
  }
  if (fieldKey === "address") {
    if (value && value.trim() && value.trim().length < 5)
      return "Địa chỉ phải có ít nhất 5 ký tự";
  }
  return "";
};

const responsiveCSS = `
  .profile-banner-inner {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 32px;
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .profile-banner-info { min-width: 0; text-align: left; }
  .profile-banner-name {
    font-size: 18px; font-weight: 700; color: #fff;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3;
  }
  .profile-banner-email {
    font-size: 16px; color: rgba(255,255,255,0.82);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;
  }
  .profile-content-wrapper {
    max-width: 960px; margin: -48px auto 0; padding: 0 32px 40px;
  }
  .profile-card-title { font-size: 16px; font-weight: 800; color: #222; margin: 0; line-height: 1.3; }
  .profile-field-label { flex-shrink: 0; width: 110px; color: #888; font-size: 16px; line-height: 1.5; }
  .profile-field-value { flex: 1; font-size: 16px; color: #222; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.5; }

  /* Fix iOS zoom */
  .profile-input-field,
  .profile-select-field,
  .profile-datepicker-select { font-size: 16px !important; }

  /* Field error — giống Login */
  .profile-field-error {
    font-size: 0.78rem;
    color: #dc3545;
    margin-top: 0.3rem;
    min-height: 1em;
    line-height: 1.4;
  }

  /* Input error state */
  .profile-input-error {
    border-color: #dc3545 !important;
    box-shadow: 0 0 0 2px rgba(220,53,69,0.12) !important;
  }

  /* Laptop */
  @media (max-width: 1279px) {
    .profile-banner-inner    { max-width: 720px; padding: 0 24px; }
    .profile-content-wrapper { max-width: 720px; padding: 0 24px 36px; }
  }
  /* Tablet */
  @media (max-width: 959px) {
    .profile-banner-inner    { max-width: 560px; padding: 0 20px; }
    .profile-content-wrapper { max-width: 560px; padding: 0 20px 32px; margin-top: -44px; }
  }
  /* Mobile */
  @media (max-width: 599px) {
    .profile-banner-inner {
      max-width: 100%; flex-direction: column; align-items: center;
      text-align: center; gap: 10px; padding: 0 16px;
    }
    .profile-banner-info   { text-align: center; }
    .profile-content-wrapper { max-width: 100%; padding: 0 12px 24px; margin-top: -36px; }
    .profile-field-label { width: 90px; }
  }
`;

/* ─── Date Picker ─── */
const DatePicker = ({ value, onChange }) => {
  const parts = value ? value.split("-") : ["", "", ""];
  const [yyyy, setYyyy] = useState(parts[0] || "");
  const [mm, setMm] = useState(parts[1] || "");
  const [dd, setDd] = useState(parts[2] || "");
  const update = (y, m, d) => onChange(y && m && d ? `${y}-${m}-${d}` : "");
  const days = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, "0"),
  );
  const months = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0"),
  );
  const curY = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(curY - i));
  const sel = {
    flex: 1,
    minWidth: 0,
    padding: "8px 4px",
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 16,
    WebkitAppearance: "none",
    appearance: "none",
    background: "#fff",
  };
  return (
    <div style={{ display: "flex", gap: 4 }}>
      <select
        value={dd}
        onChange={(e) => {
          setDd(e.target.value);
          update(yyyy, mm, e.target.value);
        }}
        style={sel}
        className="profile-datepicker-select"
      >
        <option value="">Ngày</option>
        {days.map((d) => (
          <option key={d} value={d}>
            {parseInt(d)}
          </option>
        ))}
      </select>
      <select
        value={mm}
        onChange={(e) => {
          setMm(e.target.value);
          update(yyyy, e.target.value, dd);
        }}
        style={sel}
        className="profile-datepicker-select"
      >
        <option value="">Tháng</option>
        {months.map((m) => (
          <option key={m} value={m}>
            T.{parseInt(m)}
          </option>
        ))}
      </select>
      <select
        value={yyyy}
        onChange={(e) => {
          setYyyy(e.target.value);
          update(e.target.value, mm, dd);
        }}
        style={sel}
        className="profile-datepicker-select"
      >
        <option value="">Năm</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
};

/* ─── Edit Field Modal ─── */
const EditFieldModal = ({
  label,
  fieldKey,
  value,
  inputType = "text",
  options,
  onClose,
  onSave,
}) => {
  const [val, setVal] = useState(value || (options ? options[0].value : ""));
  const [loading, setLoading] = useState(false);
  const [fieldErr, setFieldErr] = useState("");
  const [apiError, setApiError] = useState(""); // ← lỗi từ server

  const handleChange = (newVal) => {
    setVal(newVal);
    setFieldErr(validateField(fieldKey, newVal));
    setApiError(""); // clear api error khi người dùng sửa
  };

  const handleSave = async () => {
    const err = validateField(fieldKey, val);
    if (err) {
      setFieldErr(err);
      return;
    }
    try {
      setLoading(true);
      setApiError("");
      await onSave(fieldKey, val);
      onClose();
    } catch (err) {
      // hiện lỗi API ngay trong modal, không toast
      setApiError(
        err?.response?.data?.message ||
          err?.message ||
          "Có lỗi xảy ra, vui lòng thử lại",
      );
    } finally {
      setLoading(false);
    }
  };

  const baseInputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 16,
    outline: "none",
    boxSizing: "border-box",
    WebkitAppearance: "none",
    appearance: "none",
    background: "#fff",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };
  const inputStyle = fieldErr
    ? {
        ...baseInputStyle,
        borderColor: "#dc3545",
        boxShadow: "0 0 0 2px rgba(220,53,69,0.12)",
      }
    : baseInputStyle;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "0 12px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "20px 16px",
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 22,
              cursor: "pointer",
              color: "#888",
              lineHeight: 1,
              padding: "0 4px",
            }}
          >
            ×
          </button>
        </div>

        {/* ── API error banner — giống Login ── */}
        {apiError && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
              padding: "0.65rem 0.85rem",
              borderRadius: 8,
              fontSize: 14,
              lineHeight: 1.5,
              marginBottom: 12,
              wordBreak: "break-word",
              background: "#fff5f5",
              border: "1px solid #f5c2c7",
              color: "#842029",
            }}
          >
            <span style={{ flexShrink: 0 }}>⚠</span>
            <span>{apiError}</span>
          </div>
        )}

        {/* Field */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontWeight: 600,
              fontSize: 16,
              color: "#333",
            }}
          >
            {label}
            {fieldKey === "username" && (
              <span style={{ color: "#dc3545", marginLeft: 2 }}>*</span>
            )}
          </label>

          {options ? (
            <select
              value={val}
              onChange={(e) => handleChange(e.target.value)}
              style={inputStyle}
              className="profile-select-field"
            >
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : inputType === "date" ? (
            <DatePicker value={val} onChange={(v) => handleChange(v)} />
          ) : (
            <input
              type={inputType}
              value={val}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              style={inputStyle}
              className="profile-input-field"
              autoComplete="off"
            />
          )}

          {/* Field-level error */}
          {fieldErr && (
            <div className="profile-field-error" role="alert">
              {fieldErr}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 16px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
              fontSize: 14,
              color: "#444",
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: "9px 16px",
              borderRadius: 8,
              border: "none",
              background: loading ? "#90b8f0" : "#1a73e8",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14,
            }}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── ProfileAdmin Page ─── */
const ProfileAdmin = () => {
  const { user, setUser } = useAuth();
  const [editField, setEditField] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      const res = await updateAvatar(file);
      setUser((prev) => ({ ...prev, avatarUrl: res.data.avatarUrl }));
      toast.success("Cập nhật ảnh thành công");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Cập nhật ảnh thất bại",
      );
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleSaveField = async (fieldKey, value) => {
    const payload = {
      username: user?.username,
      phone: user?.phone,
      gender: user?.gender,
      date_of_birth: user?.date_of_birth
        ? new Date(user.date_of_birth).toISOString().split("T")[0]
        : null,
      address: user?.address,
      [fieldKey]: value || null,
    };
    const res = await updateAccount(payload);
    setUser((prev) => ({ ...prev, ...res.data }));
    toast.success("Cập nhật thành công");
  };

  const genderLabel = { MALE: "Nam", FEMALE: "Nữ", OTHER: "Khác" };

  const FIELDS = [
    {
      key: "username",
      label: "Họ và tên",
      value: user?.username,
      inputType: "text",
    },
    {
      key: "phone",
      label: "Số điện thoại",
      value: user?.phone,
      inputType: "tel",
    },
    {
      key: "gender",
      label: "Giới tính",
      value: genderLabel[user?.gender] || null,
      rawValue: user?.gender || "",
      options: [
        { value: "", label: "Chọn giới tính" },
        { value: "MALE", label: "Nam" },
        { value: "FEMALE", label: "Nữ" },
        { value: "OTHER", label: "Khác" },
      ],
    },
    {
      key: "date_of_birth",
      label: "Ngày sinh",
      inputType: "date",
      value: user?.date_of_birth
        ? new Date(user.date_of_birth).toLocaleDateString("vi-VN")
        : null,
      rawValue: user?.date_of_birth
        ? new Date(user.date_of_birth).toISOString().split("T")[0]
        : "",
    },
    {
      key: "address",
      label: "Địa chỉ",
      value: user?.address,
      inputType: "text",
    },
  ];

  return (
    <>
      <style>{responsiveCSS}</style>

      {/* ── Banner ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)",
          padding: "28px 0 72px",

          marginLeft: "-2rem",
          marginRight: "-2rem",
          marginTop: "-2rem",

          width: "calc(100% + 4rem)",
        }}
      >
        <div className="profile-banner-inner">
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid #fff",
              }}
            >
              {uploadingAvatar ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#eee",
                  }}
                >
                  <span style={{ color: "#888", fontSize: 10 }}>
                    Đang tải...
                  </span>
                </div>
              ) : (
                <img
                  src={user?.avatarUrl || avatarImg}
                  alt="avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = avatarImg;
                  }}
                />
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              title="Đổi ảnh đại diện"
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "#fff",
                border: "1.5px solid #e0e0e0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                padding: 0,
              }}
            >
              <CameraIcon />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </div>
          <div className="profile-banner-info">
            <div className="profile-banner-name">
              {user?.username || "Người dùng"}
            </div>
            <div className="profile-banner-email">{user?.email || ""}</div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="profile-content-wrapper">
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "20px 16px 0" }}>
            <h2 className="profile-card-title">Thông tin tài khoản</h2>
          </div>
          <div style={{ padding: "8px 0 12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                borderBottom: "1px solid #f0f0f0",
                gap: 8,
              }}
            >
              <div className="profile-field-label">Email</div>
              <div className="profile-field-value">{user?.email}</div>
            </div>
            {FIELDS.map((f) => (
              <div
                key={f.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderBottom: "1px solid #f0f0f0",
                  transition: "background 0.15s",
                  gap: 8,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f8f9fa")
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <div className="profile-field-label">{f.label}</div>
                <div className="profile-field-value">
                  {f.value || (
                    <span style={{ color: "#bbb", fontStyle: "italic" }}>
                      Chưa có
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setEditField(f)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#1a73e8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#adb5bd")
                  }
                  style={{
                    flexShrink: 0,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#adb5bd",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PencilIcon size={15} color="currentColor" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editField && (
        <EditFieldModal
          label={editField.label}
          fieldKey={editField.key}
          value={editField.rawValue ?? editField.value ?? ""}
          inputType={editField.inputType}
          options={editField.options}
          onClose={() => setEditField(null)}
          onSave={handleSaveField}
        />
      )}
    </>
  );
};

export default ProfileAdmin;
