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
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredDot, setHoveredDot] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [search, setSearch] = useState("");

  // Modal states
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editName, setEditName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isSearching = useRef(false);

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
      toast.error("Không thể tải danh sách category");
    } finally {
      setLoading(false);
    }
  };

  // Một effect duy nhất xử lý tất cả
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
  };

  const handleEdit = async () => {
    if (!editName.trim()) return;
    setSubmitting(true);
    try {
      await updateCategory(editModal.id, { name: editName.trim() });
      toast.success("Cập nhật thành công");
      setEditModal(null);
      fetchCategories(page, search);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Cập nhật thất bại";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await deleteCategory(deleteModal.id);
      toast.success("Xóa thành công");
      setDeleteModal(null);
      fetchCategories(page, search);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Xóa thất bại";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const dropdownRef = (el, id) => {
    if (!el || el._bsListened) return;
    el._bsListened = true;
    el.addEventListener("show.bs.dropdown", () => setOpenDropdown(id));
    el.addEventListener("hidden.bs.dropdown", () => setOpenDropdown(null));
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
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="5" r="1.5" fill="#6c757d" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="#6c757d" stroke="none" />
      <circle cx="12" cy="19" r="1.5" fill="#6c757d" stroke="none" />
    </svg>
  );

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    zIndex: 1050,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const modalStyle = {
    background: "#fff",
    borderRadius: "12px",
    padding: "24px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
  };

  return (
    <div>
      {/* ===== Edit Modal ===== */}
      {editModal && (
        <div style={overlayStyle} onClick={() => setEditModal(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h6
              style={{
                fontWeight: 600,
                marginBottom: "16px",
                color: "#212529",
              }}
            >
              Chỉnh sửa danh mục
            </h6>
            <label
              style={{
                fontSize: "13px",
                color: "#6c757d",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Tên danh mục
            </label>
            <input
              type="text"
              className="form-control"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEdit()}
              autoFocus
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
                marginTop: "20px",
              }}
            >
              <button
                className="btn btn-light"
                onClick={() => setEditModal(null)}
                disabled={submitting}
                style={{ fontSize: "inherit" }}
              >
                Hủy
              </button>
              <button
                className="btn"
                onClick={handleEdit}
                disabled={submitting || !editName.trim()}
                style={{
                  background: "#3d3a8c",
                  color: "#fff",
                  fontSize: "inherit",
                }}
              >
                {submitting ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Delete Modal ===== */}
      {deleteModal && (
        <div style={overlayStyle} onClick={() => setDeleteModal(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h6
              style={{ fontWeight: 600, marginBottom: "8px", color: "#212529" }}
            >
              Xóa danh mục
            </h6>
            <p
              style={{
                fontSize: "14px",
                color: "#6c757d",
                marginBottom: "20px",
              }}
            >
              Bạn có chắc muốn xóa danh mục{" "}
              <strong style={{ color: "#212529" }}>"{deleteModal.name}"</strong>{" "}
              không? Hành động này không thể hoàn tác.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <button
                className="btn btn-light"
                onClick={() => setDeleteModal(null)}
                disabled={submitting}
                style={{ fontSize: "inherit" }}
              >
                Hủy
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={submitting}
                style={{ fontSize: "inherit" }}
              >
                {submitting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div
        className="input-group"
        style={{ maxWidth: 260, marginBottom: "1rem" }}
      >
        <input
          type="text"
          className="form-control"
          placeholder="Tìm kiếm"
          value={search}
          onChange={handleSearchChange}
          style={{ borderRadius: "8px", fontSize: 13.5, transition: "0.2s" }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = "#2563eb";
          }}
          onMouseLeave={(e) => {
            if (document.activeElement !== e.target)
              e.target.style.borderColor = "";
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#2563eb";
            e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,.15)";
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
              animation: "spin 0.7s linear infinite",
              margin: "0 auto",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : categories.length === 0 ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "#adb5bd" }}>
          Không có dữ liệu
        </div>
      ) : (
        <div>
          {categories.map((cat) => {
            const isRowHovered = hoveredRow === cat.id;
            const isDotHovered = hoveredDot === cat.id;
            const isOpen = openDropdown === cat.id;
            const showTooltip = isDotHovered && !isOpen;
            const showDotBg = isDotHovered || isOpen;

            return (
              <div
                key={cat.id}
                onMouseEnter={() => {
                  if (!openDropdown || openDropdown === cat.id)
                    setHoveredRow(cat.id);
                }}
                onMouseLeave={() => {
                  if (!openDropdown || openDropdown === cat.id)
                    setHoveredRow(null);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 12px",
                  marginBottom: "6px",
                  borderRadius: "10px",
                  border:
                    isRowHovered || isOpen
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
                <div style={{ flex: 1, fontSize: "inherit", color: "#212529" }}>
                  {cat.name}
                </div>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {showTooltip && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-30px",
                        right: "0",
                        background: "#212529",
                        color: "#fff",
                        fontSize: "12px",
                        fontWeight: 500,
                        padding: "3px 8px",
                        borderRadius: "5px",
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                        zIndex: 10,
                      }}
                    >
                      Action
                    </div>
                  )}
                  <div
                    className="dropdown"
                    ref={(el) => dropdownRef(el, cat.id)}
                  >
                    <button
                      className="btn p-0"
                      data-bs-toggle="dropdown"
                      onMouseEnter={() => {
                        if (!openDropdown || openDropdown === cat.id)
                          setHoveredDot(cat.id);
                      }}
                      onMouseLeave={() => setHoveredDot(null)}
                      style={{
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        background: showDotBg ? "#e9ecef" : "transparent",
                        border: "none",
                        transition: "background 0.15s",
                      }}
                    >
                      <IconDots />
                    </button>
                    <ul
                      className="dropdown-menu dropdown-menu-end"
                      style={{
                        minWidth: "60px",
                        width: "60px",
                        padding: "6px 0",
                      }}
                    >
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleOpenEdit(cat)}
                          style={{ padding: "10px 0", textAlign: "center" }}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item text-danger"
                          onClick={() => setDeleteModal(cat)}
                          style={{ padding: "10px 0", textAlign: "center" }}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </li>
                    </ul>
                  </div>
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
              fontSize: "inherit",
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
                border: "1px solid",
                borderColor: page === p ? "#3d3a8c" : "#dee2e6",
                borderRadius: "6px",
                background: page === p ? "#3d3a8c" : "#fff",
                color: page === p ? "#fff" : "#212529",
                cursor: "pointer",
                fontWeight: page === p ? 600 : 400,
                fontSize: "inherit",
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
              fontSize: "inherit",
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
