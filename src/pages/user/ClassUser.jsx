import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getClasses, getClassByCode } from "../../service/class.service";

const COLORS = [
  "#1a73e8",
  "#0f9d58",
  "#f4511e",
  "#7986cb",
  "#e67c73",
  "#33b679",
  "#8e24aa",
  "#039be5",
  "#f6bf26",
  "#616161",
];

const getColor = (id) => COLORS[id % COLORS.length];

// joinStatus chỉ có ở kết quả tìm kiếm, không có ở danh sách lớp đã tham gia
const canViewDetail = (item) =>
  !item.joinStatus || item.joinStatus === "JOINED";

const ClassCard = ({ item, onJoin, joiningId }) => {
  const navigate = useNavigate();
  const color = getColor(item.id);
  const initials = item.title?.slice(0, 2).toUpperCase() || "??";
  const { joinStatus } = item;
  const viewable = canViewDetail(item);

  const handleCardClick = () => {
    if (viewable) navigate(`${item.id}`);
  };

  return (
    <div
      className="card border-0 shadow-sm h-100 overflow-hidden"
      style={{
        borderRadius: 16,
        cursor: viewable ? "pointer" : "default",
        transition: "transform .15s, box-shadow .15s",
      }}
      onClick={handleCardClick}
      onMouseEnter={(e) => {
        if (!viewable) return;
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {/* Banner */}
      <div
        style={{
          height: 80,
          background: color,
          position: "relative",
          padding: "14px 16px",
        }}
      >
        <div
          className="fw-bold text-white text-truncate"
          style={{ fontSize: 17, maxWidth: "75%" }}
        >
          {item.title}
        </div>
        {/* Avatar circle */}
        <div
          className="position-absolute d-flex align-items-center justify-content-center text-white fw-bold"
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            bottom: -20,
            right: 16,
            fontSize: 18,
            border: "3px solid #fff",
            letterSpacing: 1,
          }}
        >
          {initials}
        </div>
      </div>

      {/* Body */}
      <div className="card-body pt-4 pb-3 px-3">
        <p
          className="text-muted text-truncate mb-2"
          style={{ fontSize: 13, minHeight: 20 }}
        >
          {item.description || (
            <span className="fst-italic">Không có mô tả</span>
          )}
        </p>

        <div className="d-flex align-items-center justify-content-between mb-3">
          <span
            className="text-muted d-flex align-items-center gap-1"
            style={{ fontSize: 12 }}
          >
            <i className="bi bi-people" />
            {item.memberCount} thành viên
          </span>
          <span
            className="badge rounded-pill"
            style={{
              background: "#f1f3f4",
              color: "#5f6368",
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            {item.classCode}
          </span>
        </div>

        {/* Action buttons — chỉ hiện khi có joinStatus (kết quả search) và chưa JOINED */}
        {joinStatus === "NOT_JOINED" && (
          <button
            className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
            style={{ borderRadius: 8, fontSize: 13 }}
            disabled={joiningId === item.id}
            onClick={(e) => {
              e.stopPropagation();
              onJoin(item);
            }}
          >
            {joiningId === item.id ? (
              <>
                <span className="spinner-border spinner-border-sm" /> Đang xử
                lý...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right" /> Tham gia lớp
              </>
            )}
          </button>
        )}

        {joinStatus === "PENDING_APPROVAL" && (
          <button
            className="btn btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
            style={{
              borderRadius: 8,
              fontSize: 13,
              background: "#fff8e1",
              color: "#f59e0b",
              border: "1px solid #fde68a",
            }}
            disabled
          >
            <i className="bi bi-hourglass-split" />
            Đang chờ phê duyệt
          </button>
        )}
      </div>
    </div>
  );
};

const ClassUser = () => {
  const [classes, setClasses] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchCode, setSearchCode] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [joiningId, setJoiningId] = useState(null);

  const fetchClasses = async (p = 0) => {
    try {
      setLoading(true);
      const res = await getClasses({ page: p, size: 9 });
      const data = res.data;
      setClasses(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setPage(data.number || 0);
    } catch {
      toast.error("Không thể tải danh sách lớp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses(0);
  }, []);

  const handleSearch = async () => {
    const code = searchCode.trim();
    if (!code) {
      setSearchResult(null);
      fetchClasses(0);
      return;
    }
    try {
      setSearching(true);
      const res = await getClassByCode(code);
      setSearchResult(res.data);
    } catch {
      setSearchResult(null);
      setClasses([]);
      setTotalPages(0);
      setTotalElements(0);
      setPage(0);
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchCode("");
    setSearchResult(null);
    fetchClasses(0);
  };

  // TODO: gọi API join class thực tế ở đây
  const handleJoin = async (item) => {
    try {
      setJoiningId(item.id);
      // await joinClass(item.id);
      toast.success("Đã gửi yêu cầu tham gia lớp");
      // Cập nhật trạng thái sang PENDING_APPROVAL sau khi gửi
      setSearchResult((prev) =>
        prev ? { ...prev, joinStatus: "PENDING_APPROVAL" } : prev,
      );
    } catch {
      toast.error("Tham gia thất bại");
    } finally {
      setJoiningId(null);
    }
  };

  const displayList = searchResult ? [searchResult] : classes;
  const isSearchMode = !!searchResult;

  return (
    <div className="container-fluid py-4 px-4" style={{ maxWidth: 1100 }}>
      {/* Header row */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold mb-0" style={{ color: "#1a1a2e" }}>
            Danh sách lớp
          </h4>
          <span className="text-muted" style={{ fontSize: 13 }}>
            {isSearchMode ? (
              <>
                Kết quả tìm kiếm cho <strong>"{searchCode}"</strong>
              </>
            ) : (
              <>{totalElements} lớp học</>
            )}
          </span>
        </div>

        {/* Search bar */}
        <div className="d-flex align-items-center gap-2">
          <div className="input-group" style={{ width: 280 }}>
            <span
              className="input-group-text bg-white border-end-0"
              style={{ borderRadius: "10px 0 0 10px" }}
            >
              <i className="bi bi-search text-muted" style={{ fontSize: 13 }} />
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Nhập mã lớp..."
              value={searchCode}
              style={{ borderRadius: 0, fontSize: 14 }}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {searchCode && (
              <button
                className="btn btn-outline-secondary border-start-0"
                style={{ borderRadius: "0 10px 10px 0" }}
                onClick={handleClearSearch}
              >
                <i className="bi bi-x" />
              </button>
            )}
          </div>
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            style={{ borderRadius: 10, fontSize: 14, whiteSpace: "nowrap" }}
            onClick={handleSearch}
            disabled={searching}
          >
            {searching ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              <i className="bi bi-search" />
            )}
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
          <div className="text-muted mt-2" style={{ fontSize: 14 }}>
            Đang tải...
          </div>
        </div>
      ) : displayList.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <div style={{ fontSize: 56 }}>📭</div>
          <div className="fw-semibold mt-2">Không có lớp nào</div>
          <div style={{ fontSize: 13 }}>Thử tìm kiếm bằng mã lớp</div>
        </div>
      ) : (
        <div className="row g-3">
          {displayList.map((item) => (
            <div key={item.id} className="col-12 col-sm-6 col-lg-4">
              <ClassCard
                item={item}
                onJoin={handleJoin}
                joiningId={joiningId}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isSearchMode && totalPages > 1 && (
        <div className="d-flex align-items-center justify-content-center gap-3 mt-4">
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page === 0}
            onClick={() => fetchClasses(page - 1)}
          >
            ← Trước
          </button>
          <span className="text-muted" style={{ fontSize: 13 }}>
            Trang {page + 1} / {totalPages}
          </span>
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page + 1 >= totalPages}
            onClick={() => fetchClasses(page + 1)}
          >
            Tiếp →
          </button>
        </div>
      )}
    </div>
  );
};

export default ClassUser;
