import { useNavigate } from "react-router-dom";
import Footer from "../layout/Footer";

/* ─── Icon SVGs ─── */
const icons = {
  ai: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  bank: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  time: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  share: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  platform: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  analytics: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  security: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  collab: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

const features = [
  {
    key: "ai",
    icon: icons.ai,
    title: "Trí tuệ nhân tạo tạo câu hỏi",
    desc: "Tích hợp AI để tự động tạo câu hỏi chất lượng cao từ tài liệu hoặc chủ đề bất kỳ",
    bullets: [
      "Tích hợp ChatGPT để tạo câu hỏi theo chủ đề",
      "Chuyển đổi tài liệu PDF, Word thành bộ câu hỏi",
      "Tùy chỉnh độ khó và số lượng câu hỏi",
      "Kiểm duyệt và chỉnh sửa câu hỏi trước khi sử dụng",
    ],
  },
  {
    key: "bank",
    icon: icons.bank,
    title: "Quản lý ngân hàng câu hỏi",
    desc: "Hệ thống quản lý câu hỏi toàn diện với khả năng phân loại và tìm kiếm thông minh",
    bullets: [
      "Hỗ trợ nhiều dạng câu hỏi: trắc nghiệm, tự luận, upload file",
      "Import/Export hàng loạt từ Word, Excel, PDF",
      "Phân loại câu hỏi theo môn học, chủ đề, độ khó",
      "Tìm kiếm câu hỏi nhanh chóng và chính xác",
    ],
  },
  {
    key: "time",
    icon: icons.time,
    title: "Quản lý thời gian và lịch thi",
    desc: "Hệ thống lập lịch linh hoạt với các tính năng kiểm soát thời gian chính xác",
    bullets: [
      "Cài đặt thời gian bắt đầu và kết thúc làm bài",
      "Quy định thời gian làm bài theo nhu cầu",
      "Tự động nộp bài khi hết thời gian",
      "Ghi lại quá trình làm bài của học sinh",
    ],
  },
  {
    key: "share",
    icon: icons.share,
    title: "Chia sẻ và quản lý truy cập",
    desc: "Nhiều phương thức chia sẻ bài thi với khả năng kiểm soát truy cập linh hoạt",
    bullets: [
      "Chia sẻ qua link, QR code hoặc email",
      "Quản lý nhóm và lớp học sinh chi tiết",
      "Phân quyền truy cập theo danh sách",
      "Thông báo tự động khi có bài thi mới",
    ],
  },
  {
    key: "platform",
    icon: icons.platform,
    title: "Giao diện đa nền tảng",
    desc: "Trải nghiệm làm bài nhất quán trên mọi thiết bị mà không cần cài đặt ứng dụng",
    bullets: [
      "Hoạt động trực tiếp trên trình duyệt web",
      "Tối ưu cho máy tính, tablet và điện thoại",
      "Giao diện trực quan, dễ sử dụng",
      "Hỗ trợ upload file",
    ],
  },
  {
    key: "analytics",
    icon: icons.analytics,
    title: "Phân tích và báo cáo",
    desc: "Hệ thống chấm điểm tự động và báo cáo chi tiết về kết quả học tập",
    bullets: [
      "Chấm điểm tự động cho câu hỏi trắc nghiệm",
      "Hỗ trợ chấm điểm thủ công cho tự luận",
      "Báo cáo kết quả chi tiết từng học sinh",
      "Xuất báo cáo dưới nhiều định dạng",
    ],
  },
];

/* ─── Feature Page ─── */
const Feature = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        /* ═══ FEATURE PAGE ═══ */
        .fp-wrap {
          background: #f8faff;
          min-height: calc(100dvh - var(--header-h));
          padding-top: 40px;
        }

        /* ── Section header ── */
        .fp-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 clamp(16px, 4vw, 32px);
        }

        .fp-section__head {
          text-align: center;
          margin-bottom: 48px;
        }

        .fp-section__tag {
          display: inline-block;
          background: var(--blue-soft);
          color: var(--blue);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 99px;
          margin-bottom: 12px;
        }

        .fp-section__title {
          font-size: clamp(1.6rem, 3.5vw, 2.4rem);
          font-weight: 900;
          color: var(--text);
          line-height: 1.2;
          margin-bottom: 12px;
        }

        .fp-section__sub {
          color: var(--muted);
          font-size: 1rem;
          max-width: 520px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* ── Grid ── */
        .fp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        /* ── Card ── */
        .fp-card {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 32px 28px;
          transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s;
          cursor: default;
          position: relative;
          overflow: hidden;
        }

        .fp-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--blue) 0%, #4facfe 100%);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
          border-radius: 3px 3px 0 0;
        }

        .fp-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(13,110,253,0.12);
          border-color: rgba(13,110,253,0.2);
        }

        .fp-card:hover::before {
          transform: scaleX(1);
        }

        .fp-card__icon {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #0d6efd 0%, #6ea8fe 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          box-shadow: 0 4px 12px rgba(13,110,253,0.25);
        }

        .fp-card__icon svg {
          width: 22px;
          height: 22px;
        }

        .fp-card__title {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .fp-card__desc {
          font-size: 1rem;
          color: var(--muted);
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .fp-card__list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .fp-card__list li {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          font-size: 0.9rem;
          color: #374151;
          line-height: 1.5;
        }

        .fp-card__list li::before {
          content: '';
          width: 6px;
          height: 6px;
          background: var(--blue);
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 6px;
        }

        @media (max-width: 600px) {
          .fp-card__list { display: none; }
          .fp-card {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 28px 20px;
          }
          .fp-card__icon { margin-bottom: 16px; }
          .fp-card__title { margin-bottom: 8px; }
          .fp-card__desc { margin-bottom: 0; font-size: 1rem; }
        }

        /* ── CTA Section ── */
        .fp-cta-section {
          max-width: 800px;
          margin: 40px auto 0;
          padding: 0 clamp(16px, 4vw, 32px);
          text-align: center;
          margin-bottom: 40px;
        }

        .fp-cta-box {
          background: linear-gradient(135deg, #0d6efd 0%, #4facfe 100%);
          border-radius: 24px;
          padding: 56px 40px;
          color: #fff;
          position: relative;
          overflow: hidden;
        }

        .fp-cta-box::after {
          content: '';
          position: absolute;
          top: -40px; right: -40px;
          width: 200px; height: 200px;
          background: rgba(255,255,255,0.07);
          border-radius: 50%;
          pointer-events: none;
        }

        .fp-cta-box h2 {
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 900;
          margin-bottom: 12px;
        }

        .fp-cta-box p {
          font-size: 1rem;
          opacity: 0.88;
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .fp-cta-btns {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .fp-btn-white {
          background: #fff;
          color: var(--blue);
          font-size: 1rem;
          font-weight: 700;
          padding: 0.65rem 1.5rem;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }

        .fp-btn-white:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }

        .fp-btn-ghost {
          background: rgba(255,255,255,0.15);
          color: #fff;
          font-size: 1rem;
          font-weight: 700;
          padding: 0.65rem 1.5rem;
          border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.4);
          cursor: pointer;
          transition: background 0.18s;
        }

        .fp-btn-ghost:hover {
          background: rgba(255,255,255,0.25);
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .fp-stats { grid-template-columns: 1fr; }
          .fp-grid  { grid-template-columns: 1fr; }
          .fp-hero  { padding: 56px 20px 72px; }
          .fp-cta-box { padding: 40px 24px; }
        }
      `}</style>

      <div className="fp-wrap">
        {/* ── Features Grid ── */}
        <section className="fp-section">
          <div className="fp-section__head">
            <h2 className="fp-section__title">
              Mọi thứ bạn cần để dạy tốt hơn
            </h2>
            <p className="fp-section__sub">
              Nền tảng tạo bài kiểm tra trực tuyến toàn diện với công nghệ tiên
              tiến, được tin dùng bởi hàng triệu giáo viên và học sinh.
            </p>
          </div>

          <div className="fp-grid">
            {features.map((f) => (
              <div className="fp-card" key={f.key}>
                <div className="fp-card__icon">{f.icon}</div>
                <div className="fp-card__title">{f.title}</div>
                <div className="fp-card__desc">{f.desc}</div>
                <ul className="fp-card__list">
                  {f.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="fp-cta-section">
          <div className="fp-cta-box">
            <h2>Sẵn sàng nâng cấp trải nghiệm giảng dạy?</h2>
            <p>
              Tham gia cùng hàng nghìn giáo viên đang sử dụng Education để tạo
              bài thi chuyên nghiệp.
            </p>
            <div className="fp-cta-btns">
              <button
                className="fp-btn-white"
                onClick={() => navigate("/register")}
              >
                Đăng ký miễn phí
              </button>
              <button
                className="fp-btn-ghost"
                onClick={() => navigate("/contact")}
              >
                Liên hệ tư vấn
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Feature;
