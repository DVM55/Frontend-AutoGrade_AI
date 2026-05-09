import React, { useEffect, useState, useMemo } from "react";
import {
  getQuizStatistics,
  getQuestionStatistics,
} from "../../service/quiz.service";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const ALPHAS = ["A", "B", "C", "D", "E", "F"];
const PAGE_SIZE = 2;

/* ─────────────────────────────────────────────
   Pagination helper — smart ellipsis
───────────────────────────────────────────── */
const getPageRange = (current, total) => {
  if (total <= 7) return [...Array(total)].map((_, i) => i);
  const delta = 2;
  const range = [];
  const left = Math.max(0, current - delta);
  const right = Math.min(total - 1, current + delta);
  if (left > 0) range.push(0);
  if (left > 1) range.push("...");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 2) range.push("...");
  if (right < total - 1) range.push(total - 1);
  return range;
};

/* ─────────────────────────────────────────────
   MediaPreview
───────────────────────────────────────────── */
const MediaPreview = ({ mediaType, mediaUrl }) => {
  if (!mediaUrl) return null;
  const type = mediaType?.toUpperCase();
  if (type === "IMAGE") {
    return (
      <div className="qst-media-wrap">
        <img src={mediaUrl} alt="media" className="qst-media-img" />
      </div>
    );
  }
  if (type === "AUDIO") {
    return (
      <div className="qst-media-wrap">
        <div className="qst-media-audio">
          <i
            className="bi bi-music-note-beamed"
            style={{ fontSize: 18, color: "#3d3a8c" }}
          />
          <audio controls className="qst-audio-player">
            <source src={mediaUrl} />
            Trình duyệt không hỗ trợ audio.
          </audio>
        </div>
      </div>
    );
  }
  if (type === "VIDEO") {
    return (
      <div className="qst-media-wrap">
        <video controls className="qst-media-video">
          <source src={mediaUrl} />
          Trình duyệt không hỗ trợ video.
        </video>
      </div>
    );
  }
  return null;
};

/* ─────────────────────────────────────────────
   QuestionStatCard
───────────────────────────────────────────── */
const QuestionStatCard = ({ question: q, index }) => {
  const correctPct = q.correctPercent.toFixed(0);
  const wrongPct = q.wrongPercent.toFixed(0);
  const skipPct = q.skipPercent.toFixed(0);

  return (
    <div className="qst-card">
      <div className="qst-card__header">
        <span className="qst-card__num">{index + 1}</span>
        <div className="qst-card__content">
          <div className="qst-card__title">{q.content}</div>
        </div>
      </div>

      <MediaPreview mediaType={q.mediaType} mediaUrl={q.mediaUrl} />

      <div className="qst-card__body">
        <div className="qst-mini-bars">
          <div style={{ width: `${correctPct}%`, background: "#1976d2" }} />
          <div style={{ width: `${wrongPct}%`, background: "#dc2626" }} />
          <div style={{ width: `${skipPct}%`, background: "#f59e0b" }} />
        </div>
        <div className="qst-card__pct-block">
          <span className="qst-card__pct-val">{q.correctPercent}%</span>
          <span className="qst-card__pct-label"> trả lời đúng</span>
        </div>

        <div className="qst-stats-row">
          {[
            { cls: "correct", label: "Đúng", val: q.correctCount },
            { cls: "wrong", label: "Sai", val: q.wrongCount },
            { cls: "skip", label: "Bỏ trống", val: q.skippedCount },
          ].map(({ cls, label, val }) => (
            <span key={cls} className="qst-stat-pill">
              <span className={`qst-stat-dot qst-stat-dot--${cls}`} />
              <span className="qst-stat-label">{label}</span>
              <span className="qst-stat-val">{val}</span>
            </span>
          ))}
        </div>

        {q.optionStats?.length > 0 && (
          <div className="qst-options">
            {q.optionStats.map((opt, oi) => {
              const isCorrect = opt.isCorrect ?? opt.correct ?? false;
              return (
                <div
                  key={opt.optionId}
                  className={`qst-option-row${isCorrect ? " qst-option-row--correct" : ""}`}
                >
                  <span
                    className={`qst-option-label${isCorrect ? " qst-option-label--correct" : ""}`}
                  >
                    {isCorrect ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <polyline
                          points="2,7 5.5,10.5 12,3.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    ) : (
                      ALPHAS[oi]
                    )}
                  </span>
                  <div className="qst-option-body">
                    <span className="qst-option-text">{opt.optionText}</span>
                    <span className="qst-option-stat">
                      {opt.chosenCount} ({opt.chosenPercent}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   StatsTab
───────────────────────────────────────────── */
const StatsTab = ({ quizId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [qStats, setQStats] = useState([]);
  const [qLoading, setQLoading] = useState(false);

  const [sortMode, setSortMode] = useState("default"); // "default" | "most_wrong" | "most_correct"
  const [currentPage, setCurrentPage] = useState(0);

  /* Fetch quiz-level statistics */
  useEffect(() => {
    if (!quizId) return;
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getQuizStatistics(quizId);

        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu thống kê.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [quizId]);

  /* Fetch per-question statistics — only when randomQuestions === false */
  useEffect(() => {
    if (!quizId || !stats || stats.randomQuestions || !stats.totalAttempts)
      return;
    const fetchQStats = async () => {
      try {
        setQLoading(true);
        const res = await getQuestionStatistics(quizId);

        setQStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setQLoading(false);
      }
    };
    fetchQStats();
  }, [quizId, stats]);

  /* Sort handler — reset page on sort change */
  const handleSort = (mode) => {
    setSortMode(mode);
    setCurrentPage(0);
  };

  /* Sorted question list */
  const sortedQStats = useMemo(() => {
    if (!qStats.length) return [];
    if (sortMode === "most_wrong")
      return [...qStats].sort((a, b) => b.wrongPercent - a.wrongPercent);
    if (sortMode === "most_correct")
      return [...qStats].sort((a, b) => b.correctPercent - a.correctPercent);
    return qStats;
  }, [qStats, sortMode]);

  /* Pagination */
  const totalPages = Math.ceil(sortedQStats.length / PAGE_SIZE);
  const pagedQStats = sortedQStats.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE,
  );

  /* Chart data */
  const total = stats
    ? (stats.excellent || 0) +
      (stats.good || 0) +
      (stats.average || 0) +
      (stats.weak || 0)
    : 0;

  const distributions = stats
    ? [
        {
          label: "Xuất sắc",
          key: "excellent",
          value: stats.excellent || 0,
          color: "#3d3a8c",
          range: "≥ 8.0",
        },
        {
          label: "Khá",
          key: "good",
          value: stats.good || 0,
          color: "#0f6e56",
          range: "6.5 – 7.9",
        },
        {
          label: "Trung bình",
          key: "average",
          value: stats.average || 0,
          color: "#854f0b",
          range: "5.0 – 6.4",
        },
        {
          label: "Yếu",
          key: "weak",
          value: stats.weak || 0,
          color: "#a32d2d",
          range: "< 5.0",
        },
      ]
    : [];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : "0.0";
    return (
      <div className="sts-tooltip">
        <div className="sts-tooltip__label" style={{ color: d.color }}>
          {d.label} ({d.range})
        </div>
        <div className="sts-tooltip__value">
          {d.value} bài &nbsp;·&nbsp; {pct}%
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{statsStyle}</style>
      <div className="sts-wrap">
        {loading && (
          <div className="sts-loading">
            <div className="sts-spinner" />
          </div>
        )}

        {!loading && error && (
          <div className="sts-empty">
            <i className="bi bi-exclamation-circle sts-empty-icon" />
            <div className="sts-empty__title">{error}</div>
          </div>
        )}

        {!loading && !error && !stats && (
          <div className="sts-empty">
            <i className="bi bi-bar-chart sts-empty-icon" />
            <div className="sts-empty__title">Chưa có dữ liệu thống kê</div>
            <div className="sts-empty__sub">
              Dữ liệu sẽ hiển thị khi có học sinh nộp bài
            </div>
          </div>
        )}

        {!loading && !error && stats && (
          <>
            {/* Summary cards */}
            <div className="sts-summary-grid">
              <div className="sts-card">
                <div className="sts-card__label">
                  <span className="sts-card__icon">
                    <i
                      className="bi bi-grid-fill"
                      style={{ color: "#388e3c", fontSize: 16 }}
                    />
                  </span>
                  Tổng bài nộp
                </div>
                <div className="sts-card__value">
                  {stats.totalAttempts ?? "—"}
                </div>
              </div>
              <div className="sts-card">
                <div className="sts-card__label">
                  <span className="sts-card__icon">
                    <i
                      className="bi bi-bar-chart-fill"
                      style={{ color: "#ef6c00", fontSize: 16 }}
                    />
                  </span>
                  Điểm Trung Bình
                </div>
                <div className="sts-card__value">
                  {stats.averageScore != null
                    ? Number(stats.averageScore).toFixed(1)
                    : "—"}
                </div>
              </div>
              <div className="sts-card">
                <div className="sts-card__label">
                  <span className="sts-card__icon">
                    <i
                      className="bi bi-clock-fill"
                      style={{ color: "#1976d2", fontSize: 16 }}
                    />
                  </span>
                  Thời gian làm TB
                </div>
                <div className="sts-card__value" style={{ fontSize: 20 }}>
                  {stats.averageTime || "—"}
                </div>
              </div>
            </div>

            {/* Bar chart */}
            <div className="sts-dist-card">
              <div className="sts-dist-header">
                <span className="sts-section-title">Số liệu thống kê</span>
                <span className="sts-n-badge">N = {total} bài nộp</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={distributions}
                  margin={{ top: 16, right: 10, left: -40, bottom: 4 }}
                  barCategoryGap="35%"
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="#f0f0f0"
                    strokeDasharray="4 2"
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 13, fill: "#6b7280" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {distributions.map((d) => (
                      <Cell key={d.key} fill={d.color} />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="top"
                      style={{ fontSize: 12, fontWeight: 500, fill: "#374151" }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="sts-legend">
                {distributions.map((d) => (
                  <span key={d.key} className="sts-legend__item">
                    <span
                      className="sts-legend__dot"
                      style={{ background: d.color }}
                    />
                    {d.label}
                    <span className="sts-legend__range">{d.range}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* ── Per-question statistics ── */}
            {!stats.randomQuestions && stats.totalAttempts > 0 && (
              <div className="qst-section">
                {/* Header + sort buttons */}
                <div className="qst-section-header">
                  <span className="sts-section-title">Thống kê câu hỏi</span>
                  {/* Sort buttons + mobile dropdown */}
                  <div className="qst-sort-btns">
                    {/* Desktop: buttons */}
                    {[
                      { key: "default", label: "Mặc định" },
                      { key: "most_wrong", label: "Sai nhiều nhất" },
                      { key: "most_correct", label: "Đúng nhiều nhất" },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        className={`qst-sort-btn${sortMode === key ? " qst-sort-btn--active" : ""}`}
                        onClick={() => handleSort(key)}
                      >
                        {label}
                      </button>
                    ))}

                    {/* Mobile: dropdown */}
                    <select
                      className="qst-sort-select"
                      value={sortMode}
                      onChange={(e) => handleSort(e.target.value)}
                    >
                      <option value="default">Mặc định</option>
                      <option value="most_wrong">Sai nhiều nhất</option>
                      <option value="most_correct">Đúng nhiều nhất</option>
                    </select>
                  </div>
                </div>

                {qLoading && (
                  <div className="sts-loading">
                    <div className="sts-spinner" />
                  </div>
                )}

                {!qLoading && sortedQStats.length === 0 && (
                  <div className="sts-empty" style={{ padding: "32px 16px" }}>
                    <div className="sts-empty__title">
                      Chưa có dữ liệu câu hỏi
                    </div>
                  </div>
                )}

                {!qLoading && pagedQStats.length > 0 && (
                  <>
                    <div className="qst-list">
                      {pagedQStats.map((q, idx) => (
                        <QuestionStatCard
                          key={q.questionId}
                          question={q}
                          index={currentPage * PAGE_SIZE + idx}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <>
                        <div className="qd-pagination">
                          <button
                            className="qd-page-btn"
                            disabled={currentPage === 0}
                            onClick={() => setCurrentPage((p) => p - 1)}
                          >
                            <i className="bi bi-chevron-left" />
                          </button>

                          {getPageRange(currentPage, totalPages).map(
                            (item, i) =>
                              item === "..." ? (
                                <span
                                  key={`ellipsis-${i}`}
                                  className="qd-page-ellipsis"
                                >
                                  …
                                </span>
                              ) : (
                                <button
                                  key={item}
                                  className={`qd-page-btn${currentPage === item ? " qd-page-btn--active" : ""}`}
                                  onClick={() => setCurrentPage(item)}
                                >
                                  {item + 1}
                                </button>
                              ),
                          )}

                          <button
                            className="qd-page-btn"
                            disabled={currentPage === totalPages - 1}
                            onClick={() => setCurrentPage((p) => p + 1)}
                          >
                            <i className="bi bi-chevron-right" />
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────
   Styles
───────────────────────────────────────────── */
const statsStyle = `
  .sts-wrap { max-width: 1100px; margin: 0 auto; padding: 0 20px 32px; box-sizing: border-box; }
  .sts-section-title { font-size: 16px; font-weight: 600; color: #374151; }
  .sts-n-badge { font-size: 14px; font-weight: 600; color: #3d3a8c; }

  .sts-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
  .sts-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px 18px; }
  .sts-card__label { font-size: 14px; color: #6b7280; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
  .sts-card__icon { width: 22px; height: 22px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .sts-card__value { font-size: 22px; font-weight: 700; color: #1a1a2e; line-height: 1.2; }

  .sts-dist-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px 20px 20px; margin-bottom: 16px; }
  .sts-dist-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }

  .sts-legend { display: flex; flex-wrap: wrap; gap: 12px 20px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #f3f4f6; }
  .sts-legend__item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #6b7280; }
  .sts-legend__dot { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
  .sts-legend__range { font-size: 12px; color: #9ca3af; }

  .sts-tooltip { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .sts-tooltip__label { font-size: 13px; font-weight: 500; margin-bottom: 2px; }
  .sts-tooltip__value { font-size: 13px; color: #374151; }

  .sts-loading { display: flex; align-items: center; justify-content: center; padding: 64px 0; }
  .sts-spinner { width: 28px; height: 28px; border: 3px solid #e9ecef; border-top-color: #3d3a8c; border-radius: 50%; animation: sts-spin 0.7s linear infinite; }
  .sts-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 64px 16px; gap: 6px; }
  .sts-empty-icon { font-size: 36px; color: #d1d5db; margin-bottom: 6px; }
  .sts-empty__title { font-size: 16px; font-weight: 500; color: #374151; }
  .sts-empty__sub { font-size: 14px; color: #9ca3af; }
  @keyframes sts-spin { to { transform: rotate(360deg); } }

  /* ── Question statistics section ── */
  .qst-section { margin-top: 4px; }
  /* MỚI */
  .qst-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 8px; flex-wrap: nowrap; }
  .qst-list { display: flex; flex-direction: column; gap: 12px; }

 /* ── Sort buttons ── */
  .qst-sort-btns { display: flex; gap: 6px; flex-wrap: wrap; }
  .qst-sort-btn {
    padding: 5px 14px; border-radius: 8px; font-size: 13px; font-weight: 500;
    border: 1px solid #e5e7eb; background: #fff; color: #6b7280;
    cursor: pointer; transition: all 0.15s;
  }
  .qst-sort-btn:hover:not(.qst-sort-btn--active) { border-color: #3d3a8c; color: #3d3a8c; }
  .qst-sort-btn--active { background: #3d3a8c; border-color: #3d3a8c; color: #fff; cursor: default; }

  /* Mobile dropdown — ẩn mặc định */
  .qst-sort-select { display: none; }

  /* ── Pagination ── */
  .qd-pagination { display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 20px; flex-wrap: wrap; }
  .qd-page-btn {
    min-width: 34px; height: 34px; border-radius: 8px;
    border: 1px solid #e5e7eb; background: #fff;
    font-size: 16px; font-weight: 500; color: #374151;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .qd-page-btn:hover:not(:disabled) { border-color: #3d3a8c; color: #3d3a8c; }
  .qd-page-btn--active { background: #3d3a8c; border-color: #3d3a8c; color: #fff; }
  .qd-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .qd-page-ellipsis { font-size: 16px; color: #9ca3af; padding: 0 2px; line-height: 34px; }
  .qd-page-info { text-align: center; margin-top: 8px; font-size: 16px; color: #9ca3af; }

  /* ── Question card ── */
  .qst-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
  .qst-card__header { padding: 14px 18px 10px; display: flex; align-items: flex-start; gap: 12px; }
  .qst-card__num {
    flex-shrink: 0; width: 30px; height: 30px; border-radius: 6px;
    background: #eeedfe; color: #3d3a8c;
    font-size: 16px; font-weight: 600;
    display: flex; align-items: center; justify-content: center;
  }
  .qst-card__content { flex: 1; min-width: 0; }
  .qst-card__title { font-size: 16px; color: #1a1a2e; margin-bottom: 4px; }
  .qst-card__pct-block { margin: 6px 0 10px; }
  .qst-card__pct-val { font-size: 14px; font-weight: 700; color: #1a1a2e; }
  .qst-card__pct-label { font-size: 13px; color: #6b7280; }
  .qst-card__body { padding: 0 18px 16px; }

  .qst-mini-bars { display: flex; height: 5px; border-radius: 4px; overflow: hidden; gap: 1px; margin-bottom: 12px; }
  .qst-mini-bars > div { height: 100%; }

  .qst-stats-row { display: flex; gap: 16px; margin-bottom: 14px; flex-wrap: wrap; }
  .qst-stat-pill { display: flex; align-items: center; gap: 5px; font-size: 13px; }
  .qst-stat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .qst-stat-dot--correct { background: #1976d2; }
  .qst-stat-dot--wrong   { background: #dc2626; }
  .qst-stat-dot--skip    { background: #f59e0b; }
  .qst-stat-label { color: #374151; font-weight: 500; }
  .qst-stat-val   { color: #111827; font-weight: 700; }

  /* Option rows */
  .qst-options { display: flex; flex-direction: column; gap: 7px; }
  .qst-option-row { display: flex; align-items: flex-start; gap: 6px; font-size: 15px; padding: 6px 8px; border-radius: 8px; }
  .qst-option-row--correct { background: #e8f8f1; }
  .qst-option-label {
    flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%;
    border: 1.5px solid #d1d5db;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 500; color: #6b7280;
  }
  .qst-option-label--correct { border-color: #1d9e75; background: #1d9e75; color: #fff; }
  .qst-option-body { flex: 1; min-width: 0; }
  .qst-option-text { color: #374151; word-break: break-word; }
  .qst-option-stat { font-size: 12px; color: #4e1a92; white-space: nowrap; float: right; margin-left: 8px; }

  /* ── Media preview ── */
  .qst-media-wrap { padding: 0 18px 12px; display: flex; flex-direction: column; align-items: center; }
  .qst-media-img { max-width: 100%; max-height: 260px; object-fit: contain; border-radius: 8px; border: 1px solid #e5e7eb; display: block; }
  .qst-media-audio { display: flex; align-items: center; gap: 10px; background: #f5f4ff; border: 1px solid #e0defb; border-radius: 8px; padding: 10px 14px; width: 100%; max-width: 480px; }
  .qst-audio-player { flex: 1; height: 32px; outline: none; }
  .qst-media-video { max-width: 100%; max-height: 280px; border-radius: 8px; border: 1px solid #e5e7eb; display: block; background: #000; }

  @media (max-width: 820px) {
    .sts-summary-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 620px) {
  .sts-summary-grid { grid-template-columns: 1fr; }

  .qst-sort-btn { display: none; }
  .qst-sort-select {
    display: block;
    width: 130px;        /* cố định width */
    flex-shrink: 0;      /* không bị co */
    margin-left: auto;   /* đẩy sang phải */
    padding: 7px 7px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: #fff;
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    appearance: auto;
  }
}
`;

export default StatsTab;
