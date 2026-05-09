import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { getDocumentsByClass } from "../../service/document.service";
import { toast } from "react-toastify";

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN");
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

// ─── Full-screen Document Viewer ──────────────────────────────────────────────
const DocumentViewer = ({ file, onClose }) => {
  const { fileUrl, fileName, contentType } = file;
  const [textContent, setTextContent] = useState(null);
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
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
        <div style={vs.center}>
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
        <div style={vs.center}>
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
        <div style={vs.center}>
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
          <div style={vs.center}>
            <span className="spinner-border spinner-border-sm me-2" />
            <span style={{ color: "#6b7280" }}>Đang tải nội dung…</span>
          </div>
        );
      if (error)
        return (
          <div
            style={{
              ...vs.center,
              flexDirection: "column",
              gap: 8,
              color: "#ef4444",
            }}
          >
            <i className="bi bi-exclamation-circle" style={{ fontSize: 32 }} />
            <div>Không thể tải nội dung file.</div>
          </div>
        );
      return <pre style={vs.textPre}>{textContent}</pre>;
    }
    // Unsupported
    return (
      <div
        style={{
          ...vs.center,
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

  return ReactDOM.createPortal(
    <div style={vs.root}>
      <style>{`@keyframes dv-fadein { from { opacity:0; } to { opacity:1; } }`}</style>

      {/* Header */}
      <div style={vs.header}>
        <div style={vs.headerLeft}>
          <i
            className={`bi ${fileIconClass(contentType)}`}
            style={{ fontSize: 18, flexShrink: 0 }}
          />
          <span title={fileName} style={vs.title}>
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
            style={vs.headerBtn}
            title="Tải xuống"
          >
            <i className="bi bi-download" />
            <span className="d-none d-sm-inline" style={{ fontSize: 15 }}>
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
      <div style={vs.body}>{renderBody()}</div>
    </div>,
    document.body,
  );
};

const vs = {
  root: {
    position: "fixed",
    inset: 0,
    zIndex: 99999,
    background: "#f3f4f6",
    display: "flex",
    flexDirection: "column",
    animation: "dv-fadein 0.2s both",
  },
  header: {
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
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
  },
  title: {
    fontWeight: 600,
    fontSize: 16,
    color: "#111827",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  headerBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 14px",
    borderRadius: 8,
    border: "1.5px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    fontWeight: 500,
    fontSize: 15,
    cursor: "pointer",
  },
  body: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  center: {
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
    fontSize: 16,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    lineHeight: 1.75,
    color: "#111827",
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────
const DocumentUser = ({ classId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [viewerFile, setViewerFile] = useState(null);

  const fetchFiles = async (page = 0) => {
    if (!classId) return;
    try {
      setLoading(true);
      const res = await getDocumentsByClass(classId, { page, size });
      setFiles(res.data || []);
      setTotalPages(res.meta.totalPages || 0);
      setTotalElements(res.meta.totalItems || 0);
      setCurrentPage(page);
    } catch {
      toast.error("Không thể tải danh sách file");
      setFiles([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(0);
  }, [classId]);

  return (
    <>
      <style>{documentStyle}</style>

      {!loading && files.length === 0 && (
        <div className="du-empty">
          <div className="du-empty__icon">📂</div>
          <div className="du-empty__title">Chưa có tài liệu nào</div>
        </div>
      )}

      {!loading && files.length > 0 && (
        <div className="du-table-wrap">
          <table className="du-table">
            <thead>
              <tr>
                <th>Tên tệp</th>
                <th className="du-th-date">Ngày sửa đổi</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr
                  key={file.id}
                  onClick={() => setViewerFile(file)}
                  className="du-row"
                >
                  <td>
                    <div className="du-file-name">
                      <i
                        className={`bi ${fileIconClass(file.contentType)}`}
                        style={{ fontSize: 18, flexShrink: 0 }}
                      />
                      <span className="du-file-link" title={file.fileName}>
                        {file.fileName}
                      </span>
                    </div>
                  </td>
                  <td className="du-date">{formatDate(file.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="du-pagination">
          <button
            className="du-page-btn"
            disabled={currentPage === 0}
            onClick={() => fetchFiles(currentPage - 1)}
          >
            <i className="bi bi-chevron-left" />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`du-page-btn ${currentPage === i ? "du-page-btn--active" : ""}`}
              onClick={() => fetchFiles(i)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="du-page-btn"
            disabled={currentPage === totalPages - 1}
            onClick={() => fetchFiles(currentPage + 1)}
          >
            <i className="bi bi-chevron-right" />
          </button>
        </div>
      )}

      {viewerFile && (
        <DocumentViewer file={viewerFile} onClose={() => setViewerFile(null)} />
      )}
    </>
  );
};

const documentStyle = `
  .du-result-count { font-size: 16px; color: #6b7280; margin-bottom: 10px; }
  .du-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 16px; animation: du-fadein 0.25s both; }
  .du-empty__icon { font-size: 40px; margin-bottom: 8px; }
  .du-empty__title { font-size: 16px; font-weight: 500; color: #6b7280; }

  .du-table-wrap { border-radius: 12px; overflow: hidden; border: 1.5px solid #e5e7eb; background: #fff; }
  .du-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .du-table thead tr { background: #f9fafb; }
  .du-table th { padding: 11px 16px; font-size: 16px; font-weight: 600; color: #6b7280; text-align: left; border-bottom: 1.5px solid #e5e7eb; white-space: nowrap; }
  .du-th-date { width: 130px; }
  .du-table tbody tr.du-row { cursor: pointer; transition: background 0.13s; border-bottom: 1px solid #f3f4f6; }
  .du-table tbody tr.du-row:last-child { border-bottom: none; }
  .du-table tbody tr.du-row:hover { background: #f0f7ff; }
  .du-table td { padding: 11px 16px; vertical-align: middle; overflow: hidden; }
  .du-file-name { display: flex; align-items: center; gap: 9px; min-width: 0; overflow: hidden; }
  .du-file-link { font-size: 16px; color: #111827; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; flex: 1; }
  .du-date { font-size: 16px; color: #9ca3af; white-space: nowrap; width: 130px; }

  @media (max-width: 400px) { .du-th-date, .du-date { display: none; } }

  .du-pagination { display: flex; justify-content: center; align-items: center; gap: 4px; margin-top: 16px; flex-wrap: wrap; }
  .du-page-btn { min-width: 36px; height: 36px; padding: 0 8px; border: 1.5px solid #e5e7eb; border-radius: 7px; background: #fff; color: #1a1a2e; font-size: 16px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
  .du-page-btn:hover:not(:disabled) { border-color: #1a73e8; color: #1a73e8; }
  .du-page-btn--active { background: #1a73e8; color: #fff; border-color: #1a73e8; font-weight: 600; }
  .du-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  @keyframes du-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
`;

export default DocumentUser;
