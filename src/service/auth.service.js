// src/services/auth.service.js
import api from "./api";

export const register = (data) => {
  return api.post("/auth/register", data);
};

export const login = (data) => {
  return api.post("/auth/login", data);
};

export const forgotPassword = (data) => {
  return api.post("/auth/forgot-password", data);
};

export const verifyOTP = (data) => {
  return api.post("/auth/verify-otp", data);
};

export const verifyAccount = (data) => {
  return api.post("/auth/verify-account", data);
};

export const sendOTP = (data) => {
  return api.post("/auth/send-otp", data);
};

export const resetPassword = (data) => {
  return api.post("/auth/reset-password", data);
};

export const logOut = () => {
  return api.post("/auth/logout");
};
