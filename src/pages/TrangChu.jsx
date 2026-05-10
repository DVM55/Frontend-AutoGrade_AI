import React, { useEffect } from "react";
import img1 from "../assets/1.jpg";
import img2 from "../assets/2.png";
import img3 from "../assets/3.jpg";
import img4 from "../assets/4.jpg";
import img5 from "../assets/5.jpg";
import anh_nen from "../assets/anh_nen.webp";
import Footer from "../layout/Footer";

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800;900&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .tc-root {
    font-family: 'Be Vietnam Pro', sans-serif;
    color: #0f172a;
    overflow-x: hidden;
  }

  /* ══════════════════════════════
     HERO
  ══════════════════════════════ */

  .tc-hero {
    padding: 40px 40px;
    background: #fff;
  }

  .tc-hero-inner {
    max-width: 1180px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 64px;
  }

  .tc-hero-left {
    flex: 1;
  }

  .tc-hero-right {
    flex: 1;
    display: flex;
    justify-content: flex-end;
  }

  .tc-hero-right img {
    width: 100%;
    max-width: 550px;
    border-radius: 20px;
    display: block;
  }

  

  .tc-hero-title span {
    color: #2563eb;
    text-decoration: underline;
    text-decoration-color: #22c55e;
    text-underline-offset: 6px;
    text-decoration-thickness: 3px;
  }

  .tc-hero-subtitle {
    font-size: 25px;
    color: #2563eb;
    font-weight: 700;
    margin-bottom: 28px;
    line-height: 1.6;
  }

  .tc-hero-features {
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-bottom: 40px;
  }

  .tc-hero-feature {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  .tc-hero-feature-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: #eff6ff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 20px;
  }

  .tc-hero-feature-title {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .tc-hero-feature-desc {
    font-size: 14px;
    color: #64748b;
    line-height: 1.6;
  }

  .tc-hero-btns {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }

  .tc-btn-primary {
    background: #1e3a8a;
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    padding: 14px 32px;
    border-radius: 50px;
    border: none;
    cursor: pointer;
    letter-spacing: 0.3px;
    text-decoration: none;
    display: inline-block;
  }

  .tc-btn-outline {
    background: transparent;
    color: #0f172a;
    font-size: 15px;
    font-weight: 700;
    padding: 13px 32px;
    border-radius: 50px;
    border: 2px solid #cbd5e1;
    cursor: pointer;
    letter-spacing: 0.3px;
    text-decoration: none;
    display: inline-block;
  }

  @media (max-width: 768px) {
    .tc-hero-inner {
      flex-direction: column;
      gap: 40px;
    }
    .tc-hero-right img {
      max-width: 100%;
    }
    .tc-hero {
      padding: 60px 24px;
    }
  }

  /* ══════════════════════════════
     SECTION
  ══════════════════════════════ */

  .tc-section {
    padding: 40px 40px;
  }

  .tc-section--gray {
    background: #f8faff;
  }

  .tc-section-inner {
    max-width: 1180px;
    margin: 0 auto;
  }

  /* ══════════════════════════════
     SHOWCASE
  ══════════════════════════════ */

  .tc-showcase {
    display: flex;
    align-items: center;
    gap: 72px;
    margin-bottom: 96px;
  }

  .tc-showcase--reverse {
    flex-direction: row-reverse;
  }

  .tc-showcase:last-child {
    margin-bottom: 0;
  }

  .tc-showcase-text {
    flex: 1;
  }

  .tc-showcase-img-wrap {
    flex: 1.15;
    position: relative;
  }

  .tc-showcase-img-wrap img {
    width: 100%;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(37,99,235,0.12);
    border: 1px solid #e2e8f0;
    display: block;
  }

  .tc-showcase-title {
    font-size: 25px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 14px;
    line-height: 1.28;
    letter-spacing: -0.3px;
  }

  .tc-showcase-desc {
    font-size: 14px;
    color: #64748b;
    line-height: 1.75;
    margin-bottom: 28px;
  }

  /* ══════════════════════════════
     BADGES
  ══════════════════════════════ */

  .tc-badge-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .tc-badge-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 14px;
    color: #0f172a;
    font-weight: 500;
    line-height: 1.6;
  }

  .tc-badge-dot {
    width: 22px;
    height: 22px;
    border-radius: 7px;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 12px;
    color: #fff;
    font-weight: 800;
  }

  /* ══════════════════════════════
     DUAL IMAGES
  ══════════════════════════════ */

  .tc-dual-block {
    display: flex;
    align-items: center;
    gap: 72px;
    margin-bottom: 96px;
  }

  .tc-dual-text {
    flex: 1;
  }

  .tc-dual-images {
    flex: 1.15;
    display: grid;
    grid-template-columns: 0.75fr 1.25fr;
    gap: 14px;
    align-items: start;
  }

  .tc-dual-images img {
    width: 100%;
    border-radius: 14px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 10px 32px rgba(0,0,0,0.1);
    display: block;
  }

  .tc-dual-images img:nth-child(2) {
    margin-top: 28px;
  }

  /* ══════════════════════════════
     RESPONSIVE
  ══════════════════════════════ */

  @media (max-width: 1000px) {
    .tc-dual-block {
      flex-direction: column !important;
      gap: 36px;
      margin-bottom: 60px;
    }
  }

  @media (max-width: 768px) {
    .tc-showcase,
    .tc-dual-block {
      flex-direction: column !important;
      gap: 36px;
      margin-bottom: 60px;
    }

    .tc-section {
      padding: 60px 24px;
    }
  }

  @media (max-width: 420px) {
    .tc-dual-images {
      grid-template-columns: 1fr;
      justify-items: center;
    }

    .tc-dual-images img {
      max-width: 280px;
    }

    .tc-dual-images img:nth-child(2) {
      margin-top: 0;
    }
  }
`;
/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const heroChecklist = [
  "Tạo hoặc upload file câu hỏi trắc nghiệm",
  "Trộn câu hỏi & tự động chấm bài",
  "Lấy ngẫu nhiên từ ngân hàng câu hỏi",
  "AI tự động tạo câu hỏi theo chủ đề",
  "Thi online, không cần cài ứng dụng",
  "Phân quyền & kiểm soát truy cập",
];

const stats = [
  { icon: "🎓", bg: "#eff6ff", num: "50,000+", label: "Học sinh đã thi" },
  { icon: "📝", bg: "#f0fdf4", num: "12,000+", label: "Bài kiểm tra đã tạo" },
  { icon: "⚡", bg: "#fffbeb", num: "99.9%", label: "Uptime đảm bảo" },
  { icon: "🆓", bg: "#fdf4ff", num: "Miễn phí", label: "Không mất phí cơ bản" },
];

const showcases = [
  {
    eyebrow: "✏️ Soạn đề",
    title: "Tạo câu hỏi trắc nghiệm chuyên nghiệp",
    desc: "Giao diện soạn thảo cho phép thêm nhiều đáp án, đánh dấu đáp án đúng và tích hợp AI tạo câu hỏi tự động — tiết kiệm hàng giờ soạn bài.",
    items: [
      "Thêm / xóa đáp án tùy ý",
      "AI tự sinh câu hỏi theo chủ đề",
      "Import hàng loạt từ file",
    ],
    img: img3,
    reverse: false,
  },
  {
    eyebrow: "⚙️ Cài đặt đề",
    title: "Tùy chỉnh bài kiểm tra toàn diện",
    desc: "Thiết lập tổng điểm, số lần làm tối đa, cho phép xem lại đáp án và chia điểm đều tự động cho tất cả câu hỏi.",
    items: [
      "Chia điểm đều tự động",
      "Giới hạn số lần làm bài",
      "Bật / tắt xem lại đáp án",
    ],
    img: img4,
    reverse: true,
  },
  {
    eyebrow: "🔐 Quyền truy cập",
    title: "Kiểm soát ai được làm bài",
    desc: "Giới hạn bài kiểm tra theo lớp học, thiết lập thời gian truy cập cụ thể và bật chế độ riêng tư chỉ cho thành viên.",
    items: [
      "Phân quyền theo lớp học",
      "Giới hạn khung thời gian",
      "Chế độ riêng tư linh hoạt",
    ],
    img: img5,
    reverse: false,
  },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
const TrangChu = () => {
  useEffect(() => {
    if (!document.getElementById("tc-styles")) {
      const el = document.createElement("style");
      el.id = "tc-styles";
      el.textContent = STYLES;
      document.head.appendChild(el);
    }
  }, []);

  return (
    <>
      <div className="tc-root">
        {/* ══════ SHOWCASES ══════ */}
        {/* ══════ HERO ══════ */}
        <section className="tc-hero">
          <div className="tc-hero-inner">
            <div className="tc-hero-left">
              <p className="tc-hero-subtitle">
                Nâng cao chất lượng kiểm tra, đánh giá, trải nghiệm Giảng dạy và
                Học tập cùng AI
              </p>
              <div className="tc-hero-features">
                {[
                  {
                    icon: "✏️",
                    title: "Tạo câu hỏi trắc nghiệm chuyên nghiệp",
                    desc: "Thêm / xóa đáp án tùy ý, AI tự sinh câu hỏi theo chủ đề, import hàng loạt từ file — tiết kiệm hàng giờ soạn bài.",
                  },
                  {
                    icon: "⚙️",
                    title: "Tùy chỉnh bài kiểm tra toàn diện",
                    desc: "Giới hạn số lần làm bài, bật / tắt xem lại đáp án sau khi nộp.",
                  },
                  {
                    icon: "🔐",
                    title: "Kiểm soát ai được làm bài",
                    desc: "Phân quyền theo lớp học, giới hạn khung thời gian truy cập và chế độ riêng tư linh hoạt.",
                  },
                ].map((f, i) => (
                  <div className="tc-hero-feature" key={i}>
                    <div className="tc-hero-feature-icon">{f.icon}</div>
                    <div>
                      <div className="tc-hero-feature-title">{f.title}</div>
                      <div className="tc-hero-feature-desc">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="tc-hero-btns">
                <a href="/login" className="tc-btn-primary">
                  Đăng nhập
                </a>
                <a href="/register" className="tc-btn-outline">
                  Đăng ký miễn phí
                </a>
              </div>
            </div>
            <div className="tc-hero-right">
              <img src={anh_nen} alt="Nền tảng kiểm tra đánh giá" />
            </div>
          </div>
        </section>

        <section className="tc-section tc-section--gray">
          <div className="tc-section-inner">
            {/* dual images */}
            <div className="tc-dual-block">
              <div className="tc-dual-text">
                <div className="tc-showcase-title">
                  Tối ưu trên mọi thiết bị — điện thoại lẫn máy tính
                </div>
                <div className="tc-showcase-desc">
                  Học sinh làm bài mượt mà trên cả mobile lẫn desktop. Giao diện
                  tự điều chỉnh thông minh: điện thoại hiển thị gọn, máy tính mở
                  rộng thêm bảng điều hướng.
                </div>
                <div className="tc-badge-list">
                  {[
                    "Giao diện làm bài trắc nghiệm online trực quan và dễ tương tác",
                    "Giao diện tuỳ biến theo kích thước màn hình mà không làm thay đổi chất lượng hình ảnh",
                    "Chỉ cần truy cập link bài thi và làm bài mà không cần cài đặt ứng dụng",
                    "Học sinh dễ dàng truy cập và làm bài thi trắc nghiệm online mà không cần cài đặt thêm ứng dụng",
                  ].map((item, j) => (
                    <div className="tc-badge-item" key={j}>
                      <div className="tc-badge-dot">✓</div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="tc-dual-images">
                <img src={img1} alt="Giao diện mobile" loading="lazy" />
                <img src={img2} alt="Giao diện desktop" loading="lazy" />
              </div>
            </div>

            {/* remaining showcases */}
            {showcases.map((s, i) => (
              <div
                className={`tc-showcase ${s.reverse ? "tc-showcase--reverse" : ""}`}
                key={i}
              >
                <div className="tc-showcase-text">
                  <div className="tc-showcase-title">{s.title}</div>
                  <div className="tc-showcase-desc">{s.desc}</div>
                  <div className="tc-badge-list">
                    {s.items.map((item, j) => (
                      <div className="tc-badge-item" key={j}>
                        <div className="tc-badge-dot">✓</div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="tc-showcase-img-wrap">
                  <img src={s.img} alt={s.title} loading="lazy" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default TrangChu;
