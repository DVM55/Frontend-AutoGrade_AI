import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getQuizzes } from "../../service/quiz.service";

const QuizClass = ({ classId }) => {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const size = 10;

  // ================= FETCH =================
  const fetchQuizzes = async (page = 0) => {
    try {
      setLoading(true);
      const res = await getQuizzes({ classId, page, size });
      setQuizzes(res.data || []);
      setTotalPages(res.meta?.totalPages || 0);
      setTotalElements(res.meta?.totalItems || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error(error);
      setQuizzes([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes(0);
  }, [classId]);

  return (
    <>
      <style>{quizStyle}</style>

      {/* Kết quả */}
      {!loading && totalElements > 0 && (
        <div className="qz-result-count">{totalElements} bài kiểm tra</div>
      )}

      {/* ================= LIST ================= */}
      {loading ? (
        <></>
      ) : quizzes.length === 0 ? (
        <div className="qz-empty">Không có bài kiểm tra nào</div>
      ) : (
        <div className="qz-list">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="qz-item"
              onClick={() => navigate(`/teacher/quizzes/${quiz.id}`)}
            >
              <div className="qz-item__icon">
                <i className="bi bi-journal-check" />
              </div>
              <div className="qz-item__info">
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#3a0da3",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {quiz.quizStatus === "PUBLISHED" ? "Đã công bố" : "Bản nháp"}
                </div>
                <div className="qz-item__title">{quiz.title}</div>
                <div className="qz-item__desc">
                  {quiz.description || "Không có mô tả"}
                </div>
              </div>
              <i className="bi bi-chevron-right qz-item__arrow" />
            </div>
          ))}
        </div>
      )}

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && !loading && (
        <div className="qz-pagination">
          <button
            className="qz-page-btn"
            disabled={currentPage === 0}
            onClick={() => fetchQuizzes(currentPage - 1)}
          >
            <i className="bi bi-chevron-left" />
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`qz-page-btn ${currentPage === i ? "qz-page-btn--active" : ""}`}
              onClick={() => fetchQuizzes(i)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="qz-page-btn"
            disabled={currentPage === totalPages - 1}
            onClick={() => fetchQuizzes(currentPage + 1)}
          >
            <i className="bi bi-chevron-right" />
          </button>
        </div>
      )}
    </>
  );
};

const quizStyle = `
  .qz-result-count {
    font-size: 15px;
    color: #6b7280;
    margin-bottom: 10px;
    min-height: 20px;
  }

  .qz-empty {
    text-align: center;
    color: #6b7280;
    padding: 40px 0;
    font-size: 16px;
  }

  .qz-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.qz-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  gap: 14px;
  border: 1.5px solid #e5e7eb;   /* thêm border riêng cho từng item */
  border-radius: 12px;            /* bo góc từng item */
  background: #fff;
  cursor: pointer;
  transition: background 0.15s;
}
.qz-item:hover { background: #f8faff; }
/* xóa border-bottom và last-child */

  .qz-item__icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #e8f0fe;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 18px;
    color: #1a73e8;
    transition: background 0.15s;
  }
  .qz-item:hover .qz-item__icon { background: #d2e3fc; }

  .qz-item__info {
    flex: 1 1 0;
    min-width: 0;
  }

  .qz-item__title {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a2e;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .qz-item__desc {
    font-size: 15px;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  

  .qz-item__arrow {
    flex-shrink: 0;
    font-size: 14px;
    color: #9ca3af;
    transition: color 0.15s, transform 0.15s;
  }
  .qz-item:hover .qz-item__arrow {
    color: #1a73e8;
    transform: translateX(2px);
  }

  .qz-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    margin-top: 16px;
    flex-wrap: wrap;
  }

  .qz-page-btn {
    min-width: 34px; height: 34px;
    padding: 0 8px;
    border: 1.5px solid #e5e7eb;
    border-radius: 7px;
    background: #fff;
    color: #1a1a2e;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.15s;
    display: flex; align-items: center; justify-content: center;
  }
  .qz-page-btn:hover:not(:disabled) { border-color: #1a73e8; color: #1a73e8; }
  .qz-page-btn--active { background: #1a73e8; color: #fff; border-color: #1a73e8; font-weight: 600; }
  .qz-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
`;

export default QuizClass;
