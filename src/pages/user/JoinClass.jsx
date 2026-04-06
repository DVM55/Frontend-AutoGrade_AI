import React, { useEffect, useRef, useState } from "react";
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

/* ─────────────── ClassCard (style ClassUser) ─────────────── */
const ClassCard = ({ item, onJoin, joiningId }) => {
  const navigate = useNavigate();
  const color = getColor(item.id);
  const { joinStatus } = item;

  return (
    <div className="cu-card" style={{ "--accent": color }}>
      {/* Banner */}
      <div className="cu-card__banner">
        <span className="cu-card__title">{item.title}</span>
      </div>

      {/* Body */}
      <div className="cu-card__body">
        <p className="cu-card__desc">
          {item.description || <em>Không có mô tả</em>}
        </p>

        <div className="cu-card__meta">
          <span className="cu-card__members">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {item.memberCount} thành viên
          </span>
          <span className="cu-card__code">{item.classCode}</span>
        </div>

        {/* BUTTON LOGIC */}
        {joinStatus === "NOT_JOINED" && (
          <button
            className="cu-btn cu-btn--primary"
            disabled={joiningId === item.id}
            onClick={() => onJoin(item)}
          >
            {joiningId === item.id ? (
              <>
                <span className="cu-spinner" /> Đang xử lý...
              </>
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Tham gia lớp
              </>
            )}
          </button>
        )}

        {joinStatus === "PENDING_APPROVAL" && (
          <div className="cu-btn cu-btn--pending">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Đang chờ phê duyệt
          </div>
        )}

        {joinStatus === "JOINED" && (
          <button
            className="cu-btn cu-btn--joined"
            onClick={() => onJoin(item)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Bạn đã tham gia — Xem lớp
          </button>
        )}
      </div>
    </div>
  );
};

/* ─────────────── JoinClass ─────────────── */
const JoinClass = () => {
  const { classCode } = useParams();
  const navigate = useNavigate();

  const [classItem, setClassItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!classCode || hasFetched.current) return;
    hasFetched.current = true;

    const fetchClass = async () => {
      try {
        setLoading(true);
        const res = await getClassByCode(classCode);
        setClassItem(res.data.data || res.data);
      } catch {
        setClassItem(null);
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [classCode]);

  const handleJoin = async (item) => {
    if (item.joinStatus === "JOINED") {
      navigate(`/user/class/${item.id}`);
      return;
    }
    try {
      setJoiningId(item.id);
      await joinClass(item.classCode);
      toast.success("Đã gửi yêu cầu tham gia lớp");
      setClassItem((prev) =>
        prev ? { ...prev, joinStatus: "PENDING_APPROVAL" } : prev,
      );
    } catch {
      toast.error("Tham gia thất bại");
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <>
      <style>{`
        /* ══ Variables ══ */
        .cu-root {
          --blue:    #1a73e8;
          --blue-lt: #e8f0fe;
          --text:    #1a1a2e;
          --muted:   #6b7280;
          --border:  #e5e7eb;
          --bg:      #f8faff;
          --card-r:  18px;
        }

        .cu-wrapper {
          background: var(--bg);
          min-height: 100vh;
        }

        .cu-root {
          min-height: calc(100dvh - var(--header-h, 0px));
          padding: 28px clamp(16px, 4vw, 32px) 48px;
          max-width: 540px;
          margin: 0 auto;
        }

        /* ══ Spinner area ══ */
        .cu-spinner-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: clamp(48px, 15vw, 120px) 16px;
          gap: 16px;
          animation: cu-fadein 0.2s both;
        }

        .cu-spin-ring {
          width: 36px;
          height: 36px;
          border: 4px solid var(--blue-lt);
          border-top-color: var(--blue);
          border-radius: 50%;
          animation: cu-spin 0.7s linear infinite;
        }

        .cu-spinner-area span {
          font-size: 15px;
          color: var(--muted);
          font-weight: 500;
        }

        @keyframes cu-spin { to { transform: rotate(360deg); } }

        /* ══ Empty / error state ══ */
        .cu-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 64px 20px;
          color: var(--muted);
          gap: 10px;
          animation: cu-fadein 0.3s both;
        }

        .cu-empty__icon {
          width: 56px; height: 56px;
          background: #fee2e2;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 4px;
          font-size: 26px;
        }

        .cu-empty__title {
          font-size: 17px;
          font-weight: 600;
          color: var(--text);
        }

        .cu-empty__sub {
          font-size: 15px;
          color: var(--muted);
        }

        /* ══ Card ══ */
        .cu-card {
          background: #fff;
          border-radius: var(--card-r);
          border: 1.5px solid var(--border);
          overflow: hidden;
          animation: cu-fadeup 0.35s both;
        }

        @keyframes cu-fadeup {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .cu-card__banner {
          height: 88px;
          background: var(--accent);
          padding: 16px 18px;
          display: flex;
          align-items: flex-start;
        }

        .cu-card__title {
          font-size: 17px;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          line-height: 1.3;
          text-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }

        .cu-card__body {
          padding: 20px 16px 16px;
        }

        .cu-card__desc {
          font-size: 15px;
          color: var(--muted);
          margin: 0 0 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-height: 20px;
          line-height: 1.5;
        }

        .cu-card__meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .cu-card__members {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 15px;
          color: var(--muted);
        }

        .cu-card__code {
          font-size: 13px;
          font-weight: 600;
          background: var(--blue-lt);
          color: var(--blue);
          padding: 3px 9px;
          border-radius: 20px;
          letter-spacing: 0.04em;
        }

        /* ══ Buttons ══ */
        .cu-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 14px;
          border-radius: 9px;
          font-size: 15px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: opacity 0.18s, transform 0.15s;
        }
        .cu-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.9; }
        .cu-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .cu-btn--primary { background: var(--blue); color: #fff; }

        .cu-btn--pending {
          background: #fff8e1;
          color: #b45309;
          border: 1px solid #fde68a;
          cursor: default;
        }

        .cu-btn--joined {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #6ee7b7;
        }
        .cu-btn--joined:hover { opacity: 0.85; transform: translateY(-1px); }

        /* ══ Button spinner ══ */
        .cu-spinner {
          width: 13px; height: 13px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: cu-spin 0.65s linear infinite;
          flex-shrink: 0;
          display: inline-block;
        }

        @keyframes cu-fadein {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 480px) {
          .cu-root { padding: 20px 12px 40px; }
        }
      `}</style>

      <div className="cu-wrapper">
        <div className="cu-root">
          {/* ── Loading ── */}
          {loading && <></>}

          {/* ── Not found ── */}
          {!loading && !classItem && (
            <div className="cu-empty">
              <div className="cu-empty__icon">❌</div>
              <div className="cu-empty__title">Lớp không tồn tại</div>
            </div>
          )}

          {/* ── Card ── */}
          {!loading && classItem && (
            <ClassCard
              item={classItem}
              onJoin={handleJoin}
              joiningId={joiningId}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default JoinClass;
