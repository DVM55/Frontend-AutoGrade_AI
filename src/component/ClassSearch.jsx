import { useState, useRef, useCallback } from "react";
import { getClasses } from "../service/class.service";

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <>
    <div
      style={{
        width: 20,
        height: 20,
        margin: "0 auto",
        border: "2px solid #e9ecef",
        borderTop: "2px solid #3d3a8c",
        borderRadius: "50%",
        animation: "cs-spin 0.7s linear infinite",
      }}
    />
    <style>{`@keyframes cs-spin { to { transform: rotate(360deg); } }`}</style>
  </>
);

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: "#adb5bd" }}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconCheckSmall = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="3"
    strokeLinecap="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── ClassSearch ──────────────────────────────────────────────────────────────
const ClassSearch = ({ value = [], onConfirm, onClose }) => {
  const [classSearch, setClassSearch] = useState("");
  const [classes, setClasses] = useState([]);
  const [classLoading, setClassLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedTemp, setSelectedTemp] = useState(() => [...value]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchClasses = async (title = "", pageNum = 0, isAppend = false) => {
    if (pageNum === 0) setClassLoading(true);
    else setLoadingMore(true);
    try {
      const res = await getClasses({
        page: pageNum,
        size: 10,
        title: title || undefined,
      });
      setClasses((prev) => (isAppend ? [...prev, ...res.data] : res.data));
      setHasMore(res.meta.currentPage < res.meta.totalPages);
    } catch {
      if (!isAppend) setClasses([]);
    } finally {
      setClassLoading(false);
      setLoadingMore(false);
    }
  };

  useState(() => {
    fetchClasses("", 0, false);
  }, []);

  const timerRef = useRef(null);
  const handleSearch = (e) => {
    const val = e.target.value;
    setClassSearch(val);
    setPage(0);
    setHasMore(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchClasses(val, 0, false), 200);
  };

  const listRef = useRef(null);
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || loadingMore || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 30) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchClasses(classSearch, nextPage, true);
    }
  }, [loadingMore, hasMore, page, classSearch]);

  const toggleSelect = (cls) => {
    setSelectedTemp((prev) =>
      prev.some((c) => c.id === cls.id)
        ? prev.filter((c) => c.id !== cls.id)
        : [...prev, cls],
    );
  };

  return (
    <>
      <style>{`
        .cs-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 1200;
          display: flex;
          align-items: center;
          justify-content: center;
          /* padding để modal không dính mép màn hình */
          padding: 16px;
          box-sizing: border-box;
        }

        .cs-modal {
          background: #fff;
          border-radius: 14px;
          width: 100%;
          max-width: 400px;

          /*
           * Chiều cao cố định trên mobile:
           * - dvh (dynamic viewport height) tránh lỗi 100vh bị che bởi address bar
           * - fallback về 100vh cho browser cũ không hỗ trợ dvh
           * - trừ 32px = 2 × 16px padding backdrop
           */
          height: calc(100vh - 32px);
          height: calc(100dvh - 32px);

          /* Giới hạn trên desktop — không cần cao hơn 560px */
          max-height: 560px;

          /* Bắt buộc: flex column + overflow hidden để list con scroll được */
          display: flex;
          flex-direction: column;
          overflow: hidden;

          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }

        /* ── Header (flex-shrink: 0 → không bao giờ bị co) ── */
        .cs-header {
          padding: 14px 16px 0;
          flex-shrink: 0;
        }
        .cs-title-row {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 8px;
          margin-bottom: 12px;
        }
        .cs-title  { font-weight: 700; font-size: 16px; color: #212529; margin: 0; }
        .cs-subtitle { font-size: 15px; color: #6c757d; margin: 2px 0 0; }
        .cs-close-btn {
          width: 28px; height: 28px; flex-shrink: 0;
          border-radius: 7px; border: 1.5px solid #e9ecef;
          background: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #6c757d;
        }
        .cs-close-btn:hover { background: #f8f9fa; }

        .cs-search-wrap { position: relative; margin-bottom: 10px; }
        .cs-search-icon {
          position: absolute; left: 10px; top: 50%;
          transform: translateY(-50%); pointer-events: none;
          display: flex; align-items: center;
        }
        .cs-search-input {
          width: 100%; padding: 8px 10px 8px 32px;
          border: 1.5px solid #e9ecef; border-radius: 8px;
          font-size: 16px; /* 16px tránh iOS zoom khi focus */
          outline: none; box-sizing: border-box;
          transition: border-color 0.15s;
          background: #fafafa; color: #212529;
        }
        .cs-search-input:focus { border-color: #3d3a8c; background: #fff; }

        .cs-divider { height: 1px; background: #f0f0f0; margin: 0 -16px; }

        /*
         * ── List (flex: 1 + overflow-y: auto = phần còn lại scroll) ──
         * Đây là phần quan trọng nhất để scroll hoạt động đúng:
         * flex: 1          → chiếm hết không gian còn lại
         * min-height: 0    → override min-height: auto mặc định của flex item,
         *                    nếu thiếu dòng này list sẽ không scroll mà đẩy footer ra ngoài
         * overflow-y: auto → scroll khi nội dung vượt chiều cao
         */
        .cs-list {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 4px 0;
          -webkit-overflow-scrolling: touch; /* momentum scroll iOS */
        }

        .cs-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 11px 16px; cursor: pointer;
          transition: background 0.1s; min-width: 0;
        }
        .cs-item:hover  { background: #f8f9fa; }
        .cs-item.selected { background: #f5f4ff; }
        .cs-item.selected:hover { background: #eeecff; }

        .cs-checkbox {
          width: 17px; height: 17px; border-radius: 4px;
          flex-shrink: 0; margin-top: 2px;
          border: 1.5px solid #d1d5db; background: #fff;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .cs-checkbox.checked { background: #3d3a8c; border-color: #3d3a8c; }

        .cs-item-label {
          font-size: 16px; color: #212529; line-height: 1.45;
          flex: 1; min-width: 0;
          word-break: break-word; overflow-wrap: anywhere;
        }
        .cs-item.selected .cs-item-label { color: #3d3a8c; font-weight: 500; }

        .cs-empty {
          padding: 32px 16px; text-align: center;
          color: #adb5bd; font-size: 16px;
        }

        /* ── Footer (flex-shrink: 0 → luôn hiển thị ở đáy) ── */
        .cs-footer {
          padding: 12px 16px;
          border-top: 1.5px solid #f0f0f0;
          flex-shrink: 0;
          display: flex; align-items: center;
          justify-content: flex-end; gap: 8px;
        }
        .cs-count {
          font-size: 16px; color: #6c757d;
          min-width: 0; flex-shrink: 1;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .cs-count strong { color: #3d3a8c; font-weight: 600; }
        .cs-footer-btns { display: flex; gap: 8px; flex-shrink: 0; }
        .cs-btn-cancel {
          background: transparent; border: 1.5px solid #e9ecef;
          border-radius: 8px; color: #6c757d;
          font-size: 16px; font-weight: 500; padding: 7px 16px; cursor: pointer;
          white-space: nowrap;
        }
        .cs-btn-cancel:hover { background: #f8f9fa; }
        .cs-btn-confirm {
          background: #3d3a8c; border: none; border-radius: 8px; color: #fff;
          font-size: 16px; font-weight: 600; padding: 7px 18px; cursor: pointer;
          white-space: nowrap;
        }
        .cs-btn-confirm:hover { background: #2f2c6e; }

        /* Scrollbar nhỏ gọn */
        .cs-list::-webkit-scrollbar { width: 4px; }
        .cs-list::-webkit-scrollbar-track { background: transparent; }
        .cs-list::-webkit-scrollbar-thumb { background: #dee2e6; border-radius: 4px; }
        .cs-list::-webkit-scrollbar-thumb:hover { background: #ced4da; }
      `}</style>

      {/* Backdrop */}
      <div className="cs-backdrop" onClick={onClose}>
        {/* Modal */}
        <div className="cs-modal" onClick={(e) => e.stopPropagation()}>
          {/* ── Header ── */}
          <div className="cs-header">
            <div className="cs-title-row">
              <div style={{ minWidth: 0 }}>
                <p className="cs-title">Chọn lớp học</p>
                <p className="cs-subtitle">Thêm lớp được phép làm bài</p>
              </div>
              <button className="cs-close-btn" onClick={onClose}>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Search — font-size 16px tránh iOS tự zoom */}
            <div className="cs-search-wrap">
              <span className="cs-search-icon">
                <IconSearch />
              </span>
              <input
                type="text"
                className="cs-search-input"
                placeholder="Tìm kiếm lớp..."
                value={classSearch}
                onChange={handleSearch}
                autoFocus
              />
            </div>

            <div className="cs-divider" />
          </div>

          {/* ── List (scroll ở đây) ── */}
          <div className="cs-list" ref={listRef} onScroll={handleScroll}>
            {classLoading ? (
              <div className="cs-empty">
                <Spinner />
              </div>
            ) : classes.length === 0 ? (
              <div className="cs-empty">Không có dữ liệu</div>
            ) : (
              <>
                {classes.map((cls) => {
                  const isSel = selectedTemp.some((c) => c.id === cls.id);
                  return (
                    <div
                      key={cls.id}
                      className={`cs-item${isSel ? " selected" : ""}`}
                      onClick={() => toggleSelect(cls)}
                      title={cls.title}
                    >
                      <div className={`cs-checkbox${isSel ? " checked" : ""}`}>
                        {isSel && <IconCheckSmall />}
                      </div>
                      <span className="cs-item-label">{cls.title}</span>
                    </div>
                  );
                })}
                {loadingMore && (
                  <div style={{ padding: "10px", textAlign: "center" }}>
                    <Spinner />
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="cs-footer">
            <div className="cs-footer-btns">
              <button className="cs-btn-cancel" onClick={onClose}>
                Hủy
              </button>
              <button
                className="cs-btn-confirm"
                onClick={() => onConfirm(selectedTemp)}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClassSearch;
