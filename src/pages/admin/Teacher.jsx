import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { createPortal } from "react-dom";
import {
  deleteAccount,
  toggleLockAccount,
  getTeachers,
} from "../../service/account.service";

const FILTER_OPTIONS = [
  { value: "username", label: "Theo tên" },
  { value: "email", label: "Theo email" },
];

const Teacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchBy, setSearchBy] = useState("username");
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const [confirm, setConfirm] = useState(null); // { type: 'delete' | 'lock', teacher }
  const [confirmLoading, setConfirmLoading] = useState(false);

  const filterRef = useRef(null);
  const debounceRef = useRef(null);
  const skipSearchEffect = useRef(false);
  const size = 10;

  const fetchTeachers = async (page = 0, keyword = "", by = searchBy) => {
    try {
      setLoading(true);
      const res = await getTeachers({
        page,
        size,
        username: by === "username" ? keyword : "",
        email: by === "email" ? keyword : "",
      });
      setTeachers(res.data || []);
      setTotalPages(res.meta.totalPages || 0);
      setTotalElements(res.meta.totalElements || 0);
      setCurrentPage(res.meta.currentPage - 1 || 0);
    } catch {
      toast.error("Không thể tải danh sách giảng viên");
      setTeachers([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    skipSearchEffect.current = true;
    fetchTeachers(0, "");
  }, []);

  useEffect(() => {
    if (skipSearchEffect.current) {
      skipSearchEffect.current = false;
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchTeachers(0, searchInput, searchBy);
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

  const handleDelete = async () => {
    setConfirmLoading(true);
    try {
      await deleteAccount(confirm.teacher.id);
      toast.success("Đã xóa tài khoản");
      setConfirm(null);
      fetchTeachers(currentPage, searchInput);
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleToggleLock = async () => {
    setConfirmLoading(true);
    try {
      await toggleLockAccount(confirm.teacher.id);
      toast.success(
        confirm.teacher.locked ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản",
      );
      setConfirm(null);
      fetchTeachers(currentPage, searchInput);
    } catch {
      toast.error("Thao tác thất bại");
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <>
      <style>{teacherStyle}</style>

      {/* SEARCH BAR */}
      <div className="us-toolbar">
        <div className="us-search-row">
          <div className="us-input-wrap">
            <i className="bi bi-search us-search-icon" />
            <input
              type="text"
              className="us-input"
              placeholder={
                searchBy === "username"
                  ? "Tìm theo tên giảng viên..."
                  : "Tìm theo email..."
              }
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                className="us-clear-btn"
                onClick={() => setSearchInput("")}
              >
                <i className="bi bi-x" />
              </button>
            )}
          </div>

          <div className="us-filter-wrap" ref={filterRef}>
            <button
              className={`us-filter-btn ${showFilter ? "us-filter-btn--active" : ""}`}
              onClick={() => setShowFilter((v) => !v)}
            >
              <i className="bi bi-sliders2" />
              <span className="us-filter-btn__label">Lọc</span>
              {searchBy !== "username" && <span className="us-filter-dot" />}
            </button>
            {showFilter && (
              <div className="us-filter-dropdown">
                <div className="us-filter-title">Tìm kiếm theo</div>
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`us-filter-option ${searchBy === opt.value ? "us-filter-option--active" : ""}`}
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
        </div>
      </div>

      {!loading && totalElements > 0 && (
        <div className="us-result-count">{totalElements} kết quả tìm thấy</div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="us-loading">
          <div className="us-spinner" />
        </div>
      )}

      {/* EMPTY */}
      {!loading &&
        teachers.length === 0 &&
        (searchInput ? (
          <div className="us-empty">
            <i className="bi bi-search us-empty-icon" />
            <div className="us-empty__title">Không tìm thấy kết quả</div>
            <div className="us-empty__sub">Thử tìm với từ khóa khác nhé</div>
          </div>
        ) : (
          <div className="us-empty">
            <i className="bi bi-person-video3 us-empty-icon" />
            <div className="us-empty__title">Chưa có giảng viên nào</div>
            <div className="us-empty__sub">Danh sách giảng viên trống</div>
          </div>
        ))}

      {/* DATA */}
      {!loading && teachers.length > 0 && (
        <>
          <div className="us-card">
            <div className="us-table-wrap">
              <table className="us-table">
                <thead>
                  <tr>
                    <th className="us-th us-th--stt">STT</th>
                    <th className="us-th">Email</th>
                    <th className="us-th">Tên giảng viên</th>
                    <th className="us-th us-th--center">Trạng thái</th>
                    <th className="us-th us-th--center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t, index) => (
                    <tr key={t.id} className="us-tr">
                      <td className="us-td us-td--stt">
                        {currentPage * size + index + 1}
                      </td>
                      <td className="us-td us-td--email">{t.email}</td>
                      <td className="us-td us-td--name">{t.username}</td>
                      <td className="us-td us-td--center">
                        {t.locked ? (
                          <span className="us-status us-status--locked">
                            <i className="bi bi-lock-fill" />
                            Đã khóa
                          </span>
                        ) : (
                          <span className="us-status us-status--active">
                            <i className="bi bi-check-circle-fill" />
                            Hoạt động
                          </span>
                        )}
                      </td>
                      <td className="us-td us-td--center">
                        <div className="us-actions">
                          <button
                            className={`us-action-btn ${t.locked ? "us-action-btn--unlock" : "us-action-btn--lock"}`}
                            onClick={() =>
                              setConfirm({ type: "lock", teacher: t })
                            }
                            title={t.locked ? "Mở khóa" : "Khóa"}
                          >
                            <i
                              className={`bi ${t.locked ? "bi-unlock-fill" : "bi-lock-fill"}`}
                            />
                          </button>
                          <button
                            className="us-action-btn us-action-btn--delete"
                            onClick={() =>
                              setConfirm({ type: "delete", teacher: t })
                            }
                            title="Xóa"
                          >
                            <i className="bi bi-trash3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="us-pagination">
              <button
                className="us-page-btn"
                disabled={currentPage === 0}
                onClick={() => fetchTeachers(currentPage - 1, searchInput)}
              >
                <i className="bi bi-chevron-left" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`us-page-btn ${currentPage === i ? "us-page-btn--active" : ""}`}
                  onClick={() => fetchTeachers(i, searchInput)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="us-page-btn"
                disabled={currentPage === totalPages - 1}
                onClick={() => fetchTeachers(currentPage + 1, searchInput)}
              >
                <i className="bi bi-chevron-right" />
              </button>
            </div>
          )}
        </>
      )}

      {/* DELETE CONFIRM MODAL */}
      {confirm?.type === "delete" &&
        createPortal(
          <>
            <div
              className="us-backdrop"
              onClick={() => !confirmLoading && setConfirm(null)}
            />
            <div className="us-modal-wrap">
              <div
                className="us-modal us-modal--confirm"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="us-del-icon">
                  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                    <circle cx="26" cy="26" r="26" fill="#fff3e0" />
                    <path
                      d="M26 14l12 22H14L26 14z"
                      fill="none"
                      stroke="#f57c00"
                      strokeWidth="2.2"
                      strokeLinejoin="round"
                    />
                    <rect
                      x="25"
                      y="23"
                      width="2"
                      height="7"
                      rx="1"
                      fill="#f57c00"
                    />
                    <circle cx="26" cy="33" r="1.2" fill="#f57c00" />
                  </svg>
                </div>
                <div className="us-del-title">Bạn có chắc chắn xóa không?</div>
                <p className="us-del-desc">
                  Tài khoản <strong>{confirm.teacher.username}</strong> sẽ bị
                  xóa vĩnh viễn và không thể hoàn tác.
                </p>
                <div className="us-del-actions">
                  <button
                    className="us-del-cancel"
                    onClick={() => setConfirm(null)}
                    disabled={confirmLoading}
                  >
                    Hủy
                  </button>
                  <button
                    className="us-del-confirm"
                    onClick={handleDelete}
                    disabled={confirmLoading}
                  >
                    {confirmLoading ? (
                      <>
                        <span className="us-btn-spinner" /> Đang xóa...
                      </>
                    ) : (
                      "Xóa"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}

      {/* LOCK/UNLOCK CONFIRM MODAL */}
      {confirm?.type === "lock" &&
        createPortal(
          <>
            <div
              className="us-backdrop"
              onClick={() => !confirmLoading && setConfirm(null)}
            />
            <div className="us-modal-wrap">
              <div
                className="us-modal us-modal--confirm"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="us-del-icon">
                  {confirm.teacher.locked ? (
                    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                      <circle cx="26" cy="26" r="26" fill="#e6f4ea" />
                      <rect
                        x="18"
                        y="24"
                        width="16"
                        height="13"
                        rx="3"
                        fill="none"
                        stroke="#1e8e3e"
                        strokeWidth="2.2"
                      />
                      <path
                        d="M21 24v-4a5 5 0 0 1 10 0"
                        stroke="#1e8e3e"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeDasharray="4 3"
                      />
                      <circle cx="26" cy="30" r="1.5" fill="#1e8e3e" />
                    </svg>
                  ) : (
                    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                      <circle cx="26" cy="26" r="26" fill="#fff8e1" />
                      <rect
                        x="18"
                        y="24"
                        width="16"
                        height="13"
                        rx="3"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.2"
                      />
                      <path
                        d="M21 24v-4a5 5 0 0 1 10 0v2"
                        stroke="#f59e0b"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                      <circle cx="26" cy="30" r="1.5" fill="#f59e0b" />
                    </svg>
                  )}
                </div>
                <div className="us-del-title">
                  {confirm.teacher.locked
                    ? "Mở khóa tài khoản"
                    : "Khóa tài khoản"}
                </div>
                <p className="us-del-desc">
                  Bạn có chắc muốn {confirm.teacher.locked ? "mở khóa" : "khóa"}{" "}
                  tài khoản <strong>{confirm.teacher.username}</strong>?
                </p>
                <div className="us-del-actions">
                  <button
                    className="us-del-cancel"
                    onClick={() => setConfirm(null)}
                    disabled={confirmLoading}
                  >
                    Hủy
                  </button>
                  <button
                    className={`us-del-confirm ${confirm.teacher.locked ? "us-del-confirm--unlock" : "us-del-confirm--lock"}`}
                    onClick={handleToggleLock}
                    disabled={confirmLoading}
                  >
                    {confirmLoading ? (
                      <span className="us-btn-spinner" />
                    ) : confirm.teacher.locked ? (
                      "Mở khóa"
                    ) : (
                      "Khóa"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
};

const teacherStyle = `
  .us-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }
  .us-search-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1 1 0;
    min-width: 0;
  }
  .us-input-wrap {
    flex: 1 1 0;
    min-width: 0;
    max-width: 380px;
    position: relative;
    display: flex;
    align-items: center;
  }
  .us-search-icon {
    position: absolute;
    left: 10px;
    color: #9ca3af;
    font-size: 15px;
    pointer-events: none;
  }
  .us-input {
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
  .us-input:focus { border-color: #3d3a8c; }
  .us-input::placeholder { color: #9ca3af; }
  .us-clear-btn {
    position: absolute;
    right: 8px;
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    font-size: 17px;
    display: flex;
    align-items: center;
    padding: 0;
  }
  .us-clear-btn:hover { color: #6b7280; }
  .us-filter-wrap { position: relative; flex-shrink: 0; }
  .us-filter-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 12px;
    border: 1.5px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
    color: #6b7280;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    position: relative;
    transition: border-color 0.15s, color 0.15s;
    white-space: nowrap;
  }
  .us-filter-btn:hover { border-color: #3d3a8c; color: #3d3a8c; }
  .us-filter-btn--active { border-color: #3d3a8c; color: #3d3a8c; background: #f0effc; }
  .us-filter-dot {
    position: absolute;
    top: 6px; right: 6px;
    width: 7px; height: 7px;
    background: #3d3a8c;
    border-radius: 50%;
  }
  .us-filter-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    background: #fff;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.10);
    min-width: 170px;
    z-index: 100;
    overflow: hidden;
  }
  .us-filter-title {
    font-size: 13px;
    font-weight: 600;
    color: #9ca3af;
    letter-spacing: 0.06em;
    padding: 10px 14px 6px;
    text-transform: uppercase;
  }
  .us-filter-option {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 9px 14px;
    background: none;
    border: none;
    font-size: 16px;
    color: #1a1a2e;
    cursor: pointer;
    text-align: left;
    transition: background 0.12s;
  }
  .us-filter-option:hover { background: #f3f4f6; }
  .us-filter-option--active { color: #3d3a8c; font-weight: 600; background: #f0effc; }
  .us-result-count {
    font-size: 15px;
    color: #6b7280;
    margin-bottom: 10px;
  }
  .us-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 0;
  }
  .us-spinner {
    width: 26px; height: 26px;
    border: 3px solid #e9ecef;
    border-top-color: #3d3a8c;
    border-radius: 50%;
    animation: us-spin 0.7s linear infinite;
  }
  .us-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 16px;
    gap: 6px;
  }
  .us-empty-icon { font-size: 32px; color: #d1d5db; margin-bottom: 4px; }
  .us-empty__title { font-size: 16px; font-weight: 500; color: #374151; }
  .us-empty__sub { font-size: 15px; color: #9ca3af; }
  .us-card {
    background: #fff;
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
  }
  .us-table-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .us-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 16px;
    min-width: 560px;
  }
  .us-th {
    padding: 11px 16px;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: #f9fafb;
    border-bottom: 1.5px solid #e5e7eb;
    white-space: nowrap;
  }
  .us-th--stt { width: 52px; }
  .us-th--center { text-align: center; }
  .us-tr {
    transition: background 0.12s;
    border-bottom: 1px solid #f3f4f6;
  }
  .us-tr:last-child { border-bottom: none; }
  .us-tr:hover { background: #f8f7ff; }
  .us-td {
    padding: 12px 16px;
    color: #1a1a2e;
    vertical-align: middle;
  }
  .us-td--stt { font-size: 15px; }
  .us-td--center { text-align: center; }
  .us-td--name {
    font-weight: 500;
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .us-td--email {
    color: #6b7280;
    font-size: 15px;
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .us-status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
  }
  .us-status--active { background: #e6f4ea; color: #1e8e3e; }
  .us-status--locked { background: #fce8e6; color: #d93025; }
  .us-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .us-action-btn {
    display: inline-flex;
    align-items: center;
    width: 32px; height: 32px;
    border-radius: 7px;
    border: 1.5px solid;
    font-size: 14px;
    cursor: pointer;
    justify-content: center;
    transition: all 0.15s;
    background: #fff;
  }
  .us-action-btn--lock { border-color: #fde68a; color: #f59e0b; }
  .us-action-btn--lock:hover { background: #fff8e1; border-color: #f59e0b; }
  .us-action-btn--unlock { border-color: #ceead6; color: #1e8e3e; }
  .us-action-btn--unlock:hover { background: #e6f4ea; border-color: #1e8e3e; }
  .us-action-btn--delete { border-color: #fca5a5; color: #ef4444; }
  .us-action-btn--delete:hover { background: #fef2f2; border-color: #ef4444; }
  .us-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    padding: 14px 0;
    flex-wrap: wrap;
  }
  .us-page-btn {
    min-width: 34px; height: 34px;
    padding: 0 8px;
    border: 1.5px solid #e5e7eb;
    border-radius: 7px;
    background: #fff;
    color: #1a1a2e;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.15s;
    display: flex; align-items: center; justify-content: center;
  }
  .us-page-btn:hover:not(:disabled) { border-color: #3d3a8c; color: #3d3a8c; }
  .us-page-btn--active { background: #3d3a8c; color: #fff; border-color: #3d3a8c; font-weight: 600; }
  .us-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .us-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 1040;
  }
  .us-modal-wrap {
    position: fixed; inset: 0;
    display: flex; align-items: center; justify-content: center;
    z-index: 1050;
    padding: 12px;
    box-sizing: border-box;
  }
  .us-modal {
    background: #fff;
    border-radius: 14px;
    width: 100%;
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    box-sizing: border-box;
    overflow: hidden;
  }
  .us-modal--confirm {
    padding: 32px 24px 24px;
    text-align: center;
    max-width: 340px;
  }
  .us-del-icon { margin-bottom: 16px; }
  .us-del-title { font-size: 16px; font-weight: 700; color: #212529; margin-bottom: 10px; }
  .us-del-desc {
    font-size: 15px; color: #6b7280;
    margin: 0 0 24px;
    line-height: 1.6;
    word-break: keep-all;
    overflow-wrap: break-word;
  }
  .us-del-actions { display: flex; gap: 10px; }
  .us-del-cancel {
    flex: 1; padding: 10px;
    border-radius: 10px;
    border: 1px solid #dee2e6;
    background: #fff;
    font-size: 15px; font-weight: 500; color: #444;
    cursor: pointer;
    transition: background 0.15s;
  }
  .us-del-cancel:hover { background: #f0f0f0; }
  .us-del-cancel:disabled { opacity: 0.6; cursor: not-allowed; }
  .us-del-confirm {
    flex: 1; padding: 10px;
    border-radius: 10px;
    border: none;
    background: #dc3545;
    color: #fff;
    font-size: 15px; font-weight: 500;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: background 0.15s, opacity 0.15s;
  }
  .us-del-confirm:hover:not(:disabled) { background: #bb2d3b; }
  .us-del-confirm:disabled { opacity: 0.65; cursor: not-allowed; }
  .us-del-confirm--lock { background: #f59e0b; }
  .us-del-confirm--lock:hover:not(:disabled) { background: #d97706; }
  .us-del-confirm--unlock { background: #1e8e3e; }
  .us-del-confirm--unlock:hover:not(:disabled) { background: #16702f; }
  .us-btn-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: us-spin 0.7s linear infinite;
    display: inline-block;
    flex-shrink: 0;
  }
  @keyframes us-spin { to { transform: rotate(360deg); } }
  @media (max-width: 480px) {
    .us-search-row { width: 100%; flex: 0 0 100%; }
  }
`;

export default Teacher;
