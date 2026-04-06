import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getClassMemberPendings,
  approveClassMember,
  deleteClassMember,
} from "../../service/classMember.service";
import avatarImg from "../../assets/avatarImg.png";

const ClassMemberPending = () => {
  const { classId } = useParams();

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionType, setActionType] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [searchBy, setSearchBy] = useState("username");
  const [showFilter, setShowFilter] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(false);

  const filterRef = useRef(null);
  const debounceRef = useRef(null);
  const skipSearchEffect = useRef(false);
  const size = 10;

  // ================= FETCH =================
  const fetchMembers = async (page = 0, keyword = "", by = searchBy) => {
    try {
      setLoading(true);
      const res = await getClassMemberPendings(classId, {
        page,
        size,
        username: by === "username" ? keyword : "",
        email: by === "email" ? keyword : "",
      });
      setStudents(res.data || []);
      setTotalPages(res.meta.totalPages || 0);
      setTotalElements(res.meta.totalElements || 0);
      setCurrentPage(page);
    } catch (error) {
      setStudents([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    skipSearchEffect.current = true;
    fetchMembers(0, "");
  }, [classId]);

  useEffect(() => {
    if (skipSearchEffect.current) {
      skipSearchEffect.current = false;
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchMembers(0, searchInput, searchBy);
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput, searchBy]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ================= ACTION =================
  const handleConfirm = async () => {
    try {
      setLoading(true);
      if (actionType === "approve") {
        await approveClassMember(selectedStudent.id);
        toast.success("Duyệt thành viên thành công!");
      }
      if (actionType === "reject") {
        await deleteClassMember(selectedStudent.id);
        toast.success("Từ chối yêu cầu thành công!");
      }
      setSelectedStudent(null);
      fetchMembers(currentPage, searchInput);
    } catch (error) {
      toast.error("Thao tác thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const FILTER_OPTIONS = [
    { value: "username", label: "Theo tên" },
    { value: "email", label: "Theo email" },
  ];

  const isApprove = actionType === "approve";

  return (
    <>
      <style>{pendingStyle}</style>

      {/* ================= SEARCH BAR ================= */}
      <div className="cm-search-bar">
        <div className="cm-input-wrap">
          <i className="bi bi-search cm-search-icon" />
          <input
            type="text"
            className="cm-input"
            placeholder={
              searchBy === "username" ? "Tìm theo tên..." : "Tìm theo email..."
            }
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              className="cm-clear-btn"
              onClick={() => setSearchInput("")}
              aria-label="Xóa"
            >
              <i className="bi bi-x" />
            </button>
          )}
        </div>

        <div className="cm-filter-wrap" ref={filterRef}>
          <button
            className={`cm-filter-btn ${showFilter ? "cm-filter-btn--active" : ""}`}
            onClick={() => setShowFilter((v) => !v)}
          >
            <i className="bi bi-sliders2" />
            <span className="cm-filter-btn__label">Lọc</span>
            {searchBy !== "username" && <span className="cm-filter-dot" />}
          </button>

          {showFilter && (
            <div className="cm-filter-dropdown">
              <div className="cm-filter-title">Tìm kiếm theo</div>
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`cm-filter-option ${searchBy === opt.value ? "cm-filter-option--active" : ""}`}
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

      {/* Kết quả */}
      {!loading && totalElements > 0 && (
        <div className="cm-result-count">{totalElements} kết quả tìm thấy</div>
      )}

      {/* ================= LIST ================= */}
      {loading ? (
        <></>
      ) : students.length === 0 ? (
        searchInput ? (
          <div className="cm-not-found">
            <div className="cm-not-found__title">Không tìm thấy kết quả</div>
            <div className="cm-not-found__sub">
              Thử tìm với từ khóa khác nhé
            </div>
          </div>
        ) : (
          <div className="cm-empty">Không có yêu cầu chờ duyệt</div>
        )
      ) : (
        <div className="cm-list">
          {students.map((student) => (
            <div key={student.id} className="cm-item">
              <img
                src={student.avatarUrl || avatarImg}
                alt="avatar"
                className="cm-item__avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = avatarImg;
                }}
              />
              <div className="cm-item__info">
                <div className="cm-item__name">{student.username}</div>
                <div className="cm-item__email">{student.email}</div>
              </div>
              <div className="cm-item__actions">
                <button
                  className="cm-approve-btn"
                  onClick={() => {
                    setSelectedStudent(student);
                    setActionType("approve");
                  }}
                >
                  <i className="bi bi-check-lg" />
                </button>
                <button
                  className="cm-reject-btn"
                  onClick={() => {
                    setSelectedStudent(student);
                    setActionType("reject");
                  }}
                >
                  <i className="bi bi-x-lg" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && !loading && (
        <div className="cm-pagination">
          <button
            className="cm-page-btn"
            disabled={currentPage === 0}
            onClick={() => fetchMembers(currentPage - 1, searchInput)}
          >
            <i className="bi bi-chevron-left" />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`cm-page-btn ${currentPage === i ? "cm-page-btn--active" : ""}`}
              onClick={() => fetchMembers(i, searchInput)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="cm-page-btn"
            disabled={currentPage === totalPages - 1}
            onClick={() => fetchMembers(currentPage + 1, searchInput)}
          >
            <i className="bi bi-chevron-right" />
          </button>
        </div>
      )}

      {/* ================= MODAL CONFIRM (Portal) ================= */}
      {selectedStudent &&
        createPortal(
          <>
            <div
              className="cd-backdrop"
              onClick={() => !loading && setSelectedStudent(null)}
            />
            <div className="cd-modal-wrap">
              <div
                className="cd-modal cd-modal--confirm"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="cm-del-icon">
                  {isApprove ? (
                    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                      <circle cx="26" cy="26" r="26" fill="#e6f4ea" />
                      <path
                        d="M16 27l8 8 12-14"
                        stroke="#2e7d32"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
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
                  )}
                </div>

                <div className="cm-del-title">
                  {isApprove ? "Xác nhận duyệt?" : "Xác nhận từ chối?"}
                </div>
                <p className="cm-del-desc">
                  Bạn có chắc muốn{" "}
                  <strong>{isApprove ? "duyệt" : "từ chối"}</strong> thành viên{" "}
                  <strong>{selectedStudent.username}</strong>?
                </p>

                <div className="cm-del-actions">
                  <button
                    className="cm-del-cancel"
                    onClick={() => setSelectedStudent(null)}
                    disabled={loading}
                  >
                    Hủy
                  </button>
                  <button
                    className={`cm-del-confirm ${isApprove ? "cm-del-confirm--approve" : ""}`}
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="cm-btn-spinner" aria-hidden="true" />
                        Đang xử lý...
                      </>
                    ) : isApprove ? (
                      "Duyệt"
                    ) : (
                      "Từ chối"
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

const pendingStyle = `
  /* ── Search bar ── */
  .cm-search-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
    align-items: center;
  }

  .cm-input-wrap {
    flex: 1 1 0;
    min-width: 0;
    max-width: 360px;
    position: relative;
    display: flex;
    align-items: center;
  }

  .cm-search-icon {
    position: absolute;
    left: 10px;
    color: #9ca3af;
    font-size: 15px;
    pointer-events: none;
  }

  .cm-input {
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
  .cm-input:focus { border-color: #1a73e8; }
  .cm-input::placeholder { color: #9ca3af; }

  .cm-clear-btn {
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
    line-height: 1;
  }
  .cm-clear-btn:hover { color: #6b7280; }

  /* ── Filter ── */
  .cm-filter-wrap {
    position: relative;
    flex-shrink: 0;
  }

  .cm-filter-btn {
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
  .cm-filter-btn:hover { border-color: #1a73e8; color: #1a73e8; }
  .cm-filter-btn--active { border-color: #1a73e8; color: #1a73e8; background: #e8f0fe; }

  .cm-filter-dot {
    position: absolute;
    top: 6px; right: 6px;
    width: 7px; height: 7px;
    background: #1a73e8;
    border-radius: 50%;
  }

  .cm-filter-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    background: #fff;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.10);
    min-width: 160px;
    z-index: 100;
    overflow: hidden;
    animation: cm-fadein 0.15s both;
  }

  .cm-filter-title {
    font-size: 13px;
    font-weight: 600;
    color: #9ca3af;
    letter-spacing: 0.06em;
    padding: 10px 14px 6px;
    text-transform: uppercase;
  }

  .cm-filter-option {
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
  .cm-filter-option:hover { background: #f3f4f6; }
  .cm-filter-option--active { color: #1a73e8; font-weight: 600; background: #e8f0fe; }

  /* ── Result count ── */
  .cm-result-count {
    font-size: 15px;
    color: #6b7280;
    margin-bottom: 10px;
    min-height: 20px;
  }

  /* ── Empty ── */
  .cm-empty {
    text-align: center;
    color: #6b7280;
    padding: 40px 0;
    font-size: 16px;
  }

  /* ── Not found ── */
  .cm-not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 16px;
    animation: cm-fadein 0.25s both;
  }
  .cm-not-found__title {
    font-size: 16px;
    font-weight: 500;
    color: #1a1a2e;
    margin-bottom: 4px;
  }
  .cm-not-found__sub {
    font-size: 15px;
    color: #9ca3af;
  }

  /* ── List ── */
  .cm-list {
    background: #fff;
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
  }

  .cm-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    gap: 12px;
    border-bottom: 1px solid #f3f4f6;
  }
  .cm-item:last-child { border-bottom: none; }

  .cm-item__avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .cm-item__info { flex: 1 1 0; min-width: 0; }

  .cm-item__name {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a2e;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cm-item__email {
    font-size: 15px;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Action buttons ── */
  .cm-item__actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .cm-approve-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    border: 1.5px solid #86efac;
    border-radius: 8px;
    background: #fff;
    color: #16a34a;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .cm-approve-btn:hover { background: #f0fdf4; border-color: #16a34a; }

  .cm-reject-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    border: 1.5px solid #fca5a5;
    border-radius: 8px;
    background: #fff;
    color: #ef4444;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .cm-reject-btn:hover { background: #fef2f2; border-color: #ef4444; }

  /* ── Pagination ── */
  .cm-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    margin-top: 16px;
    flex-wrap: wrap;
  }

  .cm-page-btn {
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
  .cm-page-btn:hover:not(:disabled) { border-color: #1a73e8; color: #1a73e8; }
  .cm-page-btn--active { background: #1a73e8; color: #fff; border-color: #1a73e8; font-weight: 600; }
  .cm-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Modal backdrop ── */
  .cd-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 1040;
    animation: cu-fadein 0.2s both;
  }
  .cd-modal-wrap {
    position: fixed; inset: 0;
    display: flex; align-items: center; justify-content: center;
    z-index: 1050;
    padding: 10px;
    box-sizing: border-box;
  }

  /* ── Confirm modal ── */
  .cd-modal--confirm {
    background: #fff;
    border-radius: 16px;
    width: 100%;
    max-width: 340px;
    box-sizing: border-box;
    padding: 32px 24px 24px;
    text-align: center;
    animation: cu-fadeup 0.25s both;
  }

  .cm-del-icon { margin-bottom: 16px; }

  .cm-del-title {
    font-size: 16px;
    font-weight: 700;
    color: #212529;
    margin: 0 0 10px;
    line-height: 1.3;
  }

  .cm-del-desc {
    font-size: 15px;
    color: #6b7280;
    margin: 0 0 24px;
    line-height: 1.6;
    word-break: keep-all;
    overflow-wrap: break-word;
  }

  .cm-del-actions {
    display: flex;
    gap: 10px;
  }

  .cm-del-cancel {
    flex: 1;
    padding: 10px;
    border-radius: 10px;
    border: 1px solid #dee2e6;
    background: #fff;
    font-size: 15px;
    font-weight: 500;
    color: #444;
    cursor: pointer;
    transition: background 0.15s;
  }
  .cm-del-cancel:hover { background: #f0f0f0; }
  .cm-del-cancel:disabled { opacity: 0.6; cursor: not-allowed; }

  .cm-del-confirm {
    flex: 1;
    padding: 10px;
    border-radius: 10px;
    border: none;
    background: #dc3545;
    color: #fff;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: background 0.15s, opacity 0.15s;
  }
  .cm-del-confirm:hover:not(:disabled) { background: #bb2d3b; }
  .cm-del-confirm--approve { background: #16a34a; }
  .cm-del-confirm--approve:hover:not(:disabled) { background: #15803d; }
  .cm-del-confirm:disabled { opacity: 0.65; cursor: not-allowed; }

  .cm-btn-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: cu-spin 0.7s linear infinite;
    display: inline-block;
    flex-shrink: 0;
  }

  @keyframes cm-fadein {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cu-fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes cu-fadeup {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cu-spin { to { transform: rotate(360deg); } }

  @media (max-width: 479px) {
    .cm-approve-btn span,
    .cm-reject-btn span {
      display: none;
    }
    .cm-approve-btn,
    .cm-reject-btn {
      padding: 6px 8px;
    }
  }
`;

export default ClassMemberPending;
