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

const isTextFile = (contentType) =>
  contentType?.startsWith("text/") || contentType === "application/json";

// ─── Download helper ──────────────────────────────────────────────────────────
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
  } catch (err) {
    console.error("Download failed", err);
    window.open(fileUrl, "_blank"); // fallback
  }
};

// ─── Text Viewer Modal ────────────────────────────────────────────────────────
const TextViewerModal = ({ file, onClose }) => {
  const { fileUrl, fileName } = file;
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
    // Fetch dưới dạng ArrayBuffer rồi decode UTF-8 thủ công → không bị lỗi encoding
    fetch(fileUrl)
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        const decoder = new TextDecoder("utf-8");
        setContent(decoder.decode(buf));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [fileUrl]);

  return ReactDOM.createPortal(
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
            className="bi bi-file-earmark-text text-secondary"
            style={{ fontSize: 18, flexShrink: 0 }}
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
              minWidth: 0,
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
          <button
            onClick={onClose}
            title="Đóng (Esc)"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 7,
              border: "1.5px solid #d1d5db",
              background: "#fff",
              color: "#374151",
              cursor: "pointer",
              fontSize: 16,
              padding: 0,
            }}
          >
            <i className="bi bi-x-lg" />
          </button>
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

// ─── File Action Modal ────────────────────────────────────────────────────────
const FileActionModal = ({ file, onClose, onViewText }) => {
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

  return ReactDOM.createPortal(
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
          maxWidth: 380,
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
            fontSize: 16,
            color: "#111827",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            width: "100%",
          }}
        >
          {fileName}
        </div>

        <div style={{ display: "flex", gap: 10, width: "100%", marginTop: 4 }}>
          {/* File text: nút "Xem nội dung" thay cho "Mở file" */}
          {isTextFile(contentType) ? (
            <button
              onClick={() => {
                onClose();
                onViewText(file);
              }}
              style={{
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
              }}
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
              style={{
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
              }}
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
            style={{
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
            }}
          >
            <i className="bi bi-download" style={{ fontSize: 16 }} />
            Tải xuống
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 2,
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

// ─── Main Component ───────────────────────────────────────────────────────────
const DocumentUser = ({ classId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [actionFile, setActionFile] = useState(null);
  const [textViewFile, setTextViewFile] = useState(null);

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

  const handleFileClick = (e, file) => {
    e.preventDefault();
    setActionFile(file);
  };

  return (
    <>
      <style>{documentStyle}</style>

      {!loading && totalElements > 0 && (
        <div className="du-result-count">{totalElements} kết quả tìm thấy</div>
      )}

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
                <tr key={file.id} onClick={(e) => handleFileClick(e, file)}>
                  <td>
                    <div className="du-file-name">
                      <i
                        className={`bi ${fileIconClass(file.contentType)}`}
                        style={{ fontSize: 18, flexShrink: 0 }}
                      />
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        title={file.fileName}
                        className="du-file-link"
                        onClick={(e) => handleFileClick(e, file)}
                      >
                        {file.fileName}
                      </a>
                    </div>
                  </td>
                  <td className="du-date">
                    {new Date(file.updatedAt).toLocaleDateString("vi-VN")}
                  </td>
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

      {actionFile && (
        <FileActionModal
          file={actionFile}
          onClose={() => setActionFile(null)}
          onViewText={(file) => setTextViewFile(file)}
        />
      )}

      {textViewFile && (
        <TextViewerModal
          file={textViewFile}
          onClose={() => setTextViewFile(null)}
        />
      )}
    </>
  );
};

const documentStyle = `
  .du-result-count { font-size: 15px; color: #6b7280; margin-bottom: 10px; }
  .du-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 16px; animation: du-fadein 0.25s both; }
  .du-empty__icon { font-size: 40px; margin-bottom: 8px; }
  .du-empty__title { font-size: 16px; font-weight: 500; color: #6b7280; }
  .du-table-wrap { border-radius: 12px; overflow: hidden; border: 1.5px solid #e5e7eb; background: #fff; }
  .du-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .du-table thead tr { background: #f9fafb; }
  .du-table th { padding: 11px 16px; font-size: 16px; font-weight: 600; color: #6b7280; text-align: left; border-bottom: 1.5px solid #e5e7eb; white-space: nowrap; }
  .du-th-date { width: 130px; }
  .du-table tbody tr { cursor: pointer; transition: background 0.13s; border-bottom: 1px solid #f3f4f6; }
  .du-table tbody tr:last-child { border-bottom: none; }
  .du-table tbody tr:hover { background: #f0f7ff; }
  .du-table td { padding: 11px 16px; vertical-align: middle; overflow: hidden; }
  .du-file-name { display: flex; align-items: center; gap: 9px; min-width: 0; overflow: hidden; }
  .du-file-link { font-size: 16px; color: #111827; text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; flex: 1; display: block; }
  .du-file-link:hover { color: #1a73e8; text-decoration: underline; }
  .du-date { font-size: 16px; color: #9ca3af; white-space: nowrap; width: 130px; }
  @media (max-width: 400px) { .du-th-date, .du-date { display: none; } }
  .du-pagination { display: flex; justify-content: center; align-items: center; gap: 4px; margin-top: 16px; flex-wrap: wrap; }
  .du-page-btn { min-width: 34px; height: 34px; padding: 0 8px; border: 1.5px solid #e5e7eb; border-radius: 7px; background: #fff; color: #1a1a2e; font-size: 16px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
  .du-page-btn:hover:not(:disabled) { border-color: #1a73e8; color: #1a73e8; }
  .du-page-btn--active { background: #1a73e8; color: #fff; border-color: #1a73e8; font-weight: 600; }
  .du-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  @keyframes du-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
`;

export default DocumentUser;
