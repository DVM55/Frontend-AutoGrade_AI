import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllHistory } from "../../service/quiz.service";

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const size = 10;

  const fetchHistory = async (page = 0) => {
    try {
      setLoading(true);
      const res = await getAllHistory(page, size);
      setHistory(res.data || []);
      setTotalPages(res.meta?.totalPages || 0);
      setTotalElements(res.meta?.totalItems || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error(error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(0);
  }, []);

  const formatDateTime = (dt) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <style>{pageStyle}</style>
      <div className="h-wrapper">
        <div className="h-root">
          {loading ? (
            <div className="h-loading">
              <div className="h-spinner" />
            </div>
          ) : history.length === 0 ? (
            <div className="h-empty">
              <div className="h-empty__icon">
                <svg
                  width="28"
                  height="28"
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
              <div className="h-empty__title">Chưa có lần làm bài nào</div>
              <div className="h-empty__sub">
                Các bài kiểm tra bạn đã làm sẽ hiển thị ở đây
              </div>
            </div>
          ) : (
            <>
              <div className="h-list">
                {history.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`h-item${item.allowReview ? " h-item--clickable" : ""}`}
                    onClick={() =>
                      item.allowReview &&
                      navigate(`/user/quiz-attempt/review/${item.id}`)
                    }
                  >
                    <div className="h-item__body">
                      <div className="h-item__quiz-title">{item.quizTitle}</div>
                      <div className="h-item__row">
                        <span className="h-item__score">
                          {item.totalScore?.toFixed(2)} điểm
                        </span>
                        <span className="h-item__sep">·</span>
                      </div>
                      <div className="h-item__time">
                        Nộp lúc: {formatDateTime(item.submittedAt)}
                      </div>
                    </div>
                    {item.allowReview && (
                      <div className="h-item__arrow">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#1a73e8"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="h-pagination">
                  <button
                    className="h-page-btn"
                    disabled={currentPage === 0}
                    onClick={() => fetchHistory(currentPage - 1)}
                  >
                    <i className="bi bi-chevron-left" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={`h-page-btn${currentPage === i ? " h-page-btn--active" : ""}`}
                      onClick={() => fetchHistory(i)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="h-page-btn"
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
    </>
  );
};

const pageStyle = `
  .h-wrapper {
    --blue:    #1a73e8;
    --blue-lt: #e8f0fe;
    --text:    #1a1a2e;
    --muted:   #6b7280;
    --border:  #e5e7eb;
    --bg:      #f8faff;
    background: var(--bg);
    min-height: 100vh;
  }

  .h-root {
    max-width: 1100px;
    margin: 0 auto;
    padding: 28px clamp(16px, 4vw, 32px) 48px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: h-fadein 0.3s both;
  }

  @keyframes h-fadein {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .h-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .h-title {
    font-size: 26px;
    font-weight: 700;
    color: var(--blue);
    margin: 0;
  }

  .h-count {
    font-size: 16px;
    color: var(--muted);
    background: #fff;
    border: 1.5px solid var(--border);
    border-radius: 20px;
    padding: 3px 12px;
    font-weight: 500;
  }

  .h-loading {
    display: flex;
    justify-content: center;
    padding: 60px 0;
  }

  .h-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--blue-lt);
    border-top-color: var(--blue);
    border-radius: 50%;
    animation: h-spin 0.7s linear infinite;
  }

  @keyframes h-spin { to { transform: rotate(360deg); } }

  .h-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px 20px;
    gap: 8px;
    color: var(--muted);
  }

  .h-empty__icon {
    width: 56px;
    height: 56px;
    background: var(--blue-lt);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
  }

  .h-empty__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
  }

  .h-empty__sub {
    font-size: 16px;
    color: var(--muted);
    text-align: center;
  }

  .h-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .h-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    background: #fff;
    border: 1.5px solid var(--border);
    border-radius: 14px;
    transition: background 0.15s, border-color 0.15s, transform 0.15s;
  }

  .h-item:hover {
    background: #f8faff;
    border-color: rgba(26,115,232,0.22);
  }

  .h-item--clickable {
    cursor: pointer;
  }

  .h-item__index {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--blue-lt);
    color: var(--blue);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .h-item__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .h-item__quiz-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .h-item__row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .h-item__score {
    font-size: 16px;
    font-weight: 700;
    color: #d4550b;
  }

  .h-item__sep {
    color: var(--border);
    font-size: 16px;
  }

  .h-item__correct {
    font-size: 16px;
    color: var(--muted);
  }

  .h-item__time {
    font-size: 16px;
    color: var(--muted);
  }

  .h-item__arrow {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    opacity: 0.5;
    transition: opacity 0.15s;
  }

  .h-item--clickable:hover .h-item__arrow {
    opacity: 1;
  }

  .h-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    flex-wrap: wrap;
  }

  .h-page-btn {
    min-width: 34px;
    height: 34px;
    padding: 0 8px;
    border: 1.5px solid var(--border);
    border-radius: 7px;
    background: #fff;
    color: var(--text);
    font-size: 16px;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .h-page-btn:hover:not(:disabled) {
    border-color: var(--blue);
    color: var(--blue);
  }

  .h-page-btn--active {
    background: var(--blue);
    color: #fff;
    border-color: var(--blue);
    font-weight: 600;
  }

  .h-page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    .h-item__quiz-title { white-space: normal; }
    .h-item__time { white-space: normal; }
  }
`;

export default History;
