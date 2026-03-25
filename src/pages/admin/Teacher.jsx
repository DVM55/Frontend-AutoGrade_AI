import React, { useEffect, useState } from "react";
import {
  deleteAccount,
  toggleLockAccount,
  getTeachers,
} from "../../service/account.service";
import { toast } from "react-toastify";

/* =========================
   Confirm Modal
========================= */
const ConfirmModal = ({
  title,
  message,
  confirmLabel,
  confirmClass,
  onConfirm,
  onClose,
}) => (
  <div
    className="modal d-block"
    style={{ background: "rgba(0,0,0,0.45)" }}
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div
      className="modal-dialog modal-dialog-centered"
      style={{ maxWidth: 420 }}
    >
      <div
        className="modal-content border-0 shadow"
        style={{ borderRadius: 16 }}
      >
        <div className="modal-header border-0 pb-0 px-4 pt-4">
          <h6 className="modal-title fw-bold">{title}</h6>
          <button className="btn-close" onClick={onClose} />
        </div>

        <div
          className="modal-body px-4 py-3 text-secondary"
          style={{ fontSize: 14 }}
        >
          {message}
        </div>

        <div className="modal-footer border-0 px-4 pb-4 pt-0">
          <button
            className="btn btn-secondary"
            style={{ borderRadius: 8 }}
            onClick={onClose}
          >
            Hủy
          </button>

          <button
            className={`btn ${confirmClass}`}
            style={{ borderRadius: 8 }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  </div>
);

/* =========================
   Teacher Page
========================= */

const Teacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchBy, setSearchBy] = useState("username");

  const size = 10;

  /* =========================
     Fetch Teachers
  ========================= */
  const fetchTeachers = async (p = 0, keyword = "", by = searchBy) => {
    try {
      setLoading(true);

      const res = await getTeachers({
        page: p,
        size,
        username: by === "username" ? keyword : "",
        email: by === "email" ? keyword : "",
      });

      console.log("Fetched teachers:", res);

      setTeachers(res.data || []);
      setTotalPages(res.meta.totalPages || 0);
      setTotalElements(res.meta.totalElements || 0);
      setPage(res.meta.currentPage - 1 || 0);
    } catch {
      toast.error("Không thể tải danh sách giảng viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers(0, "", "username");
  }, []);

  const handleSearch = () => {
    fetchTeachers(0, searchInput, searchBy);
  };

  /* =========================
     Delete
  ========================= */
  const handleDelete = async () => {
    if (!confirm?.teacher?.id) return;

    try {
      await deleteAccount(confirm.teacher.id);
      toast.success("Đã xóa tài khoản");
      setConfirm(null);
      fetchTeachers(page, searchInput);
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  /* =========================
     Toggle Lock
  ========================= */
  const handleToggleLock = async () => {
    if (!confirm?.teacher?.id) return;

    try {
      await toggleLockAccount(confirm.teacher.id);
      toast.success(
        confirm.teacher.locked ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản",
      );
      setConfirm(null);
      fetchTeachers(page, searchInput);
    } catch {
      toast.error("Thao tác thất bại");
    }
  };

  return (
    <div className="container-fluid">
      {/* ===== Toolbar ===== */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-3">
        <div className="input-group" style={{ maxWidth: 600 }}>
          <input
            type="text"
            className="form-control"
            style={{ fontSize: 14, height: 42 }}
            placeholder={
              searchBy === "username" ? "Tìm theo tên..." : "Tìm theo email..."
            }
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />

          <select
            className="form-select"
            style={{ maxWidth: 140, fontSize: 14, height: 42 }}
            value={searchBy}
            onChange={(e) => {
              setSearchBy(e.target.value);
              setSearchInput("");
            }}
          >
            <option value="username">Theo tên</option>
            <option value="email">Theo email</option>
          </select>

          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            style={{ height: 42, fontSize: 14, whiteSpace: "nowrap" }}
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              <i className="bi bi-search" />
            )}
            Tìm kiếm
          </button>
        </div>
      </div>

      {totalElements > 0 && (
        <div className="text-muted mb-3" style={{ fontSize: 13 }}>
          {totalElements} kết quả tìm thấy
        </div>
      )}

      {/* ===== Table ===== */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light align-middle">
              <tr style={{ height: 48 }}>
                <th
                  className="text-uppercase text-secondary fw-semibold ps-4"
                  style={{ fontSize: 11, letterSpacing: ".06em", width: 64 }}
                >
                  STT
                </th>
                <th
                  className="text-uppercase text-secondary fw-semibold"
                  style={{ fontSize: 11, letterSpacing: ".06em" }}
                >
                  Email
                </th>
                <th
                  className="text-uppercase text-secondary fw-semibold"
                  style={{ fontSize: 11, letterSpacing: ".06em" }}
                >
                  Tên
                </th>
                <th
                  className="text-uppercase text-secondary fw-semibold"
                  style={{ fontSize: 11, letterSpacing: ".06em", width: 200 }}
                >
                  Trạng thái
                </th>
                <th
                  className="text-uppercase text-secondary fw-semibold"
                  style={{ fontSize: 11, letterSpacing: ".06em", width: 110 }}
                >
                  Hành động
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-5">
                    <span className="spinner-border text-primary" />
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted">
                    <div className="fw-semibold mt-2">
                      Không có giảng viên nào
                    </div>
                  </td>
                </tr>
              ) : (
                teachers.map((teacher, idx) => (
                  <tr key={teacher.id} style={{ height: 64 }}>
                    <td className="text-muted ps-4" style={{ fontSize: 14 }}>
                      {page * size + idx + 1}
                    </td>

                    <td style={{ fontSize: 14 }}>{teacher.email}</td>

                    <td>
                      <span className="fw-medium" style={{ fontSize: 15 }}>
                        {teacher.username}
                      </span>
                    </td>

                    <td>
                      {teacher.locked ? (
                        <span
                          className="badge rounded-pill px-3 py-2"
                          style={{
                            background: "#fce8e6",
                            color: "#d93025",
                            fontSize: 12,
                          }}
                        >
                          <i className="bi bi-lock-fill me-1" />
                          Đã khóa
                        </span>
                      ) : (
                        <span
                          className="badge rounded-pill px-3 py-2"
                          style={{
                            background: "#e6f4ea",
                            color: "#1e8e3e",
                            fontSize: 12,
                          }}
                        >
                          <i className="bi bi-check-circle-fill me-1" />
                          Hoạt động
                        </span>
                      )}
                    </td>

                    <td className="pe-3">
                      <div className="d-flex align-items-center gap-2 justify-content-end">
                        <button
                          className="btn btn-sm d-flex align-items-center gap-1"
                          style={{
                            borderRadius: 8,
                            fontSize: 13,
                            padding: "6px 12px",
                            background: teacher.locked ? "#e6f4ea" : "#fff8e1",
                            color: teacher.locked ? "#1e8e3e" : "#f59e0b",
                            border: teacher.locked
                              ? "1px solid #ceead6"
                              : "1px solid #fde68a",
                          }}
                          onClick={() =>
                            setConfirm({ type: "lock", teacher: teacher })
                          }
                        >
                          <i
                            className={`bi ${teacher.locked ? "bi-unlock-fill" : "bi-lock-fill"}`}
                          />
                        </button>
                        <button
                          className="btn btn-sm d-flex align-items-center gap-1"
                          style={{
                            borderRadius: 8,
                            fontSize: 13,
                            padding: "6px 12px",
                            background: "#fce8e6",
                            color: "#d93025",
                            border: "1px solid #f5c6c2",
                          }}
                          onClick={() =>
                            setConfirm({ type: "delete", teacher: teacher })
                          }
                        >
                          <i className="bi bi-trash3-fill" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ===== Pagination ===== */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center gap-3 py-3 border-top">
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={page === 0}
              onClick={() => fetchTeachers(page - 1, searchInput)}
            >
              ← Trước
            </button>

            <span className="text-muted">
              Trang {page + 1} / {totalPages}
            </span>

            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={page + 1 >= totalPages}
              onClick={() => fetchTeachers(page + 1, searchInput)}
            >
              Tiếp →
            </button>
          </div>
        )}
      </div>

      {/* ===== Confirm Modals ===== */}
      {confirm?.type === "delete" && (
        <ConfirmModal
          title="Xác nhận xóa"
          message={
            <>
              Bạn có chắc muốn xóa tài khoản{" "}
              <strong>{confirm.teacher.username}</strong>?
            </>
          }
          confirmLabel="Xóa"
          confirmClass="btn-danger"
          onConfirm={handleDelete}
          onClose={() => setConfirm(null)}
        />
      )}

      {confirm?.type === "lock" && (
        <ConfirmModal
          title={
            confirm.teacher.locked ? "Mở khóa tài khoản" : "Khóa tài khoản"
          }
          message={
            <>
              Bạn có chắc muốn {confirm.teacher.locked ? "mở khóa" : "khóa"} tài
              khoản <strong>{confirm.teacher.username}</strong>?
            </>
          }
          confirmLabel={confirm.teacher.locked ? "Mở khóa" : "Khóa"}
          confirmClass={confirm.teacher.locked ? "btn-success" : "btn-warning"}
          onConfirm={handleToggleLock}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
};

export default Teacher;
