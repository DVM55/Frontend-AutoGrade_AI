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

const isTextFile = (contentType) =>
  contentType?.startsWith("text/") || contentType === "application/json";

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

// ─── Download helper ──────────────────────────────────────────

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

// ─── Text Viewer Modal ────────────────────────────────────────

const TextViewerModal = ({ file, onClose }) => {
  const { fileUrl, fileName, contentType } = file;
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
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
    fetch(fileUrl)
      .then((r) => r.arrayBuffer())
      .then((buf) => setContent(new TextDecoder("utf-8").decode(buf)))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [fileUrl]);

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        flexDirection: "column",
        animation: "tv-fadein 0.18s both",
      }}
    >
      <style>{`@keyframes tv-fadein { from { opacity:0; } to { opacity:1; } }`}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px clamp(10px, 2vw, 18px)",
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          flexShrink: 0,
          height: 52,
          boxSizing: "border-box",
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <i
            className={`bi ${fileIconClass(contentType)}`}
            style={{ fontSize: 16, flexShrink: 0 }}
          />
          <span
            title={fileName}
            style={{
              fontWeight: 600,
              fontSize: 16,
              color: "#111827",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
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
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {loading && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
              background: "#f9fafb",
            }}
          >
            <span className="spinner-border spinner-border-sm me-2" />
            Đang tải nội dung…
          </div>
        )}
        {error && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ef4444",
              background: "#f9fafb",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <i className="bi bi-exclamation-circle" style={{ fontSize: 32 }} />
            <div>Không thể tải nội dung file.</div>
          </div>
        )}
        {!loading && !error && (
          <pre
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              background: "#f8f9fa",
              margin: 0,
              padding: "16px clamp(12px, 3vw, 24px)",
              fontSize: 16,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              lineHeight: 1.7,
              color: "#111827",
            }}
          >
            {content}
          </pre>
        )}
      </div>
    </div>,
    document.body,
  );
};

// ─── File Action Modal ────────────────────────────────────────
// Hiển thị khi click vào file — cung cấp: Mở / Xem nội dung / Tải xuống
// + nút Chỉnh sửa & Xóa (chỉ dành cho admin)

const FileActionModal = ({ file, onClose, onViewText, onRename, onDelete }) => {
  const { contentType, fileUrl, fileName } = file;

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

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "fam-fadein 0.18s both",
      }}
    >
      <style>{`@keyframes fam-fadein { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }`}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 8px 40px rgba(0,0,0,0.22)",
          padding: "28px 24px 24px",
          width: "100%",
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          textAlign: "center",
        }}
      >
        <i
          className={`bi ${fileIconClass(contentType)}`}
          style={{ fontSize: 48 }}
        />
        <div
          title={fileName}
          style={{
            fontWeight: 600,
            fontSize: 15,
            color: "#111827",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            width: "100%",
          }}
        >
          {fileName}
        </div>

        {/* Hành động chính: Mở / Xem nội dung + Tải xuống */}
        <div style={{ display: "flex", gap: 10, width: "100%", marginTop: 4 }}>
          {isTextFile(contentType) ? (
            <button
              onClick={() => {
                onClose();
                onViewText(file);
              }}
              style={btnPrimary}
            >
              <i className="bi bi-eye" style={{ fontSize: 16 }} />
              Xem nội dung
            </button>
          ) : (
            <button
              onClick={() => {
                window.open(fileUrl, "_blank", "noopener,noreferrer");
                onClose();
              }}
              style={btnPrimary}
            >
              <i
                className="bi bi-box-arrow-up-right"
                style={{ fontSize: 16 }}
              />
              Mở file
            </button>
          )}

          <button
            onClick={() => {
              triggerDownload(fileUrl, fileName);
              onClose();
            }}
            style={btnSecondary}
          >
            <i className="bi bi-download" style={{ fontSize: 16 }} />
            Tải xuống
          </button>
        </div>

        {/* Divider */}
        <div style={{ width: "100%", height: 1, background: "#f0f0f0" }} />

        {/* Admin actions: Chỉnh sửa & Xóa */}
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <button
            onClick={() => {
              onClose();
              onRename(file);
            }}
            style={btnOutlineBlue}
          >
            <i className="bi bi-pencil-square" style={{ fontSize: 16 }} />
            Chỉnh sửa
          </button>
          <button
            onClick={() => {
              onClose();
              onDelete(file);
            }}
            style={btnOutlineRed}
          >
            <i className="bi bi-trash3" style={{ fontSize: 16 }} />
            Xóa
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#9ca3af",
            fontSize: 16,
            cursor: "pointer",
            padding: "4px 8px",
          }}
        >
          Đóng
        </button>
      </div>
    </div>,
    document.body,
  );
};

// Button style constants
const btnPrimary = {
  flex: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "10px 0",
  borderRadius: 9,
  background: "#1a73e8",
  color: "#fff",
  fontWeight: 600,
  fontSize: 16,
  border: "none",
  cursor: "pointer",
};
const btnSecondary = {
  flex: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "10px 0",
  borderRadius: 9,
  background: "#fff",
  color: "#374151",
  fontWeight: 600,
  fontSize: 16,
  border: "1.5px solid #d1d5db",
  cursor: "pointer",
};
const btnOutlineBlue = {
  flex: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "9px 0",
  borderRadius: 9,
  background: "#e8f0fe",
  color: "#1a73e8",
  fontWeight: 600,
  fontSize: 16,
  border: "none",
  cursor: "pointer",
};
const btnOutlineRed = {
  flex: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "9px 0",
  borderRadius: 9,
  background: "#fff3f3",
  color: "#ef4444",
  fontWeight: 600,
  fontSize: 16,
  border: "none",
  cursor: "pointer",
};

// ─── Upload Modal ─────────────────────────────────────────────

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
          boxSizing: "border-box",
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
                fontSize: 16,
                color: "#111827",
              }}
            >
              Kéo &amp; thả tệp vào đây
            </p>
            <p style={{ fontSize: 16, color: "#9ca3af", margin: 0 }}>
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
            <div style={{ maxHeight: 220, overflowY: "auto", marginTop: 12 }}>
              {selectedFiles.map((file, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "8px 12px",
                    marginBottom: 8,
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
                      className={`bi ${fileIconClass(file.type)}`}
                      style={{ fontSize: 16, flexShrink: 0 }}
                    />
                    <div style={{ overflow: "hidden" }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 16,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 280,
                          color: "#111827",
                        }}
                      >
                        {file.name}
                      </div>
                    </div>
                  </div>
                  {!loading && (
                    <button
                      onClick={() => removeFile(i)}
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
              ))}
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
              fontSize: 16,
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
              fontSize: 16,
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
              `Tải lên${selectedFiles.length ? ` (${selectedFiles.length})` : ""}`
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

  const handleChange = (e) => {
    setName(e.target.value);
    if (nameError) setNameError("");
    if (apiError) setApiError("");
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
        {/* Close button */}
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

        {/* API error banner */}
        {apiError && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: 16,
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

        {/* Field */}
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
              boxShadow: nameError ? "0 0 0 2px rgba(220,53,69,0.12)" : "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
              background: "#fff",
              overflow: "hidden",
            }}
            onFocusCapture={(e) => {
              if (!nameError) {
                e.currentTarget.style.borderColor = "#1a73e8";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(26,115,232,0.12)";
              }
            }}
            onBlurCapture={(e) => {
              if (!nameError) {
                e.currentTarget.style.borderColor = "#ddd";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            <input
              autoFocus
              type="text"
              value={name}
              onChange={handleChange}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleSave()}
              autoComplete="off"
              style={{
                flex: 1,
                padding: "10px 12px",
                border: "none",
                outline: "none",
                fontSize: 16,
                background: "transparent",
                color: "#212529",
                minWidth: 0,
              }}
            />
            {ext && (
              <span
                style={{
                  padding: "10px 12px 10px 0",
                  fontSize: 16,
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
            <div
              style={{
                fontSize: 16,
                color: "#dc3545",
                marginTop: 4,
                lineHeight: 1.4,
              }}
            >
              {nameError}
            </div>
          )}
        </div>

        {/* Actions */}
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
              fontSize: 16,
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
              fontSize: 16,
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

// ─── File Row ─────────────────────────────────────────────────

const FileRow = ({ file, onFileClick }) => (
  <tr onClick={() => onFileClick(file)}>
    <td>
      <div className="du-file-name">
        <i
          className={`bi ${fileIconClass(file.contentType)}`}
          style={{ fontSize: 16, flexShrink: 0 }}
        />
        <span className="du-file-link" title={file.fileName}>
          {file.fileName}
        </span>
      </div>
    </td>
    <td className="du-date">{formatDateTime(file.updatedAt)}</td>
  </tr>
);

// ─── Main Component ───────────────────────────────────────────

const Document = ({ classId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [showUpload, setShowUpload] = useState(false);
  const [actionFile, setActionFile] = useState(null); // FileActionModal
  const [textViewFile, setTextViewFile] = useState(null); // TextViewerModal
  const [renameFile, setRenameFile] = useState(null);
  const [deleteFile, setDeleteFile] = useState(null);

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
      setTotalElements(res.meta.totalElements || 0);
      setPage(currentPage);
    } catch {
      toast.error("Không thể tải danh sách file");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(0);
  }, [classId]);

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
                <th className="du-th-date">Cập nhật lúc</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  onFileClick={setActionFile}
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

      {/* Modals */}
      {showUpload && (
        <UploadModal
          classId={classId}
          onClose={() => setShowUpload(false)}
          onSuccess={() => fetchFiles(0)}
        />
      )}
      {actionFile && (
        <FileActionModal
          file={actionFile}
          onClose={() => setActionFile(null)}
          onViewText={(file) => setTextViewFile(file)}
          onRename={(file) => setRenameFile(file)}
          onDelete={(file) => setDeleteFile(file)}
        />
      )}
      {textViewFile && (
        <TextViewerModal
          file={textViewFile}
          onClose={() => setTextViewFile(null)}
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
    </>
  );
};

const docStyle = `
  .cm-result-count { font-size: 15px; color: #6b7280; margin-bottom: 10px; }

  .doc-upload-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 8px; border: none;
    background: #1a73e8; color: #fff; font-size: 15px; font-weight: 600;
    cursor: pointer; transition: background 0.15s;
  }
  .doc-upload-btn:hover { background: #1558b0; }

  .du-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 16px; }
  .du-empty__icon { font-size: 40px; margin-bottom: 8px; }
  .du-empty__title { font-size: 16px; font-weight: 500; color: #6b7280; }

  .du-table-wrap { border-radius: 12px; overflow: hidden; border: 1.5px solid #e5e7eb; background: #fff; }
  .du-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .du-table thead tr { background: #f9fafb; }
  .du-table th { padding: 11px 16px; font-size: 15px; font-weight: 600; color: #6b7280; text-align: left; border-bottom: 1.5px solid #e5e7eb; white-space: nowrap; }
  .du-th-date { width: 150px; }
  .du-table tbody tr { cursor: pointer; transition: background 0.13s; border-bottom: 1px solid #f3f4f6; }
  .du-table tbody tr:last-child { border-bottom: none; }
  .du-table tbody tr:hover { background: #f0f7ff; }
  .du-table td { padding: 11px 16px; vertical-align: middle; overflow: hidden; }
  .du-file-name { display: flex; align-items: center; gap: 9px; min-width: 0; overflow: hidden; }
  .du-file-link { font-size: 15px; color: #111827; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; flex: 1; }
  .du-date { font-size: 14px; color: #9ca3af; white-space: nowrap; }

  @media (max-width: 480px) { .du-th-date, .du-date { display: none; } }

  /* ── Pagination ── */
  .cm-pagination { display: flex; justify-content: center; align-items: center; gap: 4px; margin-top: 16px; flex-wrap: wrap; }
  .cm-page-btn { min-width: 34px; height: 34px; padding: 0 8px; border: 1.5px solid #e5e7eb; border-radius: 7px; background: #fff; color: #1a1a2e; font-size: 15px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
  .cm-page-btn:hover:not(:disabled) { border-color: #1a73e8; color: #1a73e8; }
  .cm-page-btn--active { background: #1a73e8; color: #fff; border-color: #1a73e8; font-weight: 600; }
  .cm-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Modal shared ── */
  .cd-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1040; }
  .cd-modal-wrap { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 1050; padding: 10px; box-sizing: border-box; }
  .cd-modal--confirm { background: #fff; border-radius: 16px; width: 100%; max-width: 340px; box-sizing: border-box; padding: 32px 24px 24px; text-align: center; animation: cu-fadeup 0.25s both; }
  .cm-del-icon { margin-bottom: 16px; }
  .cm-del-title { font-size: 16px; font-weight: 700; color: #212529; margin: 0 0 10px; line-height: 1.3; }
  .cm-del-desc { font-size: 15px; color: #6b7280; margin: 0 0 24px; line-height: 1.6; word-break: keep-all; overflow-wrap: break-word; }
  .cm-del-actions { display: flex; gap: 10px; }
  .cm-del-cancel { flex: 1; padding: 10px; border-radius: 10px; border: 1px solid #dee2e6; background: #fff; font-size: 15px; font-weight: 500; color: #444; cursor: pointer; transition: background 0.15s; }
  .cm-del-cancel:hover { background: #f0f0f0; }
  .cm-del-cancel:disabled { opacity: 0.6; cursor: not-allowed; }
  .cm-del-confirm { flex: 1; padding: 10px; border-radius: 10px; border: none; background: #dc3545; color: #fff; font-size: 15px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: background 0.15s, opacity 0.15s; }
  .cm-del-confirm:hover:not(:disabled) { background: #bb2d3b; }
  .cm-del-confirm--blue { background: #1a73e8; }
  .cm-del-confirm--blue:hover:not(:disabled) { background: #1558b0; }
  .cm-del-confirm:disabled { opacity: 0.65; cursor: not-allowed; }
  .cm-btn-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff; border-radius: 50%; animation: cu-spin 0.7s linear infinite; display: inline-block; flex-shrink: 0; }

  @keyframes cu-fadeup { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes cu-spin { to { transform: rotate(360deg); } }
`;

export default Document;
