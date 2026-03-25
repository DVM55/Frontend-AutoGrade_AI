import React, { useState, useRef } from "react";
import Category from "./Category";
import Group from "./Group";
import Question from "./Question";
import { createCategory } from "../../service/category.service";
import { createGroup } from "../../service/group.service";
import { toast } from "react-toastify";

const tabs = [
  { key: "question", label: "Questions" },
  { key: "category", label: "Category" },
  { key: "group", label: "Group" },
];

const QuestionBank = () => {
  const [activeTab, setActiveTab] = useState("question");
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const categoryRef = useRef(null);
  const groupRef = useRef(null);
  const questionRef = useRef(null);

  const modalConfig = {
    category: {
      title: "Tạo danh mục",
      label: "Tên danh mục",
      placeholder: "Nhập tên danh mục...",
    },
    group: {
      title: "Tạo nhóm",
      label: "Tên nhóm",
      placeholder: "Nhập tên nhóm...",
    },
    question: {
      title: "Tạo câu hỏi",
      label: "Tên câu hỏi",
      placeholder: "Nhập tên câu hỏi...",
    },
  };

  const handleOpenCreateQuestion = () => {
    questionRef.current?.openCreateModal();
  };

  const handleOpenModal = () => {
    setName("");
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setName("");
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      if (activeTab === "category") {
        await createCategory({ name: name.trim() });
        toast.success("Tạo danh mục thành công");
        categoryRef.current?.refresh(); // gọi refresh
      } else if (activeTab === "group") {
        await createGroup({ name: name.trim() });
        toast.success("Tạo nhóm thành công");
        groupRef.current?.refresh();
      }
      handleClose();
    } catch {
      toast.error("Tạo thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const config = modalConfig[activeTab];

  const actionLabel = {
    question: "Tạo câu hỏi",
    category: "Tạo danh mục",
    group: "Tạo nhóm",
  };

  return (
    <div className="container-fluid">
      {/* ===== Modal ===== */}
      {showModal && (
        <div
          onClick={handleClose}
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
              maxWidth: "420px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            }}
          >
            <h6
              style={{
                fontWeight: 600,
                marginBottom: "16px",
                color: "#212529",
              }}
            >
              {config.title}
            </h6>
            <label
              style={{
                fontSize: "13px",
                color: "#6c757d",
                display: "block",
                marginBottom: "6px",
              }}
            >
              {config.label}
            </label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder={config.placeholder}
              autoFocus
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
                marginTop: "20px",
              }}
            >
              <button
                className="btn btn-light"
                onClick={handleClose}
                disabled={submitting}
                style={{ fontSize: "inherit" }}
              >
                Hủy
              </button>
              <button
                className="btn"
                onClick={handleSubmit}
                disabled={submitting || !name.trim()}
                style={{
                  background: "#3d3a8c",
                  color: "#fff",
                  fontSize: "inherit",
                }}
              >
                {submitting ? "Đang tạo..." : "Tạo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs + Action Button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        {/* Tab group */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            border: "1px solid #dee2e6",
            borderRadius: "12px",
            padding: "6px",
            gap: "2px",
            background: "#fff",
          }}
        >
          {tabs.map(({ key, label }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: "5px 16px",
                  border: "none",
                  borderRadius: "8px",
                  background: isActive ? "#e8e8f0" : "transparent",
                  color: isActive ? "#3d3a8c" : "#6c757d",
                  fontWeight: 500,
                  fontSize: "inherit",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Action button */}
        <button
          onClick={
            activeTab === "question"
              ? handleOpenCreateQuestion
              : handleOpenModal
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "7px 16px",
            border: "none",
            borderRadius: "8px",
            background: "#3d3a8c",
            color: "#fff",
            fontWeight: 500,
            fontSize: "inherit",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#2e2b6e")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#3d3a8c")}
        >
          {actionLabel[activeTab]}
          <i className="bi bi-plus-lg"></i>
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "question" && <Question ref={questionRef} />}
        {activeTab === "category" && <Category ref={categoryRef} />}
        {activeTab === "group" && <Group ref={groupRef} />}
      </div>
    </div>
  );
};

export default QuestionBank;
