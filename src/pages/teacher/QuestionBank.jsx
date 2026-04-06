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
  const [nameError, setNameError] = useState("");
  const [apiError, setApiError] = useState("");
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
    setNameError("");
    setApiError("");
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setName("");
    setNameError("");
    setApiError("");
  };

  const validate = () => {
    if (!name.trim()) {
      setNameError("Tên không được để trống");
      return false;
    }
    if (name.trim().length < 2) {
      setNameError("Tên phải có ít nhất 2 ký tự");
      return false;
    }
    if (name.trim().length > 100) {
      setNameError("Tên không được vượt quá 100 ký tự");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setApiError("");
    try {
      if (activeTab === "category") {
        await createCategory({ name: name.trim() });
        toast.success("Tạo danh mục thành công");
        categoryRef.current?.refresh();
      } else if (activeTab === "group") {
        await createGroup({ name: name.trim() });
        toast.success("Tạo nhóm thành công");
        groupRef.current?.refresh();
      }
      handleClose();
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          error.message ||
          "Tạo thất bại, vui lòng thử lại",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (nameError) setNameError("");
    if (apiError) setApiError("");
  };

  const config = modalConfig[activeTab];

  const actionLabel = {
    question: { full: "Tạo câu hỏi", short: "Thêm mới" },
    category: { full: "Tạo danh mục", short: "Thêm mới" },
    group: { full: "Tạo nhóm", short: "Thêm mới" },
  };

  return (
    <div className="container-fluid qb-root">
      <style>{`
        .qb-root {
          font-size: 16px;
          min-width: 0;
          box-sizing: border-box;
        }

        /* ===== HEADER ===== */
        .qb-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          gap: 10px;
          flex-wrap: nowrap;
        }

        /* ===== SELECT WRAPPER ===== */
        .qb-select-wrapper {
          position: relative;
          width: 160px;
          flex-shrink: 0;
        }

        .qb-select {
          width: 100%;
          appearance: none;
          -webkit-appearance: none;
          padding: 7px 36px 7px 14px;
          border: 1px solid #dee2e6;
          border-radius: 10px;
          background: #fff;
          color: #3d3a8c;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .qb-select:hover { border-color: #3d3a8c; }
        .qb-select:focus {
          border-color: #3d3a8c;
          box-shadow: 0 0 0 3px rgba(61,58,140,0.12);
        }

        .qb-select-arrow {
          pointer-events: none;
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #3d3a8c;
        }

        /* ===== ACTION BUTTON ===== */
        .qb-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 7px 14px;
          border: none;
          border-radius: 8px;
          background: #3d3a8c;
          color: #fff;
          font-weight: 500;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.15s;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .qb-action-btn:hover { background: #2e2b6e; }
        .qb-action-btn .btn-label-full { display: inline; }
        .qb-action-btn .btn-label-short { display: none; }

        /* ===== MODAL OVERLAY ===== */
        .qb-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          box-sizing: border-box;
        }

        /* ===== MODAL BOX — Option 2 style ===== */
        .qb-modal-box {
          background: #fff;
          border-radius: 12px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          box-sizing: border-box;
          max-height: calc(100vh - 24px);
          overflow-y: auto;
          overflow: hidden;
        }

        

        /* Header: title + nút X */
        .qb-modal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px 14px;
        }

        .qb-modal-title {
          font-size: 17px;
          font-weight: 600;
          color: #212529;
          margin: 0;
        }

        .qb-modal-close {
          width: 30px;
          height: 30px;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #6c757d;
          font-size: 16px;
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
        }

        .qb-modal-close:hover {
          background: #f8f9fa;
          color: #212529;
        }

        /* Body */
        .qb-modal-body {
          padding: 0 20px 20px;
        }

        /* API error banner — giống login */
        .qb-alert-banner {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.6rem 0.85rem;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 14px;
          word-break: break-word;
          background-color: #fff5f5;
          border: 1px solid #f5c2c7;
          color: #842029;
        }

        .qb-alert-icon { flex-shrink: 0; }

        /* Label */
        .qb-modal-label {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 6px;
        }

        .qb-required { color: #dc3545; }

        /* Input */
        .qb-modal-input {
          width: 100%;
          padding: 8px 12px;
          font-size: 16px;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          background: #f8f9fa;
          color: #212529;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
          appearance: none;
        }

        .qb-modal-input:focus {
          border-color: #3d3a8c;
          box-shadow: 0 0 0 3px rgba(61,58,140,0.12);
          background: #fff;
        }

        .qb-modal-input.is-error {
          border-color: #dc3545;
          box-shadow: 0 0 0 2px rgba(220,53,69,0.12);
        }

        /* Field error */
        .qb-field-error {
          font-size: 14px;
          color: #dc3545;
          margin-top: 5px;
          min-height: 1em;
        }

        /* Footer — 2 nút full width ngang nhau */
        .qb-modal-footer {
          display: flex;
          gap: 10px;
          padding: 14px 20px;
          border-top: 1px solid #f0f0f0;
          background: #fafafa;
          border-radius: 0 0 12px 12px;
        }

        .qb-btn-cancel {
          flex: 1;
          padding: 9px;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          background: #fff;
          font-size: 16px;
          font-weight: 500;
          color: #6c757d;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }

        .qb-btn-cancel:hover {
          background: #f0f0f0;
          color: #333;
        }

        .qb-btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }

        .qb-btn-submit {
          flex: 1;
          padding: 9px;
          border: none;
          border-radius: 8px;
          background: #3d3a8c;
          color: #fff;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 0.15s, opacity 0.15s;
        }

        .qb-btn-submit:hover:not(:disabled) { background: #2e2b6e; }
        .qb-btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        /* Spinner */
        .qb-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: qb-spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes qb-spin { to { transform: rotate(360deg); } }

        /* ===== RESPONSIVE <= 480px ===== */
        @media (max-width: 480px) {
          .qb-action-btn .btn-label-full { display: none; }
          .qb-action-btn .btn-label-short { display: inline; }
          .qb-select-wrapper { width: 130px; }
          .qb-select { font-size: 16px; padding: 7px 30px 7px 10px; }
          .qb-action-btn { font-size: 16px; padding: 7px 12px; }
        }

        /* ===== RESPONSIVE <= 360px ===== */
        @media (max-width: 360px) {
          .qb-root { padding-left: 8px !important; padding-right: 8px !important; }
          .qb-select-wrapper { width: 120px; }
          .qb-select { font-size: 16px; padding: 6px 28px 6px 8px; }
          .qb-action-btn { font-size: 16px; padding: 6px 10px; }
          .qb-select-arrow { right: 6px; width: 14px; height: 14px; }
          .qb-modal-head { padding: 14px 14px 10px; }
          .qb-modal-body { padding: 0 14px 16px; }
          .qb-modal-footer { padding: 12px 14px; gap: 8px; }
        }
      `}</style>

      {/* ===== Modal ===== */}
      {showModal && (
        <div className="qb-modal-overlay" onClick={handleClose}>
          <div className="qb-modal-box" onClick={(e) => e.stopPropagation()}>
            {/* Accent bar */}
            <div className="qb-modal-topbar" />

            {/* Header */}
            <div className="qb-modal-head">
              <h6 className="qb-modal-title">{config.title}</h6>
              <button
                className="qb-modal-close"
                onClick={handleClose}
                aria-label="Đóng"
                disabled={submitting}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="qb-modal-body">
              {/* API error banner */}
              {apiError && (
                <div
                  className="qb-alert-banner"
                  role="alert"
                  aria-live="assertive"
                >
                  <span className="qb-alert-icon">⚠</span>
                  <span>{apiError}</span>
                </div>
              )}

              <input
                type="text"
                className={`qb-modal-input${nameError ? " is-error" : ""}`}
                value={name}
                onChange={handleNameChange}
                onKeyDown={(e) =>
                  e.key === "Enter" && !submitting && handleSubmit()
                }
                placeholder={config.placeholder}
                autoFocus
                aria-describedby={nameError ? "qb-name-error" : undefined}
              />
              {nameError && (
                <div id="qb-name-error" className="qb-field-error" role="alert">
                  {nameError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="qb-modal-footer">
              <button
                className="qb-btn-cancel"
                onClick={handleClose}
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                className="qb-btn-submit"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="qb-spinner" aria-hidden="true" />
                    Đang tạo...
                  </>
                ) : (
                  "Tạo"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Header ===== */}
      <div className="qb-header">
        <div className="qb-select-wrapper">
          <select
            className="qb-select"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            {tabs.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <svg
            className="qb-select-arrow"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <button
          className="qb-action-btn"
          onClick={
            activeTab === "question"
              ? handleOpenCreateQuestion
              : handleOpenModal
          }
        >
          <span className="btn-label-full">{actionLabel[activeTab].full}</span>
          <span className="btn-label-short">
            {actionLabel[activeTab].short}
          </span>
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
