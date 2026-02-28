import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getDocumentsByClass } from "../../service/document.service";
import DocumentDetailUser from "./DocumentDetailUser";

const Document = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);

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

  return (
    <>
      {openedDocumentId ? (
        <DocumentDetailUser
          documentId={openedDocumentId}
          onBack={() => setOpenedDocumentId(null)}
        />
      ) : (
        <div className="container-fluid">
          {/* ================= TABLE ================= */}
          <div className="card shadow-sm border-1">
            <div className="row px-4 py-3 border-bottom bg-light fw-semibold text-muted">
              <div className="col-8">Tên</div>
              <div className="col-3">Ngày sửa đổi</div>
              <div className="col-1 text-center"></div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : documents.length > 0 ? (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="row align-items-center px-4 py-3 border-bottom hover-row"
                  onClick={() => setOpenedDocumentId(doc.id)}
                >
                  <div className="col-8 d-flex align-items-center gap-2">
                    <i className="bi bi-folder-fill text-warning fs-5"></i>
                    <span className="fw-medium">{doc.title}</span>
                  </div>

                  <div className="col-3 text-muted small">
                    {formatDate(doc.updatedAt)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-5 text-muted">
                Không có thư mục nào
              </div>
            )}
          </div>

          {/* ================= PAGINATION ================= */}
          {totalPages > 1 && (
            <div className="card-footer bg-white mt-3">
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
    </>
  );
};

export default Document;
