import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getClasses, getClassByCode } from "../../service/class.service";
import { joinClass } from "../../service/classMember.service";

/* ── Màu banner lớp ── */
const COLORS = [
  "#1a73e8",
  "#0f9d58",
  "#f4511e",
  "#7986cb",
  "#e67c73",
  "#33b679",
  "#8e24aa",
  "#039be5",
  "#f6bf26",
  "#616161",
];
const getColor = (id) => COLORS[id % COLORS.length];
const canViewDetail = (item) =>
  !item.joinStatus || item.joinStatus === "JOINED";

/* ─────────────── ClassCard ─────────────── */
const ClassCard = ({ item, onJoin, joiningId, index }) => {
  const navigate = useNavigate();
  const color = getColor(item.id);

  const viewable = canViewDetail(item);
  const { joinStatus } = item;

  return (
    <div
      className="cu-card"
      style={{ "--accent": color, animationDelay: `${index * 60}ms` }}
      onClick={() => viewable && navigate(`${item.id}`)}
      role={viewable ? "button" : undefined}
      tabIndex={viewable ? 0 : undefined}
      onKeyDown={(e) => e.key === "Enter" && viewable && navigate(`${item.id}`)}
    >
      {/* Banner */}
      <div className="cu-card__banner">
        <span className="cu-card__title">{item.title}</span>
      </div>

      {/* Body */}
      <div className="cu-card__body">
        <p className="cu-card__desc">
          {item.description || <em>Không có mô tả</em>}
        </p>

        <div className="cu-card__meta">
          <span className="cu-card__members">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {item.memberCount} thành viên
          </span>
          <span className="cu-card__code">{item.classCode}</span>
        </div>

        {/* Join button */}
        {joinStatus === "NOT_JOINED" && (
          <button
            className="cu-btn cu-btn--primary"
            disabled={joiningId === item.id}
            onClick={(e) => {
              e.stopPropagation();
              onJoin(item);
            }}
          >
            {joiningId === item.id ? (
              <>
                <span className="cu-spinner" /> Đang xử lý...
              </>
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Tham gia lớp
              </>
            )}
          </button>
        )}

        {joinStatus === "PENDING_APPROVAL" && (
          <div className="cu-btn cu-btn--pending">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Đang chờ phê duyệt
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────── Pagination Helper ─────────────── */
const getPaginationItems = (currentPage, totalPages) => {
  const items = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let i = 0; i < totalPages; i++) {
      items.push(i);
    }
  } else {
    items.push(0);

    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages - 2, currentPage + 1);

    if (currentPage <= 2) {
      end = 3;
    } else if (currentPage >= totalPages - 3) {
      start = totalPages - 4;
    }

    if (start > 1) items.push("...");

    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    if (end < totalPages - 2) items.push("...");

    items.push(totalPages - 1);
  }

  return items;
};

/* ─────────────── ClassUser ─────────────── */
const ClassUser = () => {
  const [classes, setClasses] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [joiningId, setJoiningId] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const searchStatus = notFound ? "notfound" : searchResult ? "found" : "idle";
  const isLoading = loading || searching;

  const fetchClasses = useCallback(async (p = 0) => {
    try {
      setLoading(true);

      const res = await getClasses({ page: p, size: 12 });
      setClasses(res.data || []);
      setTotalPages(res.meta.totalPages || 0);
      setPage(p);
    } catch {
      toast.error("Không thể tải danh sách lớp");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses(0);
  }, [fetchClasses]);

  const handleSearch = async () => {
    const code = searchCode.trim();
    if (!code) {
      setSearchResult(null);
      setNotFound(false);
      fetchClasses(0);
      return;
    }
    try {
      setSearching(true);
      setNotFound(false);
      const res = await getClassByCode(code);
      setSearchResult(res.data);
    } catch {
      setSearchResult(null);
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchCode("");
    setSearchResult(null);
    setNotFound(false);
    fetchClasses(0);
  };

  const handleJoin = async (item) => {
    if (!item?.classCode) {
      toast.error("Không tìm thấy mã lớp");
      return;
    }
    try {
      setJoiningId(item.id);
      await joinClass(item.classCode);
      toast.success("Đã gửi yêu cầu tham gia lớp");
      setSearchResult((prev) =>
        prev ? { ...prev, joinStatus: "PENDING_APPROVAL" } : prev,
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Tham gia thất bại");
    } finally {
      setJoiningId(null);
    }
  };

  const displayList = searchResult ? [searchResult] : classes;
  const paginationItems = getPaginationItems(page, totalPages);

  return (
    <>
      <style>{`
        /* ══ Variables ══ */
        .cu-root {
          --blue:    #1a73e8;
          --blue-lt: #e8f0fe;
          --text:    #1a1a2e;
          --muted:   #6b7280;
          --border:  #e5e7eb;
          --bg:      #f8faff;
          --card-r:  18px;
        }

        /* ══ Page wrapper ══ */
        .cu-wrapper {
          background: var(--bg);
          min-height: 100vh;
        }

        .cu-root {
          min-height: calc(100dvh - var(--header-h, 0px));
          padding: 28px clamp(16px, 4vw, 32px) 48px;
          max-width: 1100px;
          margin: 0 auto;
        }

        /* ══ Top bar ══ */
        .cu-topbar {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 16px;
        }

        /* ══ Search ══ */
        .cu-search {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cu-search__wrap {
          position: relative;
          width: 260px;
        }

        .cu-search__icon {
          position: absolute;
          left: 12px; top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
          pointer-events: none;
          display: flex;
        }

        .cu-search__input {
          width: 100%;
          padding: 9px 36px 9px 36px;
          font-size: 16px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          outline: none;
          background: #fff;
          color: var(--text);
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .cu-search__input::placeholder { color: #b0b7c3; }
        .cu-search__input:focus {
          border-color: var(--blue);
          box-shadow: 0 0 0 3px rgba(26,115,232,0.12);
        }

        .cu-search__clear {
          position: absolute;
          right: 10px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; color: var(--muted);
          display: flex; align-items: center;
          padding: 2px;
          border-radius: 4px;
          transition: color 0.15s;
        }
        .cu-search__clear:hover { color: var(--text); }

        .cu-btn-search {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 18px;
          background: var(--blue);
          color: #fff;
          border: none; border-radius: 10px;
          font-size: 16px; font-weight: 600;
          cursor: pointer;
          transition: background 0.18s, transform 0.15s;
          white-space: nowrap;
        }
        .cu-btn-search:hover:not(:disabled) { background: #1557b0; transform: translateY(-1px); }
        .cu-btn-search:disabled { opacity: 0.7; cursor: not-allowed; }

        /* ══ Status bar (spinner + count) ══ */
        .cu-status-bar {
          min-height: 32px;
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }

        /* Spinner area — fills space below search bar, centered */
        .cu-spinner-area {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(48px, 15vw, 120px) 16px;
          box-sizing: border-box;
        }

        .cu-inline-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          animation: cu-fadein 0.2s both;
        }

        .cu-spin-ring {
          width: 30px;
          height: 30px;
          border: 4px solid var(--blue-lt);
          border-top-color: var(--blue);
          border-radius: 50%;
          animation: cu-spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        .cu-inline-spinner span {
          font-size: clamp(16px, 3vw, 16px);
          color: var(--muted);
          font-weight: 500;
          letter-spacing: -0.01em;
        }

        /* ══ Grid ══ */
        .cu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 18px;
          animation: cu-fadein 0.3s both;
        }

        /* ══ Card ══ */
        .cu-card {
          background: #fff;
          border-radius: var(--card-r);
          border: 1.5px solid var(--border);
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          animation: cu-fadeup 0.35s both;
          cursor: default;
        }
        .cu-card[role="button"] { cursor: pointer; }
        .cu-card[role="button"]:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(26,115,232,0.13);
          border-color: rgba(26,115,232,0.25);
        }
        .cu-card[role="button"]:focus-visible {
          outline: 2px solid var(--blue);
          outline-offset: 2px;
        }

        @keyframes cu-fadeup {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Card banner */
        .cu-card__banner {
          height: 88px;
          background: var(--accent);
          position: relative;
          padding: 16px 70px 16px 18px;
          display: flex;
          align-items: flex-start;
        }

        .cu-card__title {
          font-size: 17px;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          line-height: 1.3;
          text-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }

        /* Card body */
        .cu-card__body {
          padding: 28px 16px 16px;
        }

        .cu-card__desc {
          font-size: 16px;
          color: var(--muted);
          margin: 0 0 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-height: 20px;
          line-height: 1.5;
        }

        .cu-card__meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .cu-card__members {
          display: flex; align-items: center; gap: 5px;
          font-size: 16px; color: var(--muted);
        }

        .cu-card__code {
          font-size: 15px; font-weight: 600;
          background: var(--blue-lt);
          color: var(--blue);
          padding: 3px 9px; border-radius: 20px;
          letter-spacing: 0.04em;
        }

        /* ══ Buttons inside card ══ */
        .cu-btn {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 9px 14px;
          border-radius: 9px;
          font-size: 16px; font-weight: 600;
          border: none; cursor: pointer;
          transition: opacity 0.18s, transform 0.15s;
        }
        .cu-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.9; }
        .cu-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .cu-btn--primary { background: var(--blue); color: #fff; }
        .cu-btn--pending {
          background: #fff8e1;
          color: #b45309;
          border: 1px solid #fde68a;
          cursor: default;
        }

        /* ══ Spinner (button inner) ══ */
        .cu-spinner {
          width: 13px; height: 13px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: cu-spin 0.65s linear infinite;
          flex-shrink: 0;
          display: inline-block;
        }

        @keyframes cu-spin { to { transform: rotate(360deg); } }

        /* ══ Empty state ══ */
        .cu-empty {
          grid-column: 1 / -1;
          display: flex; flex-direction: column; align-items: center;
          padding: 64px 20px;
          color: var(--muted);
          gap: 10px;
        }
        .cu-empty__icon {
          width: 56px; height: 56px;
          background: var(--blue-lt);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 4px;
        }
        .cu-empty__title { font-size: 16px; font-weight: 600; color: var(--text); }
        .cu-empty__sub   { font-size: 15px; }

        /* ══ Pagination ══ */
        .cu-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 32px;
          animation: cu-fadein 0.3s 0.2s both;
        }

        @keyframes cu-fadein {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .cu-page-btn {
          min-width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          padding: 0 10px;
          border: 1.5px solid var(--border);
          background: #fff; color: var(--text);
          border-radius: 8px; font-size: 16px; font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          user-select: none;
        }
        .cu-page-btn:hover:not(:disabled):not(.cu-page-btn--active) {
          border-color: var(--blue); color: var(--blue);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(26,115,232,0.15);
        }
        .cu-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .cu-page-btn--active {
          background: var(--blue); color: #fff; border-color: var(--blue);
          box-shadow: 0 2px 8px rgba(26,115,232,0.25);
        }
        .cu-page-btn--nav { padding: 0; width: 36px; }
        .cu-page-btn--dots {
          border: none; background: transparent;
          cursor: default; color: var(--muted); pointer-events: none;
        }

        /* ══ Responsive ══ */
        @media (max-width: 599px) {
          .cu-search__wrap { width: 100%; }
          .cu-search { width: 100%; }
          .cu-topbar { flex-direction: column; align-items: flex-start; }
          .cu-grid { grid-template-columns: 1fr; }
          .cu-pagination { gap: 4px; }
          .cu-page-btn { min-width: 32px; height: 32px; font-size: 16px; }
          .cu-page-btn--nav { width: 32px; }
        }
      `}</style>

      <div className="cu-wrapper">
        <div className="cu-root">
          {/* ── Top bar (search) ── */}
          <div className="cu-topbar">
            <div className="cu-search">
              <div className="cu-search__wrap">
                <span className="cu-search__icon">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  className="cu-search__input"
                  placeholder="Nhập mã lớp..."
                  value={searchCode}
                  onChange={(e) => {
                    setSearchCode(e.target.value);
                    if (!e.target.value.trim()) {
                      setNotFound(false);
                      setSearchResult(null);
                    }
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                {searchCode && (
                  <button
                    className="cu-search__clear"
                    onClick={handleClearSearch}
                    aria-label="Xóa"
                  >
                    <svg
                      width="14"
                      height="14"
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
                )}
              </div>

              <button
                className="cu-btn-search"
                onClick={handleSearch}
                disabled={isLoading}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Search
              </button>
            </div>
          </div>

          {/* ── Spinner căn giữa khi đang load ── */}
          {isLoading && <> </>}

          {/* ── Grid: chỉ hiện khi load xong ── */}
          {!isLoading && (
            <div className="cu-grid">
              {searchStatus === "notfound" ? (
                <div className="cu-empty">
                  <div className="cu-empty__icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1a73e8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <div className="cu-empty__title">Không tìm thấy lớp</div>
                  <div className="cu-empty__sub">
                    Kiểm tra lại mã lớp và thử lại
                  </div>
                </div>
              ) : displayList.length === 0 ? (
                <div className="cu-empty">
                  <div className="cu-empty__icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1a73e8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <div className="cu-empty__title">Chưa có lớp học nào</div>
                  <div className="cu-empty__sub">
                    Thử tìm kiếm bằng mã lớp để tham gia
                  </div>
                </div>
              ) : (
                displayList.map((item, i) => (
                  <ClassCard
                    key={item.id}
                    item={item}
                    onJoin={handleJoin}
                    joiningId={joiningId}
                    index={i}
                  />
                ))
              )}
            </div>
          )}

          {/* ── Pagination ── */}
          {!isLoading && searchStatus === "idle" && totalPages > 1 && (
            <div className="cu-pagination">
              <button
                className="cu-page-btn cu-page-btn--nav"
                disabled={page === 0}
                onClick={() => fetchClasses(page - 1)}
                aria-label="Trang trước"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              {paginationItems.map((item, idx) => {
                if (item === "...") {
                  return (
                    <button
                      key={`dots-${idx}`}
                      className="cu-page-btn cu-page-btn--dots"
                      disabled
                    >
                      ...
                    </button>
                  );
                }
                return (
                  <button
                    key={item}
                    className={`cu-page-btn ${page === item ? "cu-page-btn--active" : ""}`}
                    onClick={() => fetchClasses(item)}
                    aria-label={`Trang ${item + 1}`}
                    aria-current={page === item ? "page" : undefined}
                  >
                    {item + 1}
                  </button>
                );
              })}

              <button
                className="cu-page-btn cu-page-btn--nav"
                disabled={page + 1 >= totalPages}
                onClick={() => fetchClasses(page + 1)}
                aria-label="Trang sau"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ClassUser;
