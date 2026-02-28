import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getClassMemberPendings,
  approveClassMember,
  deleteClassMember,
} from "../../service/classMember.service";

const ClassMemberPending = () => {
  const { classId } = useParams();

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionType, setActionType] = useState(""); // approve | reject

  const [searchInput, setSearchInput] = useState("");
  const [searchBy, setSearchBy] = useState("username");

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const size = 10;

  // ================= FETCH =================
  const fetchMembers = async (page = 0, keyword = "") => {
    try {
      setLoading(true);

      const res = await getClassMemberPendings(classId, {
        page,
        size,
        username: searchBy === "username" ? keyword : "",
        email: searchBy === "email" ? keyword : "",
      });

      const pageData = res.data;

      setStudents(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
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
    fetchMembers(0, "");
  }, [classId]);

  // ================= SEARCH =================
  const handleSearch = () => {
    fetchMembers(0, searchInput);
  };

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

  return (
    <>
      {/* ================= SEARCH ================= */}
      <div className="d-flex gap-2 mb-3 align-items-stretch">
        <input
          type="text"
          className="form-control"
          placeholder={
            searchBy === "username" ? "Tìm theo tên..." : "Tìm theo email..."
          }
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />

        <select
          className="form-select"
          style={{ maxWidth: 160 }}
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
          className="btn btn-primary px-4 fw-semibold"
          style={{ minWidth: 120 }}
          onClick={handleSearch}
          disabled={loading}
        >
          {loading && (
            <span className="spinner-border spinner-border-sm me-2" />
          )}
          Tìm kiếm
        </button>
      </div>

      {!loading && totalElements > 0 && (
        <div className="text-muted small mb-3">
          {totalElements} kết quả tìm thấy
        </div>
      )}

      {/* ================= LIST ================= */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : students.length === 0 ? (
        <div className="text-center text-muted py-5">
          Không có yêu cầu chờ duyệt
        </div>
      ) : (
        <div className="card shadow">
          {students.map((student, index) => (
            <div
              key={student.id}
              className="d-flex align-items-center px-4 py-3"
              style={{
                borderBottom:
                  index < students.length - 1 ? "1px solid #f0f0f0" : "none",
              }}
            >
              <span className="me-3">{currentPage * size + index + 1}</span>

              <img
                src={student.avatarUrl}
                alt={student.username}
                className="rounded-circle me-3"
                style={{ width: 40, height: 40, objectFit: "cover" }}
              />

              <div className="flex-grow-1">
                <div className="fw-semibold">{student.username}</div>
                <small className="text-muted">{student.email}</small>
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => {
                    setSelectedStudent(student);
                    setActionType("approve");
                  }}
                >
                  Duyệt
                </button>

                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => {
                    setSelectedStudent(student);
                    setActionType("reject");
                  }}
                >
                  Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && !loading && (
        <div className="mt-3">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 0 && "disabled"}`}>
              <button
                className="page-link"
                onClick={() => fetchMembers(currentPage - 1, searchInput)}
              >
                Trước
              </button>
            </li>

            {[...Array(totalPages)].map((_, i) => (
              <li
                key={i}
                className={`page-item ${currentPage === i ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => fetchMembers(i, searchInput)}
                >
                  {i + 1}
                </button>
              </li>
            ))}

            <li
              className={`page-item ${
                currentPage === totalPages - 1 && "disabled"
              }`}
            >
              <button
                className="page-link"
                onClick={() => fetchMembers(currentPage + 1, searchInput)}
              >
                Sau
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* ================= MODAL CONFIRM ================= */}
      {selectedStudent && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setSelectedStudent(null)}
          />
          <div className="modal fade show d-block">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {actionType === "approve"
                      ? "Xác nhận duyệt"
                      : "Xác nhận từ chối"}
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setSelectedStudent(null)}
                  />
                </div>
                <div className="modal-body">
                  Bạn có chắc muốn{" "}
                  <strong>
                    {actionType === "approve" ? "duyệt" : "từ chối"}
                  </strong>{" "}
                  <strong>{selectedStudent.username}</strong>?
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSelectedStudent(null)}
                  >
                    Hủy
                  </button>
                  <button
                    className={`btn ${
                      actionType === "approve" ? "btn-success" : "btn-danger"
                    }`}
                    onClick={handleConfirm}
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ClassMemberPending;
