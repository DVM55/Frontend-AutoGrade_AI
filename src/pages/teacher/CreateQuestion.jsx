import React from "react";

const CreateQuestion = ({ onClose, onSuccess }) => {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          width: "100%",
          maxWidth: "520px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h6 style={{ fontWeight: 600, margin: 0, color: "#212529" }}>
            Tạo câu hỏi
          </h6>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6c757d",
              fontSize: "18px",
              lineHeight: 1,
              padding: "0 4px",
            }}
          >
            ×
          </button>
        </div>

        {/* Body — điền form vào đây */}
        <div style={{ color: "#6c757d", fontSize: "14px" }}>
          Nội dung form...
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            marginTop: "24px",
          }}
        >
          <button
            className="btn btn-light"
            onClick={onClose}
            style={{ fontSize: "inherit" }}
          >
            Hủy
          </button>
          <button
            className="btn"
            onClick={onSuccess}
            style={{
              background: "#3d3a8c",
              color: "#fff",
              fontSize: "inherit",
            }}
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestion;
