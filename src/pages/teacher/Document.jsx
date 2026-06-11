import React, { useCallback, useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  getDocumentsByClass,
  deleteDocument,
  createDocument,
  updateDocument,
} from "../../service/document.service";
import { getPresignedUploadUrls } from "../../service/upload.service";
import { toast } from "react-toastify";

// ─── Helpers ─────────────────────────────────────────────────

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
  if (contentType.startsWith("text"))
    return "bi-file-earmark-text text-secondary";
  return "bi-file-earmark text-secondary";
};

const isTextFile = (ct) => ct?.startsWith("text/") || ct === "application/json";
const isImageFile = (ct) => ct?.startsWith("image/");
const isVideoFile = (ct) => ct?.startsWith("video/");
const isAudioFile = (ct) => ct?.startsWith("audio/");
const isPdfFile = (ct) => ct?.includes("pdf");

const processingStatuses = {
  UPLOADED: {
    label: "UPLOADED",
    icon: "bi-hourglass-split",
    className: "du-status--pending",
    busy: true,
  },
  EXTRACTING_TEXT: {
    label: "EXTRACTING_TEXT",
    icon: "bi-file-earmark-text",
    className: "du-status--processing",
    busy: true,
  },
  CHUNKING: {
    label: "CHUNKING",
    icon: "bi-diagram-3",
    className: "du-status--processing",
    busy: true,
  },
  EMBEDDING: {
    label: "EMBEDDING",
    icon: "bi-cpu",
    className: "du-status--processing",
    busy: true,
  },
  COMPLETED: {
    label: "COMPLETED",
    icon: "bi-check-circle",
    className: "du-status--done",
  },
  FAILED: {
    label: "FAILED",
    icon: "bi-exclamation-circle",
    className: "du-status--failed",
  },
};

const getProcessingStatusInfo = (status) =>
  processingStatuses[status] || {
    label: "Chưa rõ",
    icon: "bi-question-circle",
    className: "du-status--unknown",
  };

const isDocumentProcessing = (status) =>
  ["UPLOADED", "EXTRACTING_TEXT", "CHUNKING", "EMBEDDING"].includes(status);

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("vi-VN");
  const time = d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} ${time}`;
};

const triggerDownload = async (fileUrl, fileName) => {
  try {
    const res = await fetch(fileUrl);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "download";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch {
    window.open(fileUrl, "_blank");
  }
};

// ─── Full-screen Document Viewer ──────────────────────────────

const DocumentViewer = ({ file, onClose }) => {
  const { fileUrl, fileName, contentType } = file;
  const [textContent, setTextContent] = useState(null);
  const [loading, setLoading] = useState(() => isTextFile(contentType));
  const [error, setError] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (isTextFile(contentType)) {
      fetch(fileUrl)
        .then((r) => r.arrayBuffer())
        .then((buf) => setTextContent(new TextDecoder("utf-8").decode(buf)))
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }
  }, [fileUrl, contentType]);

  const renderBody = () => {
    if (isImageFile(contentType)) {
      return (
        <div style={styles.viewerCenter}>
          <img
            src={fileUrl}
            alt={fileName}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
        </div>
      );
    }
    if (isVideoFile(contentType)) {
      return (
        <div style={styles.viewerCenter}>
          <video
            controls
            autoPlay
            src={fileUrl}
            style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 8 }}
          />
        </div>
      );
    }
    if (isAudioFile(contentType)) {
      return (
        <div style={styles.viewerCenter}>
          <div style={{ textAlign: "center" }}>
            <i
              className={`bi ${fileIconClass(contentType)}`}
              style={{
                fontSize: 72,
                marginBottom: 24,
                display: "block",
                color: "#f59e0b",
              }}
            />
            <div
              style={{
                fontWeight: 600,
                fontSize: 16,
                color: "#111827",
                marginBottom: 20,
              }}
            >
              {fileName}
            </div>
            <audio
              controls
              autoPlay
              src={fileUrl}
              style={{ width: "100%", maxWidth: 480 }}
            />
          </div>
        </div>
      );
    }
    if (isPdfFile(contentType)) {
      return (
        <iframe
          src={`${fileUrl}#toolbar=1`}
          title={fileName}
          style={{ flex: 1, width: "100%", border: "none" }}
        />
      );
    }
    if (isTextFile(contentType)) {
      if (loading)
        return (
          <div style={styles.viewerCenter}>
            <span className="spinner-border spinner-border-sm me-2" />
            <span style={{ color: "#6b7280" }}>Đang tải nội dung…</span>
          </div>
        );
      if (error)
        return (
          <div
            style={{
              ...styles.viewerCenter,
              flexDirection: "column",
              gap: 8,
              color: "#ef4444",
            }}
          >
            <i className="bi bi-exclamation-circle" style={{ fontSize: 32 }} />
            <div>Không thể tải nội dung file.</div>
          </div>
        );
      return <pre style={styles.textPre}>{textContent}</pre>;
    }
    // Unsupported — show open link
    return (
      <div
        style={{
          ...styles.viewerCenter,
          flexDirection: "column",
          gap: 16,
          color: "#6b7280",
        }}
      >
        <i
          className={`bi ${fileIconClass(contentType)}`}
          style={{ fontSize: 64 }}
        />
        <div style={{ fontWeight: 600, fontSize: 16, color: "#111827" }}>
          {fileName}
        </div>
        <div style={{ fontSize: 14 }}>Không thể xem trước loại file này.</div>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 20px",
            borderRadius: 9,
            background: "#1a73e8",
            color: "#fff",
            fontWeight: 600,
            fontSize: 15,
            textDecoration: "none",
          }}
        >
          <i className="bi bi-box-arrow-up-right" />
          Mở file
        </a>
      </div>
    );
  };

  return createPortal(
    <div style={styles.viewerRoot}>
      <style>{`@keyframes dv-fadein { from { opacity:0; } to { opacity:1; } }`}</style>

      {/* Header */}
      <div style={styles.viewerHeader}>
        <div style={styles.viewerHeaderLeft}>
          <i
            className={`bi ${fileIconClass(contentType)}`}
            style={{ fontSize: 18, flexShrink: 0 }}
          />
          <span title={fileName} style={styles.viewerTitle}>
            {fileName}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => triggerDownload(fileUrl, fileName)}
            style={styles.viewerBtn}
            title="Tải xuống"
          >
            <i className="bi bi-download" />
            <span className="d-none d-sm-inline" style={{ fontSize: 14 }}>
              Tải xuống
            </span>
          </button>
          <button
            onClick={onClose}
            className="btn-close"
            style={{ flexShrink: 0 }}
          />
        </div>
      </div>

      {/* Body */}
      <div style={styles.viewerBody}>{renderBody()}</div>
    </div>,
    document.body,
  );
};

const styles = {
  viewerRoot: {
    position: "fixed",
    inset: 0,
    zIndex: 99999,
    background: "#f3f4f6",
    display: "flex",
    flexDirection: "column",
    animation: "dv-fadein 0.2s both",
  },
  viewerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "10px 16px",
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    flexShrink: 0,
    height: 54,
    boxSizing: "border-box",
  },
  viewerHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
  },
  viewerTitle: {
    fontWeight: 600,
    fontSize: 15,
    color: "#111827",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  viewerBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 14px",
    borderRadius: 8,
    border: "1.5px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    fontWeight: 500,
    fontSize: 14,
    cursor: "pointer",
  },
  viewerBody: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  viewerCenter: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    overflow: "auto",
  },
  textPre: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    background: "#f8f9fa",
    margin: 0,
    padding: "16px clamp(12px, 3vw, 28px)",
    fontSize: 15,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    lineHeight: 1.75,
    color: "#111827",
  },
};

// ─── 3-Dot Dropdown Menu ──────────────────────────────────────

const FileMenu = ({ file, onRename, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        !menuRef.current?.contains(e.target) &&
        !btnRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = (e) => {
    e.stopPropagation();
    if (!open) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX,
      });
    }
    setOpen((v) => !v);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <button
        ref={btnRef}
        className="du-menu-btn"
        onClick={handleOpen}
        title="Tùy chọn"
      >
        <i className="bi bi-three-dots-vertical" />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="du-dropdown"
            style={{
              position: "absolute",
              top: dropdownPos.top,
              right: `calc(100vw - ${dropdownPos.left}px + 12px)`,
              left: "auto",
              transform: "none",
            }}
          >
            <button
              className="du-dropdown-item"
              onClick={() => {
                setOpen(false);
                onRename(file);
              }}
            >
              <i className="bi bi-pencil-square" style={{ color: "#1a73e8" }} />
              Chỉnh sửa
            </button>
            <div className="du-dropdown-divider" />
            <button
              className="du-dropdown-item du-dropdown-item--danger"
              onClick={() => {
                setOpen(false);
                onDelete(file);
              }}
            >
              <i className="bi bi-trash3" />
              Xóa
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
};

// ─── File Row ─────────────────────────────────────────────────

const ProcessingStatusBadge = ({ status }) => {
  const info = getProcessingStatusInfo(status);

  return (
    <span
      className={`du-status-badge ${info.className}`}
      title={status || "UNKNOWN"}
    >
      {info.busy ? (
        <span className="du-status-spinner" />
      ) : (
        <i className={`bi ${info.icon}`} />
      )}
      <span>{info.label}</span>
    </span>
  );
};

const FileRow = ({ file, onFileClick, onRename, onDelete }) => (
  <tr onClick={() => onFileClick(file)} className="du-row">
    <td>
      <div className="du-file-name">
        <i
          className={`bi ${fileIconClass(file.contentType)}`}
          style={{ fontSize: 17, flexShrink: 0 }}
        />
        <span className="du-file-link" title={file.fileName}>
          {file.fileName}
        </span>
      </div>
    </td>
    <td className="du-status-cell">
      <ProcessingStatusBadge status={file.processingStatus} />
    </td>
    <td className="du-date">{formatDateTime(file.updatedAt)}</td>
    <td className="du-actions-cell" onClick={(e) => e.stopPropagation()}>
      <FileMenu file={file} onRename={onRename} onDelete={onDelete} />
    </td>
  </tr>
);

// ─── Upload Modal ─────────────────────────────────────────────

const UploadModal = ({ classId, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const addFile = (files) => {
    const fileList = Array.from(files || []);
    if (!fileList.length) return;
    if (fileList.length > 1) {
      toast.warning("Chỉ được chọn 1 tệp mỗi lần");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setSelectedFile(fileList[0]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFile(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.warning("Vui lòng chọn file");
      return;
    }
    try {
      setLoading(true);
      const uploadResults = await getPresignedUploadUrls([selectedFile]);
      const uploadItem = uploadResults?.[0];

      if (!uploadItem) {
        throw new Error("Không nhận được URL tải lên");
      }

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadItem.uploadUrl);
        xhr.setRequestHeader("Content-Type", uploadItem.contentType);
        xhr.onload = () =>
          xhr.status === 200 || xhr.status === 204 ? resolve() : reject();
        xhr.onerror = reject;
        xhr.send(selectedFile);
      });

      const body = {
        objectKey: uploadItem.objectKey,
        fileName: uploadItem.fileName,
        contentType: uploadItem.contentType,
      };
      await createDocument(classId, body);
      toast.success("Upload thành công");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Upload thất bại",
      );
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="cd-backdrop"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px 14px",
            borderBottom: "1.5px solid #f0f0f0",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>
            Thêm tệp mới
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 2,
              display: "flex",
            }}
          >
            <i
              className="bi bi-x-lg"
              style={{ fontSize: 16, color: "#6b7280" }}
            />
          </button>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <div
            style={{
              border: `2px dashed ${dragging ? "#1a73e8" : "#d1d5db"}`,
              borderRadius: 12,
              padding: "32px 16px",
              textAlign: "center",
              cursor: "pointer",
              background: dragging ? "#e8f0fe" : "#f9fafb",
              transition: "all .2s",
            }}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <div style={{ fontSize: 40, marginBottom: 8 }}>☁️</div>
            <p
              style={{
                fontWeight: 600,
                margin: "0 0 4px",
                fontSize: 15,
                color: "#111827",
              }}
            >
              Kéo &amp; thả tệp vào đây
            </p>
            <p style={{ fontSize: 14, color: "#9ca3af", margin: 0 }}>
              hoặc click để chọn từ máy tính
            </p>
            <input
              ref={inputRef}
              type="file"
              hidden
              onChange={(e) => addFile(e.target.files || [])}
            />
          </div>
          {selectedFile && (
            <div style={{ maxHeight: 220, overflowY: "auto", marginTop: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "8px 12px",
                  background: "#f9fafb",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    overflow: "hidden",
                  }}
                >
                  <i
                    className={`bi ${fileIconClass(selectedFile.type)}`}
                    style={{ fontSize: 16, flexShrink: 0 }}
                  />
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: 280,
                      color: "#111827",
                    }}
                  >
                    {selectedFile.name}
                  </div>
                </div>
                {!loading && (
                  <button
                    onClick={removeFile}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#9ca3af",
                      cursor: "pointer",
                      fontSize: 16,
                      padding: 0,
                      marginLeft: 8,
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            padding: "12px 20px 20px",
            borderTop: "1.5px solid #f0f0f0",
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "8px 18px",
              borderRadius: 10,
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              fontSize: 15,
              fontWeight: 500,
              color: "#444",
              cursor: "pointer",
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleUpload}
            disabled={loading}
            style={{
              padding: "8px 18px",
              borderRadius: 10,
              border: "none",
              background: "#1a73e8",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading ? (
              <>
                <span className="cm-btn-spinner" />
                Đang tải lên…
              </>
            ) : (
              "Tải lên"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

// ─── Rename Modal ─────────────────────────────────────────────

const RenameModal = ({ file, onClose, onSuccess }) => {
  const originalName = file.fileName || "";
  const dotIndex = originalName.lastIndexOf(".");
  const baseName =
    dotIndex > 0 ? originalName.slice(0, dotIndex) : originalName;
  const ext = dotIndex > 0 ? originalName.slice(dotIndex) : "";

  const [name, setName] = useState(baseName);
  const [nameError, setNameError] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name.trim()) {
      setNameError("Tên không được để trống");
      return false;
    }
    if (name.trim().length > 200) {
      setNameError("Tên không được vượt quá 200 ký tự");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      setApiError("");
      await updateDocument(file.id, { fileName: name.trim() + ext });
      toast.success("Đã đổi tên");
      onSuccess();
      onClose();
    } catch (err) {
      setApiError(
        err?.response?.data?.message || err?.message || "Đổi tên thất bại",
      );
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="cd-backdrop"
      onClick={() => !loading && onClose()}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        boxSizing: "border-box",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 12,
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          boxSizing: "border-box",
          padding: "20px 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 12,
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: "none",
              border: "none",
              fontSize: 22,
              cursor: "pointer",
              color: "#888",
              lineHeight: 1,
              padding: "0 4px",
            }}
          >
            ×
          </button>
        </div>
        {apiError && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: 14,
              lineHeight: 1.5,
              marginBottom: 12,
              background: "#fff5f5",
              border: "1px solid #f5c2c7",
              color: "#842029",
            }}
          >
            <span style={{ flexShrink: 0 }}>⚠</span>
            <span>{apiError}</span>
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontWeight: 600,
              fontSize: 16,
              color: "#333",
            }}
          >
            Tên tệp<span style={{ color: "#dc3545", marginLeft: 2 }}>*</span>
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: 8,
              border: `1px solid ${nameError ? "#dc3545" : "#ddd"}`,
              background: "#fff",
              overflow: "hidden",
            }}
          >
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
                if (apiError) setApiError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleSave()}
              autoComplete="off"
              style={{
                flex: 1,
                padding: "10px 12px",
                border: "none",
                outline: "none",
                fontSize: 15,
                background: "transparent",
                color: "#212529",
                minWidth: 0,
              }}
            />
            {ext && (
              <span
                style={{
                  padding: "10px 12px 10px 0",
                  fontSize: 15,
                  color: "#6b7280",
                  whiteSpace: "nowrap",
                  userSelect: "none",
                }}
              >
                {ext}
              </span>
            )}
          </div>
          {nameError && (
            <div style={{ fontSize: 13, color: "#dc3545", marginTop: 4 }}>
              {nameError}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "9px 16px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
              fontSize: 14,
              color: "#444",
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: "9px 16px",
              borderRadius: 8,
              border: "none",
              background: "#1a73e8",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity: loading ? 0.65 : 1,
            }}
          >
            {loading ? (
              <>
                <span className="cm-btn-spinner" />
                Đang lưu…
              </>
            ) : (
              "Lưu"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

// ─── Delete Modal ─────────────────────────────────────────────

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

  return createPortal(
    <>
      <div className="cd-backdrop" onClick={() => !loading && onClose()} />
      <div className="cd-modal-wrap">
        <div className="cd-modal--confirm" onClick={(e) => e.stopPropagation()}>
          <div className="cm-del-icon">
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <circle cx="26" cy="26" r="26" fill="#fff3e0" />
              <path
                d="M26 14l12 22H14L26 14z"
                fill="none"
                stroke="#f57c00"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <rect x="25" y="23" width="2" height="7" rx="1" fill="#f57c00" />
              <circle cx="26" cy="33" r="1.2" fill="#f57c00" />
            </svg>
          </div>
          <div className="cm-del-title">Xác nhận xóa tệp?</div>
          <p className="cm-del-desc">
            Tệp <strong>{file.fileName}</strong> sẽ bị xóa vĩnh viễn và không
            thể khôi phục.
          </p>
          <div className="cm-del-actions">
            <button
              className="cm-del-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              className="cm-del-confirm"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="cm-btn-spinner" />
                  Đang xóa…
                </>
              ) : (
                "Xóa"
              )}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

// ─── Main Component ───────────────────────────────────────────

const Document = ({ classId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [showUpload, setShowUpload] = useState(false);
  const [viewerFile, setViewerFile] = useState(null);
  const [renameFile, setRenameFile] = useState(null);
  const [deleteFile, setDeleteFile] = useState(null);

  const fetchFiles = useCallback(
    async (currentPage = 0, options = {}) => {
      const { silent = false } = options;
      if (!classId) return;
      try {
        if (!silent) setLoading(true);
        const res = await getDocumentsByClass(classId, {
          page: currentPage,
          size,
        });
        setFiles(res.data || []);
        setTotalPages(res.meta?.totalPages || 0);
        setTotalElements(res.meta?.totalItems ?? res.meta?.totalElements ?? 0);
        setPage(currentPage);
      } catch {
        if (!silent) toast.error("Không thể tải danh sách file");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [classId, size],
  );

  useEffect(() => {
    fetchFiles(0);
  }, [fetchFiles]);

  useEffect(() => {
    const hasProcessingFiles = files.some((file) =>
      isDocumentProcessing(file.processingStatus),
    );

    if (!classId || !hasProcessingFiles) return undefined;

    const intervalId = window.setInterval(() => {
      fetchFiles(page, { silent: true });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [classId, fetchFiles, files, page]);

  return (
    <>
      <style>{docStyle}</style>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 12,
        }}
      >
        <button className="doc-upload-btn" onClick={() => setShowUpload(true)}>
          <i className="bi bi-plus-lg" />
          Mới
        </button>
      </div>

      {!loading && totalElements > 0 && (
        <div className="cm-result-count">{totalElements} kết quả tìm thấy</div>
      )}

      {loading ? null : files.length === 0 ? (
        <div className="du-empty">
          <div className="du-empty__icon">📂</div>
          <div className="du-empty__title">Chưa có tệp nào</div>
        </div>
      ) : (
        <div className="du-table-wrap">
          <table className="du-table">
            <thead>
              <tr>
                <th>Tên tệp</th>
                <th className="du-th-status">Trạng thái</th>
                <th className="du-th-date">Cập nhật lúc</th>
                <th className="du-th-actions" />
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  onFileClick={setViewerFile}
                  onRename={setRenameFile}
                  onDelete={setDeleteFile}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && !loading && (
        <div className="cm-pagination">
          <button
            className="cm-page-btn"
            disabled={page === 0}
            onClick={() => fetchFiles(page - 1)}
          >
            <i className="bi bi-chevron-left" />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`cm-page-btn ${page === i ? "cm-page-btn--active" : ""}`}
              onClick={() => fetchFiles(i)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="cm-page-btn"
            disabled={page + 1 >= totalPages}
            onClick={() => fetchFiles(page + 1)}
          >
            <i className="bi bi-chevron-right" />
          </button>
        </div>
      )}

      {showUpload && (
        <UploadModal
          classId={classId}
          onClose={() => setShowUpload(false)}
          onSuccess={() => fetchFiles(0)}
        />
      )}
      {viewerFile && (
        <DocumentViewer file={viewerFile} onClose={() => setViewerFile(null)} />
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
    </>
  );
};

const docStyle = `
  .cm-result-count { font-size: 16px; color: #6b7280; margin-bottom: 10px; }

  .doc-upload-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 8px; border: none;
    background: #1a73e8; color: #fff; font-size: 16px; font-weight: 600;
    cursor: pointer; transition: background 0.15s;
  }
  .doc-upload-btn:hover { background: #1558b0; }

  .du-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 16px; }
  .du-empty__icon { font-size: 40px; margin-bottom: 8px; }
  .du-empty__title { font-size: 16px; font-weight: 500; color: #6b7280; }

  .du-table-wrap { border-radius: 12px; overflow: hidden; border: 1.5px solid #e5e7eb; background: #fff; }
  .du-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .du-table thead tr { background: #f9fafb; }
  .du-table th { padding: 11px 16px; font-size: 16px; font-weight: 600; color: #6b7280; text-align: left; border-bottom: 1.5px solid #e5e7eb; white-space: nowrap; }
  .du-th-status { width: 170px; }
  .du-th-date { width: 160px; }
  .du-th-actions { width: 48px; }
  .du-table tbody tr.du-row { cursor: pointer; transition: background 0.13s; border-bottom: 1px solid #f3f4f6; }
  .du-table tbody tr.du-row:last-child { border-bottom: none; }
  .du-table tbody tr.du-row:hover { background: #f0f7ff; }
  .du-table td { padding: 11px 16px; vertical-align: middle; overflow: hidden; }
  .du-file-name { display: flex; align-items: center; gap: 9px; min-width: 0; overflow: hidden; }
  .du-file-link { font-size: 16px; color: #111827; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; flex: 1; }
  .du-status-cell { width: 170px; }
  .du-status-badge { display: inline-flex; align-items: center; gap: 6px; max-width: 100%; padding: 5px 9px; border-radius: 999px; font-size: 14px; font-weight: 600; line-height: 1; white-space: nowrap; vertical-align: middle; }
  .du-status-badge > span:last-child { overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  .du-status-badge i { flex-shrink: 0; font-size: 14px; }
  .du-status--pending { background: #fff7ed; color: #c2410c; }
  .du-status--processing { background: #eff6ff; color: #1d4ed8; }
  .du-status--done { background: #ecfdf5; color: #047857; }
  .du-status--failed { background: #fef2f2; color: #dc2626; }
  .du-status--unknown { background: #f3f4f6; color: #6b7280; }
  .du-status-spinner { width: 12px; height: 12px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: cu-spin 0.7s linear infinite; display: inline-block; flex-shrink: 0; opacity: 0.8; }
  .du-date { font-size: 16px; color: #9ca3af; white-space: nowrap; }
  .du-actions-cell { width: 48px; padding: 6px 8px 6px 0 !important; text-align: right; }

  @media (max-width: 640px) { .du-th-date, .du-date { display: none; } }
  @media (max-width: 480px) { .du-th-status, .du-status-cell { width: 132px; } .du-status-badge { font-size: 13px; padding: 5px 7px; } }

  /* ── 3-dot menu ── */
  .du-menu-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 34px; height: 34px; border-radius: 7px;
    border: none; background: transparent;
    color: #9ca3af; font-size: 18px; cursor: pointer;
    transition: background 0.13s, color 0.13s;
  }
  .du-menu-btn:hover { background: #e5e7eb; color: #374151; }

  .du-dropdown {
    background: #fff; border: 1.5px solid #e5e7eb; border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    min-width: 160px; z-index: 9999; overflow: hidden;
    animation: dd-pop 0.14s both; position: absolute;
  }
  @keyframes dd-pop { from { opacity:0; transform:translateY(-6px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }

  .du-dropdown-item {
    display: flex; align-items: center; gap: 9px;
    width: 100%; padding: 11px 16px;
    border: none; background: transparent;
    font-size: 16px; font-weight: 500; color: #374151;
    cursor: pointer; text-align: left; transition: background 0.12s;
  }
  .du-dropdown-item:hover { background: #f3f4f6; }
  .du-dropdown-item--danger { color: #ef4444; }
  .du-dropdown-item--danger:hover { background: #fff5f5; }
  .du-dropdown-divider { height: 1px; background: #f3f4f6; margin: 2px 0; }

  /* ── Pagination ── */
  .cm-pagination { display: flex; justify-content: center; align-items: center; gap: 4px; margin-top: 16px; flex-wrap: wrap; }
  .cm-page-btn { min-width: 36px; height: 36px; padding: 0 8px; border: 1.5px solid #e5e7eb; border-radius: 7px; background: #fff; color: #1a1a2e; font-size: 16px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
  .cm-page-btn:hover:not(:disabled) { border-color: #1a73e8; color: #1a73e8; }
  .cm-page-btn--active { background: #1a73e8; color: #fff; border-color: #1a73e8; font-weight: 600; }
  .cm-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Modal shared ── */
  .cd-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1040; }
  .cd-modal-wrap { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 1050; padding: 10px; box-sizing: border-box; }
  .cd-modal--confirm { background: #fff; border-radius: 16px; width: 100%; max-width: 340px; box-sizing: border-box; padding: 32px 24px 24px; text-align: center; animation: cu-fadeup 0.25s both; }
  .cm-del-icon { margin-bottom: 16px; }
  .cm-del-title { font-size: 16px; font-weight: 700; color: #212529; margin: 0 0 10px; line-height: 1.3; }
  .cm-del-desc { font-size: 16px; color: #6b7280; margin: 0 0 24px; line-height: 1.6; word-break: keep-all; overflow-wrap: break-word; }
  .cm-del-actions { display: flex; gap: 10px; }
  .cm-del-cancel { flex: 1; padding: 10px; border-radius: 10px; border: 1px solid #dee2e6; background: #fff; font-size: 16px; font-weight: 500; color: #444; cursor: pointer; transition: background 0.15s; }
  .cm-del-cancel:hover { background: #f0f0f0; }
  .cm-del-cancel:disabled { opacity: 0.6; cursor: not-allowed; }
  .cm-del-confirm { flex: 1; padding: 10px; border-radius: 10px; border: none; background: #dc3545; color: #fff; font-size: 16px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: background 0.15s, opacity 0.15s; }
  .cm-del-confirm:hover:not(:disabled) { background: #bb2d3b; }
  .cm-del-confirm:disabled { opacity: 0.65; cursor: not-allowed; }
  .cm-btn-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff; border-radius: 50%; animation: cu-spin 0.7s linear infinite; display: inline-block; flex-shrink: 0; }

  @keyframes cu-fadeup { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes cu-spin { to { transform: rotate(360deg); } }
`;

export default Document;
