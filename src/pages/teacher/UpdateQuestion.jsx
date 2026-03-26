import React, { useState, useEffect } from "react";
import CategorySearch from "../../component/CategorySearch";
import GroupSearch from "../../component/GroupSearch";
import { updateQuestion } from "../../service/question.service";
import Media from "./Media";
import { toast } from "react-toastify";

const ALPHA = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

const QUESTION_TYPES = [
  { value: "SINGLE_CHOICE", label: "Chọn 1 đáp án" },
  { value: "MULTIPLE_CHOICE", label: "Chọn nhiều đáp án" },
  { value: "SHORT_ANSWER", label: "Trả lời ngắn có đáp án đúng" },
];

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

const UpdateQuestion = ({ question, onClose, onSuccess }) => {
  const [content, setContent] = useState(question.content || "");
  const [questionType, setQuestionType] = useState(
    question.questionType || "SINGLE_CHOICE",
  );

  // options for SINGLE / MULTIPLE
  const [options, setOptions] = useState(
    (question.options || []).map((o) => ({
      ...o,
      optionText: o.optionText,
      isCorrect: o.isCorrect,
    })),
  );

  // correct answers for SHORT_ANSWER
  const [correctAnswers, setCorrectAnswers] = useState(
    (question.correctAnswers || []).map((a) => ({ ...a })),
  );

  // category / group
  const [category, setCategory] = useState(
    question.categoryQuestionId
      ? { id: question.categoryQuestionId, name: question.categoryQuestionName }
      : null,
  );
  const [group, setGroup] = useState(
    question.groupQuestionId
      ? { id: question.groupQuestionId, name: question.groupQuestionName }
      : null,
  );

  // media
  const [mediaUrl, setMediaUrl] = useState(question.mediaUrl || null);
  const [mediaType, setMediaType] = useState(question.mediaType || null);
  const [openMedia, setOpenMedia] = useState(false);
  const [mediaObjectKey, setMediaObjectKey] = useState(
    question.objectKey || null,
  );

  // sub-modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);

  // ui
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ── Reset options khi đổi loại câu hỏi ──
  const handleTypeChange = (newType) => {
    setQuestionType(newType);
    setErrors({});
    if (newType === "SHORT_ANSWER") {
      setOptions([]);
    } else if (newType === "SINGLE_CHOICE") {
      // giữ options nhưng chỉ cho 1 đáp án đúng
      setOptions((prev) =>
        prev.map((o, i) => ({
          ...o,
          isCorrect: i === 0 && prev.length > 0 ? true : false,
        })),
      );
      setCorrectAnswers([]);
    } else {
      setCorrectAnswers([]);
    }
  };

  // ── Options handlers ──
  const addOption = () => {
    setOptions((prev) => [
      ...prev,
      { id: null, optionText: "", isCorrect: false },
    ]);
  };

  const removeOption = (idx) => {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateOptionText = (idx, text) => {
    setOptions((prev) =>
      prev.map((o, i) => (i === idx ? { ...o, optionText: text } : o)),
    );
  };

  const toggleCorrect = (idx) => {
    if (questionType === "SINGLE_CHOICE") {
      setOptions((prev) =>
        prev.map((o, i) => ({ ...o, isCorrect: i === idx })),
      );
    } else {
      setOptions((prev) =>
        prev.map((o, i) => (i === idx ? { ...o, isCorrect: !o.isCorrect } : o)),
      );
    }
  };

  // ── Correct answers handlers (SHORT_ANSWER) ──
  const addAnswer = () => {
    setCorrectAnswers((prev) => [...prev, { id: null, answer: "" }]);
  };

  const removeAnswer = (idx) => {
    setCorrectAnswers((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateAnswer = (idx, text) => {
    setCorrectAnswers((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, answer: text } : a)),
    );
  };

  // ── Validation ──
  const validate = () => {
    const errs = {};
    if (!content.trim() && !(mediaObjectKey || mediaType)) {
      errs.content = "Vui lòng nhập nội dung hoặc chọn media.";
    }
    if (questionType !== "SHORT_ANSWER") {
      if (options.length < 2) errs.options = "Cần ít nhất 2 đáp án.";
      else if (options.some((o) => !o.optionText.trim()))
        errs.options = "Đáp án không được để trống.";
      else if (!options.some((o) => o.isCorrect))
        errs.options = "Chọn ít nhất 1 đáp án đúng.";
    } else {
      if (correctAnswers.length === 0)
        errs.correctAnswers = "Cần ít nhất 1 đáp án chấp nhận.";
      else if (correctAnswers.some((a) => !a.answer.trim()))
        errs.correctAnswers = "Đáp án không được để trống.";
    }
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      content,
      questionType,
      options:
        questionType !== "SHORT_ANSWER"
          ? options.map((o) => ({
              id: o.id,
              optionText: o.optionText,
              isCorrect: o.isCorrect,
            }))
          : [],
      correctAnswers:
        questionType === "SHORT_ANSWER"
          ? correctAnswers.map((a) => ({
              id: a.id,
              answer: a.answer,
            }))
          : [],
      categoryQuestionId: category?.id ?? null,
      groupQuestionId: group?.id ?? null,
      mediaObjectKey: mediaObjectKey || null,
      mediaType: mediaType || null,
    };

    setLoading(true);
    try {
      await updateQuestion(question.id, payload);
      toast.success("Cập nhật câu hỏi thành công!");
      onSuccess?.();
    } catch (err) {
      toast.error(
        err.response.data?.message ||
          err.response.data?.error ||
          "Cập nhật thất bại!",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Prevent body scroll ──
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .uq-input:focus { outline: none; border-color: #3d3a8c !important; box-shadow: 0 0 0 3px rgba(61,58,140,0.12) !important; }
        .uq-opt:hover .uq-opt-remove { opacity: 1 !important; }
        .uq-type-btn:hover { border-color: #3d3a8c !important; background: #f5f4ff !important; }
      `}</style>

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

      {/* ── Group modal ── */}
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

      {/* ── Media modal ── */}
      {openMedia && (
        <Media
          show={openMedia}
          onClose={() => setOpenMedia(false)}
          onSelect={(file) => {
            setMediaUrl(file.fileUrl);
            setMediaType(file.mediaType);
            setMediaObjectKey(file.objectKey); // ← thêm state này
            setOpenMedia(false);
          }}
        />
      )}

      {/* ── Full-screen overlay ── */}
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
        {/* ── Panel ── */}
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
            {/* Title ở giữa */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
                Chỉnh sửa câu hỏi
              </span>
            </div>

            {/* Nút bên phải */}
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {/* Nút Lưu */}
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
                Save
              </button>

              {/* Nút X đóng */}
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

          {/* ── Scrollable body ── */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 0" }}>
            <div
              style={{
                maxWidth: 760,
                margin: "0 auto",
                padding: "0 20px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {/* ── Card: Phân loại ── */}
              <Section title="Phân loại">
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {/* Danh mục */}
                  <div
                    onClick={() => setShowCategoryModal(true)}
                    style={{
                      flex: 1,
                      minWidth: 160,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "9px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      border: `1.5px solid ${category ? "#c5c3e8" : "#e9ecef"}`,
                      background: category ? "#f5f4ff" : "#fff",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!category) {
                        e.currentTarget.style.borderColor = "#c5c3e8";
                        e.currentTarget.style.background = "#f5f4ff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!category) {
                        e.currentTarget.style.borderColor = "#e9ecef";
                        e.currentTarget.style.background = "#fff";
                      }
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        fontSize: 13.5,
                        color: category ? "#3d3a8c" : "#adb5bd",
                        fontWeight: category ? 500 : 400,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {category?.name || "Chọn danh mục"}
                    </span>
                    {category && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setCategory(null);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        <IconX size={14} color="#6c757d" />
                      </span>
                    )}
                  </div>

                  {/* Nhóm câu hỏi — mở modal giống danh mục */}
                  <div
                    onClick={() => setShowGroupModal(true)}
                    style={{
                      flex: 1,
                      minWidth: 160,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "9px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      border: `1.5px solid ${group ? "#c5c3e8" : "#e9ecef"}`,
                      background: group ? "#f5f4ff" : "#fff",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!group) {
                        e.currentTarget.style.borderColor = "#c5c3e8";
                        e.currentTarget.style.background = "#f5f4ff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!group) {
                        e.currentTarget.style.borderColor = "#e9ecef";
                        e.currentTarget.style.background = "#fff";
                      }
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        fontSize: 13.5,
                        color: group ? "#3d3a8c" : "#adb5bd",
                        fontWeight: group ? 500 : 400,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {group?.name || "Nhóm câu hỏi"}
                    </span>
                    {group ? (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setGroup(null);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        <IconX size={14} color="#6c757d" />
                      </span>
                    ) : (
                      <IconChevron size={13} />
                    )}
                  </div>

                  {/* Loại câu hỏi — native select */}
                  <div style={{ flex: 1, minWidth: 160, position: "relative" }}>
                    <select
                      value={questionType}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      style={{
                        width: "100%",
                        height: "100%",
                        padding: "9px 32px 9px 12px",
                        borderRadius: 8,
                        cursor: "pointer",
                        border: "1.5px solid #e9ecef",
                        background: "#fff",
                        fontSize: 13.5,
                        color: "#212529",
                        appearance: "none",
                        outline: "none",
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
                    {/* chevron icon */}
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
              </Section>

              {/* ── Card: Nội dung câu hỏi + Media ── */}
              <Section title="Nội dung câu hỏi" error={errors.content}>
                {/* Textarea + icon media button */}
                <div style={{ position: "relative" }}>
                  <textarea
                    className="uq-input"
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      setErrors((p) => ({ ...p, content: null }));
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
                      background: "#fff",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                  />
                  {/* Icon mở media — góc trên phải */}
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
                      color: "#adb5bd",
                      transition: "color 0.15s, background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#3d3a8c";
                      e.currentTarget.style.background = "#f0effc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#adb5bd";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <IconImage size={17} color="currentColor" />
                  </button>
                </div>

                {/* Media preview bên dưới textarea */}
                {mediaUrl && mediaType && (
                  <div style={{ position: "relative", marginTop: 4 }}>
                    {/* Nút X xóa media */}
                    <button
                      onClick={() => {
                        setMediaUrl(null);
                        setMediaType(null);
                        setMediaObjectKey(null); // ← thêm
                      }}
                      title="Xóa media"
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

                    {mediaType === "IMAGE" && (
                      <div
                        style={{
                          borderRadius: 8,
                          overflow: "hidden",
                          border: "1.5px solid #e9ecef",
                          background: "#f8f9fa",
                        }}
                      >
                        <img
                          src={mediaUrl}
                          alt="media"
                          style={{
                            maxHeight: 220,
                            maxWidth: "100%",
                            objectFit: "contain",
                            display: "block",
                            margin: "0 auto",
                          }}
                        />
                      </div>
                    )}

                    {mediaType === "VIDEO" && (
                      <div
                        style={{
                          borderRadius: 8,
                          overflow: "hidden",
                          border: "1.5px solid #e9ecef",
                          background: "#000",
                        }}
                      >
                        <video
                          src={mediaUrl}
                          controls
                          style={{
                            width: "100%",
                            maxHeight: 260,
                            display: "block",
                            borderRadius: 8,
                          }}
                        />
                      </div>
                    )}

                    {mediaType === "AUDIO" && (
                      <div
                        style={{
                          padding: "12px 16px",
                          borderRadius: 8,
                          border: "1.5px solid #a5d8ff",
                          background: "#e8f4fd",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
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
                          src={mediaUrl}
                          controls
                          style={{ flex: 1, height: 36 }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </Section>

              {/* ── Card: Đáp án (SINGLE / MULTIPLE) ── */}
              {(questionType === "SINGLE_CHOICE" ||
                questionType === "MULTIPLE_CHOICE") && (
                <Section
                  title={questionType === "SINGLE_CHOICE" ? "Đáp án" : "Đáp án"}
                  error={errors.options}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {options.map((opt, idx) => {
                      const isMultiple = questionType === "MULTIPLE_CHOICE";
                      return (
                        <div
                          key={idx}
                          className="uq-opt"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            position: "relative",
                          }}
                        >
                          {/* Toggle correct */}
                          <button
                            onClick={() => toggleCorrect(idx)}
                            title={
                              opt.isCorrect ? "Đang đúng" : "Đánh dấu đúng"
                            }
                            style={{
                              width: 26,
                              height: 26,
                              flexShrink: 0,
                              borderRadius: isMultiple ? 6 : "50%",
                              border: `2px solid ${opt.isCorrect ? "#16a34a" : "#d1d5db"}`,
                              background: opt.isCorrect ? "#16a34a" : "#fff",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.15s",
                            }}
                          >
                            {opt.isCorrect ? (
                              <IconCheck size={12} color="#fff" />
                            ) : (
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: "#9ca3af",
                                }}
                              >
                                {ALPHA[idx]}
                              </span>
                            )}
                          </button>

                          {/* Text input */}
                          <input
                            className="uq-input"
                            type="text"
                            value={opt.optionText}
                            onChange={(e) =>
                              updateOptionText(idx, e.target.value)
                            }
                            placeholder={`Đáp án ${ALPHA[idx]}`}
                            style={{
                              flex: 1,
                              padding: "8px 12px",
                              border: `1.5px solid ${opt.isCorrect ? "#bbf7d0" : "#e9ecef"}`,
                              borderRadius: 8,
                              fontSize: 13.5,
                              background: opt.isCorrect ? "#f0fdf4" : "#fff",
                              color: opt.isCorrect ? "#15803d" : "#212529",
                              transition: "all 0.15s",
                            }}
                          />

                          {/* Remove */}
                          <button
                            className="uq-opt-remove"
                            onClick={() => removeOption(idx)}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 7,
                              flexShrink: 0,
                              border: "none",
                              background: "#fff1f2",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: 0,
                              transition: "opacity 0.15s",
                            }}
                          >
                            <IconTrash size={13} color="#ef4444" />
                          </button>
                        </div>
                      );
                    })}

                    {options.length < 10 && (
                      <button
                        onClick={addOption}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          alignSelf: "flex-start",
                          padding: "6px 14px",
                          borderRadius: 7,
                          border: "1.5px dashed #c5c3e8",
                          background: "#faf9ff",
                          color: "#3d3a8c",
                          fontSize: 13,
                          cursor: "pointer",
                          fontWeight: 500,
                          marginTop: 2,
                        }}
                      >
                        <IconPlus size={13} /> Thêm đáp án
                      </button>
                    )}
                  </div>
                </Section>
              )}

              {/* ── Card: Đáp án chấp nhận (SHORT_ANSWER) ── */}
              {questionType === "SHORT_ANSWER" && (
                <Section title="Đáp án" error={errors.correctAnswers}>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {correctAnswers.map((ans, idx) => (
                      <div
                        key={idx}
                        className="uq-opt"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            flexShrink: 0,
                            background: "#16a34a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <IconCheck size={12} color="#fff" />
                        </div>
                        <input
                          className="uq-input"
                          type="text"
                          value={ans.answer}
                          onChange={(e) => updateAnswer(idx, e.target.value)}
                          placeholder={`Đáp án ${idx + 1}`}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            border: "1.5px solid #bbf7d0",
                            borderRadius: 8,
                            fontSize: 13.5,
                            background: "#f0fdf4",
                            color: "#15803d",
                          }}
                        />
                        <button
                          className="uq-opt-remove"
                          onClick={() => removeAnswer(idx)}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 7,
                            flexShrink: 0,
                            border: "none",
                            background: "#fff1f2",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: 0,
                            transition: "opacity 0.15s",
                          }}
                        >
                          <IconTrash size={13} color="#ef4444" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addAnswer}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        alignSelf: "flex-start",
                        padding: "6px 14px",
                        borderRadius: 7,
                        border: "1.5px dashed #bbf7d0",
                        background: "#f0fdf4",
                        color: "#16a34a",
                        fontSize: 13,
                        cursor: "pointer",
                        fontWeight: 500,
                        marginTop: 2,
                      }}
                    >
                      <IconPlus size={13} color="#16a34a" /> Thêm đáp án
                    </button>
                  </div>
                </Section>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────
// Helper sub-components
// ─────────────────────────────────────────────
const Section = ({ title, children, error }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 12,
      border: "1.5px solid #ede9fe",
      padding: "18px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#3d3a8c",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {title}
      </span>
      {error && (
        <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 500 }}>
          {error}
        </span>
      )}
    </div>
    {children}
  </div>
);

const PickerRow = ({ icon, label, value, placeholder, onPick, onClear }) => (
  <div
    onClick={onPick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 14px",
      borderRadius: 9,
      cursor: "pointer",
      border: `1.5px solid ${value ? "#c5c3e8" : "#e9ecef"}`,
      background: value ? "#f5f4ff" : "#fafafa",
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
        e.currentTarget.style.background = "#fafafa";
      }
    }}
  >
    {icon}
    <span
      style={{
        flex: 1,
        fontSize: 13.5,
        color: value ? "#3d3a8c" : "#adb5bd",
        fontWeight: value ? 500 : 400,
      }}
    >
      {value || placeholder}
    </span>
    {value && (
      <span
        onClick={(e) => {
          e.stopPropagation();
          onClear();
        }}
        style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
      >
        <IconX size={15} color="#6c757d" />
      </span>
    )}
    <IconChevron size={14} />
  </div>
);

export default UpdateQuestion;
