import React, { useState, useEffect, useRef } from "react";
import CategorySearch from "../../component/CategorySearch";
import GroupSearch from "../../component/GroupSearch";
import {
  createQuestions,
  importQuestions,
} from "../../service/question.service";
import Media from "./Media";
import { toast } from "react-toastify";

const ALPHA = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

const QUESTION_TYPES = [
  { value: "SINGLE_CHOICE", label: "Chọn 1 đáp án" },
  { value: "MULTIPLE_CHOICE", label: "Chọn nhiều đáp án" },
  { value: "SHORT_ANSWER", label: "Trả lời ngắn có đáp án đúng" },
];

const QUESTION_TYPE_LABELS = {
  SINGLE_CHOICE: "Chọn 1 đáp án",
  MULTIPLE_CHOICE: "Chọn nhiều đáp án",
  SHORT_ANSWER: "Trả lời ngắn",
};

// ── Icons ──────────────────────────────────────────────────────────────────
const IconX = ({ size = 18, color = "#6c757d" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconPlus = ({ size = 14, color = "#3d3a8c" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconTrash = ({ size = 14, color = "#ef4444" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.2"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
);
const IconImage = ({ size = 16, color = "#6c757d" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const IconChevron = ({ size = 14, color = "#adb5bd" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconCheck = ({ size = 13, color = "#fff" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="3"
    strokeLinecap="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconAlert = ({ size = 13, color = "#ef4444" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconUpload = ({ size = 20, color = "#3d3a8c" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const IconDownload = ({ size = 14, color = "#3d3a8c" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconArrowLeft = ({ size = 16, color = "#6c757d" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconSave = ({ size = 15, color = "#fff" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
const IconExcel = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="4" fill="#217346" />
    <path d="M18 8h6a1 1 0 011 1v14a1 1 0 01-1 1h-6V8z" fill="#185C37" />
    <path d="M7 8h11v16H7a1 1 0 01-1-1V9a1 1 0 011-1z" fill="#21A366" />
    <path d="M18 8h-7v16h7V8z" fill="#107C41" />
    <line
      x1="18"
      y1="8"
      x2="18"
      y2="24"
      stroke="#fff"
      strokeOpacity="0.3"
      strokeWidth="0.5"
    />
    <path
      d="M10.5 12l2 3-2 3h1.5l1.25-2L14.5 18H16l-2-3 2-3h-1.5l-1.25 2L12 12h-1.5z"
      fill="white"
    />
  </svg>
);
const IconWord = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="4" fill="#2B579A" />
    <path d="M18 8h6a1 1 0 011 1v14a1 1 0 01-1 1h-6V8z" fill="#1A3F77" />
    <path d="M7 8h11v16H7a1 1 0 01-1-1V9a1 1 0 011-1z" fill="#2E75B8" />
    <path d="M18 8h-7v16h7V8z" fill="#2B579A" />
    <path
      d="M9 12h1.2l1.3 4.5 1.3-4.5h1.1l1.3 4.5 1.3-4.5H17.8l-2 6h-1.2l-1.3-4.3-1.3 4.3H10.9L9 12z"
      fill="white"
    />
  </svg>
);

// ── Shared textarea style (giống UpdateQuestion — không cắt giữa từ) ───────
const taStyle = (overrides = {}) => ({
  width: "100%",
  padding: "7px 11px",
  borderRadius: 7,
  fontSize: 16,
  fontFamily: "inherit",
  lineHeight: "1.6",
  resize: "none",
  overflow: "hidden",
  boxSizing: "border-box",
  outline: "none",
  transition: "border-color 0.15s, background 0.15s",
  overflowWrap: "break-word", // ✅ xuống dòng tại ranh giới từ
  wordBreak: "normal", // ✅ không cắt giữa từ tiếng Việt
  ...overrides,
});

// ── Auto-resize textarea helper ────────────────────────────────────────────
const resizeTextarea = (el) => {
  if (!el) return;
  el.style.height = "0px";
  el.style.height = el.scrollHeight + "px";
};

// ── Default form state ─────────────────────────────────────────────────────
const defaultForm = () => ({
  content: "",
  questionType: "SINGLE_CHOICE",
  options: [
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
  ],
  correctAnswers: [],
  category: null,
  group: null,
  mediaUrl: null,
  mediaType: null,
  mediaObjectKey: null,
});

// ── Validate ───────────────────────────────────────────────────────────────
const validateForm = (form) => {
  const errs = {};
  if (!form.content.trim() && !(form.mediaObjectKey || form.mediaType)) {
    errs.content = "Vui lòng nhập nội dung hoặc chọn media.";
  }
  if (form.questionType !== "SHORT_ANSWER") {
    if (form.options.length < 2) errs.options = "Cần ít nhất 2 đáp án.";
    else if (form.options.some((o) => !o.optionText.trim()))
      errs.options = "Đáp án không được để trống.";
    else if (!form.options.some((o) => o.isCorrect))
      errs.options = "Chọn ít nhất 1 đáp án đúng.";
  } else {
    if (form.correctAnswers.length === 0)
      errs.correctAnswers = "Cần ít nhất 1 đáp án chấp nhận.";
    else if (form.correctAnswers.some((a) => !a.answer.trim()))
      errs.correctAnswers = "Đáp án không được để trống.";
  }
  return errs;
};

// ── SelectField ────────────────────────────────────────────────────────────
const SelectField = ({ label, value, onClick, onClear }) => (
  <div>
    <div
      style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}
    >
      <div
        style={{ width: 3, height: 14, borderRadius: 2, background: "#3d3a8c" }}
      />
      <span style={{ fontSize: 16, fontWeight: 600, color: "#212529" }}>
        {label}
      </span>
    </div>
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 12px",
        borderRadius: 8,
        cursor: "pointer",
        border: `1.5px solid ${value ? "#c5c3e8" : "#e9ecef"}`,
        background: value ? "#f0effc" : "#fff",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!value) {
          e.currentTarget.style.borderColor = "#c5c3e8";
          e.currentTarget.style.background = "#f5f4ff";
        }
      }}
      onMouseLeave={(e) => {
        if (!value) {
          e.currentTarget.style.borderColor = "#e9ecef";
          e.currentTarget.style.background = "#fff";
        }
      }}
    >
      <span
        style={{
          flex: 1,
          fontSize: 16,
          color: value ? "#3d3a8c" : "#adb5bd",
          fontWeight: value ? 500 : 400,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value?.name || `Chọn ${label.toLowerCase()}`}
      </span>
      {value ? (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          <IconX size={14} color="#6c757d" />
        </span>
      ) : (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#adb5bd"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      )}
    </div>
  </div>
);

// ── ImportedQuestionCard ───────────────────────────────────────────────────
const ImportedQuestionCard = ({ question, index, onRemove }) => {
  const [expanded, setExpanded] = useState(true);
  const answers = question.options || [];
  const correctAnswers = question.correctAnswers || [];
  const isShort = question.questionType === "SHORT_ANSWER";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        border: "1.5px solid #ede9fe",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: "#f8f7ff",
          borderBottom: expanded ? "1.5px solid #ede9fe" : "none",
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            flexShrink: 0,
            background: "#ede9fe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 700,
            color: "#3d3a8c",
          }}
        >
          {index + 1}
        </span>
        <span
          style={{
            flex: 1,
            fontSize: 16,
            color: "#212529",
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {question.content || "(Không có nội dung)"}
        </span>
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#6c6baa",
            padding: "2px 7px",
            borderRadius: 20,
            background: "#ede9fe",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          {QUESTION_TYPE_LABELS[question.questionType] || question.questionType}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            border: "none",
            background: "#fff1f2",
            cursor: "pointer",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconTrash size={14} color="#ef4444" />
        </button>
        <span
          style={{
            flexShrink: 0,
            transition: "transform 0.2s",
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            display: "flex",
          }}
        >
          <IconChevron size={14} color="#adb5bd" />
        </span>
      </div>

      {expanded && (
        <div
          style={{
            padding: "10px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 5,
          }}
        >
          {!isShort
            ? answers.map((opt, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "5px 10px",
                    borderRadius: 7,
                    background: opt.isCorrect ? "#f0fdf4" : "#fafafa",
                    border: `1.5px solid ${opt.isCorrect ? "#bbf7d0" : "#f0f0f0"}`,
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      flexShrink: 0,
                      borderRadius:
                        question.questionType === "MULTIPLE_CHOICE" ? 4 : "50%",
                      background: opt.isCorrect ? "#16a34a" : "#e9ecef",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {opt.isCorrect ? (
                      <IconCheck size={14} color="#fff" />
                    ) : (
                      <span
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#9ca3af",
                        }}
                      >
                        {ALPHA[i]}
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 16,
                      color: opt.isCorrect ? "#15803d" : "#495057",
                      overflowWrap: "break-word",
                      wordBreak: "normal",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {opt.optionText}
                  </span>
                </div>
              ))
            : correctAnswers.map((ans, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "5px 10px",
                    borderRadius: 7,
                    background: "#f0fdf4",
                    border: "1.5px solid #bbf7d0",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      flexShrink: 0,
                      borderRadius: "50%",
                      background: "#16a34a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconCheck size={14} color="#fff" />
                  </div>
                  <span
                    style={{
                      fontSize: 16,
                      color: "#15803d",
                      overflowWrap: "break-word",
                      wordBreak: "normal",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {ans.answer}
                  </span>
                </div>
              ))}
        </div>
      )}
    </div>
  );
};

// ── ImportFileModal ────────────────────────────────────────────────────────
const ImportFileModal = ({ onClose, onSuccess }) => {
  const [category, setCategory] = useState(null);
  const [group, setGroup] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  const ACCEPTED = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
  ];

  const handleFile = (file) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Chỉ hỗ trợ file Excel hoặc Word!");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File không được vượt quá 2MB!");
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Vui lòng chọn file!");
      return;
    }
    setLoading(true);
    try {
      const res = await importQuestions(selectedFile);
      onSuccess(res.data, category, group);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Import thất bại!",
      );
    } finally {
      setLoading(false);
    }
  };

  const fileExt = selectedFile?.name?.split(".").pop()?.toLowerCase();
  const isExcel = ["xlsx", "xls"].includes(fileExt);

  // ── Phase 1: Upload — modal căn giữa, responsive ─────────────────────────
  return (
    <>
      {showCategoryModal && (
        <CategorySearch
          value={category}
          onConfirm={(sel) => {
            setCategory(sel);
            setShowCategoryModal(false);
          }}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
      {showGroupModal && (
        <GroupSearch
          value={group}
          onConfirm={(sel) => {
            setGroup(sel);
            setShowGroupModal(false);
          }}
          onClose={() => setShowGroupModal(false)}
        />
      )}
      <style>{`@keyframes fadeInScale{from{opacity:0;transform:scale(0.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1180,
          background: "rgba(15,23,42,0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 520,
            maxHeight: "calc(100vh - 32px)",
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            animation: "fadeInScale 0.24s cubic-bezier(.4,0,.2,1)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Body — scrollable */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Danh mục + Nhóm */}
            <div
              style={{
                background: "#f8f7ff",
                borderRadius: 12,
                border: "1.5px solid #ede9fe",
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <SelectField
                label="Danh mục"
                value={category}
                onClick={() => setShowCategoryModal(true)}
                onClear={() => setCategory(null)}
              />
              <SelectField
                label="Nhóm câu hỏi"
                value={group}
                onClick={() => setShowGroupModal(true)}
                onClear={() => setGroup(null)}
              />
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
              style={{
                borderRadius: 12,
                border: `2px dashed ${dragOver ? "#3d3a8c" : selectedFile ? "#c5c3e8" : "#d1d5db"}`,
                background: dragOver
                  ? "#f0effc"
                  : selectedFile
                    ? "#f8f7ff"
                    : "#fafafa",
                padding: "24px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                cursor: selectedFile ? "default" : "pointer",
                transition: "all 0.2s",
                minHeight: 130,
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.doc,.docx"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
              {selectedFile ? (
                <>
                  <div
                    style={{
                      width: 40,
                      height: 30,
                      borderRadius: 12,
                      background: isExcel ? "#e8f5ee" : "#e8eef8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isExcel ? <IconExcel size={24} /> : <IconWord size={24} />}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#212529",
                      }}
                    >
                      {(() => {
                        const name = selectedFile.name;
                        const lastDot = name.lastIndexOf(".");
                        const ext = lastDot !== -1 ? name.slice(lastDot) : "";
                        const base =
                          lastDot !== -1 ? name.slice(0, lastDot) : name;
                        return base.length > 10
                          ? base.slice(0, 10) + "..." + ext
                          : name;
                      })()}
                    </p>
                    <p
                      style={{
                        margin: "3px 0 0",
                        fontSize: 16,
                        color: "#6c757d",
                      }}
                    >
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    style={{
                      padding: "5px 14px",
                      borderRadius: 6,
                      border: "1.5px solid #fca5a5",
                      background: "#fff1f2",
                      color: "#ef4444",
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Xóa file
                  </button>
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "#ede9fe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconUpload size={24} color="#3d3a8c" />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <button
                      style={{
                        padding: "7px 18px",
                        borderRadius: 8,
                        border: "none",
                        background: "#3d3a8c",
                        color: "#fff",
                        fontSize: 16,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                      }}
                    >
                      <IconUpload size={14} color="#fff" /> Tải tệp lên
                    </button>
                    <p
                      style={{
                        margin: "7px 0 0",
                        fontSize: 16,
                        color: "#adb5bd",
                      }}
                    >
                      File nhỏ hơn 30.000 ký tự và 2Mb
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* File mẫu */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                {
                  href: "/src/assets/excel.xlsx",
                  label: "File mẫu Excel",
                  sub: ".xlsx template",
                  IconFile: IconExcel,
                  bg: "#e8f5ee",
                  dlColor: "#217346",
                },
                {
                  href: "/src/assets/word.docx",
                  label: "File mẫu Word",
                  sub: ".docx template",
                  IconFile: IconWord,
                  bg: "#e8eef8",
                  dlColor: "#2B579A",
                },
              ].map(({ href, label, sub, IconFile: FileIcon, bg, dlColor }) => (
                <a
                  key={label}
                  href={href}
                  download
                  style={{
                    flex: 1,
                    minWidth: 160,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e9ecef",
                    background: "#fff",
                    textDecoration: "none",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#c5c3e8";
                    e.currentTarget.style.background = "#f8f7ff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e9ecef";
                    e.currentTarget.style.background = "#fff";
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FileIcon size={24} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#212529",
                      }}
                    >
                      {label}
                    </p>
                    <p
                      style={{
                        margin: "1px 0 0",
                        fontSize: 16,
                        color: "#adb5bd",
                      }}
                    >
                      {sub}
                    </p>
                  </div>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      background: bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <IconDownload size={14} color={dlColor} />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1.5px solid #ede9fe",
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              background: "#f8f7ff",
              flexShrink: 0,
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "7px 18px",
                borderRadius: 8,
                border: "1.5px solid #e9ecef",
                background: "#fff",
                color: "#6c757d",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Hủy
            </button>
            <button
              disabled={loading || !selectedFile}
              onClick={handleImport}
              style={{
                padding: "7px 22px",
                borderRadius: 8,
                border: "none",
                background: loading || !selectedFile ? "#a5a3d0" : "#3d3a8c",
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                cursor: loading || !selectedFile ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "background 0.15s",
              }}
            >
              {loading && (
                <div
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,0.35)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
              )}
              {loading ? "Đang xử lý..." : "Import"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ── QuestionForm ───────────────────────────────────────────────────────────
const QuestionForm = React.forwardRef(
  (
    { form, index, total, onChange, onRemove, externalErrors, onClearError },
    ref,
  ) => {
    const [openMedia, setOpenMedia] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const optionRefs = useRef([]);
    const answerRefs = useRef([]);
    const contentRef = useRef(null);

    const errors = externalErrors || {};
    const hasAnyError = Object.keys(errors).length > 0;
    const set = (patch) => onChange({ ...form, ...patch });

    // Auto-resize on mount
    useEffect(() => {
      resizeTextarea(contentRef.current);
    }, [form.content]);

    useEffect(() => {
      optionRefs.current.forEach((el) => resizeTextarea(el));
      answerRefs.current.forEach((el) => resizeTextarea(el));
    }, []);

    useEffect(() => {
      optionRefs.current.forEach((el) => resizeTextarea(el));
    }, [form.options, form.questionType]);

    useEffect(() => {
      answerRefs.current.forEach((el) => resizeTextarea(el));
    }, [form.correctAnswers, form.questionType]);

    const handleTypeChange = (newType) => {
      const patch = { questionType: newType };
      if (newType === "SHORT_ANSWER") patch.options = [];
      else if (newType === "SINGLE_CHOICE") {
        patch.options = form.options.map((o, i) => ({
          ...o,
          isCorrect: i === 0,
        }));
        patch.correctAnswers = [];
      } else patch.correctAnswers = [];
      set(patch);
      onClearError(index, null);
    };

    const addOption = () => {
      if (form.options.length >= 10) return;
      set({ options: [...form.options, { optionText: "", isCorrect: false }] });
    };
    const removeOption = (idx) =>
      set({ options: form.options.filter((_, i) => i !== idx) });
    const updateOptionText = (idx, text) => {
      set({
        options: form.options.map((o, i) =>
          i === idx ? { ...o, optionText: text } : o,
        ),
      });
      onClearError(index, "options");
    };
    const toggleCorrect = (idx) => {
      if (form.questionType === "SINGLE_CHOICE")
        set({
          options: form.options.map((o, i) => ({ ...o, isCorrect: i === idx })),
        });
      else
        set({
          options: form.options.map((o, i) =>
            i === idx ? { ...o, isCorrect: !o.isCorrect } : o,
          ),
        });
      onClearError(index, "options");
    };
    const addAnswer = () =>
      set({ correctAnswers: [...form.correctAnswers, { answer: "" }] });
    const removeAnswer = (idx) =>
      set({ correctAnswers: form.correctAnswers.filter((_, i) => i !== idx) });
    const updateAnswer = (idx, text) => {
      set({
        correctAnswers: form.correctAnswers.map((a, i) =>
          i === idx ? { ...a, answer: text } : a,
        ),
      });
      onClearError(index, "correctAnswers");
    };

    const correctColors = { border: "#bbf7d0", bg: "#f0fdf4", text: "#15803d" };

    return (
      <>
        {showCategoryModal && (
          <CategorySearch
            value={form.category}
            onConfirm={(sel) => {
              set({ category: sel });
              setShowCategoryModal(false);
            }}
            onClose={() => setShowCategoryModal(false)}
          />
        )}
        {showGroupModal && (
          <GroupSearch
            value={form.group}
            onConfirm={(sel) => {
              set({ group: sel });
              setShowGroupModal(false);
            }}
            onClose={() => setShowGroupModal(false)}
          />
        )}
        {openMedia && (
          <Media
            show={openMedia}
            onClose={() => setOpenMedia(false)}
            onSelect={(file) => {
              set({
                mediaUrl: file.fileUrl,
                mediaType: file.mediaType,
                mediaObjectKey: file.objectKey,
              });
              onClearError(index, "content");
              setOpenMedia(false);
            }}
          />
        )}

        <div
          ref={ref}
          style={{
            background: "#fff",
            borderRadius: 14,
            border: `1.5px solid ${hasAnyError ? "#fca5a5" : "#ede9fe"}`,
            overflow: "hidden",
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: hasAnyError ? "0 0 0 3px rgba(239,68,68,0.10)" : "none",
          }}
        >
          {/* Card header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 18px",
              background: hasAnyError ? "#fff5f5" : "#f8f7ff",
              borderBottom: `1.5px solid ${hasAnyError ? "#fca5a5" : "#ede9fe"}`,
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: hasAnyError ? "#dc2626" : "#3d3a8c",
              }}
            >
              Câu hỏi {index + 1}
            </span>
            {total > 1 && (
              <button
                onClick={onRemove}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  border: "none",
                  background: "#fff1f2",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconTrash size={14} color="#ef4444" />
              </button>
            )}
          </div>

          <div
            style={{
              padding: "14px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Category / Group / Type */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {/* Category */}
              <div
                onClick={() => setShowCategoryModal(true)}
                style={{
                  flex: 1,
                  minWidth: 150,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  border: `1.5px solid ${form.category ? "#c5c3e8" : "#e9ecef"}`,
                  background: form.category ? "#f5f4ff" : "#fff",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!form.category) {
                    e.currentTarget.style.borderColor = "#c5c3e8";
                    e.currentTarget.style.background = "#f5f4ff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!form.category) {
                    e.currentTarget.style.borderColor = "#e9ecef";
                    e.currentTarget.style.background = "#fff";
                  }
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: form.category ? "#3d3a8c" : "#adb5bd",
                    fontWeight: form.category ? 500 : 400,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {form.category?.name || "Chọn danh mục"}
                </span>
                {form.category ? (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      set({ category: null });
                    }}
                    style={{ display: "flex", cursor: "pointer" }}
                  >
                    <IconX size={14} color="#6c757d" />
                  </span>
                ) : (
                  <IconChevron size={14} />
                )}
              </div>

              {/* Group */}
              <div
                onClick={() => setShowGroupModal(true)}
                style={{
                  flex: 1,
                  minWidth: 150,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  border: `1.5px solid ${form.group ? "#c5c3e8" : "#e9ecef"}`,
                  background: form.group ? "#f5f4ff" : "#fff",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!form.group) {
                    e.currentTarget.style.borderColor = "#c5c3e8";
                    e.currentTarget.style.background = "#f5f4ff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!form.group) {
                    e.currentTarget.style.borderColor = "#e9ecef";
                    e.currentTarget.style.background = "#fff";
                  }
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: form.group ? "#3d3a8c" : "#adb5bd",
                    fontWeight: form.group ? 500 : 400,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {form.group?.name || "Nhóm câu hỏi"}
                </span>
                {form.group ? (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      set({ group: null });
                    }}
                    style={{ display: "flex", cursor: "pointer" }}
                  >
                    <IconX size={14} color="#6c757d" />
                  </span>
                ) : (
                  <IconChevron size={14} />
                )}
              </div>

              {/* Type select */}
              <div style={{ flex: 1, minWidth: 150, position: "relative" }}>
                <select
                  value={form.questionType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  style={{
                    width: "100%",
                    height: "100%",
                    padding: "8px 30px 8px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #e9ecef",
                    background: "#fff",
                    fontSize: 16,
                    color: "#212529",
                    appearance: "none",
                    outline: "none",
                    cursor: "pointer",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#c5c3e8")}
                  onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <span
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#adb5bd"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Question content textarea — auto-resize, no word cut */}
            <div>
              {errors.content && (
                <span
                  style={{
                    fontSize: 14,
                    color: "#ef4444",
                    marginBottom: 5,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <IconAlert size={14} color="#ef4444" /> {errors.content}
                </span>
              )}
              <div style={{ position: "relative" }}>
                <textarea
                  ref={contentRef}
                  className="cq-input"
                  value={form.content}
                  onChange={(e) => {
                    set({ content: e.target.value });
                    onClearError(index, "content");
                    resizeTextarea(e.target);
                  }}
                  placeholder="Nhập nội dung câu hỏi..."
                  rows={2}
                  style={taStyle({
                    padding: "10px 40px 10px 12px",
                    border: `1.5px solid ${errors.content ? "#ef4444" : "#e9ecef"}`,
                    borderRadius: 8,
                    fontSize: 16,
                    color: "#212529",
                    background: errors.content ? "#fff5f5" : "#fff",
                    minHeight: 44,
                  })}
                  onFocus={(e) =>
                    (e.target.style.borderColor = errors.content
                      ? "#ef4444"
                      : "#3d3a8c")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.content
                      ? "#ef4444"
                      : "#e9ecef")
                  }
                />
                <button
                  onClick={() => setOpenMedia(true)}
                  title="Chọn media"
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 28,
                    height: 28,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 6,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f0effc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <IconImage
                    size={14}
                    color={form.mediaObjectKey ? "#3d3a8c" : "#adb5bd"}
                  />
                </button>
              </div>

              {/* Media preview */}
              {form.mediaUrl && form.mediaType && (
                <div style={{ position: "relative", marginTop: 8 }}>
                  <button
                    onClick={() =>
                      set({
                        mediaUrl: null,
                        mediaType: null,
                        mediaObjectKey: null,
                      })
                    }
                    style={{
                      position: "absolute",
                      top: -10,
                      right: -10,
                      zIndex: 2,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "#ef4444",
                      border: "2px solid #fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconX size={14} color="#fff" />
                  </button>
                  {form.mediaType === "IMAGE" && (
                    <div
                      style={{
                        borderRadius: 8,
                        overflow: "hidden",
                        border: "1.5px solid #e9ecef",
                        background: "#f8f9fa",
                      }}
                    >
                      <img
                        src={form.mediaUrl}
                        alt="media"
                        style={{
                          maxHeight: 200,
                          maxWidth: "100%",
                          objectFit: "contain",
                          display: "block",
                          margin: "0 auto",
                        }}
                      />
                    </div>
                  )}
                  {form.mediaType === "VIDEO" && (
                    <div
                      style={{
                        borderRadius: 8,
                        overflow: "hidden",
                        border: "1.5px solid #e9ecef",
                        background: "#000",
                      }}
                    >
                      <video
                        src={form.mediaUrl}
                        controls
                        style={{
                          width: "100%",
                          maxHeight: 240,
                          display: "block",
                        }}
                      />
                    </div>
                  )}
                  {form.mediaType === "AUDIO" && (
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1.5px solid #a5d8ff",
                        background: "#e8f4fd",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#1971c2"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                      </svg>
                      <audio
                        src={form.mediaUrl}
                        controls
                        style={{ flex: 1, height: 34 }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Single / Multiple choice options */}
            {(form.questionType === "SINGLE_CHOICE" ||
              form.questionType === "MULTIPLE_CHOICE") && (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {errors.options && (
                  <span
                    style={{
                      fontSize: 14,
                      color: "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <IconAlert size={14} color="#ef4444" /> {errors.options}
                  </span>
                )}
                {form.options.map((opt, idx) => {
                  const isMultiple = form.questionType === "MULTIPLE_CHOICE";
                  return (
                    <div
                      key={idx}
                      className="cq-opt"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        minWidth: 0,
                      }}
                    >
                      <button
                        onClick={() => toggleCorrect(idx)}
                        style={{
                          width: 24,
                          height: 24,
                          flexShrink: 0,
                          marginTop: 6,
                          borderRadius: isMultiple ? 5 : "50%",
                          border: `2px solid ${opt.isCorrect ? "#16a34a" : errors.options ? "#fca5a5" : "#d1d5db"}`,
                          background: opt.isCorrect ? "#16a34a" : "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s",
                        }}
                      >
                        {opt.isCorrect ? (
                          <IconCheck size={14} color="#fff" />
                        ) : (
                          <span
                            style={{
                              fontSize: 16,
                              fontWeight: 700,
                              color: "#9ca3af",
                            }}
                          >
                            {ALPHA[idx]}
                          </span>
                        )}
                      </button>

                      {/* ✅ Auto-resize textarea, không cắt giữa từ */}
                      <textarea
                        ref={(el) => (optionRefs.current[idx] = el)}
                        className="cq-input"
                        value={opt.optionText}
                        onChange={(e) => {
                          updateOptionText(idx, e.target.value);
                          resizeTextarea(e.target);
                        }}
                        placeholder={`Đáp án ${ALPHA[idx]}`}
                        rows={1}
                        style={taStyle({
                          flex: 1,
                          minWidth: 0,
                          width: 0,
                          padding: "6px 10px",
                          border: `1.5px solid ${opt.isCorrect ? correctColors.border : errors.options && !opt.optionText.trim() ? "#fca5a5" : "#e9ecef"}`,
                          background: opt.isCorrect
                            ? correctColors.bg
                            : errors.options && !opt.optionText.trim()
                              ? "#fff5f5"
                              : "#fff",
                          color: opt.isCorrect ? correctColors.text : "#212529",
                          fontSize: 16,
                          minHeight: 36,
                        })}
                        onFocus={(e) =>
                          (e.target.style.borderColor = opt.isCorrect
                            ? "#16a34a"
                            : "#3d3a8c")
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = opt.isCorrect
                            ? correctColors.border
                            : errors.options && !opt.optionText.trim()
                              ? "#fca5a5"
                              : "#e9ecef")
                        }
                      />

                      <button
                        className="cq-opt-remove"
                        onClick={() => removeOption(idx)}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          border: "none",
                          background: "#fff1f2",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: 0,
                          transition: "opacity 0.15s",
                          flexShrink: 0,
                          marginTop: 5,
                        }}
                      >
                        <IconTrash size={14} color="#ef4444" />
                      </button>
                    </div>
                  );
                })}
                {form.options.length < 10 && (
                  <button
                    onClick={addOption}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      alignSelf: "flex-start",
                      padding: "5px 12px",
                      borderRadius: 6,
                      border: "1.5px dashed #c5c3e8",
                      background: "#faf9ff",
                      color: "#3d3a8c",
                      fontSize: 16,
                      cursor: "pointer",
                      fontWeight: 500,
                      marginTop: 2,
                    }}
                  >
                    <IconPlus size={14} /> Thêm đáp án
                  </button>
                )}
              </div>
            )}

            {/* Short answer */}
            {form.questionType === "SHORT_ANSWER" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {errors.correctAnswers && (
                  <span
                    style={{
                      fontSize: 14,
                      color: "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <IconAlert size={14} color="#ef4444" />{" "}
                    {errors.correctAnswers}
                  </span>
                )}
                {form.correctAnswers.map((ans, idx) => (
                  <div
                    key={idx}
                    className="cq-opt"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        flexShrink: 0,
                        marginTop: 6,
                        background: "#16a34a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconCheck size={14} color="#fff" />
                    </div>

                    {/* ✅ Auto-resize textarea, không cắt giữa từ */}
                    <textarea
                      ref={(el) => (answerRefs.current[idx] = el)}
                      className="cq-input"
                      value={ans.answer}
                      onChange={(e) => {
                        updateAnswer(idx, e.target.value);
                        resizeTextarea(e.target);
                      }}
                      placeholder={`Đáp án ${idx + 1}`}
                      rows={1}
                      style={taStyle({
                        flex: 1,
                        minWidth: 0,
                        width: 0,
                        padding: "6px 10px",
                        border: `1.5px solid ${errors.correctAnswers && !ans.answer.trim() ? "#fca5a5" : correctColors.border}`,
                        background:
                          errors.correctAnswers && !ans.answer.trim()
                            ? "#fff5f5"
                            : correctColors.bg,
                        color: correctColors.text,
                        fontSize: 16,
                        minHeight: 36,
                      })}
                      onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
                      onBlur={(e) =>
                        (e.target.style.borderColor =
                          errors.correctAnswers && !ans.answer.trim()
                            ? "#fca5a5"
                            : correctColors.border)
                      }
                    />

                    <button
                      className="cq-opt-remove"
                      onClick={() => removeAnswer(idx)}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 6,
                        border: "none",
                        background: "#fff1f2",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0,
                        transition: "opacity 0.15s",
                        flexShrink: 0,
                        marginTop: 5,
                      }}
                    >
                      <IconTrash size={14} color="#ef4444" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addAnswer}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    alignSelf: "flex-start",
                    padding: "5px 12px",
                    borderRadius: 6,
                    border: "1.5px dashed #bbf7d0",
                    background: "#f0fdf4",
                    color: "#16a34a",
                    fontSize: 16,
                    cursor: "pointer",
                    fontWeight: 500,
                    marginTop: 2,
                  }}
                >
                  <IconPlus size={14} color="#16a34a" /> Thêm đáp án
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  },
);

// ── Main Component ─────────────────────────────────────────────────────────
const CreateQuestion = ({ onClose, onSuccess }) => {
  const [forms, setForms] = useState([defaultForm()]);
  const [loading, setLoading] = useState(false);
  const [allErrors, setAllErrors] = useState({});
  const [showImportModal, setShowImportModal] = useState(false);
  const formRefs = useRef([]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  useEffect(() => {
    formRefs.current = formRefs.current.slice(0, forms.length);
  }, [forms.length]);

  const updateForm = (idx, newForm) =>
    setForms((prev) => prev.map((f, i) => (i === idx ? newForm : f)));
  const addQuestion = () => setForms((prev) => [...prev, defaultForm()]);
  const removeQuestion = (idx) => {
    setForms((prev) => prev.filter((_, i) => i !== idx));
    setAllErrors((prev) => {
      const next = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = Number(k);
        if (ki < idx) next[ki] = v;
        else if (ki > idx) next[ki - 1] = v;
      });
      return next;
    });
  };

  const clearError = (formIdx, field) => {
    setAllErrors((prev) => {
      if (!prev[formIdx]) return prev;
      if (field === null) {
        const next = { ...prev };
        delete next[formIdx];
        return next;
      }
      const updatedForm = { ...prev[formIdx] };
      delete updatedForm[field];
      if (Object.keys(updatedForm).length === 0) {
        const next = { ...prev };
        delete next[formIdx];
        return next;
      }
      return { ...prev, [formIdx]: updatedForm };
    });
  };

  const handleSubmit = async () => {
    const newErrors = {};
    forms.forEach((form, idx) => {
      const errs = validateForm(form);
      if (Object.keys(errs).length > 0) newErrors[idx] = errs;
    });
    if (Object.keys(newErrors).length > 0) {
      setAllErrors(newErrors);
      const firstErrIdx = Math.min(...Object.keys(newErrors).map(Number));
      formRefs.current[firstErrIdx]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }
    const payload = forms.map((form) => ({
      content: form.content,
      questionType: form.questionType,
      options:
        form.questionType !== "SHORT_ANSWER"
          ? form.options.map((o) => ({
              optionText: o.optionText,
              isCorrect: o.isCorrect,
            }))
          : [],
      correctAnswers:
        form.questionType === "SHORT_ANSWER"
          ? form.correctAnswers.map((a) => ({ answer: a.answer }))
          : [],
      categoryQuestionId: form.category?.id ?? null,
      groupQuestionId: form.group?.id ?? null,
      mediaObjectKey: form.mediaObjectKey || null,
      mediaType: form.mediaType || null,
    }));
    setLoading(true);
    try {
      await createQuestions(payload);
      toast.success("Tạo câu hỏi thành công!");
      onSuccess?.();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Tạo câu hỏi thất bại!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .cq-opt:hover .cq-opt-remove { opacity: 1 !important; }
        .cq-input:focus { outline: none; border-color: #3d3a8c !important; box-shadow: 0 0 0 3px rgba(61,58,140,0.12) !important; }
        @media (max-width: 750px) { .cq-topbar-title { display: none !important; } }
      `}</style>

      {showImportModal && (
        <ImportFileModal
          onClose={() => setShowImportModal(false)}
          onSuccess={(questions, cat, grp) => {
            const newForms = questions.map((q) => ({
              content: q.content ?? "",
              questionType: q.questionType ?? "SINGLE_CHOICE",
              options: (q.options || []).map((o) => ({
                optionText: o.optionText,
                isCorrect: o.isCorrect,
              })),
              correctAnswers: (q.correctAnswers || []).map((a) => ({
                answer: a.answer,
              })),
              category: cat ?? null,
              group: grp ?? null,
              mediaUrl: q.mediaUrl ?? null,
              mediaType: q.mediaType ?? null,
              mediaObjectKey: q.mediaObjectKey ?? null,
            }));
            setForms((prev) => [...prev, ...newForms]);
            setShowImportModal(false);
          }}
        />
      )}

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1100,
          background: "rgba(15,23,42,0.55)",
          display: "flex",
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#f8f7ff",
            display: "flex",
            flexDirection: "column",
            animation: "slideUp 0.28s cubic-bezier(.4,0,.2,1)",
            overflow: "hidden",
          }}
        >
          {/* Top bar */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              padding: "0 24px",
              height: 56,
              background: "#fff",
              borderBottom: "1.5px solid #ede9fe",
              flexShrink: 0,
            }}
          >
            <div
              className="cq-topbar-title"
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 17, color: "#0f172a" }}>
                Tạo câu hỏi
              </span>
            </div>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <button
                onClick={() => setShowImportModal(true)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 8,
                  border: "1.5px solid #c5c3e8",
                  background: "#f5f4ff",
                  color: "#3d3a8c",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#ede9fe";
                  e.currentTarget.style.borderColor = "#3d3a8c";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f5f4ff";
                  e.currentTarget.style.borderColor = "#c5c3e8";
                }}
              >
                <IconUpload size={14} color="#3d3a8c" /> Import file
              </button>
              <button
                disabled={loading}
                onClick={handleSubmit}
                style={{
                  padding: "7px 22px",
                  borderRadius: 8,
                  border: "none",
                  background: loading ? "#a5a3d0" : "#3d3a8c",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "background 0.15s",
                }}
              >
                {loading && (
                  <div
                    style={{
                      width: 15,
                      height: 15,
                      border: "2px solid rgba(255,255,255,0.35)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                )}
                Lưu
              </button>
              <button
                onClick={onClose}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  border: "1.5px solid #e9ecef",
                  background: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconX size={14} color="#6c757d" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 0" }}>
            <div
              style={{
                maxWidth: 760,
                margin: "0 auto",
                padding: "0 20px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {forms.map((form, idx) => (
                <QuestionForm
                  key={idx}
                  ref={(el) => (formRefs.current[idx] = el)}
                  form={form}
                  index={idx}
                  total={forms.length}
                  onChange={(newForm) => updateForm(idx, newForm)}
                  onRemove={() => removeQuestion(idx)}
                  externalErrors={allErrors[idx] || null}
                  onClearError={clearError}
                />
              ))}
              <button
                onClick={addQuestion}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px",
                  borderRadius: 12,
                  border: "2px dashed #c5c3e8",
                  background: "#faf9ff",
                  color: "#3d3a8c",
                  fontSize: 16,
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#3d3a8c";
                  e.currentTarget.style.background = "#f0effc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#c5c3e8";
                  e.currentTarget.style.background = "#faf9ff";
                }}
              >
                <IconPlus size={14} /> Thêm câu hỏi
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateQuestion;
