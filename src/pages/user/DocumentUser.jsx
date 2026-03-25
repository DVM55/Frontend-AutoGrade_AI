import React, { useEffect, useState, useRef } from "react";
import { getDocumentsByClass } from "../../service/document.service";
import { toast } from "react-toastify";

const fileIconClass = (contentType) => {
  if (!contentType) return "bi-file-earmark text-secondary";
  if (contentType.startsWith("image"))
    return "bi-file-earmark-image text-success";
  if (contentType.startsWith("video"))
    return "bi-file-earmark-play text-danger";
  if (contentType.startsWith("audio"))
    return "bi-file-earmark-music text-warning";
  if (contentType.includes("pdf")) return "bi-file-earmark-pdf text-danger";
  if (contentType.includes("sheet") || contentType.includes("excel"))
    return "bi-file-earmark-excel text-success";
  if (contentType.includes("word") || contentType.includes("document"))
    return "bi-file-earmark-word text-primary";

  return "bi-file-earmark text-secondary";
};

/** Trả về true nếu file này có thể preview trong modal */
const isPreviewable = (contentType) => {
  if (!contentType) return false;
  return (
    contentType.startsWith("image/") ||
    contentType.startsWith("video/") ||
    contentType.startsWith("audio/") ||
    contentType.startsWith("text/") ||
    contentType.includes("pdf")
  );
};

// ─── Preview Modal ──────────────────────────────────────────
const PreviewModal = ({ file, onClose }) => {
  const [textContent, setTextContent] = useState(null);
  const [textLoading, setTextLoading] = useState(false);
  const { contentType, fileUrl, fileName } = file;

  // Fetch nội dung nếu là text
  useEffect(() => {
    if (contentType?.startsWith("text/")) {
      setTextLoading(true);
      fetch(fileUrl)
        .then((r) => r.text())
        .then((t) => setTextContent(t))
        .catch(() => setTextContent("Không thể tải nội dung file."))
        .finally(() => setTextLoading(false));
    }
  }, [fileUrl, contentType]);

  const renderBody = () => {
    if (contentType?.startsWith("image/")) {
      return (
        <div
          className="d-flex align-items-center justify-content-center bg-dark bg-opacity-10 rounded-2 flex-grow-1"
          style={{ minHeight: 0 }}
        >
          <img
            src={fileUrl}
            alt={fileName}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: 6,
            }}
          />
        </div>
      );
    }

    if (contentType?.startsWith("video/")) {
      return (
        <video
          controls
          autoPlay
          style={{
            width: "100%",
            flex: 1,
            minHeight: 0,
            borderRadius: 6,
            background: "#000",
          }}
        >
          <source src={fileUrl} type={contentType} />
          Trình duyệt của bạn không hỗ trợ phát video.
        </video>
      );
    }

    if (contentType?.startsWith("audio/")) {
      return (
        <div
          className="d-flex align-items-center justify-content-center flex-grow-1"
          style={{ minHeight: 0 }}
        >
          <div className="text-center">
            <div style={{ fontSize: 80 }} className="mb-4">
              🎵
            </div>
            <div
              className="fw-semibold mb-3 text-truncate"
              style={{ maxWidth: 400 }}
            >
              {fileName}
            </div>
            <audio controls autoPlay style={{ width: "min(480px, 90vw)" }}>
              <source src={fileUrl} type={contentType} />
              Trình duyệt của bạn không hỗ trợ phát audio.
            </audio>
          </div>
        </div>
      );
    }

    if (contentType?.includes("pdf")) {
      return (
        <iframe
          src={fileUrl}
          title={fileName}
          style={{
            width: "100%",
            flex: 1,
            minHeight: 0,
            border: "none",
            borderRadius: 6,
          }}
        />
      );
    }

    if (contentType?.startsWith("text/")) {
      if (textLoading)
        return (
          <div className="text-center py-5 text-muted">
            <span className="spinner-border spinner-border-sm me-2" />
            Đang tải nội dung…
          </div>
        );
      return (
        <pre
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            background: "#f8f9fa",
            borderRadius: 6,
            padding: "1rem",
            fontSize: 13,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {textContent}
        </pre>
      );
    }

    return null;
  };

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div
        className="modal-dialog m-0"
        style={{ width: "100vw", maxWidth: "100vw", height: "100vh" }}
      >
        <div
          className="modal-content border-0 rounded-0"
          style={{ height: "100vh", display: "flex", flexDirection: "column" }}
        >
          {/* Header */}
          <div className="modal-header py-2 px-3 flex-shrink-0">
            <div className="d-flex align-items-center gap-2 overflow-hidden">
              <i className={`bi ${fileIconClass(contentType)} fs-5`} />
              <span
                className="fw-semibold text-truncate"
                style={{ fontSize: 14, maxWidth: "60vw" }}
                title={fileName}
              >
                {fileName}
              </span>
            </div>
            <div className="d-flex align-items-center gap-2 ms-auto flex-shrink-0">
              <a
                href={fileUrl}
                download={fileName}
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                title="Tải xuống"
              >
                <i className="bi bi-download" />
                <span className="d-none d-sm-inline">Tải xuống</span>
              </a>

              <button className="btn-close ms-1" onClick={onClose} />
            </div>
          </div>

          {/* Body */}
          <div className="modal-body p-3 flex-grow-1 overflow-auto d-flex flex-column">
            {renderBody()}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────
const DocumentUser = ({ classId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [previewFile, setPreviewFile] = useState(null);
  const [totalElements, setTotalElements] = useState(0);

  const fetchFiles = async (currentPage = page) => {
    if (!classId) return;

    try {
      setLoading(true);
      const res = await getDocumentsByClass(classId, {
        page: currentPage,
        size,
      });
      console.log(res);

      setFiles(res.data || []);
      setTotalPages(res.meta.totalPages || 0);
      setPage(currentPage || 0);
      setTotalElements(res.meta.totalItems || 0);
    } catch {
      toast.error("Không thể tải danh sách file");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(page);
  }, [page, classId]);

  const handleFileClick = (e, file) => {
    if (isPreviewable(file.contentType)) {
      e.preventDefault();
      setPreviewFile(file);
    }
  };

  return (
    <>
      {/* HEADER */}

      {totalElements > 0 && (
        <div className="text-muted small mb-3">
          {totalElements} kết quả tìm thấy
        </div>
      )}

      {/* TABLE */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4 text-secondary fw-semibold">Tên tệp</th>
                <th
                  className="text-secondary fw-semibold"
                  style={{ width: 160 }}
                >
                  Ngày sửa đổi
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="3" className="text-center py-5">
                    <span className="spinner-border text-primary" />
                  </td>
                </tr>
              )}

              {!loading && files.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center text-muted py-5">
                    <div className="fs-1 mb-2">📂</div>
                    <div className="fw-semibold mb-1">Chưa có tệp nào</div>
                  </td>
                </tr>
              )}

              {!loading &&
                files.map((file) => (
                  <tr
                    key={file.id}
                    style={{ cursor: "pointer" }}
                    onClick={(e) => handleFileClick(e, file)}
                  >
                    {/* NAME */}
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2">
                        <i
                          className={`bi ${fileIconClass(file.contentType)} fs-5`}
                        />
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-decoration-none fw-medium text-dark"
                          onClick={(e) => handleFileClick(e, file)}
                        >
                          {file.fileName}
                        </a>
                      </div>
                    </td>

                    {/* DATE */}
                    <td className="text-secondary small">
                      {new Date(file.updatedAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center gap-3 py-3 border-top">
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              ← Trước
            </button>

            <span className="small">
              Trang {page + 1} / {totalPages}
            </span>

            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Tiếp →
            </button>
          </div>
        )}
      </div>

      {previewFile && (
        <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </>
  );
};

export default DocumentUser;
