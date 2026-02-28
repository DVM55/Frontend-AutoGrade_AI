import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../service/auth.service";
import { toast } from "react-toastify";
import bgImage from "../assets/Background-login.jpg";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear error when user types
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Mật khẩu không được để trống";
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
      const response = await login(formData);
      navigate("/verify-account", { state: { email: formData.email } });
    } catch (error) {
      toast.error(
        "Đăng nhập thất bại: " +
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
        <h2 className="text-center mb-4 fw-bold text-primary">Đăng Nhập</h2>
        <p className="text-center text-muted mb-4">Chào mừng bạn trở lại!</p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-2">
            <label htmlFor="email" className="form-label fw-semibold">
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
            />
            {errors.email && (
              <div className="text-danger small mt-1">{errors.email}</div>
            )}
          </div>

          {/* Password */}
          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-semibold">
              Mật khẩu <span className="text-danger">*</span>
            </label>
            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
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

          <div className="text-end mb-3">
            <span
              onClick={() => navigate("/forgot-password")}
              className="text-primary text-decoration-none small"
              style={{ cursor: "pointer" }}
            >
              Quên mật khẩu?
            </span>
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
              "Đăng Nhập"
            )}
          </button>

          {/* Register Link */}
          <div className="text-center">
            <span className="text-muted">Chưa có tài khoản? </span>
            <span
              onClick={() => navigate("/register")}
              className="text-primary text-decoration-none fw-semibold"
              style={{ cursor: "pointer" }}
            >
              Đăng ký ngay
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
