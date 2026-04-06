import {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import CreateQuestion from "./CreateQuestion";
import CategorySearch from "../../component/CategorySearch";
import GroupSearch from "../../component/GroupSearch";
import {
  getQuestion,
  deleteAllQuestions,
  deleteQuestionsByIds,
  deleteQuestion,
  updateQuestionsByIds,
} from "../../service/question.service";
import UpdateQuestion from "./UpdateQuestion";

const MODE_ALL = "all";
const MODE_UNCLASSIFIED = "unclassified";

const QUESTION_TYPES = [
  { value: null, label: "Tất cả" },
  { value: "single", label: "Chọn 1 đáp án" },
  { value: "multiple", label: "Chọn nhiều đáp án" },
  { value: "short", label: "Trả lời ngắn có đáp án đúng" },
];

const TYPE_MAP = {
  single: "SINGLE_CHOICE",
  multiple: "MULTIPLE_CHOICE",
  short: "SHORT_ANSWER",
};

const MODE_MAP = {
  [MODE_ALL]: "ALL",
  [MODE_UNCLASSIFIED]: "UNCLASSIFIED",
};

const QUESTION_TYPE_LABEL = {
  SINGLE_CHOICE: "Chọn 1 đáp án",
  MULTIPLE_CHOICE: "Chọn nhiều đáp án",
  SHORT_ANSWER: "Trả lời ngắn",
};

const QUESTION_TYPE_COLOR = {
  SINGLE_CHOICE: { bg: "#eef2ff", text: "#3d3a8c" },
  MULTIPLE_CHOICE: { bg: "#fdf2fb", text: "#9333ea" },
  SHORT_ANSWER: { bg: "#f0fdf4", text: "#16a34a" },
};

const ALPHA = ["A", "B", "C", "D", "E", "F"];
const PAGE_SIZE = 10;

// ===== Media Badge =====
const MediaBadge = ({ mediaType, mediaUrl }) => {
  if (!mediaType || !mediaUrl) return null;
  if (mediaType === "IMAGE") {
    return (
      <div
        style={{
          borderRadius: "8px",
          overflow: "hidden",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
        }}
      >
        <img
          src={mediaUrl}
          alt="Question media"
          style={{
            width: "100%",
            maxHeight: "240px",
            objectFit: "contain",
            display: "block",
          }}
          onError={(e) => {
            e.currentTarget.parentElement.style.display = "none";
          }}
        />
      </div>
    );
  }
  if (mediaType === "VIDEO") {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "5px 12px",
          borderRadius: "20px",
          background: "#fff4e6",
          border: "1.5px solid #ffd8a8",
          width: "fit-content",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="5 3 19 12 5 21 5 3" fill="#e67700" stroke="none" />
        </svg>
        <span style={{ fontSize: "16px", fontWeight: 600, color: "#e67700" }}>
          Video
        </span>
      </div>
    );
  }
  if (mediaType === "AUDIO") {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "5px 12px",
          borderRadius: "20px",
          background: "#e8f4fd",
          border: "1.5px solid #a5d8ff",
          width: "fit-content",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1971c2"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        <span style={{ fontSize: "16px", fontWeight: 600, color: "#1971c2" }}>
          Audio
        </span>
      </div>
    );
  }
  return null;
};

// ===== Confirm Modal =====
const ConfirmModal = ({ message, loading, onConfirm, onCancel }) => {
  if (!message) return null;
  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 1060,
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1065,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 12px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "28px 16px 24px",
            width: "100%",
            maxWidth: "380px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          <div style={{ marginBottom: "14px" }}>
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.8"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: "16px",
              color: "#0f172a",
              marginBottom: "8px",
            }}
          >
            Bạn có chắc chắn xóa không?
          </div>
          <p
            style={{
              fontSize: "16px",
              color: "#64748b",
              marginBottom: "20px",
              wordBreak: "break-word",
            }}
            dangerouslySetInnerHTML={{ __html: message }}
          />
          <div
            style={{ display: "flex", justifyContent: "center", gap: "10px" }}
          >
            <button
              disabled={loading}
              onClick={onCancel}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                border: "1.5px solid #e9ecef",
                background: "#fff",
                fontSize: "16px",
                cursor: "pointer",
                minWidth: "80px",
              }}
            >
              Hủy
            </button>
            <button
              disabled={loading}
              onClick={onConfirm}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                border: "none",
                background: "#ef4444",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
                minWidth: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              {loading && (
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
              )}
              Xóa
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ===== Question Card (defined OUTSIDE Question to avoid stale closure) =====
const QuestionCard = ({
  question,
  selectMode,
  isChecked,
  isWide,
  onToggleCheck,
  onEditSingle,
  onDeleteSingle,
}) => {
  const typeColor = QUESTION_TYPE_COLOR[question.questionType] ?? {
    bg: "#f1f3f5",
    text: "#495057",
  };
  const typeLabel =
    QUESTION_TYPE_LABEL[question.questionType] ?? question.questionType;
  const isMultiple = question.questionType === "MULTIPLE_CHOICE";
  const isShort = question.questionType === "SHORT_ANSWER";
  const hasImage = question.mediaType === "IMAGE" && !!question.mediaUrl;
  const hasNonImageMedia = !!(
    question.mediaUrl &&
    question.mediaType &&
    question.mediaType !== "IMAGE"
  );

  const IconTrash = ({ size = 13, color = "#fff" }) => (
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
  const IconEdit = ({ size = 13, color = "#fff" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
    >
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );

  const AnswerList = () => (
    <>
      {!isShort && question.options?.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          {question.options.map((opt, i) => (
            <div
              key={opt.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                borderRadius: "8px",
                border: `1.5px solid ${opt.isCorrect ? "#bbf7d0" : "#f0f0f0"}`,
                background: opt.isCorrect ? "#f0fdf4" : "#fafafa",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: isMultiple ? "5px" : "50%",
                  border: `1.5px solid ${opt.isCorrect ? "#16a34a" : "#d1d5db"}`,
                  background: opt.isCorrect ? "#16a34a" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {opt.isCorrect ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#9ca3af",
                    }}
                  >
                    {ALPHA[i]}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: "16px",
                  color: opt.isCorrect ? "#15803d" : "#495057",
                  fontWeight: opt.isCorrect ? 500 : 400,
                  flex: 1,
                  lineHeight: "1.4",
                  wordBreak: "break-word",
                }}
              >
                {opt.optionText}
              </span>
            </div>
          ))}
        </div>
      )}
      {isShort && question.correctAnswers?.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={{ fontSize: "16px", color: "#868e96", fontWeight: 500 }}>
            Đáp án chấp nhận:
          </span>
          {question.correctAnswers.map((ans) => (
            <div
              key={ans.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1.5px solid #bbf7d0",
                background: "#f0fdf4",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span
                style={{
                  fontSize: "16px",
                  color: "#15803d",
                  fontWeight: 500,
                  wordBreak: "break-word",
                }}
              >
                {ans.answer}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div
      className={`question-card${!selectMode ? " has-actions" : " select-mode"}`}
      onClick={() => {
        if (selectMode) onToggleCheck(question.id);
      }}
      style={{
        position: "relative",
        background: isChecked ? "#f5f4ff" : "#fff",
        borderRadius: "10px",
        border: `1.5px solid ${isChecked ? "#3d3a8c" : "#f0f0f0"}`,
        boxShadow: isChecked ? "0 0 0 3px rgba(61,58,140,0.12)" : "none",
        cursor: selectMode ? "pointer" : "default",
        padding: "14px 16px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
        userSelect: "none",
      }}
    >
      {/* Checkbox */}
      {selectMode && (
        <div
          className={`question-checkbox${isChecked ? " is-checked" : ""}`}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            zIndex: 2,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleCheck(question.id);
          }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "5px",
              border: `2px solid ${isChecked ? "#3d3a8c" : "#ced4da"}`,
              background: isChecked ? "#3d3a8c" : "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {isChecked && (
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!selectMode && (
        <div
          className="question-actions"
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 2,
            display: "flex",
            gap: "6px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEditSingle(question)}
            title="Sửa"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "7px",
              background: "#3d3a8c",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconEdit size={13} color="#fff" />
          </button>
          <button
            onClick={() => onDeleteSingle(question)}
            title="Xóa"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "7px",
              background: "#ef4444",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconTrash size={13} color="#fff" />
          </button>
        </div>
      )}

      {/* Type badge */}
      <div className="question-type-badge" style={{ display: "flex" }}>
        <span
          style={{
            fontSize: "15px",
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: "20px",
            background: typeColor.bg,
            color: typeColor.text,
            whiteSpace: "nowrap",
            marginLeft: "auto",
            transition: "padding-right 0.15s",
            paddingRight: selectMode ? "20px" : "10px",
            paddingLeft: selectMode ? "20px" : "10px",
          }}
        >
          {typeLabel}
        </span>
      </div>

      {hasNonImageMedia && (
        <MediaBadge
          mediaType={question.mediaType}
          mediaUrl={question.mediaUrl}
        />
      )}

      {hasImage ? (
        isWide ? (
          <div
            style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}
          >
            <div
              style={{
                flex: "0 0 calc(50% - 7px)",
                maxWidth: "calc(50% - 7px)",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1.5px solid #f0f0f0",
              }}
            >
              <MediaBadge
                mediaType={question.mediaType}
                mediaUrl={question.mediaUrl}
              />
            </div>
            <div
              style={{
                width: "1px",
                alignSelf: "stretch",
                background: "#f0f0f0",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: "7px",
              }}
            >
              <AnswerList />
            </div>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <div
              style={{
                borderRadius: "8px",
                overflow: "hidden",
                border: "1.5px solid #f0f0f0",
              }}
            >
              <MediaBadge
                mediaType={question.mediaType}
                mediaUrl={question.mediaUrl}
              />
            </div>
            <AnswerList />
          </div>
        )
      ) : (
        <AnswerList />
      )}

      {(question.categoryQuestionName || question.groupQuestionName) && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "nowrap",
            paddingTop: "6px",
            borderTop: "1px solid #f5f5f5",
            overflow: "hidden",
          }}
        >
          {question.categoryQuestionName && (
            <span
              style={{
                fontSize: "16px",
                color: "#868e96",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                minWidth: 0,
                overflow: "hidden",
                flexShrink: question.groupQuestionName ? 1 : 0,
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#adb5bd"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ flexShrink: 0 }}
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <circle cx="3" cy="6" r="1" fill="#adb5bd" stroke="none" />
                <circle cx="3" cy="12" r="1" fill="#adb5bd" stroke="none" />
                <circle cx="3" cy="18" r="1" fill="#adb5bd" stroke="none" />
              </svg>
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {question.categoryQuestionName}
              </span>
            </span>
          )}
          {question.groupQuestionName && (
            <span
              style={{
                fontSize: "16px",
                color: "#868e96",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                minWidth: 0,
                overflow: "hidden",
                flexShrink: 1,
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#adb5bd"
                strokeWidth="1.5"
                strokeLinecap="round"
                style={{ flexShrink: 0 }}
              >
                <circle cx="9" cy="9" r="5" />
                <circle cx="15" cy="9" r="5" />
                <circle cx="12" cy="15" r="5" />
              </svg>
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {question.groupQuestionName}
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const Question = forwardRef((props, ref) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterMode, setFilterMode] = useState(MODE_ALL);
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterGroup, setFilterGroup] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showUpdateQuestionModal, setShowUpdateQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [appliedFilter, setAppliedFilter] = useState({
    mode: MODE_ALL,
    category: null,
    group: null,
    type: null,
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFirstPage, setIsFirstPage] = useState(true);
  const [selectMode, setSelectMode] = useState(false);
  const [checked, setChecked] = useState([]);
  const [confirmMsg, setConfirmMsg] = useState(null);
  const [confirmCb, setConfirmCb] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [editGroup, setEditGroup] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editStep, setEditStep] = useState("form");
  const [isWide, setIsWide] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : true,
  );
  const [isNarrow, setIsNarrow] = useState(
    typeof window !== "undefined" ? window.innerWidth < 480 : false,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsWide(window.innerWidth >= 768);
      setIsNarrow(window.innerWidth < 480);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sentinelRef = useRef(null);
  const abortRef = useRef(null);
  const skipSearchEffect = useRef(false);
  const debounceRef = useRef(null);

  useImperativeHandle(ref, () => ({
    openCreateModal: () => setShowCreateModal(true),
  }));

  const fetchPage = useCallback(
    async (pageIndex, reset = false) => {
      if (loading) return;
      setLoading(true);
      if (reset) setIsFirstPage(true);
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await getQuestion({
          content: search || undefined,
          categoryId: appliedFilter.category?.id ?? undefined,
          groupId: appliedFilter.group?.id ?? undefined,
          questionType: appliedFilter.type
            ? TYPE_MAP[appliedFilter.type]
            : undefined,
          questionFilterMode: MODE_MAP[appliedFilter.mode],
          page: pageIndex,
          size: PAGE_SIZE,
        });
        const data = res?.data ?? [];
        const meta = res?.meta ?? {};
        const total = meta.totalPages ?? 1;
        setHasMore(pageIndex + 1 < total);
        setQuestions((prev) => (reset ? data : [...prev, ...data]));
        setPage(pageIndex);
      } catch (err) {
        setHasMore(false);
      } finally {
        setLoading(false);
        setIsFirstPage(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search, appliedFilter],
  );

  useEffect(() => {
    skipSearchEffect.current = true;
    setQuestions([]);
    setPage(0);
    setHasMore(true);
    fetchPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (skipSearchEffect.current) {
      skipSearchEffect.current = false;
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuestions([]);
      setPage(0);
      setHasMore(true);
      fetchPage(0, true);
    }, 200);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, appliedFilter]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading)
          fetchPage(page + 1);
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, page, fetchPage]);

  const exitSelectMode = () => {
    setSelectMode(false);
    setChecked([]);
  };
  const toggleCheck = (id) =>
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const openConfirm = (msg, cb) => {
    setConfirmMsg(msg);
    setConfirmCb(() => cb);
  };
  const closeConfirm = () => {
    setConfirmMsg(null);
    setConfirmCb(null);
  };

  const handleConfirmDone = async () => {
    if (!confirmCb) return;
    setConfirmLoading(true);
    try {
      await confirmCb();
      closeConfirm();
      setQuestions([]);
      setPage(0);
      setHasMore(true);
      fetchPage(0, true);
    } catch {
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDeleteSingle = (question) => {
    const content = question.content?.trim();
    const message = content
      ? `Câu hỏi <strong>"${content.slice(0, 60)}${content.length > 15 ? "…" : ""}"</strong> sẽ bị xóa vĩnh viễn.`
      : "Câu hỏi này sẽ bị xóa vĩnh viễn.";
    openConfirm(message, () => deleteQuestion(question.id));
  };

  const handleDeleteSelected = () => {
    openConfirm(
      `<strong>${checked.length} câu hỏi</strong> đã chọn sẽ bị xóa vĩnh viễn và không thể khôi phục.`,
      async () => {
        await deleteQuestionsByIds(checked);
        exitSelectMode();
      },
    );
  };

  const handleDeleteAll = () => {
    openConfirm(
      `<strong>Tất cả câu hỏi</strong> đang hiển thị sẽ bị xóa vĩnh viễn và không thể khôi phục.`,
      async () => {
        await deleteAllQuestions();
        exitSelectMode();
      },
    );
  };

  const handleResetFilter = () => {
    setFilterMode(MODE_ALL);
    setFilterCategory(null);
    setFilterGroup(null);
    setFilterType(null);
    setShowTypeDropdown(false);
  };
  const handleApplyFilter = () => {
    setAppliedFilter({
      mode: filterMode,
      category: filterCategory,
      group: filterGroup,
      type: filterType,
    });
    setShowFilter(false);
  };
  const handleSearchSubmit = (e) => {
    if (e.key === "Enter") setSearch(searchInput);
  };
  const handleEditSelected = () => {
    setEditCategory(null);
    setEditGroup(null);
    setEditStep("form");
    setShowEditModal(true);
  };

  const handleConfirmEdit = async () => {
    setEditLoading(true);
    try {
      await updateQuestionsByIds({
        categoryId: editCategory?.id ?? null,
        groupId: editGroup?.id ?? null,
        questionId: checked,
      });
      setShowEditModal(false);
      exitSelectMode();
      setQuestions([]);
      setPage(0);
      setHasMore(true);
      fetchPage(0, true);
    } catch (err) {
      console.error("Failed to update questions:", err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditSingle = (question) => {
    setEditingQuestion(question);
    setShowUpdateQuestionModal(true);
  };

  const isDisabled = filterMode === MODE_UNCLASSIFIED;
  const activeFilterCount = [
    appliedFilter.mode !== MODE_ALL,
    appliedFilter.category,
    appliedFilter.group,
    appliedFilter.type,
  ].filter(Boolean).length;

  const IconSearch = () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#adb5bd"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
  const IconFilter = () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
  const IconCategory = () => (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke={isDisabled ? "#ced4da" : "#3d3a8c"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle
        cx="3"
        cy="6"
        r="1"
        fill={isDisabled ? "#ced4da" : "#3d3a8c"}
        stroke="none"
      />
      <circle
        cx="3"
        cy="12"
        r="1"
        fill={isDisabled ? "#ced4da" : "#3d3a8c"}
        stroke="none"
      />
      <circle
        cx="3"
        cy="18"
        r="1"
        fill={isDisabled ? "#ced4da" : "#3d3a8c"}
        stroke="none"
      />
    </svg>
  );
  const IconGroup = () => (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke={isDisabled ? "#ced4da" : "#3d3a8c"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="9" r="5" />
      <circle cx="15" cy="9" r="5" />
      <circle cx="12" cy="15" r="5" />
    </svg>
  );
  const IconType = () => (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3d3a8c"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
    </svg>
  );
  const IconClose = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6c757d"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
  const IconChevron = () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke={isDisabled ? "#ced4da" : "#adb5bd"}
      strokeWidth="2"
      strokeLinecap="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
  const IconChevronDown = ({ open }) => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#adb5bd"
      strokeWidth="2"
      strokeLinecap="round"
      style={{
        transform: open ? "rotate(90deg)" : "none",
        transition: "transform 0.2s",
      }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
  const IconCheck = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3d3a8c"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
  const IconSelect = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
  const IconTrash = ({ size = 13, color = "#fff" }) => (
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
  const IconEdit = ({ size = 13, color = "#fff" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
    >
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );

  const SkeletonCard = () => (
    <div
      style={{
        background: "#fff",
        borderRadius: "10px",
        border: "1.5px solid #f0f0f0",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {[80, 70, 90].map((w, i) => (
          <div
            key={i}
            style={{
              height: "20px",
              width: `${w}px`,
              background:
                "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",
              backgroundSize: "200% 100%",
              borderRadius: "20px",
              animation: "shimmer 1.5s infinite",
            }}
          />
        ))}
      </div>
      <div
        style={{
          height: "16px",
          width: "75%",
          background:
            "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",
          backgroundSize: "200% 100%",
          borderRadius: "6px",
          animation: "shimmer 1.5s infinite",
        }}
      />
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            height: "36px",
            width: "100%",
            background:
              "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",
            backgroundSize: "200% 100%",
            borderRadius: "8px",
            animation: "shimmer 1.5s infinite",
          }}
        />
      ))}
    </div>
  );

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    zIndex: 1050,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 12px",
    boxSizing: "border-box",
  };
  const modalStyle = {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px 16px 24px",
    width: "100%",
    maxWidth: "360px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    boxSizing: "border-box",
  };
  const inputRowStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 0",
    borderBottom: "1.5px solid #f0f0f0",
  };

  const RadioOption = ({ mode, label }) => {
    const active = filterMode === mode;
    return (
      <div
        onClick={() => {
          setFilterMode(mode);
          if (mode === MODE_UNCLASSIFIED) {
            setFilterCategory(null);
            setFilterGroup(null);
          }
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          padding: "5px 8px",
          borderRadius: "7px",
          cursor: "pointer",
          background: active ? "#f0effc" : "transparent",
          flex: 1,
          minWidth: 0,
          transition: "background 0.15s",
          userSelect: "none",
        }}
      >
        <div
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            border: `2px solid ${active ? "#3d3a8c" : "#ced4da"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: active ? "#3d3a8c" : "transparent",
            }}
          />
        </div>
        <span
          style={{
            fontSize: "16px",
            color: active ? "#3d3a8c" : "#495057",
            fontWeight: active ? 600 : 400,
            wordBreak: "break-word",
          }}
        >
          {label}
        </span>
      </div>
    );
  };

  const showSkeleton = loading && isFirstPage && questions.length === 0;
  const showLoadMore = loading && !isFirstPage;
  const showEmpty = !loading && questions.length === 0;

  return (
    <>
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .question-card.has-actions:hover { border-color: #c5c3e8 !important; box-shadow: 0 2px 12px rgba(61,58,140,0.07) !important; }
        .question-actions { opacity: 0; pointer-events: none; transition: opacity 0.15s; }
        .question-card:hover .question-actions { opacity: 1; pointer-events: auto; }
        .question-card.has-actions:hover .question-type-badge { padding-right: 72px; }
       
        .question-checkbox { opacity: 0; pointer-events: none; transition: opacity 0.15s; }
        .question-checkbox.is-checked { opacity: 1; pointer-events: auto; }
        .question-card.select-mode:hover .question-checkbox { opacity: 1; pointer-events: auto; }
      `}</style>

      {showCreateModal && (
        <CreateQuestion
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            setQuestions([]);
            setPage(0);
            setHasMore(true);
            fetchPage(0, true);
          }}
        />
      )}
      {showUpdateQuestionModal && editingQuestion && (
        <UpdateQuestion
          question={editingQuestion}
          onClose={() => {
            setShowUpdateQuestionModal(false);
            setEditingQuestion(null);
          }}
          onSuccess={() => {
            setShowUpdateQuestionModal(false);
            setEditingQuestion(null);
            setQuestions([]);
            setPage(0);
            setHasMore(true);
            fetchPage(0, true);
          }}
        />
      )}
      {showCategoryModal && (
        <CategorySearch
          value={filterCategory}
          onConfirm={(selected) => {
            setFilterCategory(selected);
            setShowCategoryModal(false);
            setShowFilter(true);
          }}
          onClose={() => {
            setShowCategoryModal(false);
            setShowFilter(true);
          }}
        />
      )}
      {showGroupModal && (
        <GroupSearch
          value={filterGroup}
          onConfirm={(selected) => {
            setFilterGroup(selected);
            setShowGroupModal(false);
            setShowFilter(true);
          }}
          onClose={() => {
            setShowGroupModal(false);
            setShowFilter(true);
          }}
        />
      )}

      <ConfirmModal
        message={confirmMsg}
        loading={confirmLoading}
        onConfirm={handleConfirmDone}
        onCancel={() => {
          if (!confirmLoading) closeConfirm();
        }}
      />

      {/* Filter Modal */}
      {showFilter && (
        <div style={overlayStyle} onClick={() => setShowFilter(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <span
                style={{ fontWeight: 600, fontSize: "16px", color: "#212529" }}
              >
                Filter
              </span>
              <button
                onClick={() => setShowFilter(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px",
                  display: "flex",
                  flexShrink: 0,
                }}
              >
                <IconClose />
              </button>
            </div>
            <div
              style={{
                display: "flex",
                gap: "4px",
                padding: "4px 0 10px",
                borderBottom: "1.5px solid #f0f0f0",
                flexWrap: "wrap",
              }}
            >
              <RadioOption mode={MODE_ALL} label="Tất cả" />
              <RadioOption mode={MODE_UNCLASSIFIED} label="Chưa phân loại" />
            </div>
            <div style={{ borderBottom: "1.5px solid #f0f0f0" }}>
              <div
                style={{
                  ...inputRowStyle,
                  borderBottom: "none",
                  cursor: "pointer",
                }}
                onClick={() => setShowTypeDropdown((v) => !v)}
              >
                <IconType />
                <span
                  style={{
                    flex: 1,
                    fontSize: "16px",
                    color: filterType ? "#212529" : "#adb5bd",
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {filterType
                    ? QUESTION_TYPES.find((t) => t.value === filterType)?.label
                    : "Loại câu hỏi"}
                </span>
                {filterType && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterType(null);
                    }}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <IconClose />
                  </span>
                )}
                <IconChevronDown open={showTypeDropdown} />
              </div>
              {showTypeDropdown && (
                <div
                  style={{
                    paddingBottom: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  {QUESTION_TYPES.map((type) => {
                    const active = filterType === type.value;
                    return (
                      <div
                        key={String(type.value)}
                        onClick={() => {
                          setFilterType(type.value);
                          setShowTypeDropdown(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "7px 10px 7px 28px",
                          borderRadius: "7px",
                          cursor: "pointer",
                          background: active ? "#f0effc" : "transparent",
                          fontSize: "16px",
                          color: active ? "#3d3a8c" : "#495057",
                          fontWeight: active ? 600 : 400,
                        }}
                        onMouseEnter={(e) => {
                          if (!active)
                            e.currentTarget.style.background = "#f8f9fa";
                        }}
                        onMouseLeave={(e) => {
                          if (!active)
                            e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <span style={{ wordBreak: "break-word" }}>
                          {type.label}
                        </span>
                        {active && <IconCheck />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div
              style={{
                ...inputRowStyle,
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.4 : 1,
              }}
              onClick={() => {
                if (isDisabled) return;
                setShowCategoryModal(true);
                setShowFilter(false);
              }}
            >
              <IconCategory />
              <span
                style={{
                  flex: 1,
                  fontSize: "16px",
                  color: filterCategory ? "#212529" : "#adb5bd",
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {filterCategory ? filterCategory.name : "Chọn danh mục"}
              </span>
              {filterCategory && !isDisabled && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilterCategory(null);
                  }}
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <IconClose />
                </span>
              )}
              <IconChevron />
            </div>
            <div
              style={{
                ...inputRowStyle,
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.4 : 1,
              }}
              onClick={() => {
                if (isDisabled) return;
                setShowGroupModal(true);
                setShowFilter(false);
              }}
            >
              <IconGroup />
              <span
                style={{
                  flex: 1,
                  fontSize: "16px",
                  color: filterGroup ? "#212529" : "#adb5bd",
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {filterGroup ? filterGroup.name : "Chọn nhóm câu hỏi"}
              </span>
              {filterGroup && !isDisabled && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilterGroup(null);
                  }}
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <IconClose />
                </span>
              )}
              <IconChevron />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "8px",
                marginTop: "24px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={handleResetFilter}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  color: "#212529",
                  padding: "7px 12px",
                }}
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilter(false)}
                style={{
                  background: "none",
                  border: "1.5px solid #e9ecef",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  color: "#212529",
                  padding: "7px 14px",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleApplyFilter}
                style={{
                  background: "#3d3a8c",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  color: "#fff",
                  padding: "7px 14px",
                  fontWeight: 600,
                }}
              >
                Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editStep === "category" && (
        <CategorySearch
          value={editCategory}
          onConfirm={(selected) => {
            setEditCategory(selected);
            setEditStep("form");
          }}
          onClose={() => setEditStep("form")}
        />
      )}
      {showEditModal && editStep === "group" && (
        <GroupSearch
          value={editGroup}
          onConfirm={(selected) => {
            setEditGroup(selected);
            setEditStep("form");
          }}
          onClose={() => setEditStep("group")}
        />
      )}

      {showEditModal && editStep === "form" && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 1060,
            }}
          />
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1065,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 12px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "14px",
                padding: "24px 16px",
                width: "100%",
                maxWidth: "380px",
                boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "18px",
                  gap: "8px",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "16px",
                      color: "#0f172a",
                    }}
                  >
                    Chỉnh sửa câu hỏi
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      color: "#64748b",
                      marginTop: "2px",
                    }}
                  >
                    {checked.length} câu hỏi đã chọn
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "2px",
                    display: "flex",
                    flexShrink: 0,
                  }}
                >
                  <IconClose />
                </button>
              </div>
              <div
                onClick={() => setEditStep("category")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "11px 14px",
                  borderRadius: "9px",
                  border: `1.5px solid ${editCategory ? "#c5c3e8" : "#e9ecef"}`,
                  background: editCategory ? "#f5f4ff" : "#fafafa",
                  cursor: "pointer",
                  marginBottom: "10px",
                  transition: "border-color 0.15s",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3d3a8c"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  style={{ flexShrink: 0 }}
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <circle cx="3" cy="6" r="1" fill="#3d3a8c" stroke="none" />
                  <circle cx="3" cy="12" r="1" fill="#3d3a8c" stroke="none" />
                  <circle cx="3" cy="18" r="1" fill="#3d3a8c" stroke="none" />
                </svg>
                <span
                  style={{
                    flex: 1,
                    fontSize: "16px",
                    color: editCategory ? "#3d3a8c" : "#adb5bd",
                    fontWeight: editCategory ? 500 : 400,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {editCategory ? editCategory.name : "Chọn danh mục"}
                </span>
                {editCategory && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditCategory(null);
                    }}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <IconClose />
                  </span>
                )}
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#adb5bd"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ flexShrink: 0 }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <div
                onClick={() => setEditStep("group")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "11px 14px",
                  borderRadius: "9px",
                  border: `1.5px solid ${editGroup ? "#c5c3e8" : "#e9ecef"}`,
                  background: editGroup ? "#f5f4ff" : "#fafafa",
                  cursor: "pointer",
                  marginBottom: "22px",
                  transition: "border-color 0.15s",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3d3a8c"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="9" cy="9" r="5" />
                  <circle cx="15" cy="9" r="5" />
                  <circle cx="12" cy="15" r="5" />
                </svg>
                <span
                  style={{
                    flex: 1,
                    fontSize: "16px",
                    color: editGroup ? "#3d3a8c" : "#adb5bd",
                    fontWeight: editGroup ? 500 : 400,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {editGroup ? editGroup.name : "Chọn nhóm câu hỏi"}
                </span>
                {editGroup && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditGroup(null);
                    }}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <IconClose />
                  </span>
                )}
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#adb5bd"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ flexShrink: 0 }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    border: "1.5px solid #e9ecef",
                    background: "#fff",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
                <button
                  disabled={editLoading}
                  onClick={handleConfirmEdit}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#3d3a8c",
                    color: "#fff",
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: editLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {editLoading && (
                    <div
                      style={{
                        width: "14px",
                        height: "14px",
                        border: "2px solid rgba(255,255,255,0.4)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                  )}
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toolbar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              position: "relative",
              flex: 1,
              minWidth: "120px",
              maxWidth: "400px",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <IconSearch />
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchSubmit}
              placeholder="Enter để tìm kiếm..."
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                border: "1.5px solid #e9ecef",
                borderRadius: "8px",
                fontSize: "16px",
                color: "#212529",
                outline: "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3d3a8c";
                e.target.style.boxShadow = "0 0 0 3px rgba(61,58,140,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e9ecef";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
          <button
            onClick={() => setShowFilter(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              border: "1.5px solid #e9ecef",
              borderRadius: "8px",
              background: activeFilterCount > 0 ? "#f0effc" : "#fff",
              color: activeFilterCount > 0 ? "#3d3a8c" : "#212529",
              fontSize: "16px",
              cursor: "pointer",
              position: "relative",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#3d3a8c";
              e.currentTarget.style.color = "#3d3a8c";
            }}
            onMouseLeave={(e) => {
              if (!activeFilterCount) {
                e.currentTarget.style.borderColor = "#e9ecef";
                e.currentTarget.style.color = "#212529";
              }
            }}
          >
            Lọc <IconFilter />
            {activeFilterCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  background: "#3d3a8c",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "17px",
                  height: "17px",
                  fontSize: "13px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
          {!isNarrow &&
            (!selectMode ? (
              <button
                onClick={() => setSelectMode(true)}
                disabled={questions.length === 0}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 14px",
                  border: "1.5px solid #e9ecef",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#212529",
                  fontSize: "16px",
                  cursor: questions.length === 0 ? "not-allowed" : "pointer",
                  opacity: questions.length === 0 ? 0.5 : 1,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (questions.length > 0) {
                    e.currentTarget.style.borderColor = "#3d3a8c";
                    e.currentTarget.style.color = "#3d3a8c";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e9ecef";
                  e.currentTarget.style.color = "#212529";
                }}
              >
                <IconSelect /> Chọn
              </button>
            ) : (
              <button
                onClick={exitSelectMode}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 14px",
                  border: "1.5px solid #e9ecef",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#212529",
                  fontSize: "16px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Hủy
              </button>
            ))}
        </div>
        {isNarrow && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            {!selectMode ? (
              <button
                onClick={() => setSelectMode(true)}
                disabled={questions.length === 0}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 14px",
                  border: "1.5px solid #e9ecef",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#212529",
                  fontSize: "16px",
                  cursor: questions.length === 0 ? "not-allowed" : "pointer",
                  opacity: questions.length === 0 ? 0.5 : 1,
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (questions.length > 0) {
                    e.currentTarget.style.borderColor = "#3d3a8c";
                    e.currentTarget.style.color = "#3d3a8c";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e9ecef";
                  e.currentTarget.style.color = "#212529";
                }}
              >
                <IconSelect /> Chọn
              </button>
            ) : (
              <button
                onClick={exitSelectMode}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 14px",
                  border: "1.5px solid #e9ecef",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#212529",
                  fontSize: "16px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Hủy
              </button>
            )}
          </div>
        )}
      </div>

      {/* Select mode action bar */}
      {selectMode && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "10px",
            padding: "10px 14px",
            background: "#f8f7ff",
            borderRadius: "8px",
            border: "1.5px solid #e8e6f9",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginLeft: "auto",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleEditSelected}
              disabled={checked.length === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "7px",
                border: `1.5px solid ${checked.length === 0 ? "#e9ecef" : "#3d3a8c"}`,
                background: "#fff",
                color: checked.length === 0 ? "#adb5bd" : "#3d3a8c",
                fontSize: "16px",
                fontWeight: 500,
                cursor: checked.length === 0 ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <IconEdit
                size={13}
                color={checked.length === 0 ? "#adb5bd" : "#3d3a8c"}
              />
              Chỉnh sửa ({checked.length})
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={checked.length === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "7px",
                border: "none",
                background: checked.length === 0 ? "#f1f3f5" : "#ef4444",
                color: checked.length === 0 ? "#adb5bd" : "#fff",
                fontSize: "16px",
                fontWeight: 500,
                cursor: checked.length === 0 ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <IconTrash
                size={13}
                color={checked.length === 0 ? "#adb5bd" : "#fff"}
              />
              Xóa ({checked.length})
            </button>
            <button
              onClick={handleDeleteAll}
              disabled={questions.length === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "7px",
                border: "1.5px solid #ef4444",
                background: "#fff",
                color: "#ef4444",
                fontSize: "16px",
                fontWeight: 500,
                cursor: questions.length === 0 ? "not-allowed" : "pointer",
                opacity: questions.length === 0 ? 0.5 : 1,
                whiteSpace: "nowrap",
              }}
            >
              <IconTrash size={13} color="#ef4444" />
              Xóa tất cả
            </button>
          </div>
        </div>
      )}

      {/* Question list */}
      <div
        style={{
          marginTop: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {showSkeleton && [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        {!showSkeleton &&
          questions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              selectMode={selectMode}
              isChecked={checked.includes(q.id)}
              isWide={isWide}
              onToggleCheck={toggleCheck}
              onEditSingle={handleEditSingle}
              onDeleteSingle={handleDeleteSingle}
            />
          ))}
        {showEmpty && (
          <div
            style={{ textAlign: "center", padding: "48px 0", color: "#adb5bd" }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ced4da"
              strokeWidth="1.5"
              style={{ marginBottom: "12px" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <div
              style={{ fontSize: "16px", fontWeight: 500, color: "#6c757d" }}
            >
              Không tìm thấy câu hỏi nào
            </div>
          </div>
        )}
        {showLoadMore && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "16px 0",
            }}
          >
            <div
              style={{
                width: "22px",
                height: "22px",
                border: "2.5px solid #e9ecef",
                borderTopColor: "#3d3a8c",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }}
            />
          </div>
        )}
        <div ref={sentinelRef} style={{ height: "1px" }} />
      </div>
    </>
  );
});

export default Question;
