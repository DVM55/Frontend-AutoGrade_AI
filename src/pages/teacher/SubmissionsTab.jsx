import React, { useEffect, useState, useRef } from "react";
import {
  getAllQuizResults,
  exportQuizResults,
} from "../../service/quiz.service";

const SubmissionsTab = ({ quizId }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchBy, setSearchBy] = useState("userName");
  const [showFilter, setShowFilter] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await exportQuizResults(quizId);

      // Nếu interceptor trả res.data thì response chính là blob
      // Nếu không có interceptor thì response.data mới là blob
      const blob =
        response instanceof Blob
          ? response
          : new Blob([response.data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `quiz_${quizId}_results.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  const filterRef = useRef(null);
  const debounceRef = useRef(null);
  const skipSearchEffect = useRef(false);
  const size = 15;

  const FILTER_OPTIONS = [
    { value: "userName", label: "Theo tên học sinh" },
    { value: "email", label: "Theo email" },
  ];

  const fetchResults = async (page = 0, keyword = "", by = searchBy) => {
    try {
      setLoading(true);
      const res = await getAllQuizResults(quizId, {
        page,
        size,
        userName: by === "userName" ? keyword : undefined,
        email: by === "email" ? keyword : undefined,
      });
      const data = res.data || [];
      const meta = res.meta || {};
      setResults(data);
      setTotalPages(meta.totalPages || 0);
      setTotalElements(meta.totalElements || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error(error);
      setResults([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    skipSearchEffect.current = true;
    fetchResults(0, "");
  }, [quizId]);

  useEffect(() => {
    if (skipSearchEffect.current) {
      skipSearchEffect.current = false;
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchResults(0, searchInput, searchBy);
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput, searchBy]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target))
        setShowFilter(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <style>{submissionsStyle}</style>
      <div
        className="st-body-pad"
        style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}
      >
        {/* Toolbar */}
        <div className="st-toolbar">
          <div className="st-row1">
            <div className="st-input-wrap">
              <i className="bi bi-search st-search-icon" />
              <input
                type="text"
                className="st-input"
                placeholder={
                  searchBy === "userName"
                    ? "Tìm theo tên..."
                    : "Tìm theo email..."
                }
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  className="st-clear-btn"
                  onClick={() => setSearchInput("")}
                >
                  <i className="bi bi-x" />
                </button>
              )}
            </div>

            <div className="st-filter-wrap" ref={filterRef}>
              <button
                className={`st-filter-btn ${showFilter ? "st-filter-btn--active" : ""}`}
                onClick={() => setShowFilter((v) => !v)}
              >
                <i className="bi bi-sliders2" />
                <span className="st-filter-btn__label">Lọc</span>
                {searchBy !== "userName" && <span className="st-filter-dot" />}
              </button>
              {showFilter && (
                <div className="st-filter-dropdown">
                  <div className="st-filter-title">Tìm kiếm theo</div>
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      className={`st-filter-option ${searchBy === opt.value ? "st-filter-option--active" : ""}`}
                      onClick={() => {
                        setSearchBy(opt.value);
                        setSearchInput("");
                        setShowFilter(false);
                      }}
                    >
                      {searchBy === opt.value && (
                        <i className="bi bi-check2 me-1" />
                      )}
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="st-export-row">
              <button
                className={`st-export-btn ${exporting ? "st-export-btn--loading" : ""}`}
                onClick={handleExport}
                disabled={exporting || results.length === 0}
                title="Xuất file Excel"
              >
                {exporting ? (
                  <span className="st-spinner st-spinner--sm" />
                ) : (
                  <i className="bi bi-file-earmark-excel" />
                )}
                <span className="st-filter-btn__label">
                  {exporting ? "Đang xuất..." : "Xuất Excel"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {!loading && totalElements > 0 && (
          <div className="st-result-count">
            {totalElements} kết quả tìm thấy
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="st-loading">
            <div className="st-spinner" />
          </div>
        )}

        {/* Empty */}
        {!loading && results.length === 0 && (
          <div className="st-empty">
            {searchInput ? (
              <>
                <i className="bi bi-search st-empty-icon" />
                <div className="st-empty__title">Không tìm thấy kết quả</div>
                <div className="st-empty__sub">
                  Thử tìm với từ khóa khác nhé
                </div>
              </>
            ) : (
              <>
                <i className="bi bi-inbox st-empty-icon" />
                <div className="st-empty__title">Chưa có bài nộp nào</div>
                <div className="st-empty__sub">
                  Dữ liệu sẽ hiển thị khi có học sinh nộp bài
                </div>
              </>
            )}
          </div>
        )}

        {/* Table */}
        {!loading && results.length > 0 && (
          <>
            <div className="st-card">
              <div className="st-table-wrap">
                <table className="st-table">
                  <thead>
                    <tr>
                      <th className="st-th st-th--stt">STT</th>
                      <th className="st-th">Học sinh</th>
                      <th className="st-th st-th--center">Số câu đúng</th>
                      <th className="st-th st-th--center">Điểm</th>
                      <th className="st-th st-th--center">Thời gian nộp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((item, index) => (
                      <tr key={item.attemptId} className="st-tr">
                        <td className="st-td st-td--stt">
                          {currentPage * size + index + 1}
                        </td>
                        <td className="st-td st-td--name">
                          <div className="st-user-cell">
                            <div className="st-user-info">
                              <span className="st-user-name">
                                {item.submittedByName || "—"}
                              </span>
                              <span className="st-user-email">
                                {item.submittedByEmail || "—"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="st-td st-td--center">
                          <span>{item.correctCount ?? "—"}</span>
                        </td>
                        <td className="st-td st-td--center">
                          <span>
                            {item.totalScore != null ? item.totalScore : "—"}
                          </span>
                        </td>
                        <td className="st-td st-td--center st-td--date">
                          {formatDate(item.submittedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="st-pagination">
                <button
                  className="st-page-btn"
                  disabled={currentPage === 0}
                  onClick={() => fetchResults(currentPage - 1, searchInput)}
                >
                  <i className="bi bi-chevron-left" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`st-page-btn ${currentPage === i ? "st-page-btn--active" : ""}`}
                    onClick={() => fetchResults(i, searchInput)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="st-page-btn"
                  disabled={currentPage === totalPages - 1}
                  onClick={() => fetchResults(currentPage + 1, searchInput)}
                >
                  <i className="bi bi-chevron-right" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

const submissionsStyle = `
  .st-body-pad { box-sizing: border-box; }

  .st-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }
  
  
    .st-row1 {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }
  .st-input-wrap {
    flex: 1 1 0;
    min-width: 0;
    max-width: 380px;
    position: relative;
    display: flex;
    align-items: center;
  }
  .st-search-icon {
    position: absolute; left: 10px;
    color: #9ca3af; font-size: 15px;
    pointer-events: none;
  }
  .st-input {
    width: 100%;
    padding: 8px 32px 8px 32px;
    border: 1.5px solid #e5e7eb;
    border-radius: 8px;
    font-size: 16px;
    outline: none;
    background: #fff;
    color: #1a1a2e;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }
  .st-input:focus { border-color: #3d3a8c; }
  .st-input::placeholder { color: #9ca3af; }
  .st-clear-btn {
    position: absolute; right: 8px;
    background: none; border: none;
    color: #9ca3af; cursor: pointer;
    font-size: 17px; display: flex;
    align-items: center; padding: 0;
  }
  .st-clear-btn:hover { color: #6b7280; }
  .st-filter-wrap { position: relative; flex-shrink: 0; }
  .st-filter-btn {
    display: flex; align-items: center; gap: 5px;
    padding: 8px 12px;
    border: 1.5px solid #e5e7eb; border-radius: 8px;
    background: #fff; color: #6b7280;
    font-size: 16px; font-weight: 500;
    cursor: pointer; position: relative;
    transition: border-color 0.15s, color 0.15s;
    white-space: nowrap;
  }
  .st-filter-btn:hover { border-color: #3d3a8c; color: #3d3a8c; }
  .st-filter-btn--active { border-color: #3d3a8c; color: #3d3a8c; background: #f0effc; }
  .st-filter-dot {
    position: absolute; top: 6px; right: 6px;
    width: 7px; height: 7px;
    background: #3d3a8c; border-radius: 50%;
  }
  .st-filter-dropdown {
    position: absolute;
    top: calc(100% + 6px); right: 0;
    background: #fff;
    border: 1.5px solid #e5e7eb; border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.10);
    min-width: 180px; z-index: 100; overflow: hidden;
  }
  .st-filter-title {
    font-size: 13px; font-weight: 600; color: #9ca3af;
    letter-spacing: 0.06em; text-transform: uppercase;
    padding: 10px 14px 6px;
  }
  .st-filter-option {
    display: flex; align-items: center;
    width: 100%; padding: 9px 14px;
    background: none; border: none;
    font-size: 16px; color: #1a1a2e;
    cursor: pointer; text-align: left;
    transition: background 0.12s;
  }
  .st-filter-option:hover { background: #f3f4f6; }
  .st-filter-option--active { color: #3d3a8c; font-weight: 600; background: #f0effc; }

  .st-result-count { font-size: 15px; color: #6b7280; margin-bottom: 10px; }

  .st-loading {
    display: flex; align-items: center; justify-content: center;
    padding: 48px 0;
  }
  .st-spinner {
    width: 26px; height: 26px;
    border: 3px solid #e9ecef;
    border-top-color: #3d3a8c;
    border-radius: 50%;
    animation: st-spin 0.7s linear infinite;
  }
  .st-empty {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 48px 16px; gap: 6px;
  }
  .st-empty-icon { font-size: 32px; color: #d1d5db; margin-bottom: 4px; }
  .st-empty__title { font-size: 16px; font-weight: 500; color: #374151; }
  .st-empty__sub { font-size: 15px; color: #9ca3af; }

  .st-card {
    background: #fff;
    border: 1.5px solid #e5e7eb;
  }
  .st-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .st-table {
    width: 100%; border-collapse: collapse;
    font-size: 16px; min-width: 640px;
  }
  .st-th {
    padding: 11px 16px;
    text-align: left;
    font-size: 15px; font-weight: 600;
    letter-spacing: 0.04em;
    background: #f9fafb;
    border-bottom: 1.5px solid #e5e7eb;
    white-space: nowrap;
  }
  .st-th--stt { width: 52px; }
  .st-th--center { text-align: center; }
  .st-tr {
    border-bottom: 1px solid #f3f4f6;
    transition: background 0.12s;
  }
  .st-tr:last-child { border-bottom: none; }
  .st-tr:hover { background: #f8f7ff; }
  .st-td {
    padding: 12px 16px;
    color: #1a1a2e;
    vertical-align: middle;
  }
  .st-td--stt { font-size: 15px; }
  .st-td--center { text-align: center; }
  .st-td--name {
    font-weight: 500;
    max-width: 180px;
  }
  .st-user-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
  }
  .st-user-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .st-user-email {
    font-size: 15px;
    color: #6b7280;
    text-decoration: underline;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .st-td--date { font-size: 14px; color: #6b7280; white-space: nowrap; }
  .st-user-cell { display: flex; align-items: center; gap: 9px; }

  .st-pagination {
    display: flex; justify-content: center; align-items: center;
    gap: 4px; padding: 14px 0; flex-wrap: wrap;
  }
  .st-page-btn {
    min-width: 34px; height: 34px; padding: 0 8px;
    border: 1.5px solid #e5e7eb; border-radius: 7px;
    background: #fff; color: #1a1a2e;
    font-size: 16px; cursor: pointer;
    transition: all 0.15s;
    display: flex; align-items: center; justify-content: center;
  }
  .st-page-btn:hover:not(:disabled) { border-color: #3d3a8c; color: #3d3a8c; }
  .st-page-btn--active { background: #3d3a8c; color: #fff; border-color: #3d3a8c; font-weight: 600; }
  .st-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .st-export-btn {
    display: flex; align-items: center; gap: 5px;
    padding: 8px 12px;
    border: 1.5px solid #e5e7eb; border-radius: 8px;
    background: #fff; color: #6b7280;
    font-size: 16px; font-weight: 500;
    cursor: pointer; white-space: nowrap;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
    flex-shrink: 0;
  }
  .st-export-btn:hover:not(:disabled) { border-color: #16a34a; color: #16a34a; }
  .st-export-btn--loading { opacity: 0.7; cursor: not-allowed; }
  .st-export-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .st-spinner--sm {
    width: 14px; height: 14px;
    border-width: 2px;
    display: inline-block; flex-shrink: 0;
  }

  @keyframes st-spin { to { transform: rotate(360deg); } }

  

.st-export-row { display: contents; }

@media (max-width: 480px) {
  .st-row1 { flex-wrap: wrap; }
  .st-input-wrap { flex: 1 1 0; max-width: calc(100% - 76px); }
  .st-filter-wrap { flex-shrink: 0; }
  .st-export-row {
    display: flex;
    justify-content: flex-end;
    width: 100%;
  }
  .st-export-btn { flex: none; }
}
`;

export default SubmissionsTab;
