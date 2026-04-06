import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import {
  deleteCategory,
  getCategory,
  updateCategory,
} from "../../service/category.service";
import { toast } from "react-toastify";

const Category = forwardRef((props, ref) => {
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({
    totalItems: 0,
    itemCount: 0,
    itemsPerPage: 10,
    totalPages: 1,
    currentPage: 0,
  });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [search, setSearch] = useState("");

  // Modal states
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editName, setEditName] = useState("");
  const [editNameError, setEditNameError] = useState("");
  const [editApiError, setEditApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isSearching = useRef(false);
  const dropdownRefs = useRef({});

  // Click-outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openDropdown === null) return;
      const el = dropdownRefs.current[openDropdown];
      if (el && !el.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [openDropdown]);

  const fetchCategories = async (p = 0, name = search) => {
    setLoading(true);
    try {
      const res = await getCategory({
        page: p,
        size: 10,
        name: name || undefined,
      });
      setCategories(res.data);
      setMeta(res.meta);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSearching.current) {
      const timer = setTimeout(() => {
        isSearching.current = false;
        fetchCategories(0, search);
      }, 200);
      return () => clearTimeout(timer);
    }
    fetchCategories(page, search);
  }, [search, page]);

  const handleSearchChange = (e) => {
    isSearching.current = true;
    setSearch(e.target.value);
  };

  useImperativeHandle(ref, () => ({
    refresh: () => fetchCategories(page, search),
  }));

  const handleOpenEdit = (cat) => {
    setEditModal(cat);
    setEditName(cat.name);
    setEditNameError("");
    setEditApiError("");
    setOpenDropdown(null);
  };

  const handleCloseEdit = () => {
    setEditModal(null);
    setEditName("");
    setEditNameError("");
    setEditApiError("");
  };

  const validateEdit = () => {
    if (!editName.trim()) {
      setEditNameError("Tên không được để trống");
      return false;
    }
    if (editName.trim().length < 2) {
      setEditNameError("Tên phải có ít nhất 2 ký tự");
      return false;
    }
    if (editName.trim().length > 100) {
      setEditNameError("Tên không được vượt quá 100 ký tự");
      return false;
    }
    setEditNameError("");
    return true;
  };

  const handleEdit = async () => {
    if (!validateEdit()) return;
    setSubmitting(true);
    setEditApiError("");
    try {
      await updateCategory(editModal.id, { name: editName.trim() });
      toast.success("Cập nhật thành công");
      handleCloseEdit();
      fetchCategories(page, search);
    } catch (err) {
      setEditApiError(
        err?.response?.data?.message || err?.message || "Cập nhật thất bại",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditNameChange = (e) => {
    setEditName(e.target.value);
    if (editNameError) setEditNameError("");
    if (editApiError) setEditApiError("");
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await deleteCategory(deleteModal.id);
      toast.success("Xóa thành công");
      setDeleteModal(null);
      fetchCategories(page, search);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Xóa thất bại",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDropdown = (id, e) => {
    e.stopPropagation();
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  const IconList = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3d3a8c"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="3" cy="6" r="1" fill="#3d3a8c" stroke="none" />
      <circle cx="3" cy="12" r="1" fill="#3d3a8c" stroke="none" />
      <circle cx="3" cy="18" r="1" fill="#3d3a8c" stroke="none" />
    </svg>
  );

  const IconDots = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5" r="1.5" fill="#6c757d" />
      <circle cx="12" cy="12" r="1.5" fill="#6c757d" />
      <circle cx="12" cy="19" r="1.5" fill="#6c757d" />
    </svg>
  );

  const IconWarning = () => (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <circle cx="26" cy="26" r="26" fill="#fff3e0" />
      <path
        d="M26 14l12 22H14L26 14z"
        fill="none"
        stroke="#f57c00"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <rect x="25" y="23" width="2" height="7" rx="1" fill="#f57c00" />
      <circle cx="26" cy="33" r="1.2" fill="#f57c00" />
    </svg>
  );

  return (
    <div>
      <style>{`
        /* ===== OVERLAY ===== */
        .cat-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          box-sizing: border-box;
        }

        /* ===== EDIT MODAL — style giống Profile ===== */
        .cat-edit-modal {
          background: #fff;
          border-radius: 12px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          box-sizing: border-box;
          padding: 20px 16px;
        }

        .cat-edit-modal-header {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-bottom: 12px;
        }

        .cat-edit-modal-close {
          background: none;
          border: none;
          font-size: 22px;
          cursor: pointer;
          color: #888;
          line-height: 1;
          padding: 0 4px;
          transition: color 0.15s;
        }

        .cat-edit-modal-close:hover { color: #212529; }
        .cat-edit-modal-close:disabled { opacity: 0.5; cursor: not-allowed; }

        .cat-alert-banner {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.65rem 0.85rem;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 12px;
          word-break: break-word;
          background: #fff5f5;
          border: 1px solid #f5c2c7;
          color: #842029;
        }

        .cat-edit-field { margin-bottom: 16px; }

        .cat-edit-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          font-size: 16px;
          color: #333;
        }

        .cat-required { color: #dc3545; margin-left: 2px; }

        .cat-edit-input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #ddd;
          font-size: 16px;
          outline: none;
          box-sizing: border-box;
          -webkit-appearance: none;
          appearance: none;
          background: #fff;
          transition: border-color 0.2s, box-shadow 0.2s;
          color: #212529;
        }

        .cat-edit-input:focus {
          border-color: #3d3a8c;
          box-shadow: 0 0 0 3px rgba(61,58,140,0.12);
        }

        .cat-edit-input.is-error {
          border-color: #dc3545;
          box-shadow: 0 0 0 2px rgba(220,53,69,0.12);
        }

        .cat-field-error {
          font-size: 0.78rem;
          color: #dc3545;
          margin-top: 0.3rem;
          min-height: 1em;
          line-height: 1.4;
        }

        .cat-edit-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .cat-btn-cancel-sm {
          padding: 9px 16px;
          border-radius: 8px;
          border: 1px solid #ddd;
          background: #fff;
          cursor: pointer;
          font-size: 14px;
          color: #444;
          transition: background 0.15s;
        }

        .cat-btn-cancel-sm:hover { background: #f0f0f0; }
        .cat-btn-cancel-sm:disabled { opacity: 0.6; cursor: not-allowed; }

        .cat-btn-save {
          padding: 9px 16px;
          border-radius: 8px;
          border: none;
          background: #3d3a8c;
          color: #fff;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.15s, opacity 0.15s;
        }

        .cat-btn-save:hover:not(:disabled) { background: #2e2b6e; }
        .cat-btn-save:disabled { opacity: 0.65; cursor: not-allowed; }

        /* ===== DELETE MODAL — style như ảnh ===== */
        .cat-delete-modal {
          background: #fff;
          border-radius: 16px;
          width: 100%;
          max-width: 340px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.18);
          box-sizing: border-box;
          padding: 32px 24px 24px;
          text-align: center;
        }

        .cat-delete-icon { margin-bottom: 16px; }

        .cat-delete-title {
          font-size: 16px;
          font-weight: 700;
          color: #212529;
          margin: 0 0 10px;
          line-height: 1.3;
        }

        .cat-delete-desc {
          font-size: 15px;
          color: #6c757d;
          margin: 0 0 24px;
          line-height: 1.6;
          word-break: keep-all;
          overflow-wrap: break-word;
        }

        .cat-delete-name {
          color: #212529;
          font-weight: 600;
        }

        .cat-delete-actions {
          display: flex;
          gap: 10px;
        }

        .cat-delete-cancel {
          flex: 1;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #dee2e6;
          background: #fff;
          font-size: 14px;
          font-weight: 500;
          color: #444;
          cursor: pointer;
          transition: background 0.15s;
        }

        .cat-delete-cancel:hover { background: #f0f0f0; }
        .cat-delete-cancel:disabled { opacity: 0.6; cursor: not-allowed; }

        .cat-delete-confirm {
          flex: 1;
          padding: 10px;
          border-radius: 10px;
          border: none;
          background: #dc3545;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 0.15s, opacity 0.15s;
        }

        .cat-delete-confirm:hover:not(:disabled) { background: #bb2d3b; }
        .cat-delete-confirm:disabled { opacity: 0.65; cursor: not-allowed; }

        /* Spinner */
        .cat-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: cat-spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes cat-spin { to { transform: rotate(360deg); } }

        /* ===== CUSTOM DROPDOWN ===== */
        .cat-dropdown-wrap { position: relative; }

        .cat-dot-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
          -webkit-tap-highlight-color: transparent;
        }

        .cat-dot-btn:hover,
        .cat-dot-btn.active { background: #e9ecef; }

        .cat-dropdown-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 4px);
          background: #fff;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          z-index: 100;
          min-width: 120px;
          overflow: hidden;
        }

        .cat-dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 14px;
          border: none;
          background: transparent;
          font-size: 14px;
          color: #212529;
          cursor: pointer;
          text-align: left;
          transition: background 0.12s;
        }

        .cat-dropdown-item:hover { background: #f8f9fa; }
        .cat-dropdown-item.danger { color: #dc3545; }
        .cat-dropdown-item.danger:hover { background: #fff5f5; }
      `}</style>

      {/* ===== Edit Modal — giống Profile ===== */}
      {editModal && (
        <div className="cat-overlay" onClick={handleCloseEdit}>
          <div className="cat-edit-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header: chỉ nút X */}
            <div className="cat-edit-modal-header">
              <button
                className="cat-edit-modal-close"
                onClick={handleCloseEdit}
                disabled={submitting}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            {/* API error banner */}
            {editApiError && (
              <div
                className="cat-alert-banner"
                role="alert"
                aria-live="assertive"
              >
                <span style={{ flexShrink: 0 }}>⚠</span>
                <span>{editApiError}</span>
              </div>
            )}

            {/* Field */}
            <div className="cat-edit-field">
              <label className="cat-edit-label">
                Tên danh mục<span className="cat-required">*</span>
              </label>
              <input
                type="text"
                className={`cat-edit-input${editNameError ? " is-error" : ""}`}
                value={editName}
                onChange={handleEditNameChange}
                onKeyDown={(e) =>
                  e.key === "Enter" && !submitting && handleEdit()
                }
                autoFocus
                autoComplete="off"
                aria-describedby={editNameError ? "cat-edit-error" : undefined}
              />
              {editNameError && (
                <div
                  id="cat-edit-error"
                  className="cat-field-error"
                  role="alert"
                >
                  {editNameError}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="cat-edit-actions">
              <button
                className="cat-btn-cancel-sm"
                onClick={handleCloseEdit}
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                className="cat-btn-save"
                onClick={handleEdit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="cat-spinner" aria-hidden="true" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Delete Modal — style như ảnh ===== */}
      {deleteModal && (
        <div
          className="cat-overlay"
          onClick={() => !submitting && setDeleteModal(null)}
        >
          <div
            className="cat-delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cat-delete-icon">
              <IconWarning />
            </div>
            <h6 className="cat-delete-title">Bạn có chắc chắn xóa không?</h6>
            <div className="cat-delete-desc">
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 4,
                  flexWrap: "wrap",
                }}
              >
                <span>Danh mục</span>
                <span
                  className="cat-delete-name"
                  title={deleteModal.name}
                  style={{
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                  }}
                >
                  {deleteModal.name}
                </span>
                <span>sẽ bị xóa vĩnh viễn.</span>
              </div>
            </div>
            <div className="cat-delete-actions">
              <button
                className="cat-delete-cancel"
                onClick={() => setDeleteModal(null)}
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                className="cat-delete-confirm"
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="cat-spinner" aria-hidden="true" />
                    Đang xóa...
                  </>
                ) : (
                  "Xóa"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ maxWidth: 260, marginBottom: "1rem" }}>
        <input
          type="text"
          className="form-control"
          placeholder="Tìm kiếm"
          value={search}
          onChange={handleSearchChange}
          style={{ borderRadius: "8px", fontSize: 16, transition: "0.2s" }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = "#3d3a8c";
          }}
          onMouseLeave={(e) => {
            if (document.activeElement !== e.target)
              e.target.style.borderColor = "";
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#3d3a8c";
            e.target.style.boxShadow = "0 0 0 3px rgba(61,58,140,0.15)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "";
            e.target.style.boxShadow = "";
          }}
        />
      </div>

      {/* ===== List ===== */}
      {loading ? (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              border: "3px solid #e9ecef",
              borderTop: "3px solid #3d3a8c",
              borderRadius: "50%",
              animation: "cat-spin 0.7s linear infinite",
              margin: "0 auto",
            }}
          />
        </div>
      ) : categories.length === 0 ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "#adb5bd" }}>
          Không có dữ liệu
        </div>
      ) : (
        <div>
          {categories.map((cat) => {
            const isOpen = openDropdown === cat.id;
            return (
              <div
                key={cat.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 12px",
                  marginBottom: "6px",
                  borderRadius: "10px",
                  border: isOpen
                    ? "1.5px solid #5d51e7"
                    : "1.5px solid #e9ecef",
                  background: "#fff",
                  gap: "12px",
                  transition: "border-color 0.15s",
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <IconList />
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: "inherit",
                    color: "#212529",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    minWidth: 0,
                  }}
                  title={cat.name}
                >
                  {cat.name}
                </div>

                {/* Custom dropdown */}
                <div
                  className="cat-dropdown-wrap"
                  ref={(el) => {
                    if (el) dropdownRefs.current[cat.id] = el;
                  }}
                >
                  <button
                    className={`cat-dot-btn${isOpen ? " active" : ""}`}
                    onClick={(e) => toggleDropdown(cat.id, e)}
                    aria-label="Tùy chọn"
                  >
                    <IconDots />
                  </button>

                  {isOpen && (
                    <div className="cat-dropdown-menu">
                      <button
                        className="cat-dropdown-item"
                        onClick={() => handleOpenEdit(cat)}
                      >
                        <i className="bi bi-pencil" style={{ fontSize: 14 }} />
                        Chỉnh sửa
                      </button>
                      <button
                        className="cat-dropdown-item danger"
                        onClick={() => {
                          setDeleteModal(cat);
                          setOpenDropdown(null);
                        }}
                      >
                        <i className="bi bi-trash" style={{ fontSize: 14 }} />
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && meta.totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "4px",
            marginTop: "1.5rem",
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              padding: "5px 10px",
              border: "1px solid #dee2e6",
              borderRadius: "6px",
              background: "#fff",
              color: page === 0 ? "#adb5bd" : "#212529",
              cursor: page === 0 ? "not-allowed" : "pointer",
            }}
          >
            ‹
          </button>

          {Array.from({ length: meta.totalPages }, (_, i) => i).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                padding: "5px 10px",
                border: `1px solid ${page === p ? "#3d3a8c" : "#dee2e6"}`,
                borderRadius: "6px",
                background: page === p ? "#3d3a8c" : "#fff",
                color: page === p ? "#fff" : "#212529",
                cursor: "pointer",
                fontWeight: page === p ? 600 : 400,
                minWidth: "34px",
              }}
            >
              {p + 1}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages - 1, p + 1))}
            disabled={page === meta.totalPages - 1}
            style={{
              padding: "5px 10px",
              border: "1px solid #dee2e6",
              borderRadius: "6px",
              background: "#fff",
              color: page === meta.totalPages - 1 ? "#adb5bd" : "#212529",
              cursor: page === meta.totalPages - 1 ? "not-allowed" : "pointer",
            }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
});

export default Category;
