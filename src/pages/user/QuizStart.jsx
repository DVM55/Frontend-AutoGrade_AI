import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  startQuizAttempt,
  submitQuizAttempt,
} from "../../service/quiz.service";
import { useAuth } from "../../context/AuthContext";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const OPTION_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function getQuestionStatus(question, answers) {
  const ans = answers[question.id];
  if (question.questionType === "SHORT_ANSWER") {
    return ans?.text?.trim() ? "answered" : "unanswered";
  }
  return ans?.options?.length > 0 ? "answered" : "unanswered";
}

function QuestionMedia({ mediaUrl, mediaType }) {
  if (!mediaUrl || !mediaType) return null;
  const type = mediaType.toUpperCase();
  if (type === "IMAGE") {
    return (
      <img
        src={mediaUrl}
        alt="Hình ảnh câu hỏi"
        style={{
          width: "100%",
          maxHeight: 360,
          objectFit: "contain",
          borderRadius: 10,
          marginBottom: 14,

          background: "#f8fafc",
        }}
      />
    );
  }
  if (type === "VIDEO") {
    return (
      <video
        controls
        style={{
          width: "100%",
          maxHeight: 360,
          borderRadius: 10,
          marginBottom: 14,
          background: "#000",
        }}
      >
        <source src={mediaUrl} />
        Trình duyệt của bạn không hỗ trợ video.
      </video>
    );
  }
  if (type === "AUDIO") {
    return (
      <audio
        controls
        style={{ width: "100%", marginBottom: 14, borderRadius: 10 }}
      >
        <source src={mediaUrl} />
        Trình duyệt của bạn không hỗ trợ audio.
      </audio>
    );
  }
  return null;
}

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-size: 16px; }

  .quiz-root {
    display: flex;
    flex-direction: column;
    height: 100vh;
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 16px;
    color: #1e293b;
  }

  .quiz-topbar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #1e40af;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    height: 56px;
    gap: 8px;
    flex-shrink: 0;
  }
  .quiz-topbar-title {
    font-size: 16px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    min-width: 0;
  }
  .quiz-topbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .quiz-timer {
    background: #fff2;
    border: 1px solid #fff4;
    border-radius: 8px;
    padding: 4px 10px;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 1px;
    white-space: nowrap;
  }
  .quiz-timer.warning { background: #fef3c7; color: #92400e; border-color: #f59e0b; }
  .quiz-timer.danger  { background: #fee2e2; color: #991b1b; border-color: #ef4444; animation: blink 1s infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.5} }

  .btn-submit {
    background: #22c55e;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 6px 14px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition: background .2s;
  }
  .btn-submit:hover { background: #16a34a; }

  .btn-toggle-sidebar {
    display: none;
    background: #fff2;
    border: 1px solid #fff4;
    border-radius: 8px;
    color: #fff;
    width: 36px;
    height: 36px;
    cursor: pointer;
    font-size: 16px;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background .2s;
  }
  .btn-toggle-sidebar:hover { background: #fff3; }

  .quiz-body {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  .quiz-main {
    flex: 1;
    overflow-y: auto;
    padding: 0px 16px 40px;
    min-width: 0;
  }

  .quiz-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    font-size: 16px;
    color: #64748b;
    gap: 10px;
  }
  .spinner {
    width: 22px; height: 22px;
    border: 3px solid #e2e8f0;
    border-top-color: #1e40af;
    border-radius: 50%;
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .question-card {
    padding: 20px 0;
    border-bottom: 1px solid #e2e8f0;
    scroll-margin-top: 72px;
  }
  .question-card:last-child { border-bottom: none; }

  .question-header {
    margin-bottom: 14px;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.6;
    color: #0f172a;
    word-break: break-word;
  }
  .question-num { font-weight: 700; color: #1e40af; }
  .question-type-inline {
    font-size: 14px;
    font-weight: 600;
    color: #6d28d9;
    margin: 0 3px;
  }

  .options-list { display: flex; flex-direction: column; gap: 10px; }

  .option-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 10px;
    border: 2px solid #e2e8f0;
    cursor: pointer;
    transition: border-color .15s, background .15s;
    user-select: none;
  }
  .option-item:hover { border-color: #93c5fd; background: #eff6ff; }
  .option-item.selected { border-color: #3b82f6; background: #eff6ff; }
  .option-item.selected .option-circle { border-color: #3b82f6; background: #3b82f6; color: #fff; }
  .option-item.multi-selected { border-color: #6366f1; background: #f5f3ff; }
  .option-item.multi-selected .option-box { border-color: #6366f1; background: #6366f1; color: #fff; }

  .option-circle {
    width: 28px; height: 28px;
    border: 2px solid #94a3b8;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700;
    color: #64748b;
    transition: all .15s;
  }
  .option-box {
    width: 28px; height: 28px;
    border: 2px solid #94a3b8;
    border-radius: 8px;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700;
    color: #64748b;
    transition: all .15s;
  }
  .option-text { font-size: 16px; line-height: 1.45; flex: 1; }

  .text-answer {
    width: 100%;
    min-height: 90px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 16px;
    line-height: 1.5;
    font-family: inherit;
    resize: vertical;
    outline: none;
    color: #1e293b;
    transition: border-color .15s;
  }
  .text-answer:focus { border-color: #3b82f6; }
  .text-answer-count { font-size: 13px; color: #94a3b8; text-align: right; margin-top: 4px; }

  .quiz-sidebar {
    width: 280px;
    min-width: 240px;
    background: #f0f4f8;
    border-left: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex-shrink: 0;
    transition: transform .3s ease;
  }
  .sidebar-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 10px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;
  }
  .sidebar-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 9px 10px;
    border-radius: 10px;
    cursor: pointer;
    border: 1.5px solid #e2e8f0;
    background: #f8fafc;
    transition: background .15s, border-color .15s, box-shadow .15s;
  }
  .sidebar-item:hover { background: #eff6ff; border-color: #93c5fd; }
  .sidebar-item.active { background: #eff6ff; border-color: #3b82f6; box-shadow: 0 0 0 2px #bfdbfe; }

  .sidebar-num {
    width: 26px; height: 26px;
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700;
    flex-shrink: 0;
  }
  .sidebar-num.answered { background: #22c55e; color: #fff; }
  .sidebar-num.unanswered { background: #e2e8f0; color: #64748b; }

  .sidebar-item-info { flex: 1; min-width: 0; }
  .sidebar-item-label {
    font-size: 14px; font-weight: 600; color: #334155;
    margin-bottom: 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sidebar-item-answer {
    font-size: 13px; color: #94a3b8;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sidebar-item-answer.has-answer { color: #16a34a; font-weight: 600; }

  .sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 99;
  }

  .modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 200;
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
  }
  .modal-box {
    background: #fff;
    border-radius: 16px;
    padding: 28px 24px;
    max-width: 380px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  }
  .modal-title { font-size: 18px; font-weight: 700; text-align: center; margin-bottom: 8px; color: #0f172a; }
  .modal-desc { font-size: 15px; color: #64748b; text-align: center; margin-bottom: 20px; line-height: 1.6; }
  .modal-actions { display: flex; gap: 10px; }
  .btn-cancel {
    flex: 1; padding: 10px;
    border: 2px solid #e2e8f0; border-radius: 10px;
    background: #fff; font-size: 15px; font-weight: 600;
    cursor: pointer; color: #475569; transition: background .15s;
  }
  .btn-cancel:hover { background: #f1f5f9; }
  .btn-confirm {
    flex: 1; padding: 10px;
    border: none; border-radius: 10px;
    background: #1e40af; color: #fff;
    font-size: 15px; font-weight: 700;
    cursor: pointer; transition: background .15s;
  }
  .btn-confirm:hover { background: #1d4ed8; }
  .btn-confirm:disabled { opacity: 0.7; cursor: not-allowed; }

  .result-row {
    display: flex;
    justify-content: space-between;
    font-size: 15px;
    padding: 4px 0;
  }
  .result-divider { height: 1px; background: #e2e8f0; margin: 4px 0; }

  @media (max-width: 768px) {
    .btn-toggle-sidebar { display: flex; }
    .quiz-sidebar {
      position: fixed;
      top: 56px; right: 0; bottom: 0;
      z-index: 100;
      width: 270px;
      min-width: unset;
      transform: translateX(100%);
      box-shadow: -4px 0 20px rgba(0,0,0,0.15);
    }
    .quiz-sidebar.open { transform: translateX(0); }
    .sidebar-overlay.open { display: block; }
    .quiz-main { padding: 0px 10px 40px; }
    .question-card { padding: 16px 0; }
  }
`;

const QuizStart = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const { user } = useAuth();

  const questionRefs = useRef({});
  const expiredAtRef = useRef(null);
  // dùng ref để tránh stale closure trong timer
  const answersRef = useRef({});
  const quizRef = useRef(null);
  const hasAutoSubmitted = useRef(false);

  const hasFetched = useRef(false); // thêm dòng này cạnh các ref khác

  useEffect(() => {
    if (hasFetched.current) {
      console.log(">>> Bỏ qua - đã fetch rồi");
      return;
    }
    hasFetched.current = true;
    console.log(">>> fetchQuiz called");

    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await startQuizAttempt(quizId);
        const data = res.data;

        console.log(">>> Quiz attempt started:", data);

        expiredAtRef.current = data.expiredAt;

        quizRef.current = data;

        const secondsLeft = Math.max(
          0,
          Math.round((new Date(expiredAtRef.current) - Date.now()) / 1000),
        );
        setTimeLeft(secondsLeft);
        setQuiz(data);
        setActiveId(data.questions?.[0]?.id ?? null);

        const restored = {};
        (data.questions ?? []).forEach((q) => {
          restored[q.id] = {
            options: q.selectedOptionIds ?? [],
            text: q.answeredText ?? "",
          };
        });
        setAnswers(restored);
        answersRef.current = restored;
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Không thể tải bài thi. Vui lòng thử lại.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const stompClientRef = useRef(null);

  useEffect(() => {
    if (!quiz || !user) return;

    const beUrl = import.meta.env.VITE_SOCKET_URL;
    let reconnectTimer = null;
    let isUnmounted = false;

    const connect = () => {
      if (isUnmounted) return;

      const socket = new SockJS(`${beUrl}/ws`);
      const client = Stomp.over(socket);
      client.debug = null;

      client.connect(
        {},
        () => {
          if (isUnmounted) {
            client.disconnect();
            return;
          }
          console.log(">>> Socket connected");
          stompClientRef.current = client;
        },
        (err) => {
          console.log(">>> Socket error, thử kết nối lại sau 3s...", err);
          stompClientRef.current = null;

          if (!isUnmounted) {
            reconnectTimer = setTimeout(connect, 3000); // ← reconnect sau 3s
          }
        },
      );
    };

    connect();

    return () => {
      isUnmounted = true;
      clearTimeout(reconnectTimer);
      if (stompClientRef.current?.connected) {
        stompClientRef.current.disconnect();
      }
      stompClientRef.current = null;
    };
  }, [quiz, user]);

  // ── Hàm submit dùng chung (bấm tay + hết giờ) ──
  const doSubmit = useCallback(async (currentAnswers) => {
    if (hasAutoSubmitted.current) return;
    hasAutoSubmitted.current = true;

    try {
      setSubmitting(true);
      const payload = Object.entries(currentAnswers).map(
        ([questionId, ans]) => ({
          questionId: Number(questionId),
          answerText: ans.text?.trim() || null,
          selectedOptionIds: ans.options?.length > 0 ? ans.options : [],
        }),
      );
      const res = await submitQuizAttempt(quizRef.current.attemptId, payload);
      setResult(res.data);
      setShowModal(false);
    } catch (err) {
      hasAutoSubmitted.current = false;
      alert("Nộp bài thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }, []);

  // ── Đếm ngược — tự submit khi hết giờ ──
  useEffect(() => {
    if (!expiredAtRef.current) return;
    const tick = async () => {
      const left = Math.max(
        0,
        Math.round((new Date(expiredAtRef.current) - Date.now()) / 1000),
      );
      setTimeLeft(left);
      if (left <= 0 && !hasAutoSubmitted.current) {
        clearInterval(timer);
        await doSubmit(answersRef.current);
      }
    };
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [quiz, doSubmit]);

  // ── Sync answersRef khi answers thay đổi ──
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // ── Scroll spy ──
  useEffect(() => {
    const main = document.getElementById("quiz-main-scroll");
    if (!main || !quiz?.questions?.length) return;
    const onScroll = () => {
      let closest = null,
        minDist = Infinity;
      quiz.questions.forEach((q) => {
        const el = questionRefs.current[q.id];
        if (!el) return;
        const dist = Math.abs(el.getBoundingClientRect().top - 72);
        if (dist < minDist) {
          minDist = dist;
          closest = q.id;
        }
      });
      if (closest) setActiveId(closest);
    };
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, [quiz]);

  const scrollToQuestion = useCallback((id) => {
    const el = questionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
    setSidebarOpen(false);
  }, []);

  const debounceTimers = useRef({});

  const sendAnswerSocket = useCallback(
    (questionId, ans) => {
      clearTimeout(debounceTimers.current[questionId]);
      debounceTimers.current[questionId] = setTimeout(() => {
        console.log(
          ">>> [Socket] connected=",
          stompClientRef.current?.connected,
        );

        if (!stompClientRef.current?.connected) {
          console.log(">>> [Socket] KHÔNG gửi được - chưa kết nối");
          return;
        }

        const payload = {
          attemptId: quizRef.current.attemptId,
          accountId: user.id,
          questionId,
          answerText: ans.text?.trim() || null,
          selectedOptionIds: ans.options?.length > 0 ? ans.options : [],
        };

        console.log(">>> [Socket] Gửi answer:", JSON.stringify(payload));

        try {
          stompClientRef.current.send(
            "/app/quiz/answer",
            {},
            JSON.stringify(payload),
          );
          console.log(">>> [Socket] Gửi thành công");
        } catch (err) {
          console.log(">>> [Socket] Gửi lỗi:", err);
        }
      }, 500);
    },
    [user],
  );

  const toggleOption = useCallback(
    (questionId, optionId, isMultiple) => {
      setAnswers((prev) => {
        const cur = prev[questionId] || { options: [], text: "" };
        const newOptions = isMultiple
          ? cur.options.includes(optionId)
            ? cur.options.filter((x) => x !== optionId)
            : [...cur.options, optionId]
          : cur.options[0] === optionId
            ? []
            : [optionId];
        const updated = {
          ...prev,
          [questionId]: { ...cur, options: newOptions },
        };
        sendAnswerSocket(questionId, updated[questionId]); // ← thêm dòng này
        return updated;
      });
    },
    [sendAnswerSocket],
  );

  const setTextAnswer = useCallback(
    (questionId, text) => {
      setAnswers((prev) => {
        const updated = {
          ...prev,
          [questionId]: { ...(prev[questionId] || { options: [] }), text },
        };
        sendAnswerSocket(questionId, updated[questionId]); // ← thêm dòng này
        return updated;
      });
    },
    [sendAnswerSocket],
  );

  const handleConfirmSubmit = () => doSubmit(answersRef.current);

  const getSidebarAnswerLabel = (q) => {
    const ans = answers[q.id];
    if (q.questionType === "SHORT_ANSWER") {
      const t = ans?.text?.trim();
      return t
        ? `"${t.slice(0, 22)}${t.length > 22 ? "…" : ""}"`
        : "Chưa trả lời";
    }
    const ids = ans?.options || [];
    if (!ids.length) return "Chưa trả lời";
    return ids
      .map((id) => {
        const idx = (q.options ?? []).findIndex((o) => o.id === id);
        return idx >= 0 ? OPTION_LABELS[idx] : "";
      })
      .filter(Boolean)
      .join(", ");
  };

  // ── Loading ──
  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="quiz-loading">
          <div className="spinner" />
          Đang tải bài thi...
        </div>
      </>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <>
        <style>{styles}</style>
        <div
          className="quiz-loading"
          style={{ color: "#dc2626", flexDirection: "column", gap: 12 }}
        >
          <span>⚠️ {error}</span>
        </div>
      </>
    );
  }

  const questions = quiz.questions ?? [];
  const answeredCount = questions.filter(
    (q) => getQuestionStatus(q, answers) === "answered",
  ).length;
  const timerClass =
    timeLeft <= 60 ? "danger" : timeLeft <= 300 ? "warning" : "";
  const isExpired = timeLeft <= 0;

  return (
    <>
      <style>{styles}</style>
      <div className="quiz-root">
        {/* ── TOP BAR ── */}
        <div className="quiz-topbar">
          <button
            className="btn-toggle-sidebar"
            onClick={() => setSidebarOpen((p) => !p)}
            aria-label="Mở danh sách câu hỏi"
          >
            ☰
          </button>
          <span className="quiz-topbar-title">{quiz.quizTitle}</span>
          <div className="quiz-topbar-right">
            {!result && !submitting && (
              <span className={`quiz-timer ${timerClass}`}>
                ⏱ {formatTime(timeLeft)}
              </span>
            )}
            {!result && (
              <button
                className="btn-submit"
                onClick={() => setShowModal(true)}
                disabled={submitting}
              >
                Nộp bài
              </button>
            )}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="quiz-body">
          {/* ── MAIN ── */}
          <div className="quiz-main" id="quiz-main-scroll">
            {questions.map((q, idx) => {
              const isMultiple = q.questionType === "MULTIPLE_CHOICE";
              const curAns = answers[q.id] || { options: [], text: "" };
              return (
                <div
                  key={q.id}
                  ref={(el) => (questionRefs.current[q.id] = el)}
                  className="question-card"
                  id={`question-${q.id}`}
                >
                  <div className="question-header">
                    <span className="question-num">Câu {idx + 1}.</span>
                    {isMultiple && (
                      <span className="question-type-inline">
                        (Chọn nhiều đáp án)
                      </span>
                    )}{" "}
                    {q.content}
                  </div>

                  <QuestionMedia
                    mediaUrl={q.mediaUrl}
                    mediaType={q.mediaType}
                  />

                  {q.questionType === "SHORT_ANSWER" ? (
                    <div>
                      <textarea
                        className="text-answer"
                        placeholder="Nhập câu trả lời của bạn tại đây..."
                        value={curAns.text || ""}
                        onChange={(e) => setTextAnswer(q.id, e.target.value)}
                        disabled={isExpired || submitting}
                      />
                      <div className="text-answer-count">
                        {(curAns.text || "").length} ký tự
                      </div>
                    </div>
                  ) : (
                    <div className="options-list">
                      {(q.options ?? []).map((opt, optIdx) => {
                        const selected = curAns.options.includes(opt.id);
                        const optLabel =
                          OPTION_LABELS[optIdx] || String(optIdx + 1);
                        return (
                          <div
                            key={opt.id}
                            className={`option-item ${selected ? (isMultiple ? "multi-selected" : "selected") : ""}`}
                            onClick={() =>
                              !isExpired &&
                              !submitting &&
                              toggleOption(q.id, opt.id, isMultiple)
                            }
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              !isExpired &&
                              !submitting &&
                              toggleOption(q.id, opt.id, isMultiple)
                            }
                            style={
                              isExpired || submitting
                                ? { opacity: 0.6, pointerEvents: "none" }
                                : {}
                            }
                          >
                            {isMultiple ? (
                              <div className="option-box">{optLabel}</div>
                            ) : (
                              <div className="option-circle">{optLabel}</div>
                            )}
                            <span className="option-text">
                              {opt.optionText}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── SIDEBAR OVERLAY ── */}
          <div
            className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
            onClick={() => setSidebarOpen(false)}
          />

          {/* ── SIDEBAR ── */}
          <aside className={`quiz-sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="sidebar-list">
              {questions.map((q, idx) => {
                const isAnswered = getQuestionStatus(q, answers) === "answered";
                const ansLabel = getSidebarAnswerLabel(q);
                return (
                  <div
                    key={q.id}
                    className={`sidebar-item ${activeId === q.id ? "active" : ""}`}
                    onClick={() => scrollToQuestion(q.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && scrollToQuestion(q.id)
                    }
                  >
                    <div
                      className={`sidebar-num ${isAnswered ? "answered" : "unanswered"}`}
                    >
                      {isAnswered ? "✓" : idx + 1}
                    </div>
                    <div className="sidebar-item-info">
                      <div className="sidebar-item-label">Câu {idx + 1}</div>
                      <div
                        className={`sidebar-item-answer ${isAnswered ? "has-answer" : ""}`}
                      >
                        {ansLabel}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>

        {/* ── CONFIRM MODAL ── */}
        {showModal && !result && (
          <div className="modal-backdrop">
            <div className="modal-box">
              <div className="modal-title">Xác nhận nộp bài</div>
              <div className="modal-desc">
                Bạn đã trả lời{" "}
                <strong>
                  {answeredCount}/{questions.length}
                </strong>{" "}
                câu hỏi.
                {answeredCount < questions.length && (
                  <>
                    {" "}
                    Còn <strong>{questions.length - answeredCount}</strong> câu
                    chưa hoàn thành.
                  </>
                )}
                <br />
                Bạn có chắc muốn nộp bài không?
              </div>
              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Quay lại
                </button>
                <button
                  className="btn-confirm"
                  onClick={handleConfirmSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Đang nộp..." : "Nộp bài"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SUBMITTING OVERLAY (hết giờ tự submit) ── */}
        {submitting && !showModal && (
          <div className="modal-backdrop">
            <div className="modal-box" style={{ textAlign: "center" }}>
              <div className="spinner" style={{ margin: "0 auto 16px" }} />
              <div className="modal-title">Đang nộp bài...</div>
              <div className="modal-desc">Vui lòng chờ trong giây lát.</div>
            </div>
          </div>
        )}

        {/* ── RESULT MODAL ── */}
        {result && (
          <div className="modal-backdrop">
            <div className="modal-box">
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
                <div className="modal-title">Nộp bài thành công!</div>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 12,
                  padding: "16px 20px",
                  marginBottom: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div className="result-row">
                  <span style={{ color: "#64748b" }}>Số câu đúng</span>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>
                    {result.correctCount}/{result.totalQuestions}
                  </span>
                </div>
                <div className="result-divider" />
                <div className="result-row">
                  <span style={{ color: "#64748b" }}>Điểm số</span>
                  <span
                    style={{ fontWeight: 700, fontSize: 20, color: "#1e40af" }}
                  >
                    {result.totalScore}
                  </span>
                </div>
                <div className="result-divider" />
                <div className="result-row">
                  <span style={{ color: "#64748b" }}>Thời gian nộp</span>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>
                    {new Date(result.submittedAt).toLocaleTimeString("vi-VN")}
                  </span>
                </div>
              </div>

              <button
                className="btn-confirm"
                style={{ width: "100%" }}
                onClick={() =>
                  navigate(`/user/quizzes/${quizId}`, { replace: true })
                }
              >
                Thoát
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default QuizStart;
