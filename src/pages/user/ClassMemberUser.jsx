import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getClassMembers } from "../../service/classMember.service";
import avatarImg from "../../assets/avatarImg.png";

const ClassMemberUser = () => {
  const { classId } = useParams();

  const [students, setStudents] = useState([]);
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
      const res = await getClassMembers(classId, {
        page,
        size,
        username: by === "username" ? keyword : "",
        email: by === "email" ? keyword : "",
      });
      setStudents(res.data || []);
      setTotalPages(res.meta.totalPages || 0);
      setTotalElements(res.meta.totalItems || 0);
      setCurrentPage(page || 0);
    } catch (error) {
      console.error(error);
      setStudents([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Effect fetch lần đầu — reset flag mỗi khi classId đổi
  useEffect(() => {
    skipSearchEffect.current = true;
    setLoading(true);
    const timer = setTimeout(() => {
      fetchMembers(0, "");
    }, 50);
    return () => clearTimeout(timer);
  }, [classId]);

  // Effect search — bỏ qua khi flag đang bật
  useEffect(() => {
    if (skipSearchEffect.current) {
      skipSearchEffect.current = false; // tắt flag sau lần bỏ qua đầu tiên
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchMembers(0, searchInput, searchBy);
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput, searchBy]);

  // Đóng filter khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const FILTER_OPTIONS = [
    { value: "username", label: "Theo tên" },
    { value: "email", label: "Theo email" },
  ];

  return (
    <>
      <style>{memberStyle}</style>

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

        {/* Nút lọc */}
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
          <div className="cm-empty">Không có thành viên nào</div>
        )
      ) : (
        <div className="cm-list">
          {students.map((student, index) => (
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
    </>
  );
};

const memberStyle = `
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

  .cm-filter-btn__label { }

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

  /* ── Loading ── */
  .cm-loading {
    display: flex;
    justify-content: center;
    padding: 40px 0;
  }
  .cu-spin-ring {
    width: 30px; height: 30px;
    border: 4px solid #e8f0fe;
    border-top-color: #1a73e8;
    border-radius: 50%;
    animation: cu-spin 0.7s linear infinite;
  }
  @keyframes cu-spin { to { transform: rotate(360deg); } }

  /* ── Empty ── */
  .cm-empty {
    text-align: center;
    color: #6b7280;
    padding: 40px 0;
    font-size: 16px;
  }

  /* ── 404 Not Found ── */
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

  .cm-item__num {
    font-size: 16px;
    
    min-width: 20px;
    text-align: center;
    flex-shrink: 0;
  }

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

  @keyframes cm-fadein {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export default ClassMemberUser;
