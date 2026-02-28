import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getDocumentById } from "../../service/document.service";
import {
  getDocumentDetails,
  createDocumentDetails,
  updateDocumentDetail,
  deleteDocumentDetail,
} from "../../service/documentDetail.service";
import { getPresignedUploadUrls } from "../../service/upload.service";
import { toast } from "react-toastify";

// ─── Helpers ───────────────────────────────────────────────
const formatFileSize = (size) => {
  if (!size) return "0 B";
  if (size < 1024) return size + " B";
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
  if (size < 1024 * 1024 * 1024)
    return (size / (1024 * 1024)).toFixed(1) + " MB";
  return (size / (1024 * 1024 * 1024)).toFixed(1) + " GB";
};

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

// ─── Upload Modal ───────────────────────────────────────────
const UploadModal = ({ documentId, onClose, onSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const addFiles = (files) =>
    setSelectedFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...Array.from(files).filter((f) => !names.has(f.name))];
    });

  const removeFile = (index) =>
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      toast.warning("Vui lòng chọn file");
      return;
    }
    try {
      setLoading(true);
      const uploadResults = await getPresignedUploadUrls(selectedFiles);
      await Promise.all(
        uploadResults.map(
          (item, index) =>
            new Promise((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              xhr.open("PUT", item.uploadUrl);
              xhr.setRequestHeader("Content-Type", item.contentType);
              xhr.upload.onprogress = (e) => {
                if (e.lengthComputable)
                  setUploadProgress((p) => ({
                    ...p,
                    [index]: Math.round((e.loaded * 100) / e.total),
                  }));
              };
              xhr.onload = () =>
                xhr.status === 200 || xhr.status === 204 ? resolve() : reject();
              xhr.onerror = reject;
              xhr.send(selectedFiles[index]);
            }),
        ),
      );
      const body = uploadResults.map((item) => ({
        objectKey: item.objectKey,
        fileName: item.fileName,
        contentType: item.contentType,
        fileSize: item.fileSize,
      }));
      await createDocumentDetails(documentId, body);
      toast.success("Upload thành công");
      onSuccess();
      onClose();
    } catch {
      toast.error("Upload thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal d-block"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header">
            <h6 className="modal-title fw-bold">Thêm tệp mới</h6>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            <div
              className={`border border-2 rounded-3 text-center p-5 mb-3 ${
                dragging
                  ? "border-primary bg-primary bg-opacity-10"
                  : "border-secondary border-opacity-25 bg-light"
              }`}
              style={{ cursor: "pointer", transition: "all .2s" }}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <div className="fs-1 mb-2">☁️</div>
              <p className="fw-semibold mb-1">Kéo &amp; thả tệp vào đây</p>
              <p className="text-muted small mb-0">
                hoặc click để chọn từ máy tính
              </p>
              <input
                ref={inputRef}
                type="file"
                multiple
                hidden
                onChange={(e) => addFiles(e.target.files || [])}
              />
            </div>

            {selectedFiles.length > 0 && (
              <div style={{ maxHeight: 220, overflowY: "auto" }}>
                {selectedFiles.map((file, i) => (
                  <div
                    key={i}
                    className="d-flex align-items-center justify-content-between border rounded-2 px-3 py-2 mb-2 bg-light"
                  >
                    <div className="d-flex align-items-center gap-2 overflow-hidden">
                      <i
                        className={`bi ${fileIconClass(file.contentType)} fs-5`}
                        style={{ minWidth: 22 }}
                      ></i>
                      <div className="overflow-hidden">
                        <div
                          className="fw-semibold text-truncate"
                          style={{ fontSize: 13, maxWidth: 280 }}
                        >
                          {file.name}
                        </div>
                        <div className="text-muted" style={{ fontSize: 11 }}>
                          {formatFileSize(file.size)}
                        </div>
                        {uploadProgress[i] !== undefined && (
                          <div className="progress mt-1" style={{ height: 4 }}>
                            <div
                              className="progress-bar"
                              style={{ width: uploadProgress[i] + "%" }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {uploadProgress[i] !== undefined ? (
                      <span
                        className="text-primary fw-bold ms-2 flex-shrink-0"
                        style={{ fontSize: 12 }}
                      >
                        {uploadProgress[i]}%
                      </span>
                    ) : (
                      <button
                        className="btn btn-sm btn-link text-muted p-0 ms-2"
                        onClick={() => removeFile(i)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" />
                  Đang tải lên…
                </>
              ) : (
                `Tải lên${selectedFiles.length ? ` (${selectedFiles.length})` : ""}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Rename Modal ───────────────────────────────────────────
const RenameModal = ({ file, onClose, onSuccess }) => {
  const [name, setName] = useState(file.fileName || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.warning("Tên không được trống");
      return;
    }
    try {
      setLoading(true);
      await updateDocumentDetail(file.id, { fileName: name.trim() });
      toast.success("Đã đổi tên");
      onSuccess();
      onClose();
    } catch {
      toast.error("Đổi tên thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal d-block"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: 420 }}
      >
        <div className="modal-content border-0 shadow">
          <div className="modal-header">
            <h6 className="modal-title fw-bold">Chỉnh sửa</h6>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <label className="form-label fw-semibold small text-secondary">
              Tên tệp
            </label>
            <input
              className="form-control"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" />
                  Đang lưu…
                </>
              ) : (
                "Lưu"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ───────────────────────────────────
const DeleteModal = ({ file, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteDocumentDetail(file.id);
      toast.success("Đã xóa tệp");
      onSuccess();
      onClose();
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal d-block"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: 400 }}
      >
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-0 pb-0">
            <h6 className="modal-title fw-bold">Xác nhận xóa</h6>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body pt-2">
            <p className="text-secondary mb-0">
              Bạn có chắc muốn xóa tệp{" "}
              <strong className="text-dark">{file.fileName}</strong>? Hành động
              này không thể hoàn tác.
            </p>
          </div>
          <div className="modal-footer border-0 pt-0">
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              className="btn btn-danger d-flex align-items-center gap-2"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" />
                  Đang xóa…
                </>
              ) : (
                "Xóa"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Row Action Dropdown ────────────────────────────────────
const RowMenu = ({ file, onRename, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="dropdown">
      <button
        className="btn btn-sm btn-light border-0 text-secondary"
        onClick={() => setOpen((o) => !o)}
      >
        ⋮
      </button>
      {open && (
        <ul
          className="dropdown-menu dropdown-menu-end show shadow-sm border"
          style={{ minWidth: 140 }}
        >
          <li>
            <button
              className="dropdown-item"
              onClick={() => {
                setOpen(false);
                onRename(file);
              }}
            >
              Chỉnh sửa
            </button>
          </li>
          <li>
            <button
              className="dropdown-item text-danger"
              onClick={() => {
                setOpen(false);
                onDelete(file);
              }}
            >
              Xóa
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────
const DocumentDetail = () => {
  const { documentId } = useParams();

  const [document, setDocument] = useState(null);
  const [files, setFiles] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [showUpload, setShowUpload] = useState(false);
  const [renameFile, setRenameFile] = useState(null);
  const [deleteFile, setDeleteFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null); // <-- mới
  const [totalElements, setTotalElements] = useState(0);

  const fetchDocument = async () => {
    try {
      const res = await getDocumentById(documentId);
      setDocument(res?.data || res);
    } catch {
      toast.error("Không thể tải tài liệu");
    }
  };

  const fetchFiles = async (currentPage = page) => {
    try {
      const res = await getDocumentDetails(documentId, {
        page: currentPage,
        size,
      });
      const pageData = res.data;
      setFiles(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setPage(pageData.number || 0);
      setTotalElements(pageData.totalElements || 0);
    } catch {
      toast.error("Không thể tải danh sách file");
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [documentId]);
  useEffect(() => {
    fetchFiles(page);
  }, [page]);

  /** Xử lý click tên file: preview nếu được, nếu không thì mở tab mới */
  const handleFileClick = (e, file) => {
    if (isPreviewable(file.contentType)) {
      e.preventDefault();
      setPreviewFile(file);
    }
    // Nếu không preview được thì để <a> tự mở tab mới
  };

  return (
    <>
      <div className="container-fluid">
        {/* HEADER */}
        <div className="d-flex align-items-center mb-3">
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline-secondary me-3"
          >
            <i className="bi bi-arrow-left"></i> Quay lại
          </button>

          <div className="flex-grow-1">
            <h2 className="fw-bold mb-1">{document?.title}</h2>
          </div>

          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => setShowUpload(true)}
          >
            <i className="bi bi-plus-lg"></i>
            Mới
          </button>
        </div>

        {totalElements > 0 && (
          <div className="text-muted small mb-3">
            {totalElements} kết quả tìm thấy
          </div>
        )}

        {/* FILE TABLE */}
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th
                    className="ps-4 text-uppercase text-secondary fw-semibold"
                    style={{ fontSize: 11, letterSpacing: ".06em" }}
                  >
                    Tên tệp
                  </th>
                  <th
                    className="text-uppercase text-secondary fw-semibold"
                    style={{ width: 160, fontSize: 11, letterSpacing: ".06em" }}
                  >
                    Ngày sửa đổi
                  </th>
                  <th
                    className="text-uppercase text-secondary fw-semibold"
                    style={{ width: 120, fontSize: 11, letterSpacing: ".06em" }}
                  >
                    Kích thước
                  </th>
                  <th style={{ width: 125 }} />
                </tr>
              </thead>

              <tbody>
                {files.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-5">
                      <div className="fs-1 mb-2">📂</div>
                      <div className="fw-semibold mb-1">Chưa có tệp nào</div>
                      <div className="small">
                        Nhấn "Mới" để tải lên tệp đầu tiên
                      </div>
                    </td>
                  </tr>
                )}

                {files.map((file) => (
                  <tr key={file.id} className="table-row-hover">
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2">
                        <i
                          className={`bi ${fileIconClass(file.contentType)} fs-5`}
                          style={{ minWidth: 22 }}
                        ></i>
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-decoration-none fw-medium text-dark"
                          onClick={(e) => handleFileClick(e, file)}
                          style={
                            isPreviewable(file.contentType)
                              ? { cursor: "pointer" }
                              : {}
                          }
                        >
                          {file.fileName}
                        </a>
                      </div>
                    </td>
                    <td className="text-secondary small">
                      {new Date(file.updatedAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border fw-normal">
                        {formatFileSize(file.fileSize)}
                      </span>
                    </td>
                    <td className="pe-3 text-end">
                      <RowMenu
                        file={file}
                        onRename={setRenameFile}
                        onDelete={setDeleteFile}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="d-flex align-items-center justify-content-center gap-3 py-3 border-top">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                ← Trước
              </button>
              <span className="small text-secondary fw-medium">
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
      </div>

      {/* MODALS */}
      {showUpload && (
        <UploadModal
          documentId={documentId}
          onClose={() => setShowUpload(false)}
          onSuccess={() => fetchFiles(0)}
        />
      )}
      {renameFile && (
        <RenameModal
          file={renameFile}
          onClose={() => setRenameFile(null)}
          onSuccess={() => fetchFiles(page)}
        />
      )}
      {deleteFile && (
        <DeleteModal
          file={deleteFile}
          onClose={() => setDeleteFile(null)}
          onSuccess={() => fetchFiles(page)}
        />
      )}
      {previewFile && (
        <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </>
  );
};

export default DocumentDetail;
