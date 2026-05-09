import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizAttemptResult } from "../../service/quiz.service";
import { explainQuestion } from "../../service/question.service";

const MediaDisplay = ({ mediaType, mediaUrl }) => {
  if (!mediaType || !mediaUrl) return null;
  if (mediaType === "IMAGE")
    return (
      <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
        <img
          src={mediaUrl}
          alt="media"
          style={{
            width: "100%",
            maxHeight: 260,
            objectFit: "contain",
            display: "block",
          }}
          onError={(e) => {
            e.currentTarget.parentElement.style.display = "none";
          }}
        />
      </div>
    );
  if (mediaType === "VIDEO")
    return (
      <div
        style={{
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid #e9ecef",
          background: "#000",
          marginBottom: 12,
        }}
      >
        <video
          src={mediaUrl}
          controls
          style={{ width: "100%", maxHeight: 280, display: "block" }}
        />
      </div>
    );
  if (mediaType === "AUDIO")
    return (
      <div
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #a5d8ff",
          background: "#e8f4fd",
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
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
          src={mediaUrl}
          controls
          style={{ flex: 1, height: 34, minWidth: 0 }}
        />
      </div>
    );
  return null;
};

// ─── Explanation Panel ────────────────────────────────────────────────────────
const ExplanationPanel = ({ questionId }) => {
  const [state, setState] = useState("idle"); // idle | loading | success | error
  const [explanation, setExplanation] = useState(null);
  const [open, setOpen] = useState(false);

  const handleExplain = async () => {
    if (open) {
      setOpen(false);
      return;
    }

    // If already fetched, just toggle open
    if (explanation !== null) {
      setOpen(true);
      return;
    }

    setState("loading");
    setOpen(true);

    try {
      const res = await explainQuestion(questionId);
      setExplanation(res.data ?? null);
      setState("success");
    } catch {
      setState("error");
    }
  };

  return (
    <div style={{ marginTop: 14 }}>
      {/* Button */}
      <button
        onClick={handleExplain}
        disabled={state === "loading"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 14px",
          borderRadius: 20,
          border: "1.5px solid #7c3aed",
          background: open ? "#7c3aed" : "#fff",
          color: open ? "#fff" : "#7c3aed",
          fontSize: 13,
          fontWeight: 600,
          cursor: state === "loading" ? "not-allowed" : "pointer",
          transition: "all 0.18s ease",
          opacity: state === "loading" ? 0.75 : 1,
          userSelect: "none",
        }}
      >
        {state === "loading" ? (
          <>
            <SpinIcon />
            Vui lòng chờ...
          </>
        ) : (
          <>
            <LightbulbIcon filled={open} />
            {open ? "Ẩn giải thích" : "Giải thích câu này"}
          </>
        )}
      </button>

      {(state === "success" || state === "error") && open && (
        <div
          style={{
            marginTop: 10,
            padding: "14px 16px",
            borderRadius: 10,
            background: "#faf5ff",
            border: "1.5px solid #e9d8fd",
            animation: "fadeSlideIn 0.2s ease",
          }}
        >
          {state === "error" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#e53935",
                fontSize: 14,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Không thể tải giải thích. Vui lòng thử lại.</span>
            </div>
          )}

          {state === "success" && explanation && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <LightbulbIcon filled size={15} color="#7c3aed" />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#7c3aed",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Giải thích
                </span>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  color: "#374151",
                  lineHeight: 1.65,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {explanation}
              </p>
            </>
          )}

          {state === "success" && !explanation && (
            <p style={{ margin: 0, fontSize: 14, color: "#9ca3af" }}>
              Không có giải thích cho câu này.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Icon helpers ─────────────────────────────────────────────────────────────
const SpinIcon = ({ size = 13 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }}
  >
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const LightbulbIcon = ({
  filled = false,
  size = 14,
  color = "currentColor",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? color : "none"}
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    <path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8C7.21 13.16 6 11.22 6 9a6 6 0 0 1 6-6z" />
  </svg>
);

// ─── QuestionRow ─────────────────────────────────────────────────────────────
const QuestionRow = ({ question, index, isLast }) => {
  console.log("question", question);
  const isMultiple = question.questionType === "MULTIPLE_CHOICE";
  const isShort = question.questionType === "SHORT_ANSWER";
  const selectedSet = new Set(question.selectedOptionIds ?? []);
  const correct = question.isCorrect;
  const correctOptionIds = new Set(
    question.options?.filter((o) => o.isCorrect).map((o) => o.id) ?? [],
  );

  const getMultipleChoiceLabel = () => {
    if (selectedSet.size === 0) return "Chưa chọn đáp án";
    const hasWrong = [...selectedSet].some((id) => !correctOptionIds.has(id));
    if (hasWrong) return "Trả lời sai";
    if (selectedSet.size < correctOptionIds.size) return "Chọn thiếu đáp án";
    return "Trả lời sai";
  };

  return (
    <div
      style={{
        padding: "18px 20px",
        borderBottom: isLast ? "none" : "1px solid #f0f0f0",
      }}
    >
      {/* Question header */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 6,
          marginBottom: 10,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: "#111827",
            flexShrink: 0,
          }}
        >
          Câu {index + 1}:
        </span>
        {isMultiple && (
          <span style={{ fontSize: 14, color: "#7c3aed", flexShrink: 0 }}>
            (Chọn nhiều đáp án)
          </span>
        )}
        {isShort && (
          <span style={{ fontSize: 14, color: "#7c3aed", flexShrink: 0 }}>
            (Trả lời ngắn)
          </span>
        )}
        {question.score != null && (
          <span style={{ fontSize: 14, color: "#7c3aed", flexShrink: 0 }}>
            (Trả lời đúng đạt được {question.score} điểm)
          </span>
        )}
        {question.content && (
          <span
            style={{ fontSize: 16, color: "#111827", wordBreak: "break-word" }}
          >
            {question.content}
          </span>
        )}
      </div>

      <MediaDisplay
        mediaType={question.mediaType}
        mediaUrl={question.mediaUrl}
      />

      {!isShort && question.options?.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {!correct && (
            <span
              style={{
                fontSize: 14,
                color: "#e53935",
                fontWeight: 500,
                marginBottom: 2,
              }}
            >
              {isMultiple
                ? getMultipleChoiceLabel()
                : selectedSet.size > 0
                  ? "Trả lời sai"
                  : "Chưa chọn đáp án"}
            </span>
          )}

          {question.options.map((opt) => {
            const isSelected = selectedSet.has(opt.id);
            const isOpt = opt.isCorrect;

            let bgColor = "#f0f0f0";
            let textColor = "#374151";
            let circleBg = "transparent";
            let circleBorder = "#aaa";

            if (isOpt) {
              bgColor = "#6aaa64";
              textColor = "#fff";
              circleBg = "#fff";
              circleBorder = "#fff";
            }
            if (isSelected && !isOpt) {
              bgColor = "#e53935";
              textColor = "#fff";
              circleBg = "#111";
              circleBorder = "#111";
            }
            if (isSelected && isOpt) {
              circleBg = "#111";
              circleBorder = "#111";
            }

            return (
              <div
                key={opt.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 14px",
                  background: bgColor,
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    border: `2px solid ${circleBorder}`,
                    background: circleBg,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 16,
                    color: textColor,
                    fontWeight: 500,
                    wordBreak: "break-word",
                  }}
                >
                  {opt.optionText}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {isShort && (
        <>
          {!correct && (
            <span
              style={{
                fontSize: 14,
                color: "#e53935",
                fontWeight: 500,
                display: "block",
              }}
            >
              {question.answeredText ? "Trả lời sai" : "Chưa trả lời"}
            </span>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {question.answeredText && (
              <>
                <p
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 600,
                    paddingLeft: 2,
                    color: "#7c3aed",
                  }}
                >
                  Đáp án của bạn:
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 14px",
                    background: correct ? "#6aaa64" : "#e53935",
                    borderRadius: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 16,
                      color: "#fff",
                      fontWeight: 500,
                      wordBreak: "break-word",
                    }}
                  >
                    {question.answeredText}
                  </span>
                </div>
              </>
            )}

            {!correct && question.correctAnswers?.length > 0 && (
              <>
                <p
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 600,
                    paddingLeft: 2,
                    color: "#7c3aed",
                  }}
                >
                  Đáp án chấp nhận:
                </p>
                {question.correctAnswers.map((ans) => (
                  <div
                    key={ans.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 14px",
                      background: "#6aaa64",
                      borderRadius: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 16,
                        color: "#fff",
                        fontWeight: 500,
                        wordBreak: "break-word",
                      }}
                    >
                      {ans.answer}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </>
      )}

      {/* ── Explanation ── */}
      <ExplanationPanel questionId={question.id} />
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const QuizAttemptReview = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getQuizAttemptResult(attemptId);
        setData(res.data ?? []);
      } catch {
        setError("Không thể tải kết quả bài làm.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [attemptId]);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "2.5px solid #ede9fe",
            borderTopColor: "#6d28d9",
            animation: "spin 0.7s linear infinite",
          }}
        />
      </div>
    );

  if (error)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 12,
        }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p style={{ fontSize: 16, color: "#6c757d", margin: 0 }}>{error}</p>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "7px 16px",
            borderRadius: 8,
            border: "1px solid #e9ecef",
            background: "#fff",
            fontSize: 16,
            cursor: "pointer",
            color: "#374151",
          }}
        >
          Quay lại
        </button>
      </div>
    );

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 480px) {
          .rb { padding: 14px 12px !important; }
          .stat-row { flex-wrap: wrap !important; }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          background: "#f5f5f7",
        }}
      >
        {/* Topbar */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 20px",
            height: 54,
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
            Xem lại
          </span>
          <button
            onClick={() => navigate(-1)}
            style={{
              position: "absolute",
              right: 0,
              width: 32,
              height: 32,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6c757d",
              padding: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#111827";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#6c757d";
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div
          className="rb"
          style={{
            maxWidth: 700,
            margin: "0 auto",
            width: "100%",
            padding: "20px 20px",
            boxSizing: "border-box",
          }}
        >
          {data.length > 0 && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e9ecef",
                overflow: "hidden",
              }}
            >
              {data.map((q, idx) => (
                <QuestionRow
                  key={q.id}
                  question={q}
                  index={idx}
                  isLast={idx === data.length - 1}
                />
              ))}
            </div>
          )}

          {data.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <p style={{ fontSize: 16, color: "#9ca3af" }}>
                Không có dữ liệu.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default QuizAttemptReview;
