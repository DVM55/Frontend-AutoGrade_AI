import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getQuizDetailById,
  getQuizHistoryResult,
} from "../../service/quiz.service";
import QuizStart from "./QuizStart";

const QuizDetailUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const size = 10;

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await getQuizDetailById(id);
        setQuiz(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const fetchHistory = async (page = 0) => {
    try {
      setHistoryLoading(true);
      const res = await getQuizHistoryResult(id, page, size);
      console.log("Quiz history result:", res);
      setHistory(res.data || []);
      setTotalPages(res.meta?.totalPages || 0);
      setTotalElements(res.meta?.totalItems || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error(error);
      setHistory([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (showQuiz) {
    return (
      <QuizStart
        quizId={id}
        onExit={() => {
          setShowQuiz(false);
          fetchHistory(0);
        }}
      />
    );
  }

  useEffect(() => {
    if (id) fetchHistory(0);
  }, [id]);

  const formatDateTime = (dt) => {
    if (!dt) return "—";
    const d = new Date(dt);
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "—";
    if (minutes < 60) return `${minutes} phút`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h} giờ ${m} phút` : `${h} giờ`;
  };

  if (loading) return <></>;

  if (!quiz)
    return (
      <>
        <style>{pageStyle}</style>
        <div className="qd-wrapper">
          <div className="qd-root">
            <div className="qd-empty">
              <div className="qd-empty__icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1a73e8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <div className="qd-empty__title">Không tìm thấy bài kiểm tra</div>
              <div className="qd-empty__sub">
                Bài kiểm tra không tồn tại hoặc đã bị xoá
              </div>
            </div>
          </div>
        </div>
      </>
    );

  const now = new Date();
  const isExpired = quiz.endTime && new Date(quiz.endTime) < now;
  const canStart =
    !isExpired &&
    (quiz?.maxAttempts == null || totalElements < quiz.maxAttempts);

  const INFO_ROWS = [
    {
      icon: (
        <svg
          width="16"
          height="16"
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
      ),
      label: "Thời gian làm bài",
      value: formatDuration(quiz.durationMinutes),
    },
    {
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      ),
      label: "Số lần làm tối đa",
      value:
        quiz.maxAttempts != null ? `${quiz.maxAttempts} lần` : "Không giới hạn",
    },
    {
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      label: "Thời gian bắt đầu",
      value: formatDateTime(quiz.startTime),
    },
    {
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="9" y1="16" x2="15" y2="16" />
        </svg>
      ),
      label: "Thời gian kết thúc",
      value: formatDateTime(quiz.endTime),
    },
  ];

  return (
    <>
      <style>{pageStyle}</style>
      <div className="qd-wrapper">
        <div className="qd-root">
          {/* ── Banner card ── */}
          <div className="qd-banner-card">
            <div className="qd-banner">
              <h2 className="qd-banner__title">{quiz.title}</h2>
            </div>
            <div className="qd-banner__body">
              {quiz.description && (
                <p className="qd-banner__desc">{quiz.description}</p>
              )}
              {isExpired ? (
                <button
                  className="qd-start-btn qd-start-btn--disabled"
                  disabled
                >
                  Hết hạn
                </button>
              ) : (
                canStart && (
                  <button
                    className="qd-start-btn"
                    onClick={() => navigate(`/user/quiz/${id}/start`)}
                  >
                    {totalElements > 0 ? "Làm lại" : "Làm bài"}
                  </button>
                )
              )}
            </div>
          </div>

          {/* ── Info grid ── */}
          <div className="qd-info-grid">
            {INFO_ROWS.map((row) => (
              <div key={row.label} className="qd-info-cell">
                <div className="qd-info-cell__icon">{row.icon}</div>
                <div className="qd-info-cell__label">{row.label}</div>
                <div className="qd-info-cell__value">{row.value}</div>
              </div>
            ))}
          </div>

          {/* ── Lịch sử làm bài ── */}
          <div className="qd-section">
            <div className="qd-section__title">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1a73e8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Lịch sử làm bài
            </div>

            {historyLoading ? (
              <></>
            ) : history.length === 0 ? (
              <div className="qd-empty">
                <div className="qd-empty__icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1a73e8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="qd-empty__title">Chưa có lần làm bài nào</div>
                <div className="qd-empty__sub">
                  Nhấn làm bài để bắt đầu lần đầu tiên
                </div>
              </div>
            ) : (
              <>
                <div className="qd-history-list">
                  {history.map((attempt, idx) => (
                    <div
                      key={attempt.id}
                      className={`qd-history-item${attempt.allowReview ? " qd-history-item--clickable" : ""}`}
                      onClick={() =>
                        attempt.allowReview &&
                        navigate(`/user/quiz-attempt/review/${attempt.id}`)
                      }
                    >
                      <div className="qd-history-item__left">
                        <div className="qd-history-item__index">
                          #{currentPage * size + idx + 1}
                        </div>
                        <div className="qd-history-item__info">
                          <div className="qd-history-item__score">
                            {attempt.totalScore?.toFixed(2)} điểm
                          </div>
                          <div className="qd-history-item__time">
                            Thời gian nộp bài:{" "}
                            {formatDateTime(attempt.submittedAt)}
                          </div>
                          <div className="qd-history-item__detail">
                            {attempt.correctCount}/{attempt.totalQuestions} câu
                            đúng
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="qd-pagination">
                    <button
                      className="qd-page-btn"
                      disabled={currentPage === 0}
                      onClick={() => fetchHistory(currentPage - 1)}
                    >
                      <i className="bi bi-chevron-left" />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        className={`qd-page-btn ${currentPage === i ? "qd-page-btn--active" : ""}`}
                        onClick={() => fetchHistory(i)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className="qd-page-btn"
                      disabled={currentPage === totalPages - 1}
                      onClick={() => fetchHistory(currentPage + 1)}
                    >
                      <i className="bi bi-chevron-right" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const pageStyle = `
  .qd-wrapper {
    --blue:    #1a73e8;
    --blue-lt: #e8f0fe;
    --text:    #1a1a2e;
    --muted:   #6b7280;
    --border:  #e5e7eb;
    --bg:      #f8faff;
    --card-r:  18px;
    background: var(--bg);
    min-height: 100vh;
  }

  .qd-root {
    min-height: calc(100dvh - var(--header-h, 0px));
    padding: 28px clamp(16px, 4vw, 32px) 48px;
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    animation: qd-fadein 0.3s both;
  }

  @keyframes qd-fadein {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .qd-banner-card { overflow: hidden; }
  .qd-banner { padding: 4px 0; display: flex; align-items: flex-start; }
  .qd-banner__title { font-size: 16px; font-weight: 700; color: var(--blue); margin: 0; line-height: 1.35; word-break: break-word; }
  .qd-banner__body { display: flex; flex-direction: column; gap: 14px; }
  .qd-banner__desc { font-size: 15px; color: var(--muted); margin: 0; line-height: 1.6; word-break: break-word; }

  .qd-start-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 20px; background: var(--blue); color: #fff;
    border: none; border-radius: 9px; font-size: 16px; font-weight: 600;
    cursor: pointer; align-self: flex-start;
    transition: background 0.18s, transform 0.15s;
    margin-top: 6px;
  }
  .qd-start-btn:hover { background: #1557b0; transform: translateY(-1px); }
  .qd-start-btn:active { transform: translateY(0); }

  .qd-info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  @media (min-width: 600px) { .qd-info-grid { grid-template-columns: repeat(4, 1fr); } }
  @media (max-width: 360px) { .qd-info-grid { grid-template-columns: 1fr; } }

  .qd-info-cell {
    background: #fff; border-radius: 8px; padding: 14px 16px;
    display: flex; flex-direction: column; gap: 5px;
    border: 1.5px solid var(--border);
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  }
  .qd-info-cell:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(26,115,232,0.10); border-color: rgba(26,115,232,0.22); }
  .qd-info-cell__icon { color: var(--blue); display: flex; align-items: center; margin-bottom: 2px; }
  .qd-info-cell__label { font-size: 15px; font-weight: 500; }
  .qd-info-cell__value { font-size: 15px; color: var(--text); }

  .qd-section { padding: 4px 0; }
  .qd-section__title {
    display: flex; align-items: center; gap: 8px;
    font-size: 16px; font-weight: 700; color: var(--blue);
    margin-bottom: 12px;
  }

  /* History list */
  .qd-history-list { display: flex; flex-direction: column; gap: 10px; }

  .qd-history-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px; gap: 14px;
    background: #fff; border: 1.5px solid var(--border);
    border-radius: 12px;
    transition: background 0.15s, border-color 0.15s;
  }
  .qd-history-item:hover { background: #f8faff; border-color: rgba(26,115,232,0.22); }

  .qd-history-item--clickable {
    cursor: pointer;
  }
  .qd-history-item--clickable:hover {
    background: var(--blue-lt);
    border-color: var(--blue);
  }

  .qd-history-item__left {
    display: flex; align-items: center; gap: 12px;
    flex: 1; min-width: 0;
  }

  .qd-history-item__index {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--blue-lt); color: var(--blue);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 700; flex-shrink: 0;
  }

  .qd-history-item__info { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 2px; }
  .qd-history-item__score { font-size: 16px; font-weight: 700; color: #d4550b; }
  .qd-history-item__time { font-size: 15px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .qd-history-item__detail { font-size: 15px; color: var(--muted); }

  @media (max-width: 480px) {
    .qd-history-item__time { white-space: normal; }
  }

  /* Pagination */
  .qd-pagination {
    display: flex; justify-content: center; align-items: center;
    gap: 4px; margin-top: 16px; flex-wrap: wrap;
  }
  .qd-page-btn {
    min-width: 34px; height: 34px; padding: 0 8px;
    border: 1.5px solid var(--border); border-radius: 7px;
    background: #fff; color: var(--text); font-size: 16px;
    cursor: pointer; transition: all 0.15s;
    display: flex; align-items: center; justify-content: center;
  }
  .qd-page-btn:hover:not(:disabled) { border-color: var(--blue); color: var(--blue); }
  .qd-page-btn--active { background: var(--blue); color: #fff; border-color: var(--blue); font-weight: 600; }
  .qd-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .qd-empty {
    display: flex; flex-direction: column; align-items: center;
    padding: 40px 20px; color: var(--muted); gap: 8px;
  }
  .qd-empty__icon {
    width: 52px; height: 52px; background: var(--blue-lt);
    border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 4px;
  }
  .qd-empty__title { font-size: 16px; font-weight: 600; color: var(--text); }
  .qd-empty__sub { font-size: 15px; color: var(--muted); }
`;
export default QuizDetailUser;
