import React, { useState, useEffect, useRef } from "react";
import Media from "./Media";
import ClassSearch from "../../component/ClassSearch";
import { createExam } from "../../service/quiz.service";
import { toast } from "react-toastify";
import CategorySearch from "../../component/CategorySearch";
import GroupSearch from "../../component/GroupSearch";
import {
  importQuestions,
  generateQuestionFromAI,
} from "../../service/question.service";

// ─── Constants ───────────────────────────────────────────────────────────────
const ALPHA = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

const QUESTION_TYPES = [
  { value: "SINGLE_CHOICE", label: "Chọn 1 đáp án" },
  { value: "MULTIPLE_CHOICE", label: "Chọn nhiều đáp án" },
  { value: "SHORT_ANSWER", label: "Trả lời ngắn" },
];

const QUIZ_STATUS_OPTIONS = [
  { value: "DRAFT", label: "Bản nháp" },
  { value: "PUBLISHED", label: "Công khai" },
];

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconX = ({ size = 16, color = "#6c757d" }) => (
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
const IconPlus = ({ size = 16, color = "#3d3a8c" }) => (
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
const IconTrash = ({ size = 16, color = "#ef4444" }) => (
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
const IconCheck = ({ size = 14, color = "#fff" }) => (
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
const IconAlert = ({ size = 14, color = "#ef4444" }) => (
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
const IconSave = ({ size = 17, color = "#fff" }) => (
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
const IconInfo = ({ size = 17, color = "#3d3a8c" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
const IconList = ({ size = 17, color = "#3d3a8c" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const IconImage = ({ size = 16, color = "currentColor" }) => (
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
const IconCopy = ({ size = 16, color = "currentColor" }) => (
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
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);
const IconClock = ({ size = 22, color = "#3d3a8c" }) => (
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
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconCalendar = ({ size = 22, color = "#16a34a" }) => (
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
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <polyline points="9 16 11 18 15 14" />
  </svg>
);

// ─── Icons bổ sung (copy từ CreateQuestion nếu chưa có) ───────────────────
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

// ─── ImportQuizModal (không có danh mục/nhóm) ────────────────────────────
const ImportQuizModal = ({ onClose, onSuccess }) => {
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
      onSuccess(res.data);
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

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1180,
        background: "rgba(15,23,42,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
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
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderBottom: "1.5px solid #ede9fe",
            background: "#f8f7ff",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: "#3d3a8c" }}>
            Import câu hỏi từ file
          </span>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: "1.5px solid #e9ecef",
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconX size={14} />
          </button>
        </div>

        {/* Body */}
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
              padding: "28px 16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              cursor: selectedFile ? "default" : "pointer",
              transition: "all 0.2s",
              minHeight: 140,
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
                    height: 40,
                    borderRadius: 12,
                    background: isExcel ? "#e8f5ee" : "#e8eef8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isExcel ? <IconExcel size={26} /> : <IconWord size={26} />}
                </div>
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 15,
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
                      return base.length > 20
                        ? base.slice(0, 20) + "..." + ext
                        : name;
                    })()}
                  </p>
                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: 14,
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
                    fontSize: 14,
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
                  <IconUpload size={22} color="#3d3a8c" />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#3d3a8c",
                    }}
                  >
                    Kéo thả hoặc{" "}
                    <span style={{ textDecoration: "underline" }}>
                      chọn file
                    </span>
                  </p>
                  <p
                    style={{
                      margin: "5px 0 0",
                      fontSize: 13,
                      color: "#adb5bd",
                    }}
                  >
                    .xlsx · .xls · .doc · .docx — tối đa 2MB
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
            ].map(({ href, label, sub, IconFile, bg, dlColor }) => (
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
                  <IconFile size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#212529",
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      margin: "1px 0 0",
                      fontSize: 13,
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
                  <IconDownload size={13} color={dlColor} />
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
              fontSize: 15,
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
              fontSize: 15,
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
  );
};

// ─── Textarea helpers ─────────────────────────────────────────────────────────
const taStyle = (overrides = {}) => ({
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  fontSize: 16,
  fontFamily: "inherit",
  lineHeight: "1.6",
  resize: "none",
  overflow: "hidden",
  boxSizing: "border-box",
  outline: "none",
  transition: "border-color 0.15s, background 0.15s",
  overflowWrap: "break-word",
  wordBreak: "normal",
  ...overrides,
});

const resizeTextarea = (el) => {
  if (!el) return;
  el.style.height = "0px";
  el.style.height = el.scrollHeight + "px";
};

// ─── Default state ────────────────────────────────────────────────────────────
const defaultMeta = () => ({
  title: "",
  description: "",
  totalScore: "10",
  durationMinutes: "60",
  maxAttempts: 1,
  startTime: "",
  endTime: "",
  allowReview: false,
  quizStatus: "DRAFT",
  autoScore: true,
  isRandom: false,
  isPublic: true,
  classId: [],
  enableDuration: true,
  enableTimeLimit: false,
});

const defaultConfig = () => ({
  category: null,
  group: null,
  quantity: 1,
});

const defaultQuestion = () => ({
  content: "",
  questionType: "SINGLE_CHOICE",
  score: "",
  mediaUrl: null,
  mediaType: null,
  mediaObjectKey: null,
  options: [
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
  ],
  correctAnswers: [],
});

// ─── Validation ───────────────────────────────────────────────────────────────
const validateMeta = (meta) => {
  const errs = {};
  if (!meta.title.trim()) errs.title = "Tiêu đề không được để trống.";
  if (!meta.totalScore || Number(meta.totalScore) <= 0)
    errs.totalScore = "Tổng điểm phải lớn hơn 0.";
  if (!meta.maxAttempts || Number(meta.maxAttempts) < 1)
    errs.maxAttempts = "Số lần làm tối thiểu là 1.";
  if (
    meta.enableDuration &&
    (!meta.durationMinutes || Number(meta.durationMinutes) < 1)
  )
    errs.durationMinutes = "Thời gian phải lớn hơn 0 phút.";
  if (!meta.isPublic && meta.classId.length === 0)
    errs.classId = "Vui lòng thêm ít nhất 1 lớp.";
  if (meta.enableTimeLimit) {
    if (!meta.startTime && !meta.endTime) {
      errs.startTime = "Vui lòng cài đặt thời gian.";
    } else {
      if (meta.endTime && new Date(meta.endTime) <= new Date())
        errs.endTime = "Thời gian kết thúc phải sau thời điểm hiện tại.";
      if (
        meta.startTime &&
        meta.endTime &&
        new Date(meta.endTime) <= new Date(meta.startTime)
      )
        errs.endTime = "Thời gian kết thúc phải sau thời gian bắt đầu.";
    }
  }
  return errs;
};

const validateQuestion = (form) => {
  const errs = {};
  if (!form.content.trim() && !(form.mediaObjectKey || form.mediaType))
    errs.content = "Vui lòng nhập nội dung hoặc chọn media.";
  if (form.questionType !== "SHORT_ANSWER") {
    if (form.options.length < 2) {
      errs.options = "Cần ít nhất 2 đáp án.";
    } else if (form.options.some((o) => !o.optionText.trim())) {
      errs.options = "Đáp án không được để trống.";
    } else if (!form.options.some((o) => o.isCorrect)) {
      errs.options = "Chọn ít nhất 1 đáp án đúng.";
    } else {
      const texts = form.options.map((o) => o.optionText.trim().toLowerCase());
      const hasDuplicate = texts.some((t, i) => texts.indexOf(t) !== i);
      if (hasDuplicate) errs.options = "Các đáp án không được trùng nhau.";
    }
  } else {
    if (form.correctAnswers.length === 0) {
      errs.correctAnswers = "Cần ít nhất 1 đáp án chấp nhận.";
    } else if (form.correctAnswers.some((a) => !a.answer.trim())) {
      errs.correctAnswers = "Đáp án không được để trống.";
    } else {
      const texts = form.correctAnswers.map((a) =>
        a.answer.trim().toLowerCase(),
      );
      const hasDuplicate = texts.some((t, i) => texts.indexOf(t) !== i);
      if (hasDuplicate)
        errs.correctAnswers = "Các đáp án chấp nhận không được trùng nhau.";
    }
  }
  return errs;
};

const validateConfigs = (cfgs) => {
  const errs = {};
  cfgs.forEach((cfg, idx) => {
    if (!cfg.quantity || Number(cfg.quantity) < 1)
      errs[idx] = "Số lượng câu hỏi phải lớn hơn 0.";
  });
  return errs;
};

// ─── Shared UI ────────────────────────────────────────────────────────────────
const Field = ({ label, required, error, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label style={{ fontSize: 16, fontWeight: 600, color: "#374151" }}>
      {label}
      {required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {error && (
      <span
        style={{
          fontSize: 14,
          color: "#ef4444",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <IconAlert size={14} /> {error}
      </span>
    )}
  </div>
);

// ─── Toggle pill ──────────────────────────────────────────────────────────────
const TogglePill = ({ checked, onChange, size = "md", disabled = false }) => {
  const w = size === "sm" ? 36 : 44;
  const h = size === "sm" ? 22 : 26;
  const d = size === "sm" ? 16 : 20;
  const onL = size === "sm" ? 17 : 21;
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
      style={{
        width: w,
        height: h,
        borderRadius: h / 2,
        background: checked ? (disabled ? "#a5a3d0" : "#3d3a8c") : "#d1d5db",
        position: "relative",
        transition: "background .2s",
        flexShrink: 0,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <div
        style={{
          width: d,
          height: d,
          borderRadius: "50%",
          background: "#fff",
          position: "absolute",
          top: (h - d) / 2,
          left: checked ? onL : 3,
          transition: "left .2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
        }}
      />
    </div>
  );
};

// ─── ClassSelector ────────────────────────────────────────────────────────────
const ClassSelector = ({ value, onChange, error, onClearError }) => {
  const [showModal, setShowModal] = useState(false);
  const removeClass = (id) => onChange(value.filter((c) => c.id !== id));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {(value.length > 0 || error) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          {value.length > 0 && (
            <span
              style={{
                fontSize: 15,
                color: "#6c757d",
                fontWeight: 500,
                marginTop: 4,
              }}
            >
              Danh sách lớp đã chọn
            </span>
          )}
          {error && (
            <span
              style={{
                fontSize: 14,
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginTop: 4,
              }}
            >
              <IconAlert size={14} /> {error}
            </span>
          )}
        </div>
      )}
      {value.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {value.map((cls) => (
            <div
              key={cls.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px 8px 13px",
                borderRadius: 8,
                border: "1.5px solid #e9ecef",
                background: "#fff",
                minWidth: 0,
              }}
            >
              <span
                title={cls.title}
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 16,
                  color: "#212529",
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {cls.title}
              </span>
              <button
                onClick={() => removeClass(cls.id)}
                title="Xóa lớp"
                style={{
                  flexShrink: 0,
                  width: 24,
                  height: 24,
                  borderRadius: 5,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#adb5bd",
                  transition: "background 0.15s, color 0.15s",
                  padding: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fff1f2";
                  e.currentTarget.style.color = "#ef4444";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#adb5bd";
                }}
              >
                <IconX size={13} color="currentColor" />
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => setShowModal(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          alignSelf: "flex-start",
          padding: "7px 15px",
          borderRadius: 8,
          border: `1.5px dashed ${error ? "#fca5a5" : "#c5c3e8"}`,
          background: error ? "#fff5f5" : "#faf9ff",
          color: error ? "#dc2626" : "#3d3a8c",
          fontSize: 15,
          cursor: "pointer",
          fontWeight: 500,
          marginTop: 10,
        }}
      >
        <IconPlus size={14} color={error ? "#dc2626" : "#3d3a8c"} />
        Thêm lớp
      </button>
      {showModal && (
        <ClassSearch
          value={value}
          onConfirm={(selected) => {
            onChange(selected);
            if (onClearError) onClearError("classId");
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

// ─── ConfigCard (time/duration cards) ────────────────────────────────────────
const ConfigCard = ({
  icon,
  iconBg,
  title,
  description,
  checked,
  onToggle,
  children,
}) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 14,
      border: `1.5px solid ${checked ? "#c5c3e8" : "#e9ecef"}`,
      overflow: "hidden",
      transition: "border-color .15s",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        cursor: "pointer",
        userSelect: "none",
      }}
      onClick={() => onToggle(!checked)}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 11,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#212529" }}
        >
          {title}
        </p>
        <p style={{ margin: "3px 0 0", fontSize: 15, color: "#6c757d" }}>
          {description}
        </p>
      </div>
      <TogglePill checked={checked} onChange={onToggle} />
    </div>
    {checked && children && (
      <div
        style={{
          padding: "0 16px 14px",
          borderTop: "1px solid #f0effc",
          paddingTop: 12,
        }}
      >
        {children}
      </div>
    )}
  </div>
);

// ─── calcAutoScore ────────────────────────────────────────────────────────────
const calcAutoScore = (totalScore, count) => {
  if (!count || !totalScore) return 0;
  return Math.round((Number(totalScore) / count) * 100) / 100;
};

// ─── ConfigRow (random question config) ──────────────────────────────────────
const ConfigRow = ({ cfg, index, onChange, onRemove, error, isOnly }) => {
  const [showCategory, setShowCategory] = useState(false);
  const [showGroup, setShowGroup] = useState(false);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        border: `1.5px solid ${error ? "#fca5a5" : "#ede9fe"}`,
        overflow: "hidden",
        boxShadow: error ? "0 0 0 3px rgba(239,68,68,0.10)" : "none",
        transition: "border-color .2s, box-shadow .2s",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "11px 16px",
          background: error ? "#fff5f5" : "#f8f7ff",
          borderBottom: `1.5px solid ${error ? "#fca5a5" : "#ede9fe"}`,
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: error ? "#dc2626" : "#3d3a8c",
          }}
        >
          Cấu hình {index + 1}
        </span>
        {!isOnly && (
          <button
            onClick={onRemove}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "none",
              background: "#fff1f2",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#fecaca")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff1f2")}
          >
            <IconTrash size={14} />
          </button>
        )}
      </div>

      {/* Body */}
      <div
        style={{
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Category + Group buttons */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* Category */}
          <button
            onClick={() => setShowCategory(true)}
            style={{
              flex: 1,
              minWidth: 140,
              padding: "8px 12px",
              borderRadius: 8,
              border: `1.5px solid ${cfg.category ? "#c5c3e8" : "#e9ecef"}`,
              background: cfg.category ? "#f8f7ff" : "#fff",
              color: cfg.category ? "#3d3a8c" : "#adb5bd",
              fontSize: 15,
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 6,
              fontFamily: "inherit",
              transition: "border-color .15s, background .15s",
            }}
            onMouseEnter={(e) => {
              if (!cfg.category) e.currentTarget.style.borderColor = "#c5c3e8";
            }}
            onMouseLeave={(e) => {
              if (!cfg.category) e.currentTarget.style.borderColor = "#e9ecef";
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {cfg.category ? cfg.category.name : "Danh mục (tùy chọn)"}
            </span>
            {cfg.category ? (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ ...cfg, category: null });
                }}
                style={{ flexShrink: 0, display: "flex", alignItems: "center" }}
              >
                <IconX size={13} color="#6c757d" />
              </span>
            ) : (
              <IconPlus size={13} />
            )}
          </button>

          {/* Group */}
          <button
            onClick={() => setShowGroup(true)}
            style={{
              flex: 1,
              minWidth: 140,
              padding: "8px 12px",
              borderRadius: 8,
              border: `1.5px solid ${cfg.group ? "#c5c3e8" : "#e9ecef"}`,
              background: cfg.group ? "#f8f7ff" : "#fff",
              color: cfg.group ? "#3d3a8c" : "#adb5bd",
              fontSize: 15,
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 6,
              fontFamily: "inherit",
              transition: "border-color .15s, background .15s",
            }}
            onMouseEnter={(e) => {
              if (!cfg.group) e.currentTarget.style.borderColor = "#c5c3e8";
            }}
            onMouseLeave={(e) => {
              if (!cfg.group) e.currentTarget.style.borderColor = "#e9ecef";
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {cfg.group ? cfg.group.name : "Nhóm (tùy chọn)"}
            </span>
            {cfg.group ? (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ ...cfg, group: null });
                }}
                style={{ flexShrink: 0, display: "flex", alignItems: "center" }}
              >
                <IconX size={13} color="#6c757d" />
              </span>
            ) : (
              <IconPlus size={13} />
            )}
          </button>
        </div>

        {/* Quantity */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 15,
              color: "#6c757d",
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            Số câu
          </span>
          <input
            type="number"
            min="1"
            step="1"
            value={cfg.quantity}
            onChange={(e) => onChange({ ...cfg, quantity: e.target.value })}
            style={{
              width: 76,
              padding: "6px 8px",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              textAlign: "center",
              border: `1.5px solid ${error ? "#fca5a5" : "#e9ecef"}`,
              background: error ? "#fff5f5" : "#fff",
              color: "#3d3a8c",
              outline: "none",
              fontFamily: "inherit",
              transition: "border-color .15s",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = error ? "#ef4444" : "#3d3a8c")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = error ? "#fca5a5" : "#e9ecef")
            }
          />
          {error && (
            <span
              style={{
                fontSize: 14,
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <IconAlert size={14} /> {error}
            </span>
          )}
        </div>
      </div>

      {showCategory && (
        <CategorySearch
          value={cfg.category}
          onConfirm={(cat) => {
            onChange({ ...cfg, category: cat });
            setShowCategory(false);
          }}
          onClose={() => setShowCategory(false)}
        />
      )}
      {showGroup && (
        <GroupSearch
          value={cfg.group}
          onConfirm={(grp) => {
            onChange({ ...cfg, group: grp });
            setShowGroup(false);
          }}
          onClose={() => setShowGroup(false)}
        />
      )}
    </div>
  );
};

// ─── QuestionForm ─────────────────────────────────────────────────────────────
const QuestionForm = React.forwardRef(
  (
    {
      form,
      index,
      onChange,
      onRemove,
      onDuplicate,
      externalErrors,
      onClearError,
      autoScore,
      autoScoreValue,
      isOnly,
    },
    ref,
  ) => {
    const [openMedia, setOpenMedia] = useState(false);
    const optionRefs = useRef([]);
    const answerRefs = useRef([]);
    const contentRef = useRef(null);
    const errors = externalErrors || {};
    const hasAnyError = Object.keys(errors).length > 0;
    const set = (patch) => onChange({ ...form, ...patch });

    useEffect(() => {
      resizeTextarea(contentRef.current);
    }, [form.content]);
    useEffect(() => {
      optionRefs.current.forEach((el) => resizeTextarea(el));
    }, [form.options, form.questionType]);
    useEffect(() => {
      answerRefs.current.forEach((el) => resizeTextarea(el));
    }, [form.correctAnswers, form.questionType]);

    const handleTypeChange = (newType) => {
      const patch = { questionType: newType };
      if (newType === "SHORT_ANSWER") {
        patch.options = [];
      } else if (newType === "SINGLE_CHOICE") {
        patch.options =
          form.options.length > 0
            ? form.options.map((o, i) => ({ ...o, isCorrect: i === 0 }))
            : [
                { optionText: "", isCorrect: true },
                { optionText: "", isCorrect: false },
              ];
        patch.correctAnswers = [];
      } else {
        patch.correctAnswers = [];
      }
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
      <div
        ref={ref}
        style={{
          background: "#fff",
          borderRadius: 14,
          border: `1.5px solid ${hasAnyError ? "#fca5a5" : "#ede9fe"}`,
          overflow: "hidden",
          transition: "border-color .2s, box-shadow .2s",
          boxShadow: hasAnyError ? "0 0 0 3px rgba(239,68,68,0.10)" : "none",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "11px 16px",
            flexWrap: "wrap",
            gap: 8,
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
          <div style={{ position: "relative" }}>
            <select
              value={form.questionType}
              onChange={(e) => handleTypeChange(e.target.value)}
              style={{
                padding: "6px 30px 6px 11px",
                borderRadius: 7,
                border: "1.5px solid #e9ecef",
                background: "#fff",
                fontSize: 15,
                color: "#212529",
                appearance: "none",
                outline: "none",
                cursor: "pointer",
              }}
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
                right: 9,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <svg
                width="12"
                height="12"
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

        {/* Body */}
        <div
          style={{
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div>
            {errors.content && (
              <span
                style={{
                  fontSize: 14,
                  color: "#ef4444",
                  marginBottom: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <IconAlert size={14} /> {errors.content}
              </span>
            )}
            <div style={{ position: "relative" }}>
              <textarea
                ref={contentRef}
                value={form.content}
                onChange={(e) => {
                  set({ content: e.target.value });
                  onClearError(index, "content");
                  resizeTextarea(e.target);
                }}
                placeholder="Nhập nội dung câu hỏi..."
                rows={2}
                style={taStyle({
                  border: `1.5px solid ${errors.content ? "#fca5a5" : "#e9ecef"}`,
                  background: errors.content ? "#fff5f5" : "#fff",
                  color: "#212529",
                  fontSize: 16,
                  minHeight: 46,
                  paddingRight: 40,
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
                  top: 9,
                  right: 9,
                  width: 26,
                  height: 26,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 6,
                  color: form.mediaObjectKey ? "#3d3a8c" : "#adb5bd",
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
                  size={16}
                  color={form.mediaObjectKey ? "#3d3a8c" : "#adb5bd"}
                />
              </button>
            </div>

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
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "#ef4444",
                    border: "2px solid #fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconX size={13} color="#fff" />
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
                    <audio
                      src={form.mediaUrl}
                      controls
                      style={{ flex: 1, height: 34, minWidth: 0 }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Single / Multiple choice */}
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
                  <IconAlert size={14} /> {errors.options}
                </span>
              )}
              {form.options.map((opt, idx) => {
                const isMultiple = form.questionType === "MULTIPLE_CHOICE";
                const isDuplicate =
                  opt.optionText.trim() !== "" &&
                  form.options.some(
                    (o, i) =>
                      i !== idx &&
                      o.optionText.trim().toLowerCase() ===
                        opt.optionText.trim().toLowerCase(),
                  );
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
                        width: 26,
                        height: 26,
                        flexShrink: 0,
                        marginTop: 6,
                        borderRadius: isMultiple ? 6 : "50%",
                        border: `2px solid ${opt.isCorrect ? "#16a34a" : errors.options ? "#fca5a5" : "#d1d5db"}`,
                        background: opt.isCorrect ? "#16a34a" : "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all .15s",
                      }}
                    >
                      {opt.isCorrect ? (
                        <IconCheck size={14} />
                      ) : (
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#9ca3af",
                          }}
                        >
                          {ALPHA[idx]}
                        </span>
                      )}
                    </button>
                    <textarea
                      ref={(el) => (optionRefs.current[idx] = el)}
                      value={opt.optionText}
                      onChange={(e) => {
                        updateOptionText(idx, e.target.value);
                        resizeTextarea(e.target);
                      }}
                      rows={1}
                      style={taStyle({
                        flex: 1,
                        minWidth: 0,
                        width: 0,
                        padding: "6px 10px",
                        border: `1.5px solid ${isDuplicate ? "#f97316" : opt.isCorrect ? correctColors.border : errors.options && !opt.optionText.trim() ? "#fca5a5" : "#e9ecef"}`,
                        background: isDuplicate
                          ? "#fff7ed"
                          : opt.isCorrect
                            ? correctColors.bg
                            : errors.options && !opt.optionText.trim()
                              ? "#fff5f5"
                              : "#fff",
                        color: isDuplicate
                          ? "#c2410c"
                          : opt.isCorrect
                            ? correctColors.text
                            : "#212529",
                        fontSize: 16,
                        minHeight: 38,
                      })}
                      onFocus={(e) =>
                        (e.target.style.borderColor = isDuplicate
                          ? "#f97316"
                          : opt.isCorrect
                            ? "#16a34a"
                            : "#3d3a8c")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = isDuplicate
                          ? "#f97316"
                          : opt.isCorrect
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
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border: "none",
                        background: "#fff1f2",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0,
                        transition: "opacity .15s",
                        flexShrink: 0,
                        marginTop: 5,
                      }}
                    >
                      <IconTrash size={15} />
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
                    padding: "5px 13px",
                    borderRadius: 6,
                    border: "1.5px dashed #c5c3e8",
                    background: "#faf9ff",
                    color: "#3d3a8c",
                    fontSize: 15,
                    cursor: "pointer",
                    fontWeight: 500,
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
                  <IconAlert size={14} /> {errors.correctAnswers}
                </span>
              )}
              {form.correctAnswers.map((ans, idx) => {
                const isDuplicate =
                  ans.answer.trim() !== "" &&
                  form.correctAnswers.some(
                    (a, i) =>
                      i !== idx &&
                      a.answer.trim().toLowerCase() ===
                        ans.answer.trim().toLowerCase(),
                  );
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
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        flexShrink: 0,
                        marginTop: 6,
                        background: "#16a34a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconCheck size={14} />
                    </div>
                    <textarea
                      ref={(el) => (answerRefs.current[idx] = el)}
                      value={ans.answer}
                      onChange={(e) => {
                        updateAnswer(idx, e.target.value);
                        resizeTextarea(e.target);
                      }}
                      placeholder={`Đáp án chấp nhận ${idx + 1}`}
                      rows={1}
                      style={taStyle({
                        flex: 1,
                        minWidth: 0,
                        width: 0,
                        padding: "6px 10px",
                        border: `1.5px solid ${isDuplicate ? "#f97316" : errors.correctAnswers && !ans.answer.trim() ? "#fca5a5" : correctColors.border}`,
                        background: isDuplicate
                          ? "#fff7ed"
                          : errors.correctAnswers && !ans.answer.trim()
                            ? "#fff5f5"
                            : correctColors.bg,
                        color: isDuplicate ? "#c2410c" : correctColors.text,
                        fontSize: 16,
                        minHeight: 38,
                      })}
                      onFocus={(e) =>
                        (e.target.style.borderColor = isDuplicate
                          ? "#f97316"
                          : "#16a34a")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = isDuplicate
                          ? "#f97316"
                          : errors.correctAnswers && !ans.answer.trim()
                            ? "#fca5a5"
                            : correctColors.border)
                      }
                    />
                    <button
                      className="cq-opt-remove"
                      onClick={() => removeAnswer(idx)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border: "none",
                        background: "#fff1f2",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0,
                        transition: "opacity .15s",
                        flexShrink: 0,
                        marginTop: 5,
                      }}
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>
                );
              })}
              <button
                onClick={addAnswer}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  alignSelf: "flex-start",
                  padding: "5px 13px",
                  borderRadius: 6,
                  border: "1.5px dashed #bbf7d0",
                  background: "#f0fdf4",
                  color: "#16a34a",
                  fontSize: 15,
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                <IconPlus size={14} color="#16a34a" /> Thêm đáp án
              </button>
            </div>
          )}
        </div>

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

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
            background: "#fafafa",
            borderTop: "1.5px solid #ede9fe",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 4,
            }}
          >
            {errors.score && (
              <span
                style={{
                  fontSize: 14,
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <IconAlert size={14} /> {errors.score}
              </span>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15, color: "#6c757d", fontWeight: 500 }}>
                Điểm
              </span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={autoScore ? (autoScoreValue ?? "") : (form.score ?? "")}
                disabled={autoScore}
                onChange={(e) => {
                  if (!autoScore) {
                    set({ score: e.target.value });
                    onClearError(index, "score");
                  }
                }}
                placeholder="0"
                style={{
                  width: 76,
                  padding: "6px 8px",
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  textAlign: "center",
                  border: "1.5px solid #e9ecef",
                  background: autoScore ? "#f3f4f6" : "#fff",
                  color: autoScore ? "#6c757d" : "#3d3a8c",
                  outline: "none",
                  fontFamily: "inherit",
                  cursor: autoScore ? "not-allowed" : "text",
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={onDuplicate}
              title="Nhân bản câu hỏi"
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: "1.5px solid #e9ecef",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6c757d",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#c5c3e8";
                e.currentTarget.style.background = "#f5f4ff";
                e.currentTarget.style.color = "#3d3a8c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e9ecef";
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.color = "#6c757d";
              }}
            >
              <IconCopy size={16} />
            </button>
            <button
              onClick={onRemove}
              title="Xóa câu hỏi"
              disabled={isOnly}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: "1.5px solid #e9ecef",
                background: "#fff",
                cursor: isOnly ? "not-allowed" : "pointer",
                display: isOnly ? "none" : "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6c757d",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#fca5a5";
                e.currentTarget.style.background = "#fff1f2";
                e.currentTarget.style.color = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e9ecef";
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.color = "#6c757d";
              }}
            >
              <IconTrash size={16} color="currentColor" />
            </button>
          </div>
        </div>
      </div>
    );
  },
);

// ─── AiQuestionModal ─────────────────────────────────────────────────────────
const AI_QUESTION_TYPES = [
  { value: "SINGLE_CHOICE", label: "Chọn 1 đáp án" },
  { value: "MULTIPLE_CHOICE", label: "Chọn nhiều đáp án" },
  { value: "SHORT_ANSWER", label: "Trả lời ngắn" },
];

const AiQuestionModal = ({ onClose, onSuccess }) => {
  const [tab, setTab] = useState("prompt");
  const [questionType, setQuestionType] = useState("SINGLE_CHOICE");
  const [quantity, setQuantity] = useState(5);
  const [requirement, setRequirement] = useState("");
  const [docRequirement, setDocRequirement] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const requirementRef = useRef(null);
  const docRequirementRef = useRef(null);

  const ACCEPTED_DOC = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/pdf",
    "text/plain",
  ];

  const handleFile = (file) => {
    if (!file) return;
    if (!ACCEPTED_DOC.includes(file.type)) {
      toast.error("Chỉ hỗ trợ file PDF, Word hoặc TXT!");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File không được vượt quá 10MB!");
      return;
    }
    setSelectedFile(file);
  };

  const handleGenerate = async () => {
    if (tab === "prompt" && !requirement.trim()) {
      toast.error("Vui lòng nhập nội dung hoặc yêu cầu!");
      return;
    }
    if (tab === "document" && !selectedFile) {
      toast.error("Vui lòng chọn file tài liệu!");
      return;
    }
    if (!quantity || Number(quantity) < 1) {
      toast.error("Số câu hỏi phải lớn hơn 0!");
      return;
    }
    setLoading(true);
    try {
      const res = await generateQuestionFromAI({
        file: tab === "document" ? selectedFile : null,
        quantity: Number(quantity),
        requirement:
          tab === "prompt" ? requirement.trim() : docRequirement.trim() || null,
        questionType,
      });
      onSuccess(res.data);
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

  const fileExt = selectedFile?.name?.split(".").pop()?.toLowerCase();
  const isPdf = fileExt === "pdf";
  const isWord = ["doc", "docx"].includes(fileExt);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1180,
        background: "rgba(15,23,42,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @media (max-width: 480px) {
          .ai-modal-wrap { border-radius: 12px !important; }
          .ai-modal-header { padding: 11px 13px !important; }
          .ai-modal-inner { padding: 14px 13px !important; gap: 12px !important; }
          .ai-modal-footer { padding: 10px 13px !important; }
          .ai-modal-row1 { flex-direction: column !important; align-items: stretch !important; gap: 8px !important; }
          .ai-tab-pills { width: 100% !important; }
          .ai-modal-qty { flex-direction: row !important; justify-content: space-between !important; align-items: center !important; background: #f8f7ff; border-radius: 8px; padding: 8px 10px; border: 1.5px solid #ede9fe; }
          .ai-type-pills { gap: 4px !important; }
          .ai-type-pill { padding: 5px 10px !important;  }
        }
      `}</style>

      <div
        className="ai-modal-wrap"
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
        {/* ── Header ── */}
        <div
          className="ai-modal-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderBottom: "1.5px solid #ede9fe",
            background: "#f8f7ff",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#d1fae5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#059669"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#065f46" }}>
              Tạo câu hỏi bằng AI
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: "1.5px solid #e9ecef",
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconX size={14} />
          </button>
        </div>

        {/* ── Body ── */}
        <div
          className="ai-modal-inner"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* ── Row 1: Tab + Số câu hỏi ── */}
          <div
            className="ai-modal-row1"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {/* Tab pills */}
            <div
              className="ai-tab-pills"
              style={{
                display: "flex",
                background: "#f0effc",
                borderRadius: 10,
                padding: 4,
                gap: 4,
                flex: 1,
              }}
            >
              {[
                { key: "prompt", label: "Prompt" },
                { key: "document", label: "Document" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  style={{
                    flex: 1,
                    padding: "7px 0",
                    borderRadius: 7,
                    border: "none",
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all .15s",
                    background: tab === key ? "#3d3a8c" : "transparent",
                    color: tab === key ? "#fff" : "#6c757d",
                    boxShadow:
                      tab === key ? "0 1px 4px rgba(61,58,140,0.2)" : "none",
                    fontFamily: "inherit",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Số câu hỏi */}
            <div
              className="ai-modal-qty"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#374151",
                  whiteSpace: "nowrap",
                }}
              >
                Số câu hỏi
              </span>
              <input
                type="number"
                min="1"
                max="50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{
                  width: 64,
                  padding: "7px 8px",
                  borderRadius: 8,
                  border: "1.5px solid #e9ecef",
                  fontSize: 16,
                  fontWeight: 700,
                  textAlign: "center",
                  color: "#3d3a8c",
                  outline: "none",
                  fontFamily: "inherit",
                  background: "#fff",
                  transition: "border-color .15s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3d3a8c")}
                onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
              />
            </div>
          </div>

          {/* ── Row 2: Loại câu hỏi ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <label style={{ fontSize: 16, fontWeight: 600, color: "#374151" }}>
              Loại câu hỏi
            </label>
            <div
              className="ai-type-pills"
              style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
            >
              {AI_QUESTION_TYPES.map((t) => (
                <button
                  key={t.value}
                  className="ai-type-pill"
                  onClick={() => setQuestionType(t.value)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    border: `1.5px solid ${questionType === t.value ? "#3d3a8c" : "#e9ecef"}`,
                    background: questionType === t.value ? "#3d3a8c" : "#fff",
                    color: questionType === t.value ? "#fff" : "#6c757d",
                    fontSize: 15,

                    cursor: "pointer",
                    transition: "all .15s",
                    whiteSpace: "nowrap",
                    fontFamily: "inherit",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Tab content ── */}
          {tab === "prompt" ? (
            /* ── Prompt tab ── */
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                style={{ fontSize: 16, fontWeight: 600, color: "#374151" }}
              >
                Mô tả yêu cầu
              </label>
              <div style={{ position: "relative" }}>
                <textarea
                  ref={requirementRef}
                  value={requirement}
                  maxLength={20000}
                  onChange={(e) => {
                    setRequirement(e.target.value);
                    resizeTextarea(e.target);
                  }}
                  placeholder="Nhập nội dung tài liệu hoặc yêu cầu tạo câu hỏi..."
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    paddingBottom: 30,
                    borderRadius: 10,
                    border: "1.5px solid #e9ecef",
                    fontSize: 16,
                    fontFamily: "inherit",
                    lineHeight: "1.6",
                    resize: "none",
                    outline: "none",
                    boxSizing: "border-box",
                    color: "#212529",
                    background: "#fafafa",
                    transition: "border-color .15s",
                    minHeight: 120,
                    overflowWrap: "break-word",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3d3a8c")}
                  onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: 9,
                    right: 11,
                    fontSize: 12,
                    color: requirement.length > 18000 ? "#ef4444" : "#adb5bd",
                    pointerEvents: "none",
                  }}
                >
                  {requirement.length}/20000
                </span>
              </div>
            </div>
          ) : (
            /* ── Document tab ── */
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFile(e.dataTransfer.files[0]);
                }}
                onClick={() => !selectedFile && fileInputRef.current?.click()}
                style={{
                  borderRadius: 12,
                  border: `2px dashed ${dragOver ? "#059669" : selectedFile ? "#6ee7b7" : "#d1d5db"}`,
                  background: dragOver
                    ? "#f0fdf4"
                    : selectedFile
                      ? "#f0fdf4"
                      : "#fafafa",
                  padding: "22px 16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  cursor: selectedFile ? "default" : "pointer",
                  transition: "all 0.2s",
                  minHeight: 110,
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  style={{ display: "none" }}
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                {selectedFile ? (
                  <>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: isPdf
                          ? "#fee2e2"
                          : isWord
                            ? "#e8eef8"
                            : "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isPdf ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 32 32"
                          fill="none"
                        >
                          <rect width="32" height="32" rx="4" fill="#dc2626" />
                          <text
                            x="4"
                            y="22"
                            fill="white"
                            fontSize="11"
                            fontWeight="bold"
                            fontFamily="Arial"
                          >
                            PDF
                          </text>
                        </svg>
                      ) : isWord ? (
                        <IconWord size={22} />
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#6c757d"
                          strokeWidth="2"
                        >
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      )}
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
                        {selectedFile.name.length > 34
                          ? selectedFile.name.slice(0, 31) + "..."
                          : selectedFile.name}
                      </p>
                      <p
                        style={{
                          margin: "3px 0 0",
                          fontSize: 14,
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
                        padding: "4px 13px",
                        borderRadius: 6,
                        border: "1.5px solid #fca5a5",
                        background: "#fff1f2",
                        color: "#ef4444",
                        fontSize: 16,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Xóa file
                    </button>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 11,
                        background: "#d1fae5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconUpload size={20} color="#059669" />
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 16,
                          fontWeight: 600,
                          color: "#065f46",
                        }}
                      >
                        Kéo thả hoặc{" "}
                        <span style={{ textDecoration: "underline" }}>
                          chọn file
                        </span>
                      </p>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: 14,
                          color: "#adb5bd",
                        }}
                      >
                        .pdf · .doc · .docx · .txt — tối đa 10MB
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Prompt bổ sung cho Document tab */}
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label
                  style={{ fontSize: 16, fontWeight: 600, color: "#374151" }}
                >
                  Mô tả yêu cầu
                </label>
                <div style={{ position: "relative" }}>
                  <textarea
                    ref={docRequirementRef}
                    value={docRequirement}
                    maxLength={2000}
                    onChange={(e) => {
                      setDocRequirement(e.target.value);
                      resizeTextarea(e.target);
                    }}
                    placeholder="Ví dụ: Tập trung vào chương 3, ưu tiên câu hỏi khó..."
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      paddingBottom: 28,
                      borderRadius: 10,
                      border: "1.5px solid #e9ecef",
                      fontSize: 16,
                      fontFamily: "inherit",
                      lineHeight: "1.6",
                      resize: "none",
                      outline: "none",
                      boxSizing: "border-box",
                      color: "#212529",
                      background: "#fafafa",
                      transition: "border-color .15s",
                      minHeight: 80,
                      overflowWrap: "break-word",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3d3a8c")}
                    onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                  />
                  <span
                    style={{
                      position: "absolute",
                      bottom: 8,
                      right: 11,
                      fontSize: 12,
                      color:
                        docRequirement.length > 1800 ? "#ef4444" : "#adb5bd",
                      pointerEvents: "none",
                    }}
                  >
                    {docRequirement.length}/2000
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          className="ai-modal-footer"
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
              fontFamily: "inherit",
            }}
          >
            Hủy
          </button>
          <button
            disabled={loading}
            onClick={handleGenerate}
            style={{
              padding: "7px 22px",
              borderRadius: 8,
              border: "none",
              background: loading ? "#6ee7b7" : "#059669",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "background 0.15s",
              fontFamily: "inherit",
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
            {loading ? "Đang tạo..." : "Tạo câu hỏi"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CreateQuiz = ({ onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [meta, setMeta] = useState(defaultMeta());
  const [metaErrors, setMetaErrors] = useState({});
  const [forms, setForms] = useState([defaultQuestion()]);
  const [allErrors, setAllErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState([defaultConfig()]);
  const [configErrors, setConfigErrors] = useState({});
  const formRefs = useRef([]);
  const pendingScrollRef = useRef(null);
  const metaErrorRef = useRef(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    formRefs.current = formRefs.current.slice(0, forms.length);
  }, [forms.length]);

  useEffect(() => {
    if (activeTab === "questions" && pendingScrollRef.current !== null) {
      const idx = pendingScrollRef.current;
      pendingScrollRef.current = null;
      requestAnimationFrame(() => {
        formRefs.current[idx]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }
  }, [activeTab, allErrors]);

  useEffect(() => {
    if (activeTab === "info" && Object.keys(metaErrors).length > 0) {
      requestAnimationFrame(() => {
        metaErrorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }
  }, [activeTab, metaErrors]);

  const setM = (patch) => setMeta((prev) => ({ ...prev, ...patch }));
  const updateForm = (idx, newForm) =>
    setForms((prev) => prev.map((f, i) => (i === idx ? newForm : f)));
  const addQuestion = () => setForms((prev) => [...prev, defaultQuestion()]);

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

  const duplicateQuestion = (idx) => {
    const copy = JSON.parse(JSON.stringify(forms[idx]));
    setForms((prev) => [
      ...prev.slice(0, idx + 1),
      copy,
      ...prev.slice(idx + 1),
    ]);
  };

  const clearError = (formIdx, field) => {
    if (field === "score") {
      setMetaErrors((p) => {
        const n = { ...p };
        delete n.scoreSumError;
        return n;
      });
    }
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

  const autoScoreValue = calcAutoScore(meta.totalScore, forms.length);

  const handleSubmit = async () => {
    // 1. Validate meta
    const mErrs = validateMeta(meta);
    if (Object.keys(mErrs).length > 0) {
      setMetaErrors(mErrs);
      setActiveTab("info");
      return;
    }

    if (meta.isRandom) {
      // 2a. Validate configs
      const cErrs = validateConfigs(configs);
      if (Object.keys(cErrs).length > 0) {
        setConfigErrors(cErrs);
        setActiveTab("questions");
        return;
      }
    } else {
      // 2b. Validate questions
      const qErrs = {};
      forms.forEach((form, idx) => {
        const errs = validateQuestion(form);
        if (Object.keys(errs).length > 0) qErrs[idx] = errs;
      });

      if (!meta.autoScore) {
        forms.forEach((form, idx) => {
          const scoreVal = Number(form.score);
          if (!form.score && form.score !== 0)
            qErrs[idx] = {
              ...(qErrs[idx] || {}),
              score: "Vui lòng nhập điểm.",
            };
          else if (isNaN(scoreVal) || scoreVal <= 0)
            qErrs[idx] = {
              ...(qErrs[idx] || {}),
              score: "Điểm phải lớn hơn 0.",
            };
        });

        const hasScoreErrors = Object.values(qErrs).some((e) => e.score);
        if (!hasScoreErrors) {
          const totalInput = forms.reduce(
            (sum, f) => sum + (Number(f.score) || 0),
            0,
          );
          const expected = Number(meta.totalScore);
          if (Math.round(totalInput * 100) !== Math.round(expected * 100)) {
            setMetaErrors((p) => ({
              ...p,
              scoreSumError:
                "Tổng điểm các câu phải bằng tổng điểm bài kiểm tra.",
            }));
            setAllErrors(qErrs);
            pendingScrollRef.current =
              Object.keys(qErrs).length > 0
                ? Math.min(...Object.keys(qErrs).map(Number))
                : 0;
            setActiveTab("questions");
            return;
          }
        }
      }

      if (Object.keys(qErrs).length > 0) {
        setAllErrors(qErrs);
        pendingScrollRef.current = Math.min(...Object.keys(qErrs).map(Number));
        setActiveTab("questions");
        return;
      }
    }

    // 3. Build payload
    const base = {
      title: meta.title.trim(),
      description: meta.description.trim() || null,
      totalScore: Number(meta.totalScore),
      durationMinutes: meta.enableDuration
        ? Number(meta.durationMinutes)
        : null,
      maxAttempts: Number(meta.maxAttempts),
      startTime: meta.enableTimeLimit ? meta.startTime || null : null,
      endTime: meta.enableTimeLimit ? meta.endTime || null : null,
      allowReview: meta.allowReview,
      quizStatus: meta.quizStatus,
      isRandom: meta.isRandom,
      autoScore: meta.isRandom ? true : meta.autoScore,
      quizAccessType: meta.isPublic ? "PUBLIC" : "PRIVATE",
      classId: meta.isPublic ? null : meta.classId.map((c) => c.id),
    };

    const payload = meta.isRandom
      ? {
          ...base,
          randomConfigs: configs.map((cfg) => ({
            categoryQuestionId: cfg.category?.id ?? null,
            groupQuestionId: cfg.group?.id ?? null,
            quantity: Number(cfg.quantity),
          })),
        }
      : {
          ...base,
          questions: forms.map((form) => ({
            content: form.content,
            questionType: form.questionType,
            score: meta.autoScore
              ? autoScoreValue
              : form.score
                ? Number(form.score)
                : null,
            mediaObjectKey: form.mediaObjectKey || null,
            mediaType: form.mediaType || null,
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
          })),
        };

    setLoading(true);
    try {
      await createExam(payload);
      onSuccess?.(payload);
      toast.success("Tạo bài kiểm tra thành công!");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const getNowLocal = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    return now.toISOString().slice(0, 16);
  };

  const inputSt = (errKey) => ({
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    fontSize: 16,
    fontFamily: "inherit",
    border: `1.5px solid ${errKey && metaErrors[errKey] ? "#fca5a5" : "#e9ecef"}`,
    background: errKey && metaErrors[errKey] ? "#fff5f5" : "#fff",
    color: "#212529",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color .15s",
  });

  const tabHasError = (tab) => {
    if (tab === "info") {
      const { scoreSumError, ...rest } = metaErrors;
      return Object.keys(rest).length > 0;
    }
    if (tab === "questions")
      return (
        Object.keys(allErrors).length > 0 ||
        !!metaErrors.scoreSumError ||
        Object.keys(configErrors).length > 0
      );
    return false;
  };

  const ERR_ORDER = [
    "title",
    "totalScore",
    "maxAttempts",
    "durationMinutes",
    "classId",
    "startTime",
    "endTime",
  ];
  const firstMetaErrKey = ERR_ORDER.find((k) => metaErrors[k]);

  return (
    <>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        .cq-opt:hover .cq-opt-remove { opacity:1 !important; }
        .exam-inp:focus { border-color:#3d3a8c !important; box-shadow:0 0 0 3px rgba(61,58,140,0.12) !important; }

        @media (max-width: 480px) {
          .ce-grid-3 { grid-template-columns: 1fr 1fr !important; }
          .ce-topbar { padding: 0 12px !important; }
          .ce-tab-label { display: none; }
          .ce-body-pad { padding: 0 12px !important; }
          .ce-card-body { padding: 12px 14px !important; }
          .ce-configcard-inner { padding: 12px 14px !important; }
          .ce-configcard-children { padding: 0 14px 12px !important; }
        }
        @media (max-width: 360px) {
          .ce-grid-3 { grid-template-columns: 1fr !important; }
          .ce-save-text { display: none; }
        }
        @media (max-width: 320px) {
          .ce-topbar { padding: 0 8px !important; gap: 4px !important; }
          .ce-body-pad { padding: 0 8px !important; }
        }
      `}</style>

      {showImportModal && (
        <ImportQuizModal
          onClose={() => setShowImportModal(false)}
          onSuccess={(questions) => {
            const newForms = questions.map((q) => ({
              content: q.content.trim() ?? "",
              questionType: q.questionType ?? "SINGLE_CHOICE",
              score: "",
              mediaUrl: q.mediaUrl ?? null,
              mediaType: q.mediaType ?? null,
              mediaObjectKey: q.mediaObjectKey ?? null,
              options: (q.options || []).map((o) => ({
                optionText: o.optionText.trim(),
                isCorrect: o.isCorrect,
              })),
              correctAnswers: (q.correctAnswers || []).map((a) => ({
                answer: a.answer,
              })),
            }));
            setForms((prev) => [...prev, ...newForms]);
            setShowImportModal(false);
            toast.success(`Đã import ${newForms.length} câu hỏi!`);
          }}
        />
      )}

      {showAiModal && (
        <AiQuestionModal
          onClose={() => setShowAiModal(false)}
          onSuccess={(questions) => {
            const newForms = questions.map((q) => ({
              content: q.content?.trim() ?? "",
              questionType: q.questionType ?? "SINGLE_CHOICE",
              score: "",
              mediaUrl: q.mediaUrl ?? null,
              mediaType: q.mediaType ?? null,
              mediaObjectKey: q.mediaObjectKey ?? null,
              options: (q.options || []).map((o) => ({
                optionText: o.optionText?.trim(),
                isCorrect: o.isCorrect,
              })),
              correctAnswers: (q.correctAnswers || []).map((a) => ({
                answer: a.answer,
              })),
            }));
            setForms((prev) => [...prev, ...newForms]);
            setShowAiModal(false);
            toast.success(`Đã tạo ${newForms.length} câu hỏi bằng AI!`);
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
          {/* ── Top bar ── */}
          <div
            className="ce-topbar"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              padding: "0 20px",
              height: 58,
              background: "#fff",
              borderBottom: "1.5px solid #ede9fe",
              flexShrink: 0,
              gap: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 4,
                padding: "4px",
                background: "#f0effc",
                borderRadius: 10,
              }}
            >
              {[
                { key: "info", label: "Thông tin", Icon: IconInfo },
                { key: "questions", label: "Câu hỏi", Icon: IconList },
              ].map(({ key, label, Icon }) => {
                const active = activeTab === key;
                const hasErr = tabHasError(key);
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 7,
                      border: "none",
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all .15s",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      background: active ? "#fff" : "transparent",
                      color: hasErr
                        ? "#dc2626"
                        : active
                          ? "#3d3a8c"
                          : "#6c757d",
                      boxShadow: active
                        ? "0 1px 4px rgba(61,58,140,0.15)"
                        : "none",
                    }}
                  >
                    <Icon
                      size={15}
                      color={
                        hasErr ? "#dc2626" : active ? "#3d3a8c" : "#6c757d"
                      }
                    />
                    <span className="ce-tab-label">{label}</span>
                    {hasErr && (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#ef4444",
                          display: "inline-block",
                        }}
                      />
                    )}
                  </button>
                );
              })}
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
                disabled={loading}
                onClick={handleSubmit}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: loading ? "#a5a3d0" : "#3d3a8c",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  transition: "background .15s",
                  whiteSpace: "nowrap",
                }}
              >
                {loading && (
                  <div
                    style={{
                      width: 15,
                      height: 15,
                      border: "2px solid rgba(255,255,255,.35)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin .7s linear infinite",
                    }}
                  />
                )}
                <IconSave />
                <span className="ce-save-text">
                  {loading ? "Đang lưu..." : "Lưu"}
                </span>
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 9,
                    border: "1.5px solid #e9ecef",
                    background: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <IconX size={16} />
                </button>
              )}
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 0" }}>
            {/* ── TAB: Info ── */}
            {activeTab === "info" && (
              <div
                className="ce-body-pad"
                style={{
                  maxWidth: 680,
                  margin: "0 auto",
                  padding: "0 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  animation: "slideUp .2s ease",
                }}
              >
                {/* Thông tin cơ bản */}
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    border: "1.5px solid #ede9fe",
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="ce-card-body"
                    style={{
                      padding: "16px 18px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    <Field
                      label="Tiêu đề bài kiểm tra"
                      required
                      error={metaErrors.title}
                    >
                      <input
                        ref={
                          firstMetaErrKey === "title" ? metaErrorRef : undefined
                        }
                        className="exam-inp"
                        value={meta.title}
                        onChange={(e) => {
                          setM({ title: e.target.value });
                          setMetaErrors((p) => {
                            const n = { ...p };
                            delete n.title;
                            return n;
                          });
                        }}
                        placeholder="Nhập tiêu đề bài kiểm tra..."
                        style={inputSt("title")}
                      />
                    </Field>
                    <Field label="Mô tả">
                      <textarea
                        value={meta.description}
                        onChange={(e) => {
                          setM({ description: e.target.value });
                          resizeTextarea(e.target);
                        }}
                        placeholder="Mô tả ngắn về bài kiểm tra..."
                        rows={2}
                        style={taStyle({
                          border: "1.5px solid #e9ecef",
                          background: "#fff",
                          color: "#212529",
                          fontSize: 16,
                          minHeight: 64,
                        })}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#3d3a8c")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
                      />
                    </Field>
                  </div>
                </div>

                {/* Cài đặt chung */}
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    border: "1.5px solid #ede9fe",
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="ce-card-body"
                    style={{
                      padding: "16px 18px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    <div
                      className="ce-grid-3"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 12,
                      }}
                    >
                      <Field
                        label="Tổng điểm"
                        required
                        error={metaErrors.totalScore}
                      >
                        <input
                          ref={
                            firstMetaErrKey === "totalScore"
                              ? metaErrorRef
                              : undefined
                          }
                          className="exam-inp"
                          type="number"
                          min="0.1"
                          step="0.5"
                          value={meta.totalScore}
                          onChange={(e) => {
                            setM({ totalScore: e.target.value });
                            setMetaErrors((p) => {
                              const n = { ...p };
                              delete n.totalScore;
                              return n;
                            });
                          }}
                          placeholder="10"
                          style={inputSt("totalScore")}
                        />
                      </Field>
                      <Field
                        label="Số lần làm tối đa"
                        required
                        error={metaErrors.maxAttempts}
                      >
                        <input
                          ref={
                            firstMetaErrKey === "maxAttempts"
                              ? metaErrorRef
                              : undefined
                          }
                          className="exam-inp"
                          type="number"
                          min="1"
                          step="1"
                          value={meta.maxAttempts}
                          onChange={(e) => {
                            setM({ maxAttempts: e.target.value });
                            setMetaErrors((p) => {
                              const n = { ...p };
                              delete n.maxAttempts;
                              return n;
                            });
                          }}
                          placeholder="1"
                          style={inputSt("maxAttempts")}
                        />
                      </Field>
                      <Field label="Trạng thái">
                        <div style={{ position: "relative" }}>
                          <select
                            value={meta.quizStatus}
                            onChange={(e) =>
                              setM({ quizStatus: e.target.value })
                            }
                            style={{
                              ...inputSt(null),
                              appearance: "none",
                              cursor: "pointer",
                              paddingRight: 30,
                            }}
                          >
                            {QUIZ_STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
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
                      </Field>
                    </div>

                    {/* Toggles: autoScore + allowReview */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {[
                        {
                          key: "autoScore",
                          label: "Tự động chia điểm đều cho các câu hỏi",
                          val: meta.autoScore,
                          disabled: meta.isRandom,
                          onSet: (v) => {
                            if (meta.isRandom) return;
                            setM({ autoScore: v });
                            setMetaErrors((p) => {
                              const n = { ...p };
                              delete n.scoreSumError;
                              return n;
                            });
                          },
                        },
                        {
                          key: "allowReview",
                          label: "Cho phép xem lại đáp án sau khi nộp",
                          subLabel: null,
                          val: meta.allowReview,
                          disabled: false,
                          onSet: (v) => setM({ allowReview: v }),
                        },
                      ].map(
                        ({ key, label, subLabel, val, onSet, disabled }) => (
                          <div
                            key={key}
                            onClick={() => !disabled && onSet(!val)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "11px 14px",
                              borderRadius: 10,
                              border: `1.5px solid ${val ? "#c5c3e8" : "#e9ecef"}`,
                              background: val ? "#f8f7ff" : "#fafafa",
                              cursor: disabled ? "not-allowed" : "pointer",
                              userSelect: "none",
                              transition: "all .15s",
                              gap: 12,
                              opacity: 1,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 16,
                                  color: disabled ? "#9ca3af" : "#374151",
                                  lineHeight: 1.4,
                                }}
                              >
                                {label}
                              </span>
                            </div>
                            <TogglePill
                              checked={val}
                              onChange={onSet}
                              size="sm"
                              disabled={disabled}
                            />
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                {/* Quyền truy cập */}
                <div
                  ref={firstMetaErrKey === "classId" ? metaErrorRef : undefined}
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    border: `1.5px solid ${!meta.isPublic ? "#c5c3e8" : "#e9ecef"}`,
                    overflow: "hidden",
                    transition: "border-color .15s",
                  }}
                >
                  <div
                    className="ce-configcard-inner"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px 16px",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    onClick={() => {
                      setM({ isPublic: !meta.isPublic, classId: [] });
                      setMetaErrors((p) => {
                        const n = { ...p };
                        delete n.classId;
                        return n;
                      });
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 11,
                        background: meta.isPublic ? "#dcfce7" : "#fff7ed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={meta.isPublic ? "#16a34a" : "#f97316"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                      </svg>
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
                        {meta.isPublic ? "Công khai" : "Riêng tư"}
                      </p>
                      <p
                        style={{
                          margin: "3px 0 0",
                          fontSize: 15,
                          color: "#6c757d",
                        }}
                      >
                        {meta.isPublic
                          ? "Mọi người có link đều có thể làm bài"
                          : "Chỉ thành viên trong lớp mới được phép làm bài"}
                      </p>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <TogglePill
                        checked={meta.isPublic}
                        onChange={(v) => {
                          setM({ isPublic: v, classId: [] });
                          setMetaErrors((p) => {
                            const n = { ...p };
                            delete n.classId;
                            return n;
                          });
                        }}
                      />
                    </div>
                  </div>
                  {!meta.isPublic && (
                    <div
                      className="ce-configcard-children"
                      style={{
                        padding: "0 16px 14px",
                        borderTop: "1px solid #f0effc",
                        paddingTop: 12,
                      }}
                    >
                      <ClassSelector
                        value={meta.classId}
                        error={metaErrors.classId}
                        onClearError={(key) =>
                          setMetaErrors((p) => {
                            const n = { ...p };
                            delete n[key];
                            return n;
                          })
                        }
                        onChange={(ids) => setM({ classId: ids })}
                      />
                    </div>
                  )}
                </div>

                {/* Thời gian làm bài */}
                <ConfigCard
                  icon={<IconClock size={22} color="#3d3a8c" />}
                  iconBg="#ede9fe"
                  title="Thời gian làm bài"
                  description="Thời gian tối đa làm bài kiểm tra khi bắt đầu làm"
                  checked={meta.enableDuration}
                  onToggle={(v) => {
                    setM({ enableDuration: v });
                    if (!v)
                      setMetaErrors((p) => {
                        const n = { ...p };
                        delete n.durationMinutes;
                        return n;
                      });
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginTop: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    <input
                      ref={
                        firstMetaErrKey === "durationMinutes"
                          ? metaErrorRef
                          : undefined
                      }
                      className="exam-inp"
                      type="number"
                      min="1"
                      step="1"
                      value={meta.durationMinutes}
                      onChange={(e) => {
                        setM({ durationMinutes: e.target.value });
                        setMetaErrors((p) => {
                          const n = { ...p };
                          delete n.durationMinutes;
                          return n;
                        });
                      }}
                      placeholder="60"
                      style={{ ...inputSt("durationMinutes"), width: 80 }}
                    />
                    <span
                      style={{ fontSize: 16, color: "#6c757d", flexShrink: 0 }}
                    >
                      Phút
                    </span>
                  </div>
                  {metaErrors.durationMinutes && (
                    <span
                      style={{
                        fontSize: 14,
                        color: "#ef4444",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        marginTop: 6,
                      }}
                    >
                      <IconAlert size={14} /> {metaErrors.durationMinutes}
                    </span>
                  )}
                </ConfigCard>

                {/* Giới hạn thời gian truy cập */}
                <ConfigCard
                  icon={<IconCalendar size={22} color="#16a34a" />}
                  iconBg="#dcfce7"
                  title="Giới hạn thời gian truy cập"
                  description="Học sinh chỉ có thể làm bài trong khoảng thời gian được chỉ định"
                  checked={meta.enableTimeLimit}
                  onToggle={(v) => {
                    setM({ enableTimeLimit: v });
                    if (!v)
                      setMetaErrors((p) => {
                        const n = { ...p };
                        delete n.startTime;
                        delete n.endTime;
                        return n;
                      });
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      marginTop: 4,
                    }}
                  >
                    {metaErrors.startTime && (
                      <span
                        style={{
                          fontSize: 14,
                          color: "#ef4444",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <IconAlert size={14} /> {metaErrors.startTime}
                      </span>
                    )}
                    <Field label="Thời gian bắt đầu">
                      <input
                        ref={
                          firstMetaErrKey === "startTime"
                            ? metaErrorRef
                            : undefined
                        }
                        className="exam-inp"
                        type="datetime-local"
                        value={meta.startTime}
                        min={getNowLocal()}
                        onChange={(e) => {
                          setM({ startTime: e.target.value });
                          setMetaErrors((p) => {
                            const n = { ...p };
                            delete n.startTime;
                            delete n.endTime;
                            return n;
                          });
                        }}
                        style={{ ...inputSt("startTime"), minWidth: 0 }}
                      />
                    </Field>
                    <Field label="Thời gian kết thúc">
                      <input
                        ref={
                          firstMetaErrKey === "endTime"
                            ? metaErrorRef
                            : undefined
                        }
                        className="exam-inp"
                        type="datetime-local"
                        value={meta.endTime}
                        min={getNowLocal()}
                        onChange={(e) => {
                          setM({ endTime: e.target.value });
                          setMetaErrors((p) => {
                            const n = { ...p };
                            delete n.endTime;
                            delete n.startTime;
                            return n;
                          });
                        }}
                        style={{ ...inputSt("endTime"), minWidth: 0 }}
                      />
                    </Field>
                    {metaErrors.endTime && (
                      <span
                        style={{
                          fontSize: 14,
                          color: "#ef4444",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <IconAlert size={14} /> {metaErrors.endTime}
                      </span>
                    )}
                  </div>
                </ConfigCard>
              </div>
            )}

            {/* ── TAB: Questions ── */}
            {activeTab === "questions" && (
              <div
                className="ce-body-pad"
                style={{
                  maxWidth: 760,
                  margin: "0 auto",
                  padding: "0 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  animation: "slideUp .2s ease",
                }}
              >
                {/* ── Toggle isRandom ── */}
                <div
                  onClick={() => {
                    const next = !meta.isRandom;
                    setM({
                      isRandom: next,
                      autoScore: next ? true : meta.autoScore,
                    });
                    setConfigErrors({});
                    setAllErrors({});
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: `1.5px solid ${meta.isRandom ? "#c5c3e8" : "#e9ecef"}`,
                    background: meta.isRandom ? "#f8f7ff" : "#fff",
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "all .15s",
                    gap: 12,
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#212529",
                      }}
                    >
                      Lấy câu hỏi ngẫu nhiên từ ngân hàng
                    </span>
                  </div>
                  <TogglePill
                    checked={meta.isRandom}
                    onChange={(v) => {
                      setM({
                        isRandom: v,
                        autoScore: v ? true : meta.autoScore,
                      });
                      setConfigErrors({});
                      setAllErrors({});
                    }}
                    size="sm"
                  />
                </div>

                {meta.isRandom ? (
                  <>
                    {/* Danh sách configs */}
                    {configs.map((cfg, idx) => (
                      <ConfigRow
                        key={idx}
                        cfg={cfg}
                        index={idx}
                        onChange={(newCfg) => {
                          setConfigs((prev) =>
                            prev.map((c, i) => (i === idx ? newCfg : c)),
                          );
                          setConfigErrors((prev) => {
                            const n = { ...prev };
                            delete n[idx];
                            return n;
                          });
                        }}
                        onRemove={() => {
                          setConfigs((prev) =>
                            prev.filter((_, i) => i !== idx),
                          );
                          setConfigErrors((prev) => {
                            const next = {};
                            Object.entries(prev).forEach(([k, v]) => {
                              const ki = Number(k);
                              if (ki < idx) next[ki] = v;
                              else if (ki > idx) next[ki - 1] = v;
                            });
                            return next;
                          });
                        }}
                        error={configErrors[idx]}
                        isOnly={configs.length === 1}
                      />
                    ))}

                    {/* Thêm cấu hình */}
                    <button
                      onClick={() =>
                        setConfigs((prev) => [...prev, defaultConfig()])
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "13px",
                        borderRadius: 12,
                        border: "2px dashed #c5c3e8",
                        background: "#faf9ff",
                        color: "#3d3a8c",
                        fontSize: 16,
                        cursor: "pointer",
                        fontWeight: 500,
                        transition: "all .15s",
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
                      <IconPlus size={16} /> Thêm cấu hình
                    </button>
                  </>
                ) : (
                  <>
                    {/* Score sum error */}
                    {metaErrors.scoreSumError && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "11px 14px",
                          borderRadius: 10,
                          background: "#fff5f5",
                          border: "1.5px solid #fca5a5",
                          fontSize: 14,
                          color: "#dc2626",
                          fontWeight: 500,
                          flexWrap: "wrap",
                        }}
                      >
                        <IconAlert size={14} color="#dc2626" />
                        {metaErrors.scoreSumError}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {/* Import từ file */}
                      <button
                        onClick={() => setShowImportModal(true)}
                        style={{
                          flex: 1,
                          minWidth: 200,
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "15px 18px",
                          borderRadius: 12,
                          border: "2px dashed #c5c3e8",
                          background: "#faf9ff",
                          color: "#3d3a8c",
                          fontSize: 15,
                          cursor: "pointer",
                          fontWeight: 500,
                          transition: "all .15s",
                          textAlign: "left",
                          fontFamily: "inherit",
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
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: "#ede9fe",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <IconUpload size={20} color="#3d3a8c" />
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: 600,
                              color: "#3d3a8c",
                              marginBottom: 2,
                            }}
                          >
                            Import từ file
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#6c757d",
                              fontWeight: 400,
                            }}
                          >
                            Hỗ trợ .xlsx, .xls, .doc, .docx
                          </div>
                        </div>
                      </button>

                      {/* Sinh câu hỏi bằng AI — placeholder, bạn tự kết nối API sau */}
                      <button
                        onClick={() => setShowAiModal(true)}
                        style={{
                          flex: 1,
                          minWidth: 200,
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "15px 18px",
                          borderRadius: 12,
                          border: "2px dashed #a7f3d0",
                          background: "#f0fdf4",
                          color: "#065f46",
                          fontSize: 15,
                          cursor: "pointer",
                          fontWeight: 500,
                          transition: "all .15s",
                          textAlign: "left",
                          fontFamily: "inherit",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#10b981";
                          e.currentTarget.style.background = "#d1fae5";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#a7f3d0";
                          e.currentTarget.style.background = "#f0fdf4";
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: "#d1fae5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#059669"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                          </svg>
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: 600,
                              color: "#065f46",
                              marginBottom: 2,
                            }}
                          >
                            AI
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#6c757d",
                              fontWeight: 400,
                            }}
                          >
                            Tạo tự động từ chủ đề hoặc tài liệu
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Danh sách câu hỏi */}
                    {forms.map((form, idx) => (
                      <QuestionForm
                        key={idx}
                        ref={(el) => (formRefs.current[idx] = el)}
                        form={form}
                        index={idx}
                        onChange={(newForm) => updateForm(idx, newForm)}
                        onRemove={() => removeQuestion(idx)}
                        onDuplicate={() => duplicateQuestion(idx)}
                        externalErrors={allErrors[idx] || null}
                        onClearError={clearError}
                        autoScore={meta.autoScore}
                        autoScoreValue={autoScoreValue}
                        isOnly={forms.length === 1}
                      />
                    ))}

                    {/* Thêm câu hỏi */}
                    <button
                      onClick={addQuestion}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "13px",
                        borderRadius: 12,
                        border: "2px dashed #c5c3e8",
                        background: "#faf9ff",
                        color: "#3d3a8c",
                        fontSize: 16,
                        cursor: "pointer",
                        fontWeight: 500,
                        transition: "all .15s",
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
                      <IconPlus size={16} /> Thêm câu hỏi
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateQuiz;
