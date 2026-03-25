import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getClassMembers } from "../../service/classMember.service";
import avatarImg from "../../assets/avatarImg.png";

const ClassMemberUser = () => {
  const { classId } = useParams();

  const [students, setStudents] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [searchBy, setSearchBy] = useState("username");

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(false);

  const size = 10;

  // ================= FETCH =================
  const fetchMembers = async (page = 0, keyword = "") => {
    try {
      setLoading(true);

      const res = await getClassMembers(classId, {
        page,
        size,
        username: searchBy === "username" ? keyword : "",
        email: searchBy === "email" ? keyword : "",
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

  // Load lần đầu
  useEffect(() => {
    fetchMembers(0, "");
  }, [classId]);

  // ================= SEARCH =================
  const handleSearch = () => {
    fetchMembers(0, searchInput);
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
          {loading ? (
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
            />
          ) : null}
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
          Không có thành viên nào
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
                src={student.avatarUrl || avatarImg}
                alt="User Avatar"
                className="rounded-circle me-3"
                style={{ width: 40, height: 40, objectFit: "cover" }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = avatarImg;
                }}
              />

              <div className="flex-grow-1">
                <div className="fw-semibold">{student.username}</div>
                <small className="text-muted">{student.email}</small>
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
    </>
  );
};

export default ClassMemberUser;
