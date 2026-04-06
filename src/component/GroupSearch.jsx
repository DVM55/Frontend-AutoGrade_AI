import { useState, useRef, useCallback } from "react";
import { getGroup } from "../service/group.service";

const Spinner = () => (
  <>
    <div
      style={{
        width: "22px",
        height: "22px",
        margin: "0 auto",
        border: "2.5px solid #e9ecef",
        borderTop: "2.5px solid #3d3a8c",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </>
);

const GroupSearch = ({ value, onConfirm, onClose }) => {
  const [groupSearch, setGroupSearch] = useState("");
  const [groups, setGroups] = useState([]);
  const [groupLoading, setGroupLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedTemp, setSelectedTemp] = useState(value);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchGroups = async (name = "", pageNum = 0, isAppend = false) => {
    if (pageNum === 0) setGroupLoading(true);
    else setLoadingMore(true);

    try {
      const res = await getGroup({
        page: pageNum,
        size: 10,
        name: name || undefined,
      });

      const newItems = res.data;
      const meta = res.meta;

      setGroups((prev) => (isAppend ? [...prev, ...newItems] : newItems));
      setHasMore(meta.currentPage < meta.totalPages);
    } catch {
      if (!isAppend) setGroups([]);
    } finally {
      setGroupLoading(false);
      setLoadingMore(false);
    }
  };

  useState(() => {
    fetchGroups("", 0, false);
  }, []);

  const timerRef = useRef(null);
  const handleSearch = (e) => {
    const val = e.target.value;
    setGroupSearch(val);
    setPage(0);
    setHasMore(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchGroups(val, 0, false), 200);
  };

  const listRef = useRef(null);
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || loadingMore || !hasMore) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 30;
    if (nearBottom) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchGroups(groupSearch, nextPage, true);
    }
  }, [loadingMore, hasMore, page, groupSearch]);

  const IconSearch = () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#adb5bd"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 1200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "300px",
          height: "420px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search */}
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1.5px solid #f0f0f0",
            flexShrink: 0,
          }}
        >
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <IconSearch />
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={groupSearch}
              onChange={handleSearch}
              autoFocus
              style={{
                width: "100%",
                padding: "7px 12px 7px 32px",
                border: "1.5px solid #e9ecef",
                borderRadius: "8px",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3d3a8c";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e9ecef";
              }}
            />
          </div>
        </div>

        {/* List */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}
        >
          {groupLoading ? (
            <div style={{ padding: "20px", textAlign: "center" }}>
              <Spinner />
            </div>
          ) : groups.length === 0 ? (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "#adb5bd",
                fontSize: "16px",
              }}
            >
              Không có dữ liệu
            </div>
          ) : (
            <>
              {groups.map((group) => {
                const isSelected = selectedTemp?.id === group.id;
                return (
                  <div
                    key={group.id}
                    onClick={() => setSelectedTemp(group)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "9px 16px",
                      cursor: "pointer",
                      background: isSelected ? "#f0effc" : "transparent",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background = "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span
                      style={{
                        width: "14px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {isSelected && (
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#3d3a8c"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      )}
                    </span>
                    <div
                      style={{
                        width: "17px",
                        height: "17px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        border: isSelected
                          ? "5px solid #3d3a8c"
                          : "1.5px solid #adb5bd",
                        transition: "border 0.15s",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "16px",
                        color: "#212529",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {group.name}
                    </span>
                  </div>
                );
              })}

              {loadingMore && (
                <div style={{ padding: "10px", textAlign: "center" }}>
                  <Spinner />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1.5px solid #f0f0f0",
            flexShrink: 0,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={() => onConfirm(selectedTemp)}
            style={{
              background: "#3d3a8c",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "16px",
              fontWeight: 600,
              padding: "7px 20px",
              cursor: "pointer",
            }}
          >
            Chọn
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupSearch;
