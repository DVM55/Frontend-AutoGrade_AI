import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { resetPassword } from "../service/auth.service";
import { toast } from "react-toastify";
import bgImage from "../assets/Background-login.jpg";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const otp = location.state?.otp || "";

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.password.trim()) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword({
        email,
        otp,
        newPassword: formData.password,
      });
      toast.success("Đổi mật khẩu thành công!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      toast.error(
        "Đổi mật khẩu thất bại: " +
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
        <h2 className="text-center mb-3 fw-bold text-primary">
          Đặt Lại Mật Khẩu
        </h2>
        <p className="text-center text-muted mb-4">
          Nhập mật khẩu mới cho tài khoản của bạn
        </p>

        <form onSubmit={handleSubmit}>
          {/* Password */}
          <div className="mb-2">
            <label htmlFor="password" className="form-label fw-semibold">
              Mật khẩu mới <span className="text-danger">*</span>
            </label>
            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu mới"
              />
              <button
                type="button"
                className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-decoration-none text-secondary"
                onClick={() => setShowPassword(!showPassword)}
                style={{ zIndex: 10 }}
              >
                <i
                  className={showPassword ? "bi bi-eye" : "bi bi-eye-slash"}
                ></i>
              </button>
            </div>
            {errors.password && (
              <div className="text-danger small mt-1">{errors.password}</div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label fw-semibold">
              Xác nhận mật khẩu <span className="text-danger">*</span>
            </label>
            <div className="position-relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-decoration-none text-secondary"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ zIndex: 10 }}
              >
                <i
                  className={
                    showConfirmPassword ? "bi bi-eye" : "bi bi-eye-slash"
                  }
                ></i>
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="text-danger small mt-1">
                {errors.confirmPassword}
              </div>
            )}
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
              "Đặt Lại Mật Khẩu"
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

export default ResetPassword;
