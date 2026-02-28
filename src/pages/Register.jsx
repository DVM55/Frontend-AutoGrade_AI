import { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginImage from "../assets/login.png";
import { register } from "../service/auth.service";
import { toast } from "react-toastify";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    username: "",
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
    // Clear error when user types
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Họ và tên không được để trống";
    } else if (formData.username.length < 3) {
      newErrors.username = "Họ và tên phải có ít nhất 3 ký tự";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

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
      const response = await register(formData);
      console.log("Registration successful:", response.data);
      toast.success("Đăng ký thành công!");
    } catch (error) {
      console.error(
        "Registration failed:",
        error.response?.data || error.message,
      );
      toast.error(
        "Đăng ký thất bại: " + (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* Left Side - Image */}
        <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center ">
          <img
            src={loginImage}
            alt="Registration"
            className="img-fluid"
            style={{ maxWidth: "80%", maxHeight: "80%", objectFit: "contain" }}
          />
        </div>

        {/* Right Side - Form */}
        <div className="col-md-6 d-flex align-items-center justify-content-center">
          <div className="w-100" style={{ maxWidth: "500px", padding: "20px" }}>
            <h2 className="text-center mb-4 fw-bold text-primary">
              Đăng Ký Tài Khoản
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <label htmlFor="username" className="form-label fw-semibold">
                  Họ và tên <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.username ? "is-invalid" : ""}`}
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                />
                {errors.username && (
                  <div className="text-danger small mt-1">
                    {errors.username}
                  </div>
                )}
              </div>

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
              <div className="mb-2">
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
                  <div className="text-danger small mt-1">
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-3">
                <label
                  htmlFor="confirmPassword"
                  className="form-label fw-semibold"
                >
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
                    placeholder="Nhập lại mật khẩu"
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
                  "Đăng Ký"
                )}
              </button>

              {/* Login Link */}
              <div className="text-center">
                <span className="text-muted">Đã có tài khoản? </span>
                <span
                  onClick={() => navigate("/login")}
                  className="text-primary text-decoration-none fw-semibold"
                  style={{ cursor: "pointer" }}
                >
                  Đăng nhập ngay
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
