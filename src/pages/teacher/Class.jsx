import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
} from "../../service/class.service";
import { createPortal } from "react-dom";

const FILTER_OPTIONS = [
  { value: "title", label: "Theo tên lớp" },
  { value: "classCode", label: "Theo mã lớp" },
];

const Class = () => {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchBy, setSearchBy] = useState("title");
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "" });

  // Lỗi form
  const [titleError, setTitleError] = useState("");
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filterRef = useRef(null);
  const debounceRef = useRef(null);
  const skipSearchEffect = useRef(false);
  const size = 15;

  const fetchClasses = async (page = 0, keyword = "", by = searchBy) => {
    try {
      setLoading(true);
      const res = await getClasses({
        page,
        size,
        title: by === "title" ? keyword : "",
        classCode: by === "classCode" ? keyword : "",
      });
      setClasses(res.data || []);
      setTotalPages(res.meta.totalPages || 0);
      setTotalElements(res.meta.totalElements || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error(error);
      setClasses([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    skipSearchEffect.current = true;
    fetchClasses(0, "");
  }, []);

  useEffect(() => {
    if (skipSearchEffect.current) {
      skipSearchEffect.current = false;
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchClasses(0, searchInput, searchBy);
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

  const openCreateModal = () => {
    setEditingClass(null);
    setFormData({ title: "", description: "" });
    setTitleError("");
    setApiError("");
    setShowModal(true);
  };

  const openEditModal = (item, e) => {
    e.stopPropagation();
    setEditingClass(item);
    setFormData({
      title: item.title || "",
      description: item.description || "",
    });
    setTitleError("");
    setApiError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClass(null);
    setFormData({ title: "", description: "" });
    setTitleError("");
    setApiError("");
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setTitleError("Tên lớp không được để trống");
      return false;
    }
    if (formData.title.trim().length < 2) {
      setTitleError("Tên lớp phải có ít nhất 2 ký tự");
      return false;
    }
    if (formData.title.trim().length > 100) {
      setTitleError("Tên lớp không được vượt quá 100 ký tự");
      return false;
    }
    setTitleError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setApiError("");
    try {
      if (editingClass?.id) {
        await updateClass(editingClass.id, formData);
        toast.success("Cập nhật lớp thành công!");
      } else {
        await createClass(formData);
        toast.success("Tạo lớp thành công!");
      }
      closeModal();
      fetchClasses(currentPage, searchInput);
    } catch (error) {
      setApiError(
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra!",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleTitleChange = (e) => {
    setFormData({ ...formData, title: e.target.value });
    if (titleError) setTitleError("");
    if (apiError) setApiError("");
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteClass(deleteTarget.id);
      toast.success("Xóa lớp thành công!");
      setDeleteTarget(null);
      fetchClasses(currentPage, searchInput);
    } catch {
      toast.error("Xóa thất bại!");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <style>{classStyle}</style>

      {/* SEARCH BAR */}
      <div className="cl-toolbar">
        <div className="cl-search-row">
          <div className="cl-input-wrap">
            <i className="bi bi-search cl-search-icon" />
            <input
              type="text"
              className="cl-input"
              placeholder={
                searchBy === "title"
                  ? "Tìm theo tên lớp..."
                  : "Tìm theo mã lớp..."
              }
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                className="cl-clear-btn"
                onClick={() => setSearchInput("")}
              >
                <i className="bi bi-x" />
              </button>
            )}
          </div>

          <div className="cl-filter-wrap" ref={filterRef}>
            <button
              className={`cl-filter-btn ${showFilter ? "cl-filter-btn--active" : ""}`}
              onClick={() => setShowFilter((v) => !v)}
            >
              <i className="bi bi-sliders2" />
              <span className="cl-filter-btn__label">Lọc</span>
              {searchBy !== "title" && <span className="cl-filter-dot" />}
            </button>
            {showFilter && (
              <div className="cl-filter-dropdown">
                <div className="cl-filter-title">Tìm kiếm theo</div>
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`cl-filter-option ${searchBy === opt.value ? "cl-filter-option--active" : ""}`}
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

        <button className="cl-create-btn" onClick={openCreateModal}>
          <i className="bi bi-plus-lg" />
          <span>Tạo lớp</span>
        </button>
      </div>

      {!loading && totalElements > 0 && (
        <div className="cl-result-count">{totalElements} kết quả tìm thấy</div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="cl-loading">
          <div className="cl-spinner" />
        </div>
      )}

      {/* EMPTY */}
      {!loading &&
        classes.length === 0 &&
        (searchInput ? (
          <div className="cl-empty">
            <i className="bi bi-search cl-empty-icon" />
            <div className="cl-empty__title">Không tìm thấy kết quả</div>
            <div className="cl-empty__sub">Thử tìm với từ khóa khác nhé</div>
          </div>
        ) : (
          <div className="cl-empty">
            <i className="bi bi-building cl-empty-icon" />
            <div className="cl-empty__title">Chưa có lớp nào</div>
            <div className="cl-empty__sub">Tạo lớp đầu tiên của bạn</div>
          </div>
        ))}

      {/* DATA */}
      {!loading && classes.length > 0 && (
        <>
          <div className="cl-card">
            <div className="cl-table-wrap">
              <table className="cl-table">
                <thead>
                  <tr>
                    <th className="cl-th cl-th--stt">STT</th>
                    <th className="cl-th">Mã lớp</th>
                    <th className="cl-th">Tên lớp</th>
                    <th className="cl-th cl-th--desc">Mô tả</th>
                    <th className="cl-th cl-th--center">Thành viên</th>
                    <th className="cl-th cl-th--center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((item, index) => (
                    <tr
                      key={item.id}
                      className="cl-tr"
                      onClick={() => navigate(`/teacher/classes/${item.id}`)}
                    >
                      <td className="cl-td cl-td--stt">
                        {currentPage * size + index + 1}
                      </td>
                      <td className="cl-td">
                        <span className="cl-badge">{item.classCode}</span>
                      </td>
                      <td className="cl-td cl-td--name">{item.title}</td>
                      <td className="cl-td cl-td--desc">
                        {item.description || <span className="cl-dash">—</span>}
                      </td>
                      <td className="cl-td cl-td--center">
                        <span className="cl-member-count">
                          <i className="bi bi-people" />
                          {item.memberCount}
                        </span>
                      </td>
                      <td className="cl-td cl-td--center">
                        <div
                          className="cl-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="cl-action-btn cl-action-btn--edit"
                            onClick={(e) => openEditModal(item, e)}
                            title="Sửa"
                          >
                            <i className="bi bi-pencil" />
                          </button>
                          <button
                            className="cl-action-btn cl-action-btn--delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(item);
                            }}
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

          {/* Pagination nằm ngoài cl-card */}
          {totalPages > 1 && (
            <div className="cl-pagination">
              <button
                className="cl-page-btn"
                disabled={currentPage === 0}
                onClick={() => fetchClasses(currentPage - 1, searchInput)}
              >
                <i className="bi bi-chevron-left" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`cl-page-btn ${currentPage === i ? "cl-page-btn--active" : ""}`}
                  onClick={() => fetchClasses(i, searchInput)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="cl-page-btn"
                disabled={currentPage === totalPages - 1}
                onClick={() => fetchClasses(currentPage + 1, searchInput)}
              >
                <i className="bi bi-chevron-right" />
              </button>
            </div>
          )}
        </>
      )}

      {/* CREATE/EDIT MODAL */}
      {showModal &&
        createPortal(
          <>
            <div className="cl-backdrop" onClick={closeModal} />
            <div className="cl-modal-wrap">
              <div className="cl-modal" onClick={(e) => e.stopPropagation()}>
                <div className="cl-modal__header">
                  <span className="cl-modal__title">
                    {editingClass ? "Chỉnh sửa lớp" : "Tạo lớp mới"}
                  </span>
                  <button
                    className="cl-modal__close"
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="cl-modal__body">
                    {/* API error banner */}
                    {apiError && (
                      <div className="cl-alert-banner" role="alert">
                        <span style={{ flexShrink: 0 }}>⚠</span>
                        <span>{apiError}</span>
                      </div>
                    )}

                    <div className="cl-field">
                      <label className="cl-label">
                        Tên lớp <span className="cl-required">*</span>
                      </label>
                      <input
                        type="text"
                        className={`cl-form-input${titleError ? " cl-form-input--error" : ""}`}
                        placeholder="Nhập tên lớp..."
                        value={formData.title}
                        onChange={handleTitleChange}
                        autoFocus
                      />
                      {titleError && (
                        <div className="cl-field-error" role="alert">
                          {titleError}
                        </div>
                      )}
                    </div>

                    <div className="cl-field">
                      <label className="cl-label">Mô tả</label>
                      <textarea
                        className="cl-form-input cl-form-textarea"
                        rows={3}
                        placeholder="Nhập mô tả (tuỳ chọn)..."
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="cl-modal__footer">
                    <button
                      type="button"
                      className="cl-btn cl-btn--cancel"
                      onClick={closeModal}
                      disabled={submitting}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="cl-btn cl-btn--primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="cl-btn-spinner" />
                          {editingClass ? "Đang lưu..." : "Đang tạo..."}
                        </>
                      ) : editingClass ? (
                        "Cập nhật"
                      ) : (
                        "Tạo lớp"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>,
          document.body,
        )}

      {/* DELETE MODAL */}
      {deleteTarget &&
        createPortal(
          <>
            <div
              className="cl-backdrop"
              onClick={() => !deleteLoading && setDeleteTarget(null)}
            />
            <div className="cl-modal-wrap">
              <div
                className="cl-modal cl-modal--delete"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="cl-del-icon">
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
                <div className="cl-del-title">Bạn có chắc chắn xóa không?</div>
                <p className="cl-del-desc">
                  Lớp <strong>{deleteTarget.title}</strong> sẽ bị xóa vĩnh viễn.
                </p>
                <div className="cl-del-actions">
                  <button
                    className="cl-del-cancel"
                    onClick={() => setDeleteTarget(null)}
                    disabled={deleteLoading}
                  >
                    Hủy
                  </button>
                  <button
                    className="cl-del-confirm"
                    onClick={handleDelete}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <>
                        <span className="cl-btn-spinner" /> Đang xóa...
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
    </>
  );
};

const classStyle = `
  .cl-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }
  .cl-search-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1 1 0;
    min-width: 0;
  }
  .cl-input-wrap {
    flex: 1 1 0;
    min-width: 0;
    max-width: 380px;
    position: relative;
    display: flex;
    align-items: center;
  }
  .cl-search-icon {
    position: absolute;
    left: 10px;
    color: #9ca3af;
    font-size: 15px;
    pointer-events: none;
  }
  .cl-input {
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
  .cl-input:focus { border-color: #3d3a8c; }
  .cl-input::placeholder { color: #9ca3af; }
  .cl-clear-btn {
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
  .cl-clear-btn:hover { color: #6b7280; }
  .cl-filter-wrap { position: relative; flex-shrink: 0; }
  .cl-filter-btn {
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
  .cl-filter-btn:hover { border-color: #3d3a8c; color: #3d3a8c; }
  .cl-filter-btn--active { border-color: #3d3a8c; color: #3d3a8c; background: #f0effc; }
  .cl-filter-dot {
    position: absolute;
    top: 6px; right: 6px;
    width: 7px; height: 7px;
    background: #3d3a8c;
    border-radius: 50%;
  }
  .cl-filter-dropdown {
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
  .cl-filter-title {
    font-size: 13px;
    font-weight: 600;
    color: #9ca3af;
    letter-spacing: 0.06em;
    padding: 10px 14px 6px;
    text-transform: uppercase;
  }
  .cl-filter-option {
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
  .cl-filter-option:hover { background: #f3f4f6; }
  .cl-filter-option--active { color: #3d3a8c; font-weight: 600; background: #f0effc; }
  .cl-create-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    background: #3d3a8c;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: background 0.15s;
  }
  .cl-create-btn:hover { background: #2e2b6e; }
  .cl-result-count {
    font-size: 15px;
    color: #6b7280;
    margin-bottom: 10px;
  }
  .cl-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 0;
  }
  .cl-spinner {
    width: 26px; height: 26px;
    border: 3px solid #e9ecef;
    border-top-color: #3d3a8c;
    border-radius: 50%;
    animation: cl-spin 0.7s linear infinite;
  }
  .cl-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 16px;
    gap: 6px;
  }
  .cl-empty-icon { font-size: 32px; color: #d1d5db; margin-bottom: 4px; }
  .cl-empty__title { font-size: 16px; font-weight: 500; color: #374151; }
  .cl-empty__sub { font-size: 15px; color: #9ca3af; }
  .cl-card {
    background: #fff;
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
  }
  .cl-table-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .cl-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 16px;
    min-width: 600px;
  }
  .cl-th {
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
  .cl-th--stt { width: 52px; }
  .cl-th--center { text-align: center; }
  .cl-th--desc { min-width: 120px; }
  .cl-tr {
    cursor: pointer;
    transition: background 0.12s;
    border-bottom: 1px solid #f3f4f6;
    white-space: nowrap;
  }
  .cl-tr:last-child { border-bottom: none; }
  .cl-tr:hover { background: #f8f7ff; }
  .cl-td {
    padding: 12px 16px;
    color: #1a1a2e;
    vertical-align: middle;
  }
  .cl-td--stt {  font-size: 15px; }
  .cl-td--center { text-align: center; }
  .cl-td--name {
    font-weight: 500;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cl-td--desc {
    color: #6b7280;
    font-size: 15px;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cl-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 9px;
    border-radius: 20px;
    background: #f0effc;
    color: #3d3a8c;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cl-dash { color: #d1d5db; }
  .cl-member-count {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 15px;
    color: #6b7280;
  }
  .cl-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .cl-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    width: 32px; height: 32px;
    border-radius: 7px;
    border: 1.5px solid;
    font-size: 14px;
    cursor: pointer;
    justify-content: center;
    transition: all 0.15s;
    background: #fff;
  }
  .cl-action-btn--edit { border-color: #c5c3e8; color: #3d3a8c; }
  .cl-action-btn--edit:hover { background: #f0effc; border-color: #3d3a8c; }
  .cl-action-btn--delete { border-color: #fca5a5; color: #ef4444; }
  .cl-action-btn--delete:hover { background: #fef2f2; border-color: #ef4444; }
  .cl-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    padding: 14px 0;
    flex-wrap: wrap;
  }
  .cl-page-btn {
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
  .cl-page-btn:hover:not(:disabled) { border-color: #3d3a8c; color: #3d3a8c; }
  .cl-page-btn--active { background: #3d3a8c; color: #fff; border-color: #3d3a8c; font-weight: 600; }
  .cl-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .cl-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 1040;
  }
  .cl-modal-wrap {
    position: fixed; inset: 0;
    display: flex; align-items: center; justify-content: center;
    z-index: 1050;
    padding: 12px;
    box-sizing: border-box;
  }
  .cl-modal {
    background: #fff;
    border-radius: 14px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    box-sizing: border-box;
    overflow: hidden;
  }
  .cl-modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1.5px solid #f3f4f6;
  }
  .cl-modal__title { font-size: 16px; font-weight: 700; color: #0f172a; }
  .cl-modal__close {
    width: 30px; height: 30px;
    border-radius: 7px;
    border: 1.5px solid #e9ecef;
    background: #fff;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #6c757d;
    font-size: 14px;
    transition: background 0.15s;
  }
  .cl-modal__close:hover { background: #f3f4f6; }
  .cl-modal__close:disabled { opacity: 0.5; cursor: not-allowed; }
  .cl-modal__body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .cl-alert-banner {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.65rem 0.85rem;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.5;
    word-break: break-word;
    background: #fff5f5;
    border: 1px solid #f5c2c7;
    color: #842029;
  }
  .cl-field { display: flex; flex-direction: column; gap: 7px; }
  .cl-label { font-size: 16px; font-weight: 600; color: #374151; }
  .cl-required { color: #ef4444; margin-left: 2px; }
  .cl-form-input {
    width: 100%;
    padding: 9px 12px;
    border: 1.5px solid #e5e7eb;
    border-radius: 8px;
    font-size: 16px;
    outline: none;
    color: #1a1a2e;
    background: #fff;
    box-sizing: border-box;
    transition: border-color 0.15s, box-shadow 0.15s;
    font-family: inherit;
  }
  .cl-form-input:focus {
    border-color: #3d3a8c;
    box-shadow: 0 0 0 3px rgba(61,58,140,0.12);
  }
  .cl-form-input--error {
    border-color: #dc3545 !important;
    box-shadow: 0 0 0 2px rgba(220,53,69,0.12) !important;
  }
  .cl-field-error {
    font-size: 13px;
    color: #dc3545;
    line-height: 1.4;
  }
  .cl-form-textarea { resize: vertical; min-height: 80px; }
  .cl-modal__footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 14px 20px;
    border-top: 1.5px solid #f3f4f6;
    background: #f9fafb;
  }
  .cl-btn {
    padding: 8px 18px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .cl-btn--cancel { border: 1.5px solid #e5e7eb; background: #fff; color: #6b7280; }
  .cl-btn--cancel:hover:not(:disabled) { background: #f3f4f6; }
  .cl-btn--cancel:disabled { opacity: 0.6; cursor: not-allowed; }
  .cl-btn--primary { border: none; background: #3d3a8c; color: #fff; }
  .cl-btn--primary:hover:not(:disabled) { background: #2e2b6e; }
  .cl-btn--primary:disabled { opacity: 0.65; cursor: not-allowed; }
  .cl-modal--delete {
    padding: 32px 24px 24px;
    text-align: center;
    max-width: 340px;
  }
  .cl-del-icon { margin-bottom: 16px; }
  .cl-del-title { font-size: 16px; font-weight: 700; color: #212529; margin-bottom: 10px; }
  .cl-del-desc { font-size: 15px; color: #6b7280; margin: 0 0 24px; line-height: 1.6; word-break: keep-all; overflow-wrap: break-word; }
  .cl-del-actions { display: flex; gap: 10px; }
  .cl-del-cancel {
    flex: 1; padding: 10px;
    border-radius: 10px;
    border: 1px solid #dee2e6;
    background: #fff;
    font-size: 15px; font-weight: 500; color: #444;
    cursor: pointer;
    transition: background 0.15s;
  }
  .cl-del-cancel:hover { background: #f0f0f0; }
  .cl-del-cancel:disabled { opacity: 0.6; cursor: not-allowed; }
  .cl-del-confirm {
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
  .cl-del-confirm:hover:not(:disabled) { background: #bb2d3b; }
  .cl-del-confirm:disabled { opacity: 0.65; cursor: not-allowed; }
  .cl-btn-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: cl-spin 0.7s linear infinite;
    display: inline-block;
    flex-shrink: 0;
  }
  @keyframes cl-spin { to { transform: rotate(360deg); } }
  @media (max-width: 480px) {
    .cl-search-row { width: 100%; flex: 0 0 100%; }
    .cl-create-btn { margin-left: auto; }
  }
`;

export default Class;
