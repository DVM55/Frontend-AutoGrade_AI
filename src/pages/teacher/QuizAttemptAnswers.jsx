import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getQuizAttemptResult } from "../../service/quiz.service";

const questionTypeLabels = {
  SINGLE_CHOICE: "Chọn một đáp án",
  MULTIPLE_CHOICE: "Chọn nhiều đáp án",
  SHORT_ANSWER: "Trả lời ngắn",
};

const formatDateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const MediaPreview = ({ mediaType, mediaUrl }) => {
  if (!mediaType || !mediaUrl) return null;

  if (mediaType === "IMAGE") {
    return (
      <div className="taa-media taa-media--image">
        <img src={mediaUrl} alt="Nội dung câu hỏi" />
      </div>
    );
  }

  if (mediaType === "VIDEO") {
    return (
      <div className="taa-media">
        <video src={mediaUrl} controls />
      </div>
    );
  }

  if (mediaType === "AUDIO") {
    return (
      <div className="taa-audio">
        <i className="bi bi-volume-up" />
        <audio src={mediaUrl} controls />
      </div>
    );
  }

  return null;
};

const OptionRow = ({ option, selected }) => {
  const correct = Boolean(option.isCorrect);
  const className = [
    "taa-option",
    selected ? "taa-option--selected" : "",
    correct ? "taa-option--correct" : "",
    selected && !correct ? "taa-option--wrong" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <span className="taa-option__mark">
        {selected ? <i className="bi bi-check2" /> : null}
      </span>
      <span className="taa-option__text">{option.optionText || "—"}</span>
      <span className="taa-option__badges">
        {selected && <span className="taa-badge taa-badge--selected">Đã chọn</span>}
        {correct && <span className="taa-badge taa-badge--correct">Đáp án đúng</span>}
      </span>
    </div>
  );
};

const QuestionCard = ({ question, index }) => {
  const selectedIds = useMemo(
    () => new Set(question.selectedOptionIds || []),
    [question.selectedOptionIds],
  );
  const isShortAnswer = question.questionType === "SHORT_ANSWER";
  const answeredText = question.answeredText?.trim();
  const correct = Boolean(question.isCorrect);

  return (
    <article className="taa-question">
      <div className="taa-question__head">
        <div>
          <div className="taa-question__label">Câu {index + 1}</div>
          <h2>{question.content || "Không có nội dung câu hỏi"}</h2>
        </div>
        <div className="taa-question__meta">
          <span>{questionTypeLabels[question.questionType] || "Câu hỏi"}</span>
          {question.score != null && <span>{question.score} điểm</span>}
          <span className={correct ? "taa-result taa-result--correct" : "taa-result taa-result--wrong"}>
            {correct ? "Đúng" : "Sai"}
          </span>
        </div>
      </div>

      <MediaPreview mediaType={question.mediaType} mediaUrl={question.mediaUrl} />

      {!isShortAnswer && (
        <div className="taa-options">
          {(question.options || []).map((option) => (
            <OptionRow
              key={option.id}
              option={option}
              selected={selectedIds.has(option.id)}
            />
          ))}
          {(question.options || []).length === 0 && (
            <div className="taa-muted">Không có đáp án lựa chọn.</div>
          )}
        </div>
      )}

      {isShortAnswer && (
        <div className="taa-short">
          <div>
            <div className="taa-short__title">Đáp án học sinh</div>
            <div className={answeredText ? "taa-answer" : "taa-answer taa-answer--empty"}>
              {answeredText || "Chưa trả lời"}
            </div>
          </div>

          {(question.correctAnswers || []).length > 0 && (
            <div>
              <div className="taa-short__title">Đáp án chấp nhận</div>
              <div className="taa-accepted">
                {question.correctAnswers.map((answer) => (
                  <span key={answer.id}>{answer.answer}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
};

const QuizAttemptAnswers = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const submission = location.state?.submission;

  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnswers = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getQuizAttemptResult(attemptId);
        setAnswers(res.data || []);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Không thể tải đáp án của học sinh",
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnswers();
  }, [attemptId]);

  const summary = useMemo(() => {
    const total = answers.length;
    const correct = answers.filter((item) => item.isCorrect).length;
    return { total, correct, wrong: Math.max(total - correct, 0) };
  }, [answers]);

  return (
    <>
      <style>{teacherAttemptAnswersStyle}</style>

      <div className="taa-page">
        <div className="taa-shell">
          <div className="taa-topbar">
            <button className="taa-back-btn" onClick={() => navigate(-1)}>
              <i className="bi bi-chevron-left" />
              Quay lại
            </button>
            <div>
              <h1>Đáp án học sinh đã chọn</h1>
              <p>Attempt #{attemptId}</p>
            </div>
          </div>

          <section className="taa-summary">
            <div className="taa-student">
              <div className="taa-student__avatar">
                <i className="bi bi-person" />
              </div>
              <div>
                <h2>{submission?.submittedByName || "Học sinh"}</h2>
                <p>{submission?.submittedByEmail || "Không có email"}</p>
              </div>
            </div>

            <div className="taa-stats">
              <div>
                <span>Điểm</span>
                <strong>{submission?.totalScore ?? "—"}</strong>
              </div>
              <div>
                <span>Số câu đúng</span>
                <strong>{submission?.correctCount ?? summary.correct}</strong>
              </div>
              <div>
                <span>Thời gian nộp</span>
                <strong>{formatDateTime(submission?.submittedAt)}</strong>
              </div>
            </div>
          </section>

          {loading && (
            <div className="taa-state">
              <span className="taa-spinner" />
              Đang tải đáp án...
            </div>
          )}

          {!loading && error && (
            <div className="taa-state taa-state--error">
              <i className="bi bi-exclamation-circle" />
              <span>{error}</span>
              <button onClick={() => navigate(-1)}>Quay lại</button>
            </div>
          )}

          {!loading && !error && answers.length === 0 && (
            <div className="taa-state">
              <i className="bi bi-inbox" />
              Không có dữ liệu đáp án.
            </div>
          )}

          {!loading && !error && answers.length > 0 && (
            <div className="taa-content">
              <div className="taa-overview">
                <span>{summary.total} câu hỏi</span>
                <span>{summary.correct} đúng</span>
                <span>{summary.wrong} sai</span>
              </div>

              {answers.map((question, index) => (
                <QuestionCard
                  key={question.id || index}
                  question={question}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const teacherAttemptAnswersStyle = `
  .taa-page {
    min-height: calc(100dvh - var(--header-h, 0px));
    background: #f6f8fb;
    padding: 20px;
    box-sizing: border-box;
  }

  .taa-shell {
    max-width: 980px;
    margin: 0 auto;
  }

  .taa-topbar {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 14px;
  }

  .taa-topbar h1 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    color: #111827;
  }

  .taa-topbar p {
    margin: 3px 0 0;
    font-size: 14px;
    color: #6b7280;
  }

  .taa-back-btn {
    height: 38px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1.5px solid #e5e7eb;
    background: #fff;
    color: #374151;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    flex-shrink: 0;
  }

  .taa-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    background: #fff;
    border: 1.5px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 14px;
  }

  .taa-student {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .taa-student__avatar {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #eef2ff;
    color: #3d3a8c;
    flex-shrink: 0;
  }

  .taa-student h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
    color: #111827;
  }

  .taa-student p {
    margin: 3px 0 0;
    font-size: 14px;
    color: #6b7280;
  }

  .taa-stats {
    display: flex;
    align-items: stretch;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .taa-stats > div {
    min-width: 116px;
    padding: 9px 12px;
    border-radius: 8px;
    background: #f9fafb;
    border: 1px solid #eef2f7;
  }

  .taa-stats span {
    display: block;
    margin-bottom: 4px;
    color: #6b7280;
    font-size: 13px;
  }

  .taa-stats strong {
    color: #111827;
    font-size: 16px;
    font-weight: 800;
  }

  .taa-content {
    display: grid;
    gap: 12px;
  }

  .taa-overview {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .taa-overview span {
    padding: 6px 10px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid #e5e7eb;
    color: #374151;
    font-size: 14px;
    font-weight: 700;
  }

  .taa-question {
    background: #fff;
    border: 1.5px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
  }

  .taa-question__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .taa-question__label {
    color: #3d3a8c;
    font-size: 13px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
  }

  .taa-question h2 {
    margin: 0;
    color: #111827;
    font-size: 17px;
    line-height: 1.55;
    font-weight: 700;
    word-break: break-word;
  }

  .taa-question__meta {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: flex-end;
    flex-shrink: 0;
  }

  .taa-question__meta span {
    padding: 5px 8px;
    border-radius: 999px;
    background: #f3f4f6;
    color: #4b5563;
    font-size: 12px;
    font-weight: 700;
  }

  .taa-question__meta .taa-result--correct {
    background: #ecfdf5;
    color: #047857;
  }

  .taa-question__meta .taa-result--wrong {
    background: #fef2f2;
    color: #dc2626;
  }

  .taa-media {
    margin: 0 0 12px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    background: #111827;
  }

  .taa-media img,
  .taa-media video {
    display: block;
    width: 100%;
    max-height: 320px;
    object-fit: contain;
  }

  .taa-media--image {
    background: #f9fafb;
  }

  .taa-audio {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    margin-bottom: 12px;
    border-radius: 8px;
    background: #eef2ff;
    color: #3d3a8c;
  }

  .taa-audio audio {
    flex: 1;
    min-width: 0;
    height: 34px;
  }

  .taa-options {
    display: grid;
    gap: 8px;
  }

  .taa-option {
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1.5px solid #e5e7eb;
    background: #f9fafb;
  }

  .taa-option__mark {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid #cbd5e1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 14px;
    flex-shrink: 0;
  }

  .taa-option__text {
    color: #111827;
    font-size: 15px;
    line-height: 1.5;
    word-break: break-word;
  }

  .taa-option__badges {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .taa-option--selected {
    border-color: #3d3a8c;
    background: #f0effc;
  }

  .taa-option--selected .taa-option__mark {
    background: #3d3a8c;
    border-color: #3d3a8c;
  }

  .taa-option--correct {
    border-color: #86efac;
    background: #f0fdf4;
  }

  .taa-option--correct .taa-option__mark {
    border-color: #16a34a;
  }

  .taa-option--selected.taa-option--correct .taa-option__mark {
    background: #16a34a;
    border-color: #16a34a;
  }

  .taa-option--wrong {
    border-color: #fecaca;
    background: #fef2f2;
  }

  .taa-option--wrong .taa-option__mark {
    background: #dc2626;
    border-color: #dc2626;
  }

  .taa-badge {
    padding: 4px 7px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    white-space: nowrap;
  }

  .taa-badge--selected {
    background: #e0e7ff;
    color: #3730a3;
  }

  .taa-badge--correct {
    background: #dcfce7;
    color: #15803d;
  }

  .taa-short {
    display: grid;
    gap: 12px;
  }

  .taa-short__title {
    margin-bottom: 6px;
    font-size: 14px;
    font-weight: 800;
    color: #374151;
  }

  .taa-answer {
    padding: 10px 12px;
    border-radius: 8px;
    border: 1.5px solid #e5e7eb;
    background: #f9fafb;
    color: #111827;
    font-size: 15px;
    line-height: 1.5;
    word-break: break-word;
  }

  .taa-answer--empty,
  .taa-muted {
    color: #9ca3af;
    font-style: italic;
  }

  .taa-accepted {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .taa-accepted span {
    padding: 7px 10px;
    border-radius: 8px;
    background: #ecfdf5;
    border: 1px solid #bbf7d0;
    color: #047857;
    font-size: 14px;
    font-weight: 700;
  }

  .taa-state {
    min-height: 260px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 12px;
    color: #6b7280;
    background: #fff;
    border: 1.5px solid #e5e7eb;
    border-radius: 8px;
    padding: 24px;
    text-align: center;
  }

  .taa-state i {
    font-size: 34px;
    color: #9ca3af;
  }

  .taa-state--error i {
    color: #dc2626;
  }

  .taa-state button {
    padding: 8px 14px;
    border-radius: 8px;
    border: 1.5px solid #e5e7eb;
    background: #fff;
    color: #374151;
    font-weight: 700;
    cursor: pointer;
  }

  .taa-spinner {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 3px solid #eef2ff;
    border-top-color: #3d3a8c;
    animation: taa-spin 0.7s linear infinite;
  }

  @keyframes taa-spin { to { transform: rotate(360deg); } }

  @media (max-width: 720px) {
    .taa-page { padding: 12px; }
    .taa-topbar { align-items: flex-start; flex-direction: column; }
    .taa-summary { align-items: flex-start; flex-direction: column; }
    .taa-stats { width: 100%; justify-content: stretch; }
    .taa-stats > div { flex: 1 1 130px; }
    .taa-question__head { flex-direction: column; }
    .taa-question__meta { justify-content: flex-start; }
    .taa-option { grid-template-columns: 24px minmax(0, 1fr); }
    .taa-option__badges { grid-column: 2; justify-content: flex-start; }
  }
`;

export default QuizAttemptAnswers;
