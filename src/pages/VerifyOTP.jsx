import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOTP, sendOTP } from "../service/auth.service";
import { toast } from "react-toastify";
import bgImage from "../assets/Background-login.jpg";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ❗ GIỮ NGUYÊN EMAIL như bạn yêu cầu
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
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

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);
    setError("");

    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const otpString = otp.join("");
    setLoading(true);

    try {
      await verifyOTP({ email, otp: otpString });

      toast.success("Xác thực thành công!");
      navigate("/reset-password", {
        state: { email, otp: otpString },
      });
    } catch (err) {
      toast.error(
        "Mã OTP không hợp lệ: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX RESEND OTP
  const handleResend = async () => {
    if (!canResend) return;

    if (!email) {
      toast.error("Không tìm thấy email để gửi lại OTP");
      return;
    }

    try {
      setResending(true);

      await sendOTP({
        email: email,
        type: 2,
      });

      toast.success("Đã gửi lại mã OTP");

      // reset state
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      setError("");

      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(
        "Gửi lại OTP thất bại: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="container-fluid vh-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="w-100 bg-white rounded-4 shadow-lg"
        style={{ maxWidth: "450px", padding: "40px" }}
      >
        <h2 className="text-center mb-3 fw-bold text-primary">Xác Thực OTP</h2>

        <p className="text-center text-muted mb-4">
          Mã OTP đã được gửi đến email: <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <div className="d-flex justify-content-center gap-2 mb-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  className={`form-control text-center fs-3 fw-bold ${
                    error ? "is-invalid" : ""
                  }`}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  maxLength="1"
                  style={{
                    width: "55px",
                    height: "55px",
                    borderRadius: "8px",
                  }}
                />
              ))}
            </div>

            {error && (
              <div className="text-danger small text-center">{error}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 mb-3"
            disabled={loading}
          >
            {loading ? "Đang xác thực..." : "Xác Nhận"}
          </button>

          {/* RESEND */}
          <div className="text-center mb-2">
            <span className="text-muted">Không nhận được mã? </span>

            {canResend ? (
              <span
                onClick={!resending ? handleResend : undefined}
                className="text-primary fw-semibold"
                style={{
                  cursor: resending ? "not-allowed" : "pointer",
                  opacity: resending ? 0.6 : 1,
                }}
              >
                {resending ? "Đang gửi..." : "Gửi lại"}
              </span>
            ) : (
              <span className="text-muted fw-semibold">
                Gửi lại ({countdown}s)
              </span>
            )}
          </div>

          <div className="text-center">
            <span
              onClick={() => navigate("/login")}
              className="text-primary"
              style={{ cursor: "pointer" }}
            >
              ← Quay lại đăng nhập
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
