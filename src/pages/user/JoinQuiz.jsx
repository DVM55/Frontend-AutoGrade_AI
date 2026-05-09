import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizByCode } from "../../service/quiz.service";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* Thay đổi trong STYLES, phần .jq-root */

.jq-root {
  min-height: 100vh;
  background: #f0f4ff;
  display: flex;
  align-items: flex-start;   /* giữ flex-start */
  justify-content: center;
  padding: 40px 24px 40px;   /* ← giảm padding-top từ 100px xuống 40px */
  position: relative;
  overflow: hidden;
}

  .jq-root::before, .jq-root::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.35;
    pointer-events: none;
  }
  .jq-root::before {
    width: 400px; height: 400px;
    background: radial-gradient(circle, #93c5fd, #2563eb);
    top: -100px; left: -100px;
  }
  .jq-root::after {
    width: 350px; height: 350px;
    background: radial-gradient(circle, #a5b4fc, #4f46e5);
    bottom: -80px; right: -80px;
  }

  .jq-card {
    width: 100%;
    max-width: 480px;
    background: #fff;
    border-radius: 24px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 20px 60px rgba(37,99,235,0.12), 0 4px 20px rgba(0,0,0,0.06);
    overflow: hidden;
    position: relative;
    z-index: 1;
    animation: jq-fadeup 0.4s ease both;
  }
  @keyframes jq-fadeup {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .jq-header {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    padding: 28px 28px 24px;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .jq-header-icon {
    width: 48px; height: 48px;
    background: rgba(255,255,255,0.18);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    backdrop-filter: blur(4px);
  }
  .jq-header-title {
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    line-height: 1.3;
  }
  .jq-header-sub {
    font-size: 12px;
    color: rgba(255,255,255,0.7);
    margin-top: 2px;
  }

  .jq-body { padding: 28px; }

  .jq-loading {
    display: flex; flex-direction: column;
    align-items: center; gap: 14px;
    padding: 20px 0;
  }
  .jq-spinner {
    width: 36px; height: 36px;
    border: 3px solid #eff6ff;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: jq-spin 0.7s linear infinite;
  }
  @keyframes jq-spin { to { transform: rotate(360deg); } }
  .jq-loading-text { font-size: 13px; color: #94a3b8; }

  .jq-error {
    text-align: center; padding: 12px 0 4px;
  }
  .jq-error-icon {
    width: 52px; height: 52px;
    background: #fef2f2;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 12px;
  }
  .jq-error-title { font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 6px; }
  .jq-error-msg { font-size: 13px; color: #94a3b8; line-height: 1.5; }

  .jq-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 20px;
  }
  .jq-info-box {
    background: #f8faff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px 14px;
  }
  .jq-info-label {
    font-size: 11px;
    color: #94a3b8;
    font-weight: 500;
    margin-bottom: 4px;
    display: flex; align-items: center; gap: 5px;
  }
  .jq-info-value {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
  }

  .jq-quiz-title {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 20px;
    line-height: 1.3;
  }

  .jq-divider {
    height: 1px;
    background: #f1f5f9;
    margin: 0 0 20px;
  }

  .jq-btn {
    width: 100%;
    padding: 13px;
    border-radius: 12px;
    border: none;
    font-family: 'Be Vietnam Pro', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity .15s, transform .15s, box-shadow .15s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .jq-btn--primary {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #fff;
    box-shadow: 0 4px 14px rgba(37,99,235,0.35);
  }
  .jq-btn--primary:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(37,99,235,0.45);
    transform: translateY(-1px);
  }
  .jq-btn--primary:active:not(:disabled) { transform: scale(0.98); }
  .jq-btn--primary:disabled { opacity: 0.45; cursor: not-allowed; }
  .jq-btn--secondary {
    background: #f1f5f9;
    color: #475569;
    margin-top: 10px;
  }
  .jq-btn--secondary:hover { background: #e2e8f0; }

  @media (max-width: 480px) {
    .jq-header { padding: 22px 20px 18px; }
    .jq-body { padding: 20px; }
  }
`;

const getStatus = (startTime, endTime) => {
  const now = new Date();
  const start = startTime ? new Date(startTime) : null;
  const end = endTime ? new Date(endTime) : null;
  if (end && now > end) return "ended";
  if (start && now < start) return "upcoming";
  return "active";
};

const IconQuiz = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const IconClock = ({ size = 14, color = "#94a3b8" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconRepeat = ({ size = 14, color = "#94a3b8" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

const IconArrow = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconAlert = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#ef4444"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const JoinQuiz = () => {
  const { quizCode } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!document.getElementById("jq-styles")) {
      const el = document.createElement("style");
      el.id = "jq-styles";
      el.textContent = STYLES;
      document.head.appendChild(el);
    }
  }, []);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getQuizByCode(quizCode);
        setQuiz(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Không tìm thấy bài kiểm tra. Vui lòng kiểm tra lại mã.",
        );
      } finally {
        setLoading(false);
      }
    };
    if (quizCode) fetchQuiz();
  }, [quizCode]);

  const status = quiz ? getStatus(quiz.startTime, quiz.endTime) : null;
  const canJoin = status === "active";

  return (
    <div className="jq-root">
      <div className="jq-card">
        {/* Header */}
        <div className="jq-header">
          <div className="jq-header-icon">
            <IconQuiz />
          </div>
          <div>
            <div className="jq-header-title">Tham gia bài kiểm tra</div>
            <div className="jq-header-sub">Mã: {quizCode}</div>
          </div>
        </div>

        {/* Body */}
        <div className="jq-body">
          {loading && (
            <div className="jq-loading">
              <div className="jq-spinner" />
              <div className="jq-loading-text">
                Đang tải thông tin bài kiểm tra...
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="jq-error">
              <div className="jq-error-icon">
                <IconAlert />
              </div>
              <div className="jq-error-title">Không tìm thấy bài kiểm tra</div>
              <div className="jq-error-msg">{error}</div>
              <div
                style={{ height: 1, background: "#f1f5f9", margin: "20px 0" }}
              />
              <button
                className="jq-btn jq-btn--secondary"
                onClick={() => navigate(-1)}
              >
                Quay lại
              </button>
            </div>
          )}

          {!loading && quiz && (
            <>
              <div className="jq-quiz-title">{quiz.title}</div>

              <div className="jq-divider" />

              <div className="jq-info-grid">
                <div className="jq-info-box">
                  <div className="jq-info-label">
                    <IconClock color="#94a3b8" /> Thời gian
                  </div>
                  <div className="jq-info-value">
                    {quiz.durationMinutes
                      ? `${quiz.durationMinutes} phút`
                      : "—"}
                  </div>
                </div>

                <div className="jq-info-box">
                  <div className="jq-info-label">
                    <IconRepeat color="#94a3b8" /> Số lần thi
                  </div>
                  <div className="jq-info-value">
                    {quiz.maxAttempts
                      ? `${quiz.maxAttempts} lần`
                      : "Không giới hạn"}
                  </div>
                </div>
              </div>

              <button
                className="jq-btn jq-btn--primary"
                disabled={!canJoin}
                onClick={() => navigate(`/user/quiz/${quiz.id}/start`)}
              >
                {canJoin ? (
                  <>
                    <span>Bắt đầu làm bài</span>
                    <IconArrow />
                  </>
                ) : status === "upcoming" ? (
                  "Chưa đến giờ mở bài"
                ) : (
                  "Bài kiểm tra đã kết thúc"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinQuiz;
