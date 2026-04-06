import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import {
  deleteGroup,
  getGroup,
  updateGroup,
} from "../../service/group.service";
import { toast } from "react-toastify";

const Group = forwardRef((props, ref) => {
  const [groups, setGroups] = useState([]);
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

  // Click-outside để đóng dropdown — fix bug mobile
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

  const fetchGroups = async (p = 0, name = search) => {
    setLoading(true);
    try {
      const res = await getGroup({
        page: p,
        size: 10,
        name: name || undefined,
      });
      setGroups(res.data);
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
        fetchGroups(0, search);
      }, 200);
      return () => clearTimeout(timer);
    }
    fetchGroups(page, search);
  }, [search, page]);

  const handleSearchChange = (e) => {
    isSearching.current = true;
    setSearch(e.target.value);
  };

  useImperativeHandle(ref, () => ({
    refresh: () => fetchGroups(page, search),
  }));

  const handleOpenEdit = (group) => {
    setEditModal(group);
    setEditName(group.name);
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
      await updateGroup(editModal.id, { name: editName.trim() });
      toast.success("Cập nhật thành công");
      handleCloseEdit();
      fetchGroups(page, search);
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
      await deleteGroup(deleteModal.id);
      toast.success("Xóa thành công");
      setDeleteModal(null);
      fetchGroups(page, search);
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

  const IconGroup = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3d3a8c"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="9" r="5" />
      <circle cx="15" cy="9" r="5" />
      <circle cx="12" cy="15" r="5" />
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
        .grp-overlay {
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
        .grp-edit-modal {
          background: #fff;
          border-radius: 12px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          box-sizing: border-box;
          padding: 20px 16px;
        }

        .grp-edit-modal-header {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-bottom: 12px;
        }

        .grp-edit-modal-close {
          background: none;
          border: none;
          font-size: 22px;
          cursor: pointer;
          color: #888;
          line-height: 1;
          padding: 0 4px;
          transition: color 0.15s;
        }

        .grp-edit-modal-close:hover { color: #212529; }
        .grp-edit-modal-close:disabled { opacity: 0.5; cursor: not-allowed; }

        .grp-alert-banner {
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

        .grp-edit-field { margin-bottom: 16px; }

        .grp-edit-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          font-size: 16px;
          color: #333;
        }

        .grp-required { color: #dc3545; margin-left: 2px; }

        .grp-edit-input {
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

        .grp-edit-input:focus {
          border-color: #3d3a8c;
          box-shadow: 0 0 0 3px rgba(61,58,140,0.12);
        }

        .grp-edit-input.is-error {
          border-color: #dc3545;
          box-shadow: 0 0 0 2px rgba(220,53,69,0.12);
        }

        .grp-field-error {
          font-size: 0.78rem;
          color: #dc3545;
          margin-top: 0.3rem;
          min-height: 1em;
          line-height: 1.4;
        }

        .grp-edit-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .grp-btn-cancel-sm {
          padding: 9px 16px;
          border-radius: 8px;
          border: 1px solid #ddd;
          background: #fff;
          cursor: pointer;
          font-size: 14px;
          color: #444;
          transition: background 0.15s;
        }

        .grp-btn-cancel-sm:hover { background: #f0f0f0; }
        .grp-btn-cancel-sm:disabled { opacity: 0.6; cursor: not-allowed; }

        .grp-btn-save {
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

        .grp-btn-save:hover:not(:disabled) { background: #2e2b6e; }
        .grp-btn-save:disabled { opacity: 0.65; cursor: not-allowed; }

        /* ===== DELETE MODAL ===== */
        .grp-delete-modal {
          background: #fff;
          border-radius: 16px;
          width: 100%;
          max-width: 340px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.18);
          box-sizing: border-box;
          padding: 32px 24px 24px;
          text-align: center;
        }

        .grp-delete-icon { margin-bottom: 16px; }

        .grp-delete-title {
          font-size: 16px;
          font-weight: 700;
          color: #212529;
          margin: 0 0 10px;
          line-height: 1.3;
        }

        .grp-delete-desc {
          font-size: 15px;
          color: #6c757d;
          margin: 0 0 24px;
          line-height: 1.6;
          word-break: keep-all;
          overflow-wrap: break-word;
        }

        .grp-delete-name {
          color: #212529;
          font-weight: 600;
        }

        .grp-delete-actions {
          display: flex;
          gap: 10px;
        }

        .grp-delete-cancel {
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

        .grp-delete-cancel:hover { background: #f0f0f0; }
        .grp-delete-cancel:disabled { opacity: 0.6; cursor: not-allowed; }

        .grp-delete-confirm {
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

        .grp-delete-confirm:hover:not(:disabled) { background: #bb2d3b; }
        .grp-delete-confirm:disabled { opacity: 0.65; cursor: not-allowed; }

        /* Spinner */
        .grp-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: grp-spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes grp-spin { to { transform: rotate(360deg); } }

        /* ===== CUSTOM DROPDOWN ===== */
        .grp-dropdown-wrap { position: relative; }

        .grp-dot-btn {
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

        .grp-dot-btn:hover,
        .grp-dot-btn.active { background: #e9ecef; }

        .grp-dropdown-menu {
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

        .grp-dropdown-item {
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

        .grp-dropdown-item:hover { background: #f8f9fa; }
        .grp-dropdown-item.danger { color: #dc3545; }
        .grp-dropdown-item.danger:hover { background: #fff5f5; }
      `}</style>

      {/* ===== Edit Modal ===== */}
      {editModal && (
        <div className="grp-overlay" onClick={handleCloseEdit}>
          <div className="grp-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="grp-edit-modal-header">
              <button
                className="grp-edit-modal-close"
                onClick={handleCloseEdit}
                disabled={submitting}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            {editApiError && (
              <div
                className="grp-alert-banner"
                role="alert"
                aria-live="assertive"
              >
                <span style={{ flexShrink: 0 }}>⚠</span>
                <span>{editApiError}</span>
              </div>
            )}

            <div className="grp-edit-field">
              <label className="grp-edit-label">
                Tên nhóm<span className="grp-required">*</span>
              </label>
              <input
                type="text"
                className={`grp-edit-input${editNameError ? " is-error" : ""}`}
                value={editName}
                onChange={handleEditNameChange}
                onKeyDown={(e) =>
                  e.key === "Enter" && !submitting && handleEdit()
                }
                autoFocus
                autoComplete="off"
                aria-describedby={editNameError ? "grp-edit-error" : undefined}
              />
              {editNameError && (
                <div
                  id="grp-edit-error"
                  className="grp-field-error"
                  role="alert"
                >
                  {editNameError}
                </div>
              )}
            </div>

            <div className="grp-edit-actions">
              <button
                className="grp-btn-cancel-sm"
                onClick={handleCloseEdit}
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                className="grp-btn-save"
                onClick={handleEdit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="grp-spinner" aria-hidden="true" />
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

      {/* ===== Delete Modal ===== */}
      {deleteModal && (
        <div
          className="grp-overlay"
          onClick={() => !submitting && setDeleteModal(null)}
        >
          <div
            className="grp-delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grp-delete-icon">
              <IconWarning />
            </div>
            <h6 className="grp-delete-title">Bạn có chắc chắn xóa không?</h6>
            <div className="grp-delete-desc">
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
                  className="grp-delete-name"
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
            <div className="grp-delete-actions">
              <button
                className="grp-delete-cancel"
                onClick={() => setDeleteModal(null)}
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                className="grp-delete-confirm"
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="grp-spinner" aria-hidden="true" />
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
              animation: "grp-spin 0.7s linear infinite",
              margin: "0 auto",
            }}
          />
        </div>
      ) : groups.length === 0 ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "#adb5bd" }}>
          Không có dữ liệu
        </div>
      ) : (
        <div>
          {groups.map((group) => {
            const isOpen = openDropdown === group.id;
            return (
              <div
                key={group.id}
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
                  <IconGroup />
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
                  title={group.name}
                >
                  {group.name}
                </div>

                <div
                  className="grp-dropdown-wrap"
                  ref={(el) => {
                    if (el) dropdownRefs.current[group.id] = el;
                  }}
                >
                  <button
                    className={`grp-dot-btn${isOpen ? " active" : ""}`}
                    onClick={(e) => toggleDropdown(group.id, e)}
                    aria-label="Tùy chọn"
                  >
                    <IconDots />
                  </button>

                  {isOpen && (
                    <div className="grp-dropdown-menu">
                      <button
                        className="grp-dropdown-item"
                        onClick={() => handleOpenEdit(group)}
                      >
                        <i className="bi bi-pencil" style={{ fontSize: 14 }} />
                        Chỉnh sửa
                      </button>
                      <button
                        className="grp-dropdown-item danger"
                        onClick={() => {
                          setDeleteModal(group);
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

export default Group;
