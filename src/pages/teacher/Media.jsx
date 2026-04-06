import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteAllMedia,
  deleteMedia,
  deleteMediasByIds,
  getMedias,
  updateMedia,
  createMedia,
} from "../../service/media.service";
import { getPresignedUploadUrls } from "../../service/upload.service";
import { toast } from "react-toastify";

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { key: "IMAGE", label: "Image", uploadLabel: "Upload" },
  { key: "VIDEO", label: "Video", uploadLabel: "Upload" },
  { key: "AUDIO", label: "Audio", uploadLabel: "Upload" },
];

const PAGE_SIZE = 12;

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
  Image: ({ color = "#6b7280" }) => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  Video: ({ color = "#6b7280" }) => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
    >
      <rect x="2" y="4" width="16" height="16" rx="2" />
      <path d="M22 8l-6 4 6 4V8z" />
    </svg>
  ),
  Audio: ({ color = "#6b7280" }) => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
  Upload: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  ),
  Play: () => (
    <svg width="38" height="38" viewBox="0 0 38 38">
      <circle cx="19" cy="19" r="19" fill="rgba(0,0,0,.5)" />
      <polygon points="15,11 29,19 15,27" fill="white" />
    </svg>
  ),
  Trash: ({ size = 13, color = "#fff" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  ),
  Edit: ({ size = 13, color = "#fff" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
    >
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Warning: () => (
    <svg
      width="44"
      height="44"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#f59e0b"
      strokeWidth="1.8"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Select: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  Close: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6b7280"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Search: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9ca3af"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
};
const TAB_ICONS = { IMAGE: Icon.Image, VIDEO: Icon.Video, AUDIO: Icon.Audio };

// ── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = ({ size = 16, color = "#2563eb" }) => (
  <>
    <style>{`@keyframes media-spin { to { transform: rotate(360deg); } }`}</style>
    <div
      style={{
        width: size,
        height: size,
        border: `2px solid rgba(0,0,0,0.08)`,
        borderTopColor: color,
        borderRadius: "50%",
        animation: "media-spin 0.7s linear infinite",
        flexShrink: 0,
      }}
    />
  </>
);

// ── Thumbnail ─────────────────────────────────────────────────────────────────
function Thumb({ item }) {
  if (item.mediaType === "IMAGE")
    return (
      <img
        src={item.fileUrl}
        alt={item.fileName}
        style={{
          width: "100%",
          height: 130,
          objectFit: "cover",
          display: "block",
        }}
      />
    );
  if (item.mediaType === "VIDEO")
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 130,
          background: "#0f172a",
        }}
      >
        <video
          src={item.fileUrl}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.7,
          }}
          muted
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon.Play />
        </div>
      </div>
    );
  return (
    <div
      style={{
        height: 130,
        background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
      }}
    >
      <Icon.Audio color="#93c5fd" />
      <span style={{ color: "#93c5fd", fontSize: 16 }}>Audio file</span>
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ message, loading, onConfirm, onCancel }) {
  if (!message) return null;
  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 1220,
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1225,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 16px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            width: "100%",
            maxWidth: 400,
            boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
            boxSizing: "border-box",
            padding: "28px 24px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <Icon.Warning />
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: "#0f172a",
              marginBottom: 8,
            }}
          >
            Bạn có chắc chắn xóa không?
          </div>
          <p
            style={{
              fontSize: 16,
              color: "#64748b",
              marginBottom: 20,
              wordBreak: "break-word",
            }}
            dangerouslySetInnerHTML={{ __html: message }}
          />
          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            <button
              disabled={loading}
              onClick={onCancel}
              style={{
                padding: "8px 24px",
                borderRadius: 8,
                border: "1.5px solid #e9ecef",
                background: "#fff",
                fontSize: 16,
                cursor: "pointer",
                minWidth: 90,
              }}
            >
              Hủy
            </button>
            <button
              disabled={loading}
              onClick={onConfirm}
              style={{
                padding: "8px 24px",
                borderRadius: 8,
                border: "none",
                background: "#ef4444",
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                minWidth: 90,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {loading && <Spinner size={13} color="#fff" />}
              Xóa
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Rename Modal ──────────────────────────────────────────────────────────────
function RenameModal({ item, loading, onConfirm, onCancel }) {
  const [name, setName] = useState("");
  const inputRef = useRef();
  useEffect(() => {
    if (!item) return;
    setName(item.fileName);
    setTimeout(() => inputRef.current?.select(), 50);
  }, [item]);
  if (!item) return null;
  const ext = item.fileName.includes(".")
    ? item.fileName.slice(item.fileName.lastIndexOf("."))
    : "";
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onConfirm(item.id, trimmed.includes(".") ? trimmed : trimmed + ext);
  };
  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 1220,
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1225,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 16px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            width: "100%",
            maxWidth: 420,
            boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
            boxSizing: "border-box",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              padding: "20px 20px 0",
            }}
          >
            <button
              disabled={loading}
              onClick={onCancel}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 2,
                display: "flex",
              }}
            >
              <Icon.Close />
            </button>
          </div>
          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div style={{ padding: "16px 20px" }}>
              <label
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Tên file
              </label>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1.5px solid #e9ecef",
                  fontSize: 16,
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#2563eb";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e9ecef";
                  e.target.style.boxShadow = "none";
                }}
              />
              {ext && (
                <span
                  style={{
                    fontSize: 16,
                    color: "#9ca3af",
                    marginTop: 4,
                    display: "block",
                  }}
                >
                  Đuôi file: <code>{ext}</code> — sẽ được giữ nguyên nếu bạn
                  xóa.
                </span>
              )}
            </div>
            {/* Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                padding: "0 20px 20px",
              }}
            >
              <button
                type="button"
                disabled={loading}
                onClick={onCancel}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  border: "1.5px solid #e9ecef",
                  background: "#fff",
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "#2563eb",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {loading && <Spinner size={13} color="#fff" />}
                Lưu
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ── Media Card ────────────────────────────────────────────────────────────────
function MediaCard({
  item,
  isChecked,
  selectMode,
  onSelect,
  onCheck,
  onDeleteClick,
  onEditClick,
}) {
  const [hovered, setHovered] = useState(false);
  const handleClick = () => (selectMode ? onCheck() : onSelect());
  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: 10,
        overflow: "hidden",
        cursor: "pointer",
        userSelect: "none",
        border: `2px solid ${isChecked ? "#2563eb" : hovered ? "#93c5fd" : "#e5e7eb"}`,
        background: isChecked ? "#eff6ff" : "#fff",
        transition:
          "border-color .15s, box-shadow .15s, background .15s, transform .15s",
        boxShadow: isChecked
          ? "0 0 0 3px rgba(37,99,235,.15)"
          : hovered
            ? "0 6px 18px rgba(0,0,0,.13)"
            : "0 1px 3px rgba(0,0,0,.06)",
        transform: hovered && !isChecked ? "translateY(-2px)" : "none",
      }}
    >
      {(hovered || isChecked) && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 130,
            zIndex: 3,
            pointerEvents: "none",
            background: hovered ? "rgba(0,0,0,.18)" : "rgba(0,0,0,.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: 8,
            boxSizing: "border-box",
          }}
        >
          {selectMode && (
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => {
                e.stopPropagation();
                onCheck();
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 18,
                height: 18,
                cursor: "pointer",
                borderRadius: 5,
                pointerEvents: "auto",
                flexShrink: 0,
                accentColor: "#2563eb",
              }}
            />
          )}
          {!selectMode && hovered && (
            <div
              style={{
                display: "flex",
                gap: 4,
                marginLeft: "auto",
                pointerEvents: "auto",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick(item);
                }}
                title="Đổi tên"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: "#2563eb",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon.Edit size={13} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick(item);
                }}
                title="Xóa"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: "#ef4444",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon.Trash size={13} />
              </button>
            </div>
          )}
        </div>
      )}
      <Thumb item={item} />
      <div
        style={{
          padding: "5px 8px 6px",
          fontSize: 16,
          color: "#374151",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontWeight: 500,
          borderTop: "1px solid #f3f4f6",
        }}
      >
        {item.fileName}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Media({ show, onClose, onSelect }) {
  const [tab, setTab] = useState("IMAGE");
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const [selectMode, setSelectMode] = useState(false);
  const [checked, setChecked] = useState([]);

  const [confirmMsg, setConfirmMsg] = useState(null);
  const [confirmCb, setConfirmCb] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [renameItem, setRenameItem] = useState(null);
  const [renameLoading, setRenameLoading] = useState(false);

  const [isNarrow, setIsNarrow] = useState(
    typeof window !== "undefined" ? window.innerWidth < 480 : false,
  );

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth < 480);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fileRef = useRef();
  const searchTimer = useRef();
  const scrollRef = useRef();
  const sentinelRef = useRef();

  // ── Load trang đầu ────────────────────────────────────────────────────────
  const loadFirst = useCallback(async (mediaType, fileName) => {
    setLoading(true);
    setError(null);
    setData([]);
    setPage(0);
    setHasMore(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const res = await getMedias({
        mediaType,
        fileName,
        page: 0,
        size: PAGE_SIZE,
      });
      const { data: items, meta: m } = res;
      setData(items || []);
      setMeta(m);
      setHasMore(m.currentPage < m.totalPages);
    } catch {
      setError("Không thể tải media. Vui lòng thử lại.");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load trang tiếp ───────────────────────────────────────────────────────
  const loadMore = useCallback(
    async (mediaType, fileName, nextPage) => {
      if (loadingMore) return;
      setLoadingMore(true);
      try {
        const res = await getMedias({
          mediaType,
          fileName,
          page: nextPage,
          size: PAGE_SIZE,
        });
        const { data: items, meta: m } = res;
        setData((prev) => [...prev, ...(items || [])]);
        setMeta(m);
        setPage(nextPage);
        setHasMore(m.currentPage < m.totalPages);
      } catch {
        setHasMore(false);
      } finally {
        setLoadingMore(false);
      }
    },
    [loadingMore],
  );

  const isFirstMount = useRef(true);

  useEffect(() => {
    if (!show) return;
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => loadFirst(tab, search), 400);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  useEffect(() => {
    if (!show) return;
    isFirstMount.current = true;
    exitSelectMode();
    loadFirst(tab, search);
  }, [tab, show]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore)
          loadMore(tab, search, page + 1);
      },
      { root: scrollRef.current, threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, tab, search, page, loadMore]);

  const exitSelectMode = () => {
    setSelectMode(false);
    setChecked([]);
  };
  const toggleCheck = (item) =>
    setChecked((prev) =>
      prev.includes(item.id)
        ? prev.filter((id) => id !== item.id)
        : [...prev, item.id],
    );
  const handleSelect = (item) => {
    onSelect(item);
    onClose();
  };

  const openConfirm = (msg, cb) => {
    setConfirmMsg(msg);
    setConfirmCb(() => cb);
  };
  const closeConfirm = () => {
    setConfirmMsg(null);
    setConfirmCb(null);
  };

  const handleConfirmDone = async () => {
    if (!confirmCb) return;
    setConfirmLoading(true);
    try {
      await confirmCb();
      closeConfirm();
      loadFirst(tab, search);
    } catch {
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDeleteSingle = (item) => {
    openConfirm(
      `File <strong>"${item.fileName}"</strong> sẽ bị xóa vĩnh viễn và không thể khôi phục.`,
      () => deleteMedia(item.id),
    );
  };
  const handleDeleteSelected = () => {
    openConfirm(
      `<strong>${checked.length} ${tab.toLowerCase()}</strong> đã chọn sẽ bị xóa vĩnh viễn và không thể khôi phục.`,
      async () => {
        await deleteMediasByIds(checked);
        exitSelectMode();
      },
    );
  };
  const handleDeleteAll = () => {
    openConfirm(
      `<strong>Tất cả ${meta?.totalItems ?? data.length} ${tab.toLowerCase()}</strong> sẽ bị xóa vĩnh viễn và không thể khôi phục.`,
      async () => {
        await deleteAllMedia(tab);
        exitSelectMode();
      },
    );
  };
  const handleRename = async (id, newName) => {
    setRenameLoading(true);
    try {
      await updateMedia(id, { fileName: newName });
      setRenameItem(null);
      loadFirst(tab, search);
    } catch {
    } finally {
      setRenameLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    try {
      const uploadResults = await getPresignedUploadUrls(files);
      await Promise.all(
        uploadResults.map((item, index) => {
          const file = files[index];
          return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("PUT", item.uploadUrl);
            xhr.setRequestHeader("Content-Type", item.contentType);
            xhr.onload = () =>
              xhr.status === 200 || xhr.status === 204 ? resolve() : reject();
            xhr.onerror = reject;
            xhr.send(file);
          });
        }),
      );
      await createMedia(
        uploadResults.map((item) => ({
          objectKey: item.objectKey,
          fileName: item.fileName,
          contentType: item.contentType,
        })),
      );
      toast.success("Upload thành công");
      loadFirst(tab, search);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Upload thất bại",
      );
    } finally {
      e.target.value = "";
    }
  };

  if (!show) return null;
  const currentTab = TABS.find((t) => t.key === tab);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(2px)",
          zIndex: 1200,
        }}
      />

      {/* Modal wrapper */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1210,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            width: "100%",
            maxWidth: 900,
            height: 610,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px 0",
              flexShrink: 0,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
              Media
            </span>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
              }}
            >
              <Icon.Close />
            </button>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              padding: "12px 24px 0",
              borderBottom: "1px solid #f1f5f9",
              flexShrink: 0,
            }}
          >
            {TABS.map(({ key, label }) => {
              const active = tab === key;
              const TabIcon = TAB_ICONS[key];
              return (
                <button
                  key={key}
                  onClick={() => {
                    setTab(key);
                    setSearch("");
                    exitSelectMode();
                  }}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "10px 0",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: active ? 600 : 400,
                    color: active ? "#2563eb" : "#6b7280",
                    borderBottom: active
                      ? "2.5px solid #2563eb"
                      : "2.5px solid transparent",
                    marginBottom: -1,
                    fontSize: 16.5,
                    transition: "color 0.15s",
                  }}
                >
                  <TabIcon color={active ? "#2563eb" : "#6b7280"} />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              flexDirection: isNarrow ? "column" : "row",
              alignItems: isNarrow ? "stretch" : "center",
              gap: 8,
              padding: "12px 24px",
              flexShrink: 0,
            }}
          >
            {/* Search */}
            <div
              style={{
                position: "relative",
                maxWidth: isNarrow ? "100%" : 260,
                width: "100%",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  display: "flex",
                }}
              >
                <Icon.Search />
              </span>
              <input
                type="text"
                placeholder="Search file"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 32px",
                  borderRadius: 8,
                  border: "1.5px solid #e9ecef",
                  fontSize: 16,
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#2563eb";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e9ecef";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexShrink: 0,
                marginLeft: isNarrow ? 0 : "auto",
                justifyContent: isNarrow ? "flex-end" : "flex-start",
              }}
            >
              {!selectMode ? (
                <button
                  disabled={data.length === 0}
                  onClick={() => setSelectMode(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 8,
                    border: "1.5px solid #d1d5db",
                    background: "#fff",
                    color: "#374151",
                    fontSize: 16,
                    cursor: data.length === 0 ? "not-allowed" : "pointer",
                    opacity: data.length === 0 ? 0.5 : 1,
                  }}
                >
                  <Icon.Select /> Chọn
                </button>
              ) : (
                <button
                  onClick={exitSelectMode}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    border: "1.5px solid #d1d5db",
                    background: "#fff",
                    color: "#374151",
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
              )}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: isNarrow ? "7px 10px" : "7px 14px",
                  border: "1.5px solid #2563eb",
                  color: "#2563eb",
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: "pointer",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                <Icon.Upload />
                {!isNarrow && currentTab.uploadLabel}
                <input
                  ref={fileRef}
                  type="file"
                  hidden
                  onChange={handleUpload}
                />
              </label>
            </div>
          </div>

          {/* Select mode action bar */}
          {selectMode && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 8,
                padding: "0 24px 10px",
                flexShrink: 0,
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <button
                disabled={checked.length === 0}
                onClick={handleDeleteSelected}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: checked.length === 0 ? "#f1f3f5" : "#ef4444",
                  color: checked.length === 0 ? "#adb5bd" : "#fff",
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: checked.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                <Icon.Trash
                  size={13}
                  color={checked.length === 0 ? "#adb5bd" : "#fff"}
                />
                Xóa ({checked.length})
              </button>
              <button
                disabled={data.length === 0}
                onClick={handleDeleteAll}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "1.5px solid #ef4444",
                  background: "#fff",
                  color: "#ef4444",
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: data.length === 0 ? "not-allowed" : "pointer",
                  opacity: data.length === 0 ? 0.5 : 1,
                }}
              >
                <Icon.Trash size={13} color="#ef4444" />
                Xóa tất cả
              </button>
            </div>
          )}

          {/* Grid */}
          <div
            ref={scrollRef}
            style={{ flex: 1, overflowY: "auto", padding: "0 24px" }}
          >
            {loading ? (
              <div
                style={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <Spinner size={18} />
                <span style={{ fontSize: 16, color: "#6b7280" }}>
                  Loading...
                </span>
              </div>
            ) : error ? (
              <div
                style={{
                  height: 200,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 16, color: "#ef4444" }}>{error}</span>
                <button
                  onClick={() => loadFirst(tab, search)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 8,
                    border: "1.5px solid #2563eb",
                    background: "#fff",
                    color: "#2563eb",
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                >
                  Thử lại
                </button>
              </div>
            ) : data.length === 0 ? (
              <div
                style={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  color: "#9ca3af",
                }}
              >
                Không có file nào
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: 12,
                    paddingTop: 12,
                    paddingBottom: 12,
                  }}
                >
                  {data.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      isChecked={checked.includes(item.id)}
                      selectMode={selectMode}
                      onSelect={() => handleSelect(item)}
                      onCheck={() => toggleCheck(item)}
                      onDeleteClick={handleDeleteSingle}
                      onEditClick={setRenameItem}
                    />
                  ))}
                </div>
                <div ref={sentinelRef} style={{ height: 1 }} />
                {loadingMore && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "16px 0",
                    }}
                  >
                    <Spinner size={20} />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 24px",
              borderTop: "1px solid #f1f5f9",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 16, color: "#6b7280" }}>
              {meta && checked.length > 0 && (
                <span style={{ color: "#2563eb", fontWeight: 600 }}>
                  · {checked.length} đã chọn
                </span>
              )}
            </span>
            <button
              onClick={onClose}
              style={{
                padding: "7px 18px",
                borderRadius: 8,
                border: "1.5px solid #e9ecef",
                background: "#fff",
                fontSize: 16,
                cursor: "pointer",
                color: "#374151",
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        message={confirmMsg}
        loading={confirmLoading}
        onConfirm={handleConfirmDone}
        onCancel={() => {
          if (!confirmLoading) closeConfirm();
        }}
      />
      <RenameModal
        item={renameItem}
        loading={renameLoading}
        onConfirm={handleRename}
        onCancel={() => {
          if (!renameLoading) setRenameItem(null);
        }}
      />
    </>
  );
}
