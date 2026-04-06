import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyAccount, sendOTP } from "../service/auth.service";
import { useAuth } from "../context/AuthContext";

const VerifyAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const from = location.state?.from?.pathname || "/";

  const { login } = useAuth();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!successMsg) return;

    const timer = setTimeout(() => {
      setSuccessMsg("");
    }, 5000); // 5s

    return () => clearTimeout(timer);
  }, [successMsg]);

  /* ================= COUNTDOWN ================= */
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  /* ================= OTP INPUT ================= */
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) newOtp[i] = pastedData[i];
    setOtp(newOtp);
    setError("");
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const FIELD_ERRORS = [
    "Mã OTP không được để trống",
    "Mã OTP phải có 6 chữ số",
  ];

  const validate = () => {
    const otpString = otp.join("");
    if (!otpString.trim()) {
      setError("Mã OTP không được để trống");
      return false;
    }
    if (otpString.length !== 6) {
      setError("Mã OTP phải có 6 chữ số");
      return false;
    }
    return true;
  };

  /* ================= VERIFY ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const otpString = otp.join("");
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await verifyAccount({ email, otp: otpString });
      const { accessToken, refreshToken } = res.data;
      await login(accessToken, refreshToken, (userData) => {
        console.log(from);
        navigate(from, { replace: true });
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESEND ================= */
  const handleResend = async () => {
    if (!canResend || resending) return;
    if (!email) {
      setError("Không tìm thấy email để gửi OTP");
      return;
    }
    setError("");
    setSuccessMsg("");
    try {
      setResending(true);
      await sendOTP({ email, type: 1 });
      setSuccessMsg("Đã gửi lại mã OTP thành công!");
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setResending(false);
    }
  };

  const isFieldError = FIELD_ERRORS.includes(error);
  const isBannerError = error && !isFieldError;

  /* ================= UI ================= */
  return (
    <>
      <style>{`
        .verify-wrapper {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background-color: #f0f4ff;
        }

        .verify-card {
          width: 100%;
          max-width: 440px;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          padding: clamp(24px, 6vw, 48px) clamp(20px, 6vw, 40px);
          border: 1px solid #ddd;
        }

        .verify-title {
          font-size: clamp(1.4rem, 5vw, 1.75rem);
          font-weight: 600;
          color: #0d6efd;
          text-align: center;
          margin-bottom: 0.8rem;
        }

        .verify-subtitle {
          font-size: clamp(1rem, 3vw, 1.1rem);
          text-align: center;
          color: #6c757d;
          margin-bottom: 1.5rem;
          line-height: 1.5;
          word-break: break-word;
        }

        .verify-subtitle strong {
          color: #67b664;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        /* ── Alert banners ── */
        .alert-banner {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.65rem 0.85rem;
          border-radius: 8px;
          font-size: clamp(0.78rem, 2.8vw, 0.85rem);
          line-height: 1.5;
          margin-bottom: 1rem;
          word-break: break-word;
        }

        .alert-banner.alert-error {
          background-color: #fff5f5;
          border: 1px solid #f5c2c7;
          color: #842029;
        }

        .alert-banner.alert-success {
          background-color: #f0fff4;
          border: 1px solid #b2dfdb;
          color: #1a5c3a;
        }

        .alert-icon { flex-shrink: 0; }

        /* ── OTP row ── */
        .otp-row {
          display: flex;
          justify-content: center;
          gap: clamp(6px, 2vw, 12px);
          margin-bottom: 0.4rem;
          flex-wrap: nowrap;
        }

        .otp-input {
          width: clamp(40px, 12vw, 55px);
          height: clamp(44px, 13vw, 58px);
          font-size: clamp(1.2rem, 5vw, 1.6rem);
          font-weight: 700;
          text-align: center;
          border: 1px solid #dee2e6;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
          appearance: none;
          background-image: none !important;
          padding: 0;
          color: #212529;
        }

        .otp-input:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.15);
        }

        .otp-input.is-error {
          border-color: #dc3545;
          box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.12);
        }

        .otp-input::-webkit-inner-spin-button,
        .otp-input::-webkit-outer-spin-button { -webkit-appearance: none; }

        /* field-level error sits below inputs */
        .field-error {
          font-size: 0.78rem;
          color: #dc3545;
          text-align: center;
          min-height: 1.1em;
          margin-bottom: 0.85rem;
        }

        /* ── Submit button ── */
        .btn-verify {
          width: 100%;
          padding: 0.7rem 1rem;
          font-size: clamp(1rem, 3vw, 1.1rem);
          font-weight: 600;
          border-radius: 10px;
          background-color: #0d6efd;
          border: none;
          color: #fff;
          cursor: pointer;
          transition: background-color 0.2s, opacity 0.2s;
          margin-bottom: 1rem;
        }

        .btn-verify:disabled { opacity: 0.7; cursor: not-allowed; }
        .btn-verify:not(:disabled):hover { background-color: #0b5ed7; }

        /* ── Resend row ── */
        .resend-row {
          text-align: center;
          font-size: clamp(1rem, 3vw, 1.1rem);
          margin-bottom: 0.75rem;
          color: #6c757d;
        }

        .resend-link {
          color: #0d6efd;
          font-weight: 600;
          cursor: pointer;
          user-select: none;
          transition: opacity 0.2s;
        }

        .resend-link.disabled { cursor: not-allowed; opacity: 0.55; }

        /* ── Back link ── */
        .back-link {
          display: block;
          text-align: center;
          font-size: clamp(1rem, 3vw, 1.1rem);
          color: #0d6efd;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .back-link:hover { opacity: 0.75; }

        @media (max-width: 360px) {
          .verify-card { border-radius: 12px; padding: 20px 14px; }
          .otp-row { gap: 5px; }
        }
      `}</style>

      <div className="verify-wrapper">
        <div className="verify-card">
          <h2 className="verify-title">Xác Thực OTP</h2>

          <p className="verify-subtitle">
            Mã OTP đã được gửi đến email: <strong>{email}</strong>
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* ── Success banner ── */}
            {successMsg && (
              <div
                className="alert-banner alert-success"
                role="status"
                aria-live="polite"
              >
                <span className="alert-icon">✓</span>
                <span>{successMsg}</span>
              </div>
            )}

            {/* ── API / resend error banner ── */}
            {isBannerError && (
              <div
                className="alert-banner alert-error"
                role="alert"
                aria-live="assertive"
              >
                <span className="alert-icon">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* ── OTP inputs ── */}
            <div className="otp-row">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  className={`otp-input${isFieldError ? " is-error" : ""}`}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  maxLength={1}
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>

            {/* ── Field-level validation error ── */}
            <div className="field-error" role="alert" aria-live="polite">
              {isFieldError ? error : ""}
            </div>

            <button type="submit" className="btn-verify" disabled={loading}>
              {loading ? "Đang xác thực..." : "Xác Nhận"}
            </button>

            <div className="resend-row">
              Không nhận được mã?{" "}
              {canResend ? (
                <span
                  className={`resend-link${resending ? " disabled" : ""}`}
                  onClick={handleResend}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleResend()}
                >
                  {resending ? "Đang gửi..." : "Gửi lại"}
                </span>
              ) : (
                <span className="resend-link disabled">
                  Gửi lại ({countdown}s)
                </span>
              )}
            </div>

            <span
              className="back-link"
              onClick={() => navigate("/login")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate("/login")}
            >
              ← Quay lại đăng nhập
            </span>
          </form>
        </div>
      </div>
    </>
  );
};

export default VerifyAccount;
