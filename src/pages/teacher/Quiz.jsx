import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateQuiz from "./CreateQuiz";
import { getQuizzes, deleteQuiz } from "../../service/quiz.service";
import ClassSearchSingle from "../../component/ClassSearchSingle";

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconPlus = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconSearch = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#adb5bd"
    strokeWidth="2"
    strokeLinecap="round"
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
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
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
const IconClock = ({ size = 13, color = "#6c757d" }) => (
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
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconRepeat = ({ size = 13, color = "#6c757d" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
  >
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 014-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 01-4 4H3" />
  </svg>
);
const IconList = ({ size = 13, color = "#6c757d" }) => (
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
const IconLock = ({ size = 13, color = "#6c757d" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);
const IconGlobe = ({ size = 13, color = "#6c757d" }) => (
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
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
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
const IconDots = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
  >
    <circle cx="12" cy="5" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="19" r="1" fill="currentColor" />
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
      transform: open ? "rotate(180deg)" : "none",
      transition: "transform 0.2s",
    }}
  >
    <polyline points="6 9 12 15 18 9" />
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

// ─── ConfirmModal ─────────────────────────────────────────────────────────────
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

// ─── StatusBadge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const isPublished = status === "PUBLISHED";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 10px",
        borderRadius: "15px",
        fontSize: "16px",
        fontWeight: 600,
        background: isPublished ? "#dcfce7" : "#f1f5f9",
        color: isPublished ? "#16a34a" : "#64748b",
        whiteSpace: "nowrap",
      }}
    >
      <span />
      {isPublished ? "Đã xuất bản" : "Bản nháp"}
    </span>
  );
};

// ─── SkeletonCard ─────────────────────────────────────────────────────────────
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
    {[["60%"], ["80%"], ["40%", "40%"]].map((row, ri) => (
      <div key={ri} style={{ display: "flex", gap: "8px" }}>
        {row.map((w, i) => (
          <div
            key={i}
            style={{
              height: ri === 0 ? 22 : 16,
              width: w,
              background:
                "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",
              backgroundSize: "200% 100%",
              borderRadius: "6px",
              animation: "shimmer 1.5s infinite",
            }}
          />
        ))}
      </div>
    ))}
  </div>
);

// ─── QuizCard ─────────────────────────────────────────────────────────────────
const QuizCard = ({ quiz, onDelete, onNavigate }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const isPrivate = quiz.quizAccessType === "PRIVATE";

  const formatDate = (dt) => {
    if (!dt) return null;
    return new Date(dt).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div
      className="quiz-card"
      onClick={() => onNavigate(quiz.id)}
      style={{
        position: "relative",
        background: "#fff",
        borderRadius: "10px",
        border: "1.5px solid #f0f0f0",
        padding: "14px 16px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        transition: "border-color 0.15s, box-shadow 0.15s",
        cursor: "pointer",
      }}
    >
      {/* 3-dot menu */}
      <div
        ref={menuRef}
        className="quiz-menu-wrap"
        style={{ position: "absolute", top: "10px", right: "10px", zIndex: 2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="quiz-menu-btn"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "7px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6c757d",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#3d3a8c";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#6c757d";
          }}
        >
          <IconDots />
        </button>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: "36px",
              right: 0,
              zIndex: 10,
              background: "#fff",
              borderRadius: "9px",
              border: "1.5px solid #e9ecef",
              boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
              minWidth: "130px",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => {
                setMenuOpen(false);
                onDelete(quiz);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "9px 14px",
                border: "none",
                background: "transparent",
                fontSize: "16px",
                color: "#ef4444",
                cursor: "pointer",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#fff5f5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <IconTrash size={14} color="#ef4444" /> Xóa
            </button>
          </div>
        )}
      </div>

      {/* Status + access */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
          paddingRight: "40px",
        }}
      >
        <StatusBadge status={quiz.quizStatus} />
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "16px",
            color: "#6c757d",
          }}
        >
          {isPrivate ? (
            <IconLock size={13} color="#6c757d" />
          ) : (
            <IconGlobe size={13} color="#6c757d" />
          )}
          {isPrivate ? "Riêng tư" : "Công khai"}
        </span>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: "16px",
          fontWeight: 700,
          color: "#212529",
          lineHeight: 1.4,
          wordBreak: "break-word",
        }}
      >
        {quiz.title}
      </div>

      {/* Description */}
      {quiz.description && (
        <div
          style={{
            fontSize: "16px",
            color: "#6c757d",
            lineHeight: 1.5,
            wordBreak: "break-word",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {quiz.description}
        </div>
      )}

      {/* Meta row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexWrap: "wrap",
          paddingTop: "6px",
          borderTop: "1px solid #f5f5f5",
        }}
      >
        {quiz.durationMinutes != null && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "16px",
              color: "#6c757d",
            }}
          >
            <IconClock size={13} /> {quiz.durationMinutes} phút
          </span>
        )}
        {quiz.maxAttempts != null && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "16px",
              color: "#6c757d",
            }}
          >
            <IconRepeat size={13} /> {quiz.maxAttempts} lần
          </span>
        )}
        {quiz.questionCount != null && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "16px",
              color: "#6c757d",
            }}
          >
            <IconList size={13} /> {quiz.questionCount} câu
          </span>
        )}
        {quiz.createdAt && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: "16px",
              color: "#adb5bd",
              whiteSpace: "nowrap",
            }}
          >
            {formatDate(quiz.createdAt)}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Filter options ───────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: null, label: "Tất cả" },
  { value: "PUBLISHED", label: "Đã xuất bản" },
  { value: "DRAFT", label: "Bản nháp" },
];
const ACCESS_OPTIONS = [
  { value: null, label: "Tất cả" },
  { value: "PUBLIC", label: "Công khai" },
  { value: "PRIVATE", label: "Riêng tư" },
];

const PAGE_SIZE = 10;

// ─── Main ─────────────────────────────────────────────────────────────────────
const Quiz = () => {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFirstPage, setIsFirstPage] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterAccess, setFilterAccess] = useState(null);
  const [filterClass, setFilterClass] = useState(null);
  const [appliedFilter, setAppliedFilter] = useState({
    status: null,
    access: null,
    classId: null,
  });
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showAccessDropdown, setShowAccessDropdown] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState(null);
  const [confirmCb, setConfirmCb] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const sentinelRef = useRef(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const skipFirstEffect = useRef(false);

  const fetchPage = useCallback(
    async (pageIndex, reset = false) => {
      if (loading) return;
      setLoading(true);
      if (reset) setIsFirstPage(true);
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await getQuizzes({
          title: search || undefined,
          classId: appliedFilter.classId ?? undefined,
          status: appliedFilter.status ?? undefined,
          quizAccessType: appliedFilter.access ?? undefined,
          page: pageIndex,
          size: PAGE_SIZE,
        });
        const data = res?.data ?? [];
        const meta = res?.meta ?? {};
        setHasMore(pageIndex + 1 < (meta.totalPages ?? 1));
        setQuizzes((prev) => (reset ? data : [...prev, ...data]));
        setPage(pageIndex);
      } catch {
        setHasMore(false);
      } finally {
        setLoading(false);
        setIsFirstPage(false);
      }
    },
    [search, appliedFilter],
  );

  useEffect(() => {
    skipFirstEffect.current = true;
    setQuizzes([]);
    setPage(0);
    setHasMore(true);
    fetchPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (skipFirstEffect.current) {
      skipFirstEffect.current = false;
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuizzes([]);
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

  const reload = () => {
    setQuizzes([]);
    setPage(0);
    setHasMore(true);
    fetchPage(0, true);
  };

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
      reload();
    } catch {
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDelete = (quiz) => {
    openConfirm(
      `Bài kiểm tra <strong>"${quiz.title?.slice(0, 60) ?? ""}"</strong> sẽ bị xóa vĩnh viễn.`,
      () => deleteQuiz(quiz.id),
    );
  };

  const handleNavigate = (id) => navigate(`/teacher/quizzes/${id}`);

  const handleApplyFilter = () => {
    setAppliedFilter({
      status: filterStatus,
      access: filterAccess,
      classId: filterClass?.id ?? null,
    });
    setShowFilter(false);
  };
  const handleResetFilter = () => {
    setFilterStatus(null);
    setFilterAccess(null);
    setFilterClass(null);
    setShowStatusDropdown(false);
    setShowAccessDropdown(false);
    setAppliedFilter({ status: null, access: null, classId: null });
  };

  const activeFilterCount = [
    appliedFilter.status,
    appliedFilter.access,
    appliedFilter.classId,
  ].filter(Boolean).length;
  const showSkeleton = loading && isFirstPage && quizzes.length === 0;
  const showLoadMore = loading && !isFirstPage;
  const showEmpty = !loading && quizzes.length === 0;

  const dropdownRowSt = (active) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "7px 10px 7px 14px",
    borderRadius: "7px",
    cursor: "pointer",
    background: active ? "#f0effc" : "transparent",
    fontSize: "16px",
    color: active ? "#3d3a8c" : "#495057",
    fontWeight: active ? 600 : 400,
  });

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .quiz-card:hover { border-color: #c5c3e8 !important; box-shadow: 0 2px 12px rgba(61,58,140,0.07) !important; }
        @media (max-width: 480px) {
          .exam-toolbar { flex-wrap: wrap !important; }
          .exam-search { width: 100% !important; max-width: 100% !important; }
          .exam-create-btn { margin-left: auto !important; }
        }
      `}</style>

      {showCreate && (
        <CreateQuiz
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            reload();
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

      {showClassModal && (
        <ClassSearchSingle
          value={filterClass}
          title="Chọn lớp"
          onConfirm={(cls) => {
            setFilterClass(cls);
            setShowClassModal(false);
            setShowFilter(true);
          }}
          onClose={() => {
            setShowClassModal(false);
            setShowFilter(true);
          }}
        />
      )}

      {/* Filter modal */}
      {showFilter && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 12px",
            boxSizing: "border-box",
          }}
          onClick={() => setShowFilter(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "20px 16px 24px",
              width: "100%",
              maxWidth: "360px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              boxSizing: "border-box",
            }}
            onClick={(e) => e.stopPropagation()}
          >
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
                }}
              >
                <IconClose />
              </button>
            </div>

            {/* Status */}
            <div
              style={{
                borderBottom: "1.5px solid #f0f0f0",
                marginBottom: "4px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 0",
                  cursor: "pointer",
                }}
                onClick={() => setShowStatusDropdown((v) => !v)}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3d3a8c"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span
                  style={{
                    flex: 1,
                    fontSize: "16px",
                    color: filterStatus ? "#212529" : "#adb5bd",
                  }}
                >
                  {filterStatus
                    ? STATUS_OPTIONS.find((o) => o.value === filterStatus)
                        ?.label
                    : "Trạng thái"}
                </span>
                {filterStatus && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterStatus(null);
                    }}
                    style={{ cursor: "pointer", display: "flex" }}
                  >
                    <IconClose />
                  </span>
                )}
                <IconChevronDown open={showStatusDropdown} />
              </div>
              {showStatusDropdown && (
                <div
                  style={{
                    paddingBottom: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <div
                      key={String(opt.value)}
                      onClick={() => {
                        setFilterStatus(opt.value);
                        setShowStatusDropdown(false);
                      }}
                      style={dropdownRowSt(filterStatus === opt.value)}
                      onMouseEnter={(e) => {
                        if (filterStatus !== opt.value)
                          e.currentTarget.style.background = "#f8f9fa";
                      }}
                      onMouseLeave={(e) => {
                        if (filterStatus !== opt.value)
                          e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span>{opt.label}</span>
                      {filterStatus === opt.value && <IconCheck />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Access */}
            <div
              style={{
                borderBottom: "1.5px solid #f0f0f0",
                marginBottom: "4px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 0",
                  cursor: "pointer",
                }}
                onClick={() => setShowAccessDropdown((v) => !v)}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3d3a8c"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
                <span
                  style={{
                    flex: 1,
                    fontSize: "16px",
                    color: filterAccess ? "#212529" : "#adb5bd",
                  }}
                >
                  {filterAccess
                    ? ACCESS_OPTIONS.find((o) => o.value === filterAccess)
                        ?.label
                    : "Quyền truy cập"}
                </span>
                {filterAccess && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterAccess(null);
                    }}
                    style={{ cursor: "pointer", display: "flex" }}
                  >
                    <IconClose />
                  </span>
                )}
                <IconChevronDown open={showAccessDropdown} />
              </div>
              {showAccessDropdown && (
                <div
                  style={{
                    paddingBottom: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  {ACCESS_OPTIONS.map((opt) => (
                    <div
                      key={String(opt.value)}
                      onClick={() => {
                        setFilterAccess(opt.value);
                        setShowAccessDropdown(false);
                      }}
                      style={dropdownRowSt(filterAccess === opt.value)}
                      onMouseEnter={(e) => {
                        if (filterAccess !== opt.value)
                          e.currentTarget.style.background = "#f8f9fa";
                      }}
                      onMouseLeave={(e) => {
                        if (filterAccess !== opt.value)
                          e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span>{opt.label}</span>
                      {filterAccess === opt.value && <IconCheck />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Class */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 0",
                borderBottom: "1.5px solid #f0f0f0",
                cursor: "pointer",
              }}
              onClick={() => {
                setShowClassModal(true);
                setShowFilter(false);
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3d3a8c"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
              </svg>
              <span
                style={{
                  flex: 1,
                  fontSize: "16px",
                  color: filterClass ? "#212529" : "#adb5bd",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {filterClass ? filterClass.title : "Chọn lớp"}
              </span>
              {filterClass && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilterClass(null);
                  }}
                  style={{ cursor: "pointer", display: "flex" }}
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
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
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

      {/* Toolbar */}
      <div
        className="exam-toolbar"
        style={{ display: "flex", alignItems: "center", gap: "8px" }}
      >
        <div
          className="exam-search"
          style={{
            position: "relative",
            flex: 1,
            minWidth: "180px",
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
            onKeyDown={(e) => {
              if (e.key === "Enter") setSearch(searchInput);
            }}
            placeholder="Enter để tìm kiếm..."
            style={{
              width: "100%",
              padding: "8px 12px 8px 36px",
              border: "1.5px solid #e9ecef",
              borderRadius: "8px",
              fontSize: "16px",
              color: "#212529",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color .15s, box-shadow .15s",
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
        <button
          className="exam-create-btn"
          onClick={() => setShowCreate(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "7px 14px",
            border: "none",
            borderRadius: "8px",
            background: "#3d3a8c",
            color: "#fff",
            fontWeight: 600,
            fontSize: "16px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
            marginLeft: "auto",
          }}
        >
          Tạo bài kiểm tra <IconPlus />
        </button>
      </div>

      {/* List */}
      <div
        style={{
          marginTop: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {showSkeleton && [1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        {!showSkeleton &&
          quizzes.map((q) => (
            <QuizCard
              key={q.id}
              quiz={q}
              onDelete={handleDelete}
              onNavigate={handleNavigate}
            />
          ))}
        {showEmpty && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
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
              Không tìm thấy bài kiểm tra nào
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
};

export default Quiz;
