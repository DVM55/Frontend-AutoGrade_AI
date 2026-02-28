import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateAccount, updateAvatar } from "../../service/account.service";
import { toast } from "react-toastify";
import avatarImg from "../../assets/avatarImg.png";

const DatePicker = ({ value, onChange }) => {
  const parts = value ? value.split("-") : ["", "", ""];
  const [yyyy, setYyyy] = useState(parts[0] || "");
  const [mm, setMm] = useState(parts[1] || "");
  const [dd, setDd] = useState(parts[2] || "");

  const update = (y, m, d) => {
    if (y && m && d) onChange(`${y}-${m}-${d}`);
    else onChange("");
  };

  const days = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, "0"),
  );
  const months = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0"),
  );
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <select
        value={dd}
        onChange={(e) => {
          setDd(e.target.value);
          update(yyyy, mm, e.target.value);
        }}
        style={{
          flex: 1,
          padding: "10px 8px",
          borderRadius: 8,
          border: "1px solid #ddd",
          fontSize: 14,
        }}
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
        style={{
          flex: 1,
          padding: "10px 8px",
          borderRadius: 8,
          border: "1px solid #ddd",
          fontSize: 14,
        }}
      >
        <option value="">Tháng</option>
        {months.map((m) => (
          <option key={m} value={m}>
            Tháng {parseInt(m)}
          </option>
        ))}
      </select>
      <select
        value={yyyy}
        onChange={(e) => {
          setYyyy(e.target.value);
          update(e.target.value, mm, dd);
        }}
        style={{
          flex: 1,
          padding: "10px 8px",
          borderRadius: 8,
          border: "1px solid #ddd",
          fontSize: 14,
        }}
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

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave(fieldKey, val);
      onClose();
    } finally {
      setLoading(false);
    }
  };

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
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          minWidth: 360,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            Chỉnh sửa {label}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: "#888",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              marginBottom: 6,
              fontWeight: 500,
              fontSize: 14,
              color: "#444",
            }}
          >
            {label}
          </label>

          {options ? (
            <select
              value={val}
              onChange={(e) => setVal(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 15,
                outline: "none",
              }}
            >
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : inputType === "date" ? (
            <DatePicker value={val} onChange={(v) => setVal(v)} />
          ) : (
            <input
              type={inputType}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 15,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          )}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 20px",
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
              padding: "9px 20px",
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
      toast.error("Cập nhật ảnh thất bại");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleSaveField = async (fieldKey, value) => {
    try {
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
    } catch (err) {
      toast.error(err?.response?.data?.message || "Cập nhật thất bại");
      throw err;
    }
  };

  const genderLabel = { MALE: "Nam", FEMALE: "Nữ", OTHER: "Khác" };

  const FIELDS = [
    {
      key: "username",
      label: "Tên người dùng",
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
        { value: "MALE", label: "Nam" },
        { value: "FEMALE", label: "Nữ" },
        { value: "OTHER", label: "Khác" },
      ],
    },
    {
      key: "date_of_birth",
      label: "Ngày sinh",
      value: user?.date_of_birth
        ? new Date(user.date_of_birth).toLocaleDateString("vi-VN")
        : null,
      inputType: "date",
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
      {/* Top banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)",
          padding: "40px 0 80px",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {/* Avatar */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: 96,
                  height: 96,
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
                    <span style={{ color: "#888", fontSize: 12 }}>
                      Đang tải...
                    </span>
                  </div>
                ) : (
                  <img
                    src={user?.avatarUrl || avatarImg}
                    alt="avatar"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
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
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "#fff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                ✏️
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
            </div>

            {/* Name & email */}
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>
                {user?.username || "Người dùng"}
              </div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
                {user?.email || ""}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile content */}
      <div
        style={{
          maxWidth: 900,
          margin: "-48px auto 0",
          padding: "0 24px 40px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "24px 28px 0" }}>
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 600,
                color: "#222",
              }}
            >
              Thông tin tài khoản
            </h2>
          </div>

          <div style={{ padding: "8px 0 16px" }}>
            {/* Email — không cho sửa */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "14px 28px",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <div style={{ width: 180, color: "#888", fontSize: 14 }}>
                Email
              </div>
              <div style={{ flex: 1, fontSize: 15, color: "#222" }}>
                {user?.email}
              </div>
            </div>

            {FIELDS.map((f) => (
              <div
                key={f.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 28px",
                  borderBottom: "1px solid #f0f0f0",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f8f9fa")
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <div style={{ width: 180, color: "#888", fontSize: 14 }}>
                  {f.label}
                </div>
                <div style={{ flex: 1, fontSize: 15, color: "#222" }}>
                  {f.value || (
                    <span style={{ color: "#bbb", fontStyle: "italic" }}>
                      Chưa có dữ liệu
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
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#adb5bd",
                    fontSize: 18,
                  }}
                >
                  ✏️
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
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
