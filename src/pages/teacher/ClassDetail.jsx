import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getClassById } from "../../service/class.service";
import ClassMember from "./ClassMember";
import ClassMemberPending from "./ClassMemberPending";
import Document from "./Document";

const ClassDetail = () => {
  const { classId } = useParams();

  const [activeTab, setActiveTab] = useState("students");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await getClassById(classId);
        setClassInfo(res.data);
      } catch (error) {
        console.error("Fetch class detail error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClass();
  }, [classId]);

  if (loading) return <></>;

  if (!classInfo)
    return (
      <>
        <style>{spinnerStyle}</style>
        <div className="cu-spinner-area">
          <div className="cu-inline-spinner">
            <span>Không tìm thấy lớp</span>
          </div>
        </div>
      </>
    );

  const joinLink = `http://localhost:5173/user/join/class/${classInfo.classCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classInfo.classCode).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 500);
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinLink).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 500);
    });
  };

  const TABS = [
    { key: "students", label: "Thành viên", icon: "bi-people" },
    { key: "approval", label: "Phê duyệt", icon: "bi-person-check" },
    { key: "exams", label: "Bài kiểm tra", icon: "bi-journal-check" },
    { key: "documents", label: "Tài liệu", icon: "bi-folder2-open" },
  ];

  return (
    <>
      <style>{pageStyle}</style>

      <div className="cd-wrapper">
        <div className="cd-root">
          {/* ── Header ── */}
          <div className="cd-header">
            <div className="cd-header__top">
              <h4 className="cd-header__title">{classInfo.title}</h4>

              <button
                className="cd-share-btn"
                onClick={() => setShowShareModal(true)}
              >
                <i className="bi bi-share-fill" />
                <span className="cd-share-btn__label">Chia sẻ lớp</span>
              </button>
            </div>

            <p className="cd-header__desc">
              {classInfo.description || "Không có mô tả"}
            </p>
          </div>

          {/* ── Tabs ── */}
          <div className="cd-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`cd-tab-btn ${activeTab === tab.key ? "cd-tab-btn--active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <i className={`bi ${tab.icon}`} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── Tab Content ── */}
          <div className="cd-content">
            {activeTab === "students" && (
              <ClassMember classId={classInfo?.id} />
            )}
            {activeTab === "approval" && (
              <ClassMemberPending classId={classInfo?.id} />
            )}
            {activeTab === "exams" && (
              <div className="cd-empty-card">
                <div style={{ fontSize: 44 }}>📝</div>
                <div className="cd-empty-card__text">
                  Chưa có bài kiểm tra nào
                </div>
              </div>
            )}
            {activeTab === "documents" && <Document classId={classInfo?.id} />}
          </div>
        </div>
      </div>

      {/* ── Share Modal ── */}
      {showShareModal && (
        <>
          <div
            className="cd-backdrop"
            onClick={() => setShowShareModal(false)}
          />
          <div className="cd-modal-wrap">
            <div className="cd-modal">
              <div className="cd-modal__header">
                <button
                  className="cd-modal__close"
                  onClick={() => setShowShareModal(false)}
                  aria-label="Đóng"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="cd-modal__body">
                {/* Mã lớp */}
                <div className="cd-modal__section">
                  <label className="cd-modal__label">Mã lớp</label>
                  <div className="cd-modal__row">
                    <div className="cd-code-box">{classInfo.classCode}</div>
                    <button
                      className={`cd-copy-btn ${copiedCode ? "cd-copy-btn--done" : ""}`}
                      onClick={handleCopyCode}
                      title="Sao chép"
                    >
                      {copiedCode ? (
                        <i className="bi bi-check2" />
                      ) : (
                        <i className="bi bi-copy" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Join Link */}
                <div className="cd-modal__section">
                  <label className="cd-modal__label">Đường dẫn tham gia</label>
                  <div className="cd-modal__row">
                    <div className="cd-code-box cd-code-box--link">
                      {joinLink}
                    </div>
                    <button
                      className={`cd-copy-btn ${copiedLink ? "cd-copy-btn--done" : ""}`}
                      onClick={handleCopyLink}
                      title="Sao chép"
                    >
                      {copiedLink ? (
                        <i className="bi bi-check2" />
                      ) : (
                        <i className="bi bi-copy" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="cd-modal__footer">
                <button
                  className="cd-modal__close-btn"
                  onClick={() => setShowShareModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

/* ── Spinner ── */
const spinnerStyle = `
  .cu-spinner-area {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(48px, 15vw, 120px) 16px;
    box-sizing: border-box;
  }
  .cu-inline-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    animation: cu-fadein 0.2s both;
  }
  .cu-spin-ring {
    width: clamp(30px, 8vw, 30px);
    height: clamp(30px, 8vw, 30px);
    border: 4px solid #e8f0fe;
    border-top-color: #1a73e8;
    border-radius: 50%;
    animation: cu-spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  .cu-inline-spinner span {
    font-size: clamp(16px, 3vw, 16px);
    color: #6b7280;
    font-weight: 500;
  }
  @keyframes cu-spin { to { transform: rotate(360deg); } }
  @keyframes cu-fadein {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ── Page styles ── */
const pageStyle = `
  ${spinnerStyle}

  .cd-wrapper {
    --blue:    #1a73e8;
    --blue-lt: #e8f0fe;
    --text:    #1a1a2e;
    --muted:   #6b7280;
    --border:  #e5e7eb;
    --bg:      #f8faff;
    
    min-height: 100vh;
  }

  .cd-root {
    max-width: 1100px;
    box-sizing: border-box;
  }

  /* ══ Header ══ */
  .cd-header {
    margin-bottom: 18px;
  }

  .cd-header__top {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    min-width: 0;
  }

  .cd-header__title {
    flex: 1 1 0;
    min-width: 0;
    font-size: clamp(16px, 3.2vw, 16px);
    font-weight: 700;
    margin: 0;
    color: var(--muted);
    white-space: normal;
    word-break: break-word;
  }

  .cd-share-btn {
    flex-shrink: 0;
    display: flex; align-items: center; gap: 6px;
    padding: 7px 12px;
    background: var(--blue);
    color: #fff;
    border: none; border-radius: 8px;
    font-size: clamp(16px, 2.3vw, 16px);
    font-weight: 600;
    cursor: pointer;
    transition: background 0.18s, transform 0.15s;
    white-space: nowrap;
  }
  .cd-share-btn:hover { background: #1557b0; transform: translateY(-1px); }

  @media (max-width: 479px) {
    .cd-share-btn__label { display: none; }
    .cd-share-btn { padding: 7px 9px; flex: 0 0 auto; width: auto; }
    .cd-header__title { white-space: normal; overflow: visible; text-overflow: unset; }
  }

  .cd-header__desc {
    font-size: clamp(15px, 2.5vw, 15px);
    color: var(--muted);
    line-height: 1.5;
  }

  /* ══ Tabs ══ */
  .cd-tabs {
    display: flex;
    border-bottom: 2px solid var(--border);
    margin-bottom: 20px;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    min-width: 0;
  }
  .cd-tabs::-webkit-scrollbar { display: none; }

  .cd-tab-btn {
    display: flex; align-items: center; gap: 4px;
    padding: 9px clamp(6px, 2vw, 14px);
    background: transparent;
    border: none;
    border-bottom: 2.5px solid transparent;
    margin-bottom: -2px;
    font-size: clamp(16px, 2.5vw, 16px);
    font-weight: 400;
    color: #141516;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: color 0.15s, border-color 0.15s;
  }
  @media (max-width: 339px) {
    .cd-tab-btn i { display: none; }
  }
  .cd-tab-btn--active {
    color: var(--blue);
    border-bottom-color: var(--blue);
  }
  .cd-tab-btn:hover:not(.cd-tab-btn--active) { color: var(--text); }

  /* ══ Content ══ */
  .cd-content { animation: cu-fadein 0.25s both; }

  /* ══ Empty card ══ */
  .cd-empty-card {
    background: #fff;
    border: 1.5px solid var(--border);
    border-radius: 12px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 40px 16px;
    gap: 8px;
  }
  .cd-empty-card__text {
    font-size: 16px; font-weight: 600; color: var(--muted);
  }

  /* ══ Backdrop ══ */
  .cd-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 1040;
    animation: cu-fadein 0.2s both;
  }

  /* ══ Modal ══ */
  .cd-modal-wrap {
    position: fixed; inset: 0;
    display: flex; align-items: center; justify-content: center;
    z-index: 1050;
    padding: 10px;
    box-sizing: border-box;
  }

  .cd-modal {
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.18);
    width: 100%;
    max-width: 460px;
    min-width: 0;
    box-sizing: border-box;
    animation: cu-fadeup 0.25s both;
  }

  .cd-modal__header {
    display: flex; align-items: center; justify-content: flex-end;
    padding: 16px 16px 10px;
    gap: 8px;
  }
  .cd-modal__close {
    flex-shrink: 0;
    width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    background: none; border: none; cursor: pointer;
    color: var(--muted); border-radius: 6px;
    transition: background 0.15s, color 0.15s;
  }
  .cd-modal__close:hover { background: #f3f4f6; color: var(--text); }

  .cd-modal__body { padding: 0 16px 12px; }

  .cd-modal__section { margin-bottom: 16px; }

  .cd-modal__label {
    display: block;
    font-size: 16px; font-weight: 600;
    color: var(--muted); letter-spacing: 0.07em;
    margin-bottom: 6px;
  }

  .cd-modal__row {
    display: flex;
    gap: 7px;
    align-items: stretch;
    flex-wrap: nowrap;
  }

  .cd-code-box {
    flex: 1 1 0;
    min-width: 0;
    text-align: center;
    font-size: clamp(16px, 4vw, 16px);
    font-weight: 700;
    color: var(--blue);
    background: var(--blue-lt);
    border: 2px dashed #667eea;
    border-radius: 9px;
    padding: 8px 6px;
    letter-spacing: clamp(1px, 0.8vw, 4px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cd-code-box--link {
    letter-spacing: 0;
    font-size: 16px;
    font-weight: 400;
    color: var(--text);
  }

  .cd-copy-btn {
    flex-shrink: 0;
    width: 38px;
    height: auto;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px;
    border: 1.5px solid var(--blue);
    background: #fff; color: var(--blue);
    font-size: 16px;
    cursor: pointer;
    transition: all 0.18s;
  }
  .cd-copy-btn:hover:not(.cd-copy-btn--done) { background: var(--blue-lt); }
  .cd-copy-btn--done,
  .cd-copy-btn--done:hover { background: #16a34a; color: #fff; border-color: #16a34a; }

  .cd-modal__footer {
    padding: 4px 16px 16px;
    display: flex; justify-content: flex-end;
  }
  .cd-modal__close-btn {
    padding: 8px 16px;
    border-radius: 8px;
    border: 1.5px solid var(--border);
    background: #fff; color: var(--muted);
    font-size: clamp(16px, 2.5vw, 16px); font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .cd-modal__close-btn:hover { background: #f3f4f6; color: var(--text); }

  @keyframes cu-fadeup {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export default ClassDetail;
