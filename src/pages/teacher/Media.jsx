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
  {
    key: "VIDEO",
    label: "Video (Mp4)",
    uploadLabel: "Upload",
  },
  {
    key: "AUDIO",
    label: "Audio (mp3)",
    uploadLabel: "Upload",
  },
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
};
const TAB_ICONS = { IMAGE: Icon.Image, VIDEO: Icon.Video, AUDIO: Icon.Audio };

// ── Thumbnail ─────────────────────────────────────────────────────────────────
function Thumb({ item }) {
  if (item.mediaType === "IMAGE")
    return (
      <img
        src={item.fileUrl}
        alt={item.fileName}
        className="w-100"
        style={{ height: 130, objectFit: "cover", display: "block" }}
      />
    );
  if (item.mediaType === "VIDEO")
    return (
      <div
        className="position-relative w-100"
        style={{ height: 130, background: "#0f172a" }}
      >
        <video
          src={item.fileUrl}
          className="w-100 h-100"
          style={{ objectFit: "cover", opacity: 0.7 }}
          muted
        />
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
          <Icon.Play />
        </div>
      </div>
    );
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{
        height: 130,
        background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
      }}
    >
      <Icon.Audio color="#93c5fd" />
      <small className="mt-1" style={{ color: "#93c5fd", fontSize: 11 }}>
        Audio file
      </small>
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ message, loading, onConfirm, onCancel }) {
  if (!message) return null;
  return (
    <>
      <div
        className="modal-backdrop show"
        style={{ zIndex: 1065, opacity: 0.55 }}
      />
      <div
        className="modal show d-block"
        style={{ zIndex: 1070 }}
        tabIndex="-1"
      >
        <div
          className="modal-dialog modal-dialog-centered"
          style={{ maxWidth: 400 }}
        >
          <div
            className="modal-content"
            style={{ borderRadius: 14, border: "none" }}
          >
            <div className="modal-body text-center px-4 pt-4 pb-2">
              <div className="mb-3">
                <Icon.Warning />
              </div>
              <h6
                className="fw-bold mb-2"
                style={{ fontSize: 16, color: "#0f172a" }}
              >
                Bạn có chắc chắn xóa không?
              </h6>
              <p
                className="text-secondary mb-0"
                style={{ fontSize: 13.5 }}
                dangerouslySetInnerHTML={{ __html: message }}
              />
            </div>
            <div className="modal-footer border-0 justify-content-center gap-2 pb-4">
              <button
                className="btn btn-light px-4"
                style={{ borderRadius: 8, fontSize: 13.5, minWidth: 100 }}
                disabled={loading}
                onClick={onCancel}
              >
                Hủy
              </button>
              <button
                className="btn btn-danger px-4 d-flex align-items-center gap-2"
                style={{ borderRadius: 8, fontSize: 13.5, minWidth: 100 }}
                disabled={loading}
                onClick={onConfirm}
              >
                {loading && (
                  <span className="spinner-border spinner-border-sm" />
                )}
                Xóa
              </button>
            </div>
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
        className="modal-backdrop show"
        style={{ zIndex: 1065, opacity: 0.55 }}
      />
      <div
        className="modal show d-block"
        style={{ zIndex: 1070 }}
        tabIndex="-1"
      >
        <div
          className="modal-dialog modal-dialog-centered"
          style={{ maxWidth: 420 }}
        >
          <div
            className="modal-content"
            style={{ borderRadius: 14, border: "none" }}
          >
            <div className="modal-header border-0 pb-0 px-4 pt-4">
              <h6
                className="modal-title fw-bold"
                style={{ fontSize: 16, color: "#0f172a" }}
              >
                Đổi tên file
              </h6>
              <button
                className="btn-close"
                disabled={loading}
                onClick={onCancel}
              />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body px-4 py-3">
                <label
                  className="form-label text-secondary"
                  style={{ fontSize: 13 }}
                >
                  Tên file
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ borderRadius: 8, fontSize: 14 }}
                  required
                />
                {ext && (
                  <small
                    className="text-secondary mt-1 d-block"
                    style={{ fontSize: 12 }}
                  >
                    Đuôi file: <code>{ext}</code> — sẽ được giữ nguyên nếu bạn
                    xóa.
                  </small>
                )}
              </div>
              <div className="modal-footer border-0 px-4 pb-4 gap-2">
                <button
                  type="button"
                  className="btn btn-light px-4"
                  style={{ borderRadius: 8, fontSize: 13.5 }}
                  disabled={loading}
                  onClick={onCancel}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-4 d-flex align-items-center gap-2"
                  style={{ borderRadius: 8, fontSize: 13.5 }}
                  disabled={loading}
                >
                  {loading && (
                    <span className="spinner-border spinner-border-sm" />
                  )}
                  Lưu
                </button>
              </div>
            </form>
          </div>
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
    <div className="col-6 col-md-3 mb-3">
      <div
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="position-relative"
        style={{
          border: `2px solid ${isChecked ? "#2563eb" : "#e5e7eb"}`,
          borderRadius: 10,
          overflow: "hidden",
          cursor: "pointer",
          background: isChecked ? "#eff6ff" : "#fff",
          userSelect: "none",
          transition: "border-color .15s, box-shadow .15s, background .15s",
          boxShadow: isChecked
            ? "0 0 0 3px rgba(37,99,235,.15)"
            : hovered
              ? "0 4px 14px rgba(0,0,0,.12)"
              : "0 1px 3px rgba(0,0,0,.06)",
        }}
      >
        {(hovered || isChecked) && (
          <div
            className="position-absolute top-0 start-0 w-100 d-flex justify-content-between align-items-start p-2"
            style={{
              height: 130,
              zIndex: 3,
              background: hovered ? "rgba(0,0,0,.18)" : "rgba(0,0,0,.05)",
              pointerEvents: "none",
            }}
          >
            {selectMode && (
              <input
                type="checkbox"
                className="form-check-input"
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
                }}
              />
            )}
            {!selectMode && hovered && (
              <div
                className="d-flex gap-1 ms-auto"
                style={{ pointerEvents: "auto" }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClick(item);
                  }}
                  className="btn d-flex align-items-center justify-content-center p-0"
                  title="Đổi tên"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: "#2563eb",
                    border: "none",
                  }}
                >
                  <Icon.Edit size={13} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick(item);
                  }}
                  className="btn d-flex align-items-center justify-content-center p-0"
                  title="Xóa"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: "#ef4444",
                    border: "none",
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
          className="px-2 py-1"
          style={{
            fontSize: 13,
            color: "#374151",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.fileName}
        </div>
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
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const [selectMode, setSelectMode] = useState(false);
  const [checked, setChecked] = useState([]);

  // ── confirm & rename state ────────────────────────────────────────────────
  const [confirmMsg, setConfirmMsg] = useState(null);
  const [confirmCb, setConfirmCb] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [renameItem, setRenameItem] = useState(null);
  const [renameLoading, setRenameLoading] = useState(false);

  const fileRef = useRef();
  const searchTimer = useRef();
  const scrollRef = useRef();
  const sentinelRef = useRef();

  // ── Load trang đầu (reset) — GIỮ NGUYÊN ──────────────────────────────────
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
    } catch (e) {
      setError("Không thể tải media. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load trang tiếp (append) — GIỮ NGUYÊN ────────────────────────────────
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
      } catch (e) {
        // silent fail
      } finally {
        setLoadingMore(false);
      }
    },
    [loadingMore],
  );

  // ── Reset khi đổi tab ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!show) return;
    exitSelectMode();
    loadFirst(tab, search);
  }, [tab, show]);

  // ── Debounce search ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!show) return;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => loadFirst(tab, search), 400);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  // ── Infinite scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore(tab, search, page + 1);
        }
      },
      { root: scrollRef.current, threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, tab, search, page, loadMore]);

  // ── Helpers ───────────────────────────────────────────────────────────────
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

  // ── Confirm helper ────────────────────────────────────────────────────────
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
      loadFirst(tab, search); // reload từ trang đầu
    } catch {
      /* toast lỗi nếu cần */
    } finally {
      setConfirmLoading(false);
    }
  };

  // ── Xóa 1 ────────────────────────────────────────────────────────────────
  const handleDeleteSingle = (item) => {
    openConfirm(
      `File <strong>"${item.fileName}"</strong> sẽ bị xóa vĩnh viễn và không thể khôi phục.`,
      () => deleteMedia(item.id),
    );
  };

  // ── Xóa nhiều ────────────────────────────────────────────────────────────
  const handleDeleteSelected = () => {
    openConfirm(
      `<strong>${checked.length} ${tab.toLowerCase()}</strong> đã chọn sẽ bị xóa vĩnh viễn và không thể khôi phục.`,
      async () => {
        await deleteMediasByIds(checked);
        exitSelectMode();
      },
    );
  };

  // ── Xóa tất cả ───────────────────────────────────────────────────────────
  const handleDeleteAll = () => {
    openConfirm(
      `<strong>Tất cả ${meta?.totalItems ?? data.length} ${tab.toLowerCase()} </strong> sẽ bị xóa vĩnh viễn và không thể khôi phục.`,
      async () => {
        await deleteAllMedia(tab); // ✅ truyền body
        exitSelectMode();
      },
    );
  };

  // ── Đổi tên ──────────────────────────────────────────────────────────────
  const handleRename = async (id, newName) => {
    setRenameLoading(true);
    try {
      await updateMedia(id, { fileName: newName });
      setRenameItem(null);
      loadFirst(tab, search); // reload từ trang đầu
    } catch {
      /* toast lỗi nếu cần */
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
      const message =
        err?.response?.data?.message || // axios backend trả về
        err?.message || // lỗi JS
        "Upload thất bại";

      toast.error(message);
    } finally {
      e.target.value = "";
    }
  };

  if (!show) return null;
  const currentTab = TABS.find((t) => t.key === tab);

  return (
    <>
      <div
        className="modal-backdrop show"
        onClick={onClose}
        style={{ backdropFilter: "blur(2px)" }}
      />

      <div
        className="modal show d-block"
        style={{ zIndex: 1055 }}
        tabIndex="-1"
      >
        <div
          className="modal-dialog modal-xl modal-dialog-centered"
          style={{ maxWidth: 900 }}
        >
          <div
            className="modal-content"
            style={{
              borderRadius: 14,
              border: "none",
              overflow: "hidden",
              height: 610,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div className="modal-header border-0 pb-0 px-4">
              <h5
                className="modal-title fw-bold"
                style={{ fontSize: 18, color: "#0f172a" }}
              >
                Media
              </h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            {/* Tabs */}
            <div
              className="px-4 mt-3"
              style={{ borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}
            >
              <ul className="nav w-100">
                {TABS.map(({ key, label }) => {
                  const active = tab === key;
                  const TabIcon = TAB_ICONS[key];
                  return (
                    <li className="nav-item" key={key} style={{ flex: 1 }}>
                      <button
                        onClick={() => {
                          setTab(key);
                          setSearch("");
                          exitSelectMode();
                        }}
                        className="btn btn-link text-decoration-none d-flex align-items-center justify-content-center gap-2 py-3 w-100"
                        style={{
                          fontWeight: active ? 600 : 400,
                          color: active ? "#2563eb" : "#6b7280",
                          borderBottom: active
                            ? "2.5px solid #2563eb"
                            : "2.5px solid transparent",
                          borderRadius: 0,
                          marginBottom: -1,
                          fontSize: 14.5,
                        }}
                      >
                        <TabIcon color={active ? "#2563eb" : "#6b7280"} />
                        {label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Toolbar */}
            <div
              className="d-flex align-items-center gap-2 px-4 py-4"
              style={{ flexShrink: 0 }}
            >
              <div className="input-group" style={{ maxWidth: 260 }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search file"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    borderRadius: "8px",
                    fontSize: 13.5,
                    transition: "0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = "#2563eb";
                  }}
                  onMouseLeave={(e) => {
                    if (document.activeElement !== e.target)
                      e.target.style.borderColor = "";
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2563eb";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "";
                    e.target.style.boxShadow = "";
                  }}
                />
              </div>

              <div className="d-flex gap-2 ms-auto">
                {!selectMode ? (
                  <button
                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    style={{ borderRadius: 8, fontSize: 13.5 }}
                    disabled={data.length === 0}
                    onClick={() => setSelectMode(true)}
                  >
                    <Icon.Select /> Chọn
                  </button>
                ) : (
                  <button
                    className="btn btn-outline-secondary"
                    style={{ borderRadius: 8, fontSize: 13.5 }}
                    onClick={exitSelectMode}
                  >
                    Hủy
                  </button>
                )}
                <label
                  className="btn d-flex align-items-center gap-2"
                  style={{
                    border: "1.5px solid #2563eb",
                    color: "#2563eb",
                    borderRadius: 8,
                    fontSize: 13.5,
                    fontWeight: 500,
                  }}
                >
                  <Icon.Upload />
                  {currentTab.uploadLabel}
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
                className="d-flex align-items-center gap-3 px-4 pb-2"
                style={{ flexShrink: 0, borderBottom: "1px solid #f8fafc" }}
              >
                <div className="d-flex gap-2 ms-auto">
                  <button
                    className="btn btn-danger d-flex align-items-center gap-2"
                    style={{ borderRadius: 8, fontSize: 13.5 }}
                    disabled={checked.length === 0}
                    onClick={handleDeleteSelected}
                  >
                    <Icon.Trash size={13} color="#fff" /> Xóa ({checked.length})
                  </button>
                  <button
                    className="btn d-flex align-items-center gap-2"
                    style={{
                      borderRadius: 8,
                      fontSize: 13.5,
                      border: "1.5px solid #ef4444",
                      color: "#ef4444",
                      background: "#fff",
                    }}
                    disabled={data.length === 0}
                    onClick={handleDeleteAll}
                  >
                    <Icon.Trash size={13} color="#ef4444" /> Xóa tất cả
                  </button>
                </div>
              </div>
            )}

            {/* Grid */}
            <div
              ref={scrollRef}
              style={{ flex: 1, overflowY: "auto", padding: "0 24px 0" }}
            >
              {loading ? (
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{ height: 200 }}
                >
                  <div className="spinner-border spinner-border-sm text-primary me-2" />
                  <span className="text-secondary" style={{ fontSize: 14 }}>
                    Loading...
                  </span>
                </div>
              ) : error ? (
                <div
                  className="d-flex flex-column align-items-center justify-content-center"
                  style={{ height: 200, gap: 12 }}
                >
                  <span className="text-danger" style={{ fontSize: 14 }}>
                    {error}
                  </span>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    style={{ borderRadius: 8 }}
                    onClick={() => loadFirst(tab, search)}
                  >
                    Thử lại
                  </button>
                </div>
              ) : data.length === 0 ? (
                <div
                  className="d-flex align-items-center justify-content-center text-secondary"
                  style={{ height: 200, fontSize: 14 }}
                >
                  Không có file nào
                </div>
              ) : (
                <>
                  <div className="row">
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
                    <div className="d-flex justify-content-center py-3">
                      <div className="spinner-border spinner-border-sm text-primary" />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div
              className="px-4 py-2 d-flex align-items-center justify-content-between"
              style={{ borderTop: "1px solid #f1f5f9", flexShrink: 0 }}
            >
              <small className="text-secondary">
                {meta ? (
                  <>
                    {checked.length > 0 && (
                      <span className="ms-2 text-primary fw-semibold">
                        · {checked.length} đã chọn
                      </span>
                    )}
                  </>
                ) : (
                  ""
                )}
              </small>
              <button
                className="btn btn-light ms-auto"
                style={{ borderRadius: 8, fontSize: 13.5 }}
                onClick={onClose}
              >
                Đóng
              </button>
            </div>
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
