import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getClassByCode } from "../../service/class.service";
import { joinClass } from "../../service/classMember.service";

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

const ClassCard = ({ item, onJoin, joiningId }) => {
  const color = getColor(item.id);
  const initials = item.title?.slice(0, 2).toUpperCase() || "??";
  const { joinStatus } = item;

  return (
    <div
      className="card border-0 shadow-sm overflow-hidden"
      style={{ borderRadius: 16 }}
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
          }}
        >
          {initials}
        </div>
      </div>

      <div className="card-body pt-4 pb-3 px-3">
        <p className="text-muted mb-2" style={{ fontSize: 13 }}>
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
            }}
          >
            {item.classCode}
          </span>
        </div>

        {/* BUTTON LOGIC */}
        {joinStatus === "NOT_JOINED" && (
          <button
            className="btn btn-primary btn-sm w-100"
            disabled={joiningId === item.id}
            onClick={() => onJoin(item)}
          >
            {joiningId === item.id ? "Đang xử lý..." : "Tham gia lớp"}
          </button>
        )}

        {joinStatus === "PENDING_APPROVAL" && (
          <button
            className="btn btn-sm w-100"
            style={{
              background: "#fff8e1",
              color: "#f59e0b",
              border: "1px solid #fde68a",
            }}
            disabled
          >
            Đang chờ phê duyệt
          </button>
        )}

        {joinStatus === "JOINED" && (
          <button
            className="btn btn-success btn-sm w-100"
            onClick={() => onJoin(item)}
          >
            Bạn đã tham gia - Xem lớp
          </button>
        )}
      </div>
    </div>
  );
};

const JoinClass = () => {
  const { classCode } = useParams();
  const navigate = useNavigate();

  const [classItem, setClassItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);

  useEffect(() => {
    if (!classCode) return;

    const fetchClass = async () => {
      try {
        setLoading(true);
        const res = await getClassByCode(classCode);

        // Nếu backend trả ApiResponse thì dùng res.data.data
        setClassItem(res.data.data || res.data);
      } catch (error) {
        setClassItem(null);
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [classCode]);

  const handleJoin = async (item) => {
    try {
      // ✅ Nếu đã tham gia → chuyển sang trang lớp
      if (item.joinStatus === "JOINED") {
        navigate(`/user/class/${item.id}`);
        return;
      }

      // ✅ Nếu chưa tham gia → gọi API join
      setJoiningId(item.id);

      await joinClass(item.classCode);

      toast.success("Đã gửi yêu cầu tham gia lớp");

      setClassItem((prev) =>
        prev ? { ...prev, joinStatus: "PENDING_APPROVAL" } : prev,
      );
    } catch (error) {
      toast.error("Tham gia thất bại");
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 600 }}>
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" />
          <div className="text-muted mt-2">Đang tải lớp...</div>
        </div>
      ) : !classItem ? (
        <div className="text-center text-muted">
          <div style={{ fontSize: 60 }}>❌</div>
          <div className="fw-semibold mt-3">Lớp không tồn tại</div>
        </div>
      ) : (
        <ClassCard item={classItem} onJoin={handleJoin} joiningId={joiningId} />
      )}
    </div>
  );
};

export default JoinClass;
