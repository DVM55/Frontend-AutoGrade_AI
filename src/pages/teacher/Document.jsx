import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  getDocumentsByClass,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../../service/document.service";
import DocumentDetail from "./DocumentDetail";

const Document = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(false);
  const [openedDocumentId, setOpenedDocumentId] = useState(null);

  const size = 10;

  // ================= FORMAT DATE =================
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ================= FETCH =================
  const fetchDocuments = async (page = 0) => {
    try {
      setLoading(true);

      const res = await getDocumentsByClass(classId, {
        page,
        size,
      });

      const pageData = res.data;

      setDocuments(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
      setCurrentPage(page);
    } catch (error) {
      toast.error("Không thể tải danh sách thư mục");
      setDocuments([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(0);
  }, [classId]);

  // ================= PAGINATION =================
  const handlePageChange = (page) => {
    fetchDocuments(page);
  };

  // ================= CREATE / UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.warning("Tên thư mục không được để trống");
      return;
    }

    try {
      const payload = { title, description };

      if (isEditing) {
        await updateDocument(selectedDocument.id, payload);
        toast.success("Cập nhật thành công");
      } else {
        await createDocument(classId, payload);
        toast.success("Tạo thư mục thành công");
      }

      closeModal();
      fetchDocuments(currentPage);
    } catch (error) {
      toast.error("Thao tác thất bại");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa thư mục này?")) return;

    try {
      await deleteDocument(id);
      toast.success("Xóa thành công");
      fetchDocuments(currentPage);
    } catch (error) {
      toast.error("Xóa thất bại");
    }
  };

  // ================= MODAL CONTROL =================
  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedDocument({});
    setTitle("");
    setDescription("");
  };

  const openEditModal = (doc) => {
    setIsEditing(true);
    setSelectedDocument(doc);
    setTitle(doc.title || "");
    setDescription(doc.description || "");
  };

  const closeModal = () => {
    setSelectedDocument(null);
    setIsEditing(false);
    setTitle("");
    setDescription("");
  };

  if (openedDocumentId) {
    return (
      <DocumentDetail
        documentId={openedDocumentId}
        onBack={() => setOpenedDocumentId(null)}
      />
    );
  }

  return (
    <div className="container-fluid">
      {/* ================= HEADER ================= */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="text-muted small">
          {totalElements > 0 && `${totalElements} thư mục`}
        </div>

        <button className="btn btn-primary" onClick={openCreateModal}>
          <i className="bi bi-folder-plus me-2"></i>
          Tạo thư mục
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card shadow-sm border-1">
        {/* ===== HEADER ===== */}
        <div className="row px-4 py-3 border-bottom bg-light fw-semibold text-muted">
          <div className="col-8">Tên</div>
          <div className="col-3">Ngày sửa đổi</div>
          <div className="col-1 text-center"></div>
        </div>

        {/* ===== BODY ===== */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : documents.length > 0 ? (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="row align-items-center px-4 py-3 border-bottom hover-row"
              onClick={() => navigate(`documents/${doc.id}`)}
            >
              {/* ===== NAME ===== */}
              <div className="col-8 d-flex align-items-center gap-2">
                <i className="bi bi-folder-fill text-warning fs-5"></i>
                <span className="fw-medium">{doc.title}</span>
              </div>

              {/* ===== UPDATED DATE ===== */}
              <div className="col-3 text-muted small">
                {formatDate(doc.updatedAt)}
              </div>

              {/* ===== ACTION ===== */}
              <div className="col-1 text-center">
                <div className="dropdown">
                  <button
                    className="btn btn-sm"
                    data-bs-toggle="dropdown"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <i className="bi bi-three-dots-vertical"></i>
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(doc);
                        }}
                      >
                        Sửa
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(doc.id);
                        }}
                      >
                        Xóa
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-5 text-muted">
            Không có thư mục nào
          </div>
        )}
      </div>

      {/* ===== PAGINATION ===== */}
      {totalPages > 1 && (
        <div className="card-footer bg-white mt-3">
          <ul className="pagination justify-content-center mb-0">
            <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
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

      {/* ================= MODAL ================= */}
      {selectedDocument !== null && (
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
                  {isEditing ? "Cập nhật thư mục" : "Tạo thư mục"}
                </h5>
                <button className="btn-close" onClick={closeModal}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Tên thư mục"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Mô tả"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                    {isEditing ? "Cập nhật" : "Tạo"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Hover effect */}
      <style>
        {`
          .hover-row:hover {
            background-color: #f8f9fa;
            cursor: pointer;
          }
        `}
      </style>
    </div>
  );
};

export default Document;
