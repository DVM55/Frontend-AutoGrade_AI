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

      const data = res.data;

      setTeachers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setPage(data.number || 0);
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
    try {
      await deleteAccount(confirm.user.id);
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
    try {
      await toggleLockAccount(confirm.user.id);
      toast.success(
        confirm.user.locked ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản",
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
                    <div style={{ fontSize: 48 }}>👨‍🏫</div>
                    <div className="fw-semibold mt-2">
                      Không có giảng viên nào
                    </div>
                  </td>
                </tr>
              ) : (
                teachers.map((teacher, idx) => (
                  <tr key={teacher.id} style={{ height: 64 }}>
                    <td className="ps-4">{page * size + idx + 1}</td>

                    <td>{teacher.email}</td>

                    <td className="fw-medium">{teacher.username}</td>

                    <td>
                      {teacher.locked ? (
                        <span className="badge bg-danger-subtle text-danger">
                          <i className="bi bi-lock-fill me-1" />
                          Đã khóa
                        </span>
                      ) : (
                        <span className="badge bg-success-subtle text-success">
                          <i className="bi bi-check-circle-fill me-1" />
                          Hoạt động
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="d-flex gap-2 justify-content-end">
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() =>
                            setConfirm({ type: "lock", user: teacher })
                          }
                        >
                          <i
                            className={`bi ${
                              teacher.locked ? "bi-unlock-fill" : "bi-lock-fill"
                            }`}
                          />
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            setConfirm({ type: "delete", user: teacher })
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
              <strong>{confirm.user.username}</strong>?
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
          title={confirm.user.locked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
          message={
            <>
              Bạn có chắc muốn {confirm.user.locked ? "mở khóa" : "khóa"} tài
              khoản <strong>{confirm.user.username}</strong>?
            </>
          }
          confirmLabel={confirm.user.locked ? "Mở khóa" : "Khóa"}
          confirmClass={confirm.user.locked ? "btn-success" : "btn-warning"}
          onConfirm={handleToggleLock}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
};

export default Teacher;
