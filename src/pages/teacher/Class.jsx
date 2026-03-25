import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
} from "../../service/class.service";

const Class = () => {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchBy, setSearchBy] = useState("title");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [totalElements, setTotalElements] = useState(0);

  const size = 10;

  // ================= FETCH =================
  const fetchClasses = async (page = 0, keyword = "") => {
    try {
      setLoading(true);

      const res = await getClasses({
        page,
        size,
        title: searchBy === "title" ? keyword : "",
        classCode: searchBy === "classCode" ? keyword : "",
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

  // Load lần đầu
  useEffect(() => {
    fetchClasses(0, "");
  }, []);

  // ================= SEARCH =================
  const handleSearch = () => {
    fetchClasses(0, searchInput);
  };

  // ================= PAGINATION =================
  const handlePageChange = (page) => {
    fetchClasses(page, searchInput);
  };

  // ================= FORM =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openCreateModal = () => {
    setEditingClass(null);
    setFormData({ title: "", description: "" });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingClass(item);
    setFormData({
      title: item.title || "",
      description: item.description || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClass(null);
    setFormData({ title: "", description: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tên lớp!");
      return;
    }

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
      console.error(error.response?.data || error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa lớp này?")) return;

    try {
      await deleteClass(id);
      toast.success("Xóa lớp thành công!");
      fetchClasses(currentPage, searchInput);
    } catch (error) {
      toast.error("Xóa thất bại!");
    }
  };

  return (
    <div className="container-fluid">
      {/* ================= SEARCH ================= */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="input-group" style={{ maxWidth: 600 }}>
          <input
            type="text"
            className="form-control"
            placeholder={
              searchBy === "title"
                ? "Tìm theo tên lớp..."
                : "Tìm theo mã lớp..."
            }
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />

          <select
            className="form-select"
            style={{ maxWidth: 130 }}
            value={searchBy}
            onChange={(e) => {
              setSearchBy(e.target.value);
              setSearchInput("");
            }}
          >
            <option value="title">Theo tên</option>
            <option value="classCode">Theo mã</option>
          </select>

          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Đang tìm...
              </>
            ) : (
              "Tìm kiếm"
            )}
          </button>
        </div>

        <button className="btn btn-success" onClick={openCreateModal}>
          Tạo lớp
        </button>
      </div>

      {!loading && totalElements > 0 && (
        <div className="text-muted small mb-3">
          {totalElements} kết quả tìm thấy
        </div>
      )}

      {/* ================= TABLE ================= */}
      <div className="card shadow">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>STT</th>
                <th>Mã lớp</th>
                <th>Tên lớp</th>
                <th>Mô tả</th>
                <th>Số thành viên</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <div className="spinner-border text-primary"></div>
                  </td>
                </tr>
              ) : classes.length > 0 ? (
                classes.map((item, index) => (
                  <tr
                    key={item.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/teacher/classes/${item.id}`)}
                  >
                    <td>{currentPage * size + index + 1}</td>
                    <td>
                      <span className="badge bg-primary">{item.classCode}</span>
                    </td>
                    <td>{item.title}</td>
                    <td>{item.description || "—"}</td>
                    <td>{item.memberCount}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(item);
                        }}
                      >
                        Sửa
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Không có lớp nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION ================= */}
        {totalPages > 1 && (
          <div className="card-footer text-center">
            <ul className="pagination justify-content-center mb-0">
              <li
                className={`page-item ${currentPage === 0 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
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
                    onClick={() => handlePageChange(i)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}

              <li
                className={`page-item ${
                  currentPage === totalPages - 1 ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Sau
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={closeModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingClass ? "Chỉnh sửa lớp" : "Tạo lớp mới"}
                </h5>
                <button className="btn-close" onClick={closeModal}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input
                    type="text"
                    name="title"
                    className="form-control mb-3"
                    placeholder="Tên lớp"
                    value={formData.title}
                    onChange={handleChange}
                  />

                  <textarea
                    name="description"
                    className="form-control"
                    rows="3"
                    placeholder="Mô tả"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Hủy
                  </button>

                  <button type="submit" className="btn btn-primary">
                    {editingClass ? "Cập nhật" : "Tạo"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Class;
