import React, { useState, useEffect, useRef } from "react";
import CategorySearch from "../../component/CategorySearch";
import GroupSearch from "../../component/GroupSearch";
import { createQuestions } from "../../service/question.service";
import Media from "./Media";
import { toast } from "react-toastify";

const ALPHA = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

const QUESTION_TYPES = [
  { value: "SINGLE_CHOICE", label: "Chọn 1 đáp án" },
  { value: "MULTIPLE_CHOICE", label: "Chọn nhiều đáp án" },
  { value: "SHORT_ANSWER", label: "Trả lời ngắn có đáp án đúng" },
];

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

// ── Validate 1 câu hỏi ─────────────────────────────────────────────────────
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

// ── QuestionForm ───────────────────────────────────────────────────────────
const QuestionForm = React.forwardRef(
  (
    { form, index, total, onChange, onRemove, externalErrors, onClearError },
    ref,
  ) => {
    const [openMedia, setOpenMedia] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);

    // merge external errors (from submit) with no local state —
    // external errors are cleared when user edits the relevant field
    const errors = externalErrors || {};
    const hasAnyError = Object.keys(errors).length > 0;

    const set = (patch) => onChange({ ...form, ...patch });

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
      onClearError(index, null); // clear all errors on type change
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
      if (form.questionType === "SINGLE_CHOICE") {
        set({
          options: form.options.map((o, i) => ({ ...o, isCorrect: i === idx })),
        });
      } else {
        set({
          options: form.options.map((o, i) =>
            i === idx ? { ...o, isCorrect: !o.isCorrect } : o,
          ),
        });
      }
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
            // subtle shake animation trigger via key — handled by parent passing a shakeKey
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
              padding: "12px 18px",
              background: hasAnyError ? "#fff5f5" : "#f8f7ff",
              borderBottom: `1.5px solid ${hasAnyError ? "#fca5a5" : "#ede9fe"}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: hasAnyError ? "#dc2626" : "#3d3a8c",
                }}
              >
                Câu hỏi {index + 1}
              </span>
              {hasAnyError && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "2px 8px",
                    borderRadius: 20,
                    background: "#fee2e2",
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "#dc2626",
                  }}
                >
                  <IconAlert size={11} color="#dc2626" />
                  Có lỗi cần sửa
                </span>
              )}
            </div>
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
                <IconTrash size={13} color="#ef4444" />
              </button>
            )}
          </div>

          <div
            style={{
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* Phân loại */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {/* Danh mục */}
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
                    fontSize: 13,
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
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <IconX size={13} color="#6c757d" />
                  </span>
                ) : null}
              </div>

              {/* Nhóm câu hỏi */}
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
                    fontSize: 13,
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
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <IconX size={13} color="#6c757d" />
                  </span>
                ) : (
                  <IconChevron size={13} />
                )}
              </div>

              {/* Loại câu hỏi */}
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
                    fontSize: 13,
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

            {/* Nội dung + media */}
            <div>
              {errors.content && (
                <span
                  style={{
                    fontSize: 12,
                    color: "#ef4444",
                    marginBottom: 5,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <IconAlert size={11} color="#ef4444" /> {errors.content}
                </span>
              )}
              <div style={{ position: "relative" }}>
                <textarea
                  value={form.content}
                  onChange={(e) => {
                    set({ content: e.target.value });
                    onClearError(index, "content");
                  }}
                  placeholder="Nhập nội dung câu hỏi..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 40px 10px 12px",
                    border: `1.5px solid ${errors.content ? "#ef4444" : "#e9ecef"}`,
                    borderRadius: 8,
                    fontSize: 14,
                    color: "#212529",
                    resize: "vertical",
                    fontFamily: "inherit",
                    background: errors.content ? "#fff5f5" : "#fff",
                    boxSizing: "border-box",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
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
                    size={17}
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
                    <IconX size={11} color="#fff" />
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

            {/* Đáp án — SINGLE / MULTIPLE */}
            {(form.questionType === "SINGLE_CHOICE" ||
              form.questionType === "MULTIPLE_CHOICE") && (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {errors.options && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <IconAlert size={11} color="#ef4444" /> {errors.options}
                  </span>
                )}
                {form.options.map((opt, idx) => {
                  const isMultiple = form.questionType === "MULTIPLE_CHOICE";
                  return (
                    <div
                      key={idx}
                      className="cq-opt"
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <button
                        onClick={() => toggleCorrect(idx)}
                        style={{
                          width: 24,
                          height: 24,
                          flexShrink: 0,
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
                          <IconCheck size={11} color="#fff" />
                        ) : (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: "#9ca3af",
                            }}
                          >
                            {ALPHA[idx]}
                          </span>
                        )}
                      </button>
                      <input
                        type="text"
                        value={opt.optionText}
                        onChange={(e) => updateOptionText(idx, e.target.value)}
                        placeholder={`Đáp án ${ALPHA[idx]}`}
                        style={{
                          flex: 1,
                          padding: "7px 11px",
                          border: `1.5px solid ${opt.isCorrect ? "#bbf7d0" : errors.options && !opt.optionText.trim() ? "#fca5a5" : "#e9ecef"}`,
                          borderRadius: 7,
                          fontSize: 13,
                          background: opt.isCorrect
                            ? "#f0fdf4"
                            : errors.options && !opt.optionText.trim()
                              ? "#fff5f5"
                              : "#fff",
                          color: opt.isCorrect ? "#15803d" : "#212529",
                          outline: "none",
                          transition: "all 0.15s",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = opt.isCorrect
                            ? "#16a34a"
                            : "#3d3a8c")
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = opt.isCorrect
                            ? "#bbf7d0"
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
                        }}
                      >
                        <IconTrash size={12} color="#ef4444" />
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
                      fontSize: 12.5,
                      cursor: "pointer",
                      fontWeight: 500,
                      marginTop: 2,
                    }}
                  >
                    <IconPlus size={12} /> Thêm đáp án
                  </button>
                )}
              </div>
            )}

            {/* Đáp án — SHORT_ANSWER */}
            {form.questionType === "SHORT_ANSWER" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {errors.correctAnswers && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <IconAlert size={11} color="#ef4444" />{" "}
                    {errors.correctAnswers}
                  </span>
                )}
                {form.correctAnswers.map((ans, idx) => (
                  <div
                    key={idx}
                    className="cq-opt"
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: "#16a34a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconCheck size={11} color="#fff" />
                    </div>
                    <input
                      type="text"
                      value={ans.answer}
                      onChange={(e) => updateAnswer(idx, e.target.value)}
                      placeholder={`Đáp án ${idx + 1}`}
                      style={{
                        flex: 1,
                        padding: "7px 11px",
                        border: `1.5px solid ${errors.correctAnswers && !ans.answer.trim() ? "#fca5a5" : "#bbf7d0"}`,
                        borderRadius: 7,
                        fontSize: 13,
                        background:
                          errors.correctAnswers && !ans.answer.trim()
                            ? "#fff5f5"
                            : "#f0fdf4",
                        color: "#15803d",
                        outline: "none",
                      }}
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
                      }}
                    >
                      <IconTrash size={12} color="#ef4444" />
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
                    fontSize: 12.5,
                    cursor: "pointer",
                    fontWeight: 500,
                    marginTop: 2,
                  }}
                >
                  <IconPlus size={12} color="#16a34a" /> Thêm đáp án
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
  // allErrors: Record<formIndex, { content?, options?, correctAnswers? }>
  const [allErrors, setAllErrors] = useState({});

  // một ref array, mỗi phần tử trỏ đến DOM node của từng QuestionForm
  const formRefs = useRef([]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // sync refs array length với số forms
  useEffect(() => {
    formRefs.current = formRefs.current.slice(0, forms.length);
  }, [forms.length]);

  const updateForm = (idx, newForm) =>
    setForms((prev) => prev.map((f, i) => (i === idx ? newForm : f)));

  const addQuestion = () => setForms((prev) => [...prev, defaultForm()]);

  const removeQuestion = (idx) => {
    setForms((prev) => prev.filter((_, i) => i !== idx));
    // shift down errors for indices > idx
    setAllErrors((prev) => {
      const next = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = Number(k);
        if (ki < idx) next[ki] = v;
        else if (ki > idx) next[ki - 1] = v;
        // ki === idx → dropped
      });
      return next;
    });
  };

  // xóa lỗi cho 1 field cụ thể của 1 form (khi user sửa)
  // field === null → xóa hết lỗi của form đó
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
    // 1. Validate tất cả
    const newErrors = {};
    forms.forEach((form, idx) => {
      const errs = validateForm(form);
      if (Object.keys(errs).length > 0) newErrors[idx] = errs;
    });

    if (Object.keys(newErrors).length > 0) {
      setAllErrors(newErrors);

      // 2. Scroll đến form đầu tiên có lỗi
      const firstErrIdx = Math.min(...Object.keys(newErrors).map(Number));
      const target = formRefs.current[firstErrIdx];
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      return;
    }

    // 4. Submit
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

  const errorCount = Object.keys(allErrors).length;

  return (
    <>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
        .cq-opt:hover .cq-opt-remove { opacity: 1 !important; }
      `}</style>

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
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
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
              {/* Error badge */}
              {errorCount > 0 && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "4px 10px",
                    borderRadius: 20,
                    background: "#fee2e2",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#dc2626",
                  }}
                >
                  <IconAlert size={12} color="#dc2626" />
                  {errorCount} câu hỏi có lỗi
                </span>
              )}
              <button
                disabled={loading}
                onClick={handleSubmit}
                style={{
                  padding: "7px 22px",
                  borderRadius: 8,
                  border: "none",
                  background: loading ? "#a5a3d0" : "#3d3a8c",
                  color: "#fff",
                  fontSize: 13.5,
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
                Lưu {forms.length > 1 ? `(${forms.length})` : ""}
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
                <IconX size={17} color="#6c757d" />
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

              {/* Nút thêm câu hỏi */}
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
                  fontSize: 13.5,
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
                <IconPlus size={15} /> Thêm câu hỏi
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateQuestion;
