import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../service/auth.service";
import { toast } from "react-toastify";
import bgImage from "../assets/Background-login.jpg";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError("");
  };

  const validate = () => {
    if (!email.trim()) {
      setError("Email không được để trống");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email không hợp lệ");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword({ email });
      toast.success("Đã gửi mã OTP đến email của bạn!");
      setTimeout(() => {
        navigate("/verify-otp", { state: { email } });
      }, 1500);
    } catch (error) {
      toast.error(
        "Gửi email thất bại: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
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
        <h2 className="text-center mb-3 fw-bold text-primary">Quên Mật Khẩu</h2>
        <p className="text-center text-muted mb-4">
          Nhập email của bạn để tiến hành đặt lại mật khẩu
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              className={`form-control ${error ? "is-invalid" : ""}`}
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="example@email.com"
            />
            {error && <div className="text-danger small mt-1">{error}</div>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary w-100 py-2 mb-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Đang xử lý...
              </>
            ) : (
              "Gửi Email "
            )}
          </button>

          {/* Back to Login */}
          <div className="text-center">
            <span
              onClick={() => navigate("/login")}
              className="text-primary text-decoration-none"
              style={{ cursor: "pointer" }}
            >
              <i className="bi bi-arrow-left me-1"></i>
              Quay lại đăng nhập
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
