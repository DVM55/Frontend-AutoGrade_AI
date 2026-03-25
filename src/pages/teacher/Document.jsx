import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  getDocumentsByClass,
  deleteDocument,
  createDocument,
  updateDocument,
} from "../../service/document.service";
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
const UploadModal = ({ classId, onClose, onSuccess }) => {
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
      await createDocument(classId, body);
      toast.success("Upload thành công");
      onSuccess();
      onClose();
    } catch {
      const message =
        err?.response?.data?.message || // axios backend trả về
        err?.message || // lỗi JS
        "Upload thất bại";

      toast.error(message);
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
                        className={`bi ${fileIconClass(file.type)} fs-5`}
                        style={{ minWidth: 22 }}
                      ></i>
                      <div className="overflow-hidden">
                        <div
                          className="fw-semibold text-truncate"
                          style={{ fontSize: 13, maxWidth: 280 }}
                        >
                          {file.name}
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
      await updateDocument(file.id, { fileName: name.trim() });
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
        style={{ maxWidth: 460 }}
      >
        <div
          className="modal-content border-0 shadow"
          style={{ borderRadius: 16 }}
        >
          <div className="modal-header border-0 pb-0 px-4 pt-4">
            <h6 className="modal-title fw-bold d-flex align-items-center gap-2">
              <span
                className="d-inline-flex align-items-center justify-content-center"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "#e7f1ff",
                  color: "#0d6efd",
                }}
              >
                <i className="bi bi-pencil-square" />
              </span>
              Chỉnh sửa tên tệp
            </h6>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body px-4 py-3">
            <label className="form-label fw-semibold small text-secondary mb-2">
              Tên tệp
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white text-secondary">
                <i className="bi bi-file-earmark-text" />
              </span>
              <input
                className="form-control"
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
            </div>
          </div>
          <div className="modal-footer border-0 px-4 pb-4 pt-0 d-flex gap-2">
            <button
              className="btn btn-light border"
              style={{ minWidth: 96 }}
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
              style={{ minWidth: 120 }}
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
      await deleteDocument(file.id);
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
        style={{ maxWidth: 460 }}
      >
        <div
          className="modal-content border-0 shadow"
          style={{ borderRadius: 16 }}
        >
          <div className="modal-header border-0 pb-0 px-4 pt-4">
            <h6 className="modal-title fw-bold d-flex align-items-center gap-2 text-danger">
              <span
                className="d-inline-flex align-items-center justify-content-center"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "#fdebec",
                  color: "#dc3545",
                }}
              >
                <i className="bi bi-trash3" />
              </span>
              Xác nhận xóa tệp
            </h6>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body px-4 py-3">
            <p className="text-secondary mb-2">
              Bạn có chắc muốn xóa tệp bên dưới không?
            </p>
            <div
              className="px-3 py-2"
              style={{
                borderRadius: 10,
                background: "#f8f9fa",
                border: "1px solid #e9ecef",
              }}
            >
              <i className="bi bi-file-earmark me-2 text-secondary" />
              <strong className="text-dark">{file.fileName}</strong>
            </div>
            <div className="small text-danger mt-2">
              Hành động này không thể hoàn tác.
            </div>
          </div>
          <div className="modal-footer border-0 px-4 pb-4 pt-0 d-flex gap-2">
            <button
              className="btn btn-light border"
              style={{ minWidth: 96 }}
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              className="btn btn-danger d-flex align-items-center justify-content-center gap-2"
              style={{ minWidth: 120 }}
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
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = (e) => {
    e.stopPropagation();

    const rect = btnRef.current.getBoundingClientRect();

    setPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.right + window.scrollX - 180,
    });

    setOpen((o) => !o);
  };

  return (
    <>
      <button
        ref={btnRef}
        className="btn btn-sm d-inline-flex align-items-center justify-content-center"
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: open ? "#eef2ff" : "#f8f9fa",
          border: open ? "1px solid #c7d2fe" : "1px solid #e5e7eb",
        }}
        onClick={handleOpen}
      >
        <i className="bi bi-three-dots-vertical" />
      </button>

      {open &&
        createPortal(
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              zIndex: 9999,
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              minWidth: 180,
              padding: 8,
            }}
          >
            <button
              className="dropdown-item d-flex align-items-center gap-2 py-2"
              onClick={() => {
                setTimeout(() => setOpen(false), 0); // 🔥 FIX
                onRename(file);
              }}
            >
              <i className="bi bi-pencil-square text-primary" />
              Chỉnh sửa
            </button>

            <button
              className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
              onClick={() => {
                setTimeout(() => setOpen(false), 0); // 🔥 FIX
                onDelete(file);
              }}
            >
              <i className="bi bi-trash3" />
              Xóa
            </button>
          </div>,
          document.body,
        )}
    </>
  );
};

// ─── Main Component ─────────────────────────────────────────
const Document = ({ classId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [showUpload, setShowUpload] = useState(false);
  const [renameFile, setRenameFile] = useState(null);
  const [deleteFile, setDeleteFile] = useState(null);
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

      setFiles(res.data || []);
      setTotalPages(res.meta.totalPages || 0);
      setPage(currentPage || 0);
      setTotalElements(res.meta.totalElements || 0);
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
      <div className="d-flex align-items-center justify-content-end mb-3">
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
                <th
                  style={{ width: 150 }}
                  className="text-secondary fw-semibold text-center"
                >
                  Hành động
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

                    {/* ACTION */}
                    <td
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setRenameFile(file)}
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setDeleteFile(file)}
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
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

      {/* MODALS */}
      {showUpload && (
        <UploadModal
          classId={classId}
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

export default Document;
