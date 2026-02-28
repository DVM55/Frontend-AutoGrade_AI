import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./context/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import VerifyAccount from "./pages/VerifyAccount";

import Layout from "./layout/teacher/Layout";
import LayoutUser from "./layout/student/LayoutUser";
import LayoutAdmin from "./layout/admin/LayoutAdmin";
import Exam from "./pages/teacher/Exam";
import Class from "./pages/teacher/Class";
import ClassDetail from "./pages/teacher/ClassDetail";

import DocumentDetail from "./pages/teacher/DocumentDetail";
import ClassUser from "./pages/user/ClassUser";
import ClassDetailUser from "./pages/user/ClassDetailUser";

import JoinClass from "./pages/user/JoinClass";
import ProfileUser from "./pages/user/ProfileUser";
import ChangePasswordUser from "./pages/user/ChangePasswordUser";
import Profile from "./pages/teacher/Profile";
import ChangePassword from "./pages/teacher/ChangePassword";
import User from "./pages/admin/User";
import ProfileAdmin from "./pages/admin/ProfileAdmin";
import Password from "./pages/admin/Password";
import Teacher from "./pages/admin/Teacher";

function App() {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-account" element={<VerifyAccount />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <LayoutAdmin />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<User />} />
          <Route path="teachers" element={<Teacher />} />
          <Route path="profile" element={<ProfileAdmin />} />
          <Route path="change-password" element={<Password />} />
        </Route>

        {/* Teacher routes */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["TEACHER"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="classes" replace />} />
          <Route path="exams" element={<Exam />} />
          <Route path="classes" element={<Class />} />
          <Route path="classes/:classId" element={<ClassDetail />} />
          <Route path="profile" element={<Profile />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route
            path="classes/:classId/documents/:documentId"
            element={<DocumentDetail />}
          />
        </Route>

        {/* User route */}
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <LayoutUser />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="class" replace />} />
          <Route path="class" element={<ClassUser />} />
          <Route path="class/:classId" element={<ClassDetailUser />} />
          <Route path="join/class/:classCode" element={<JoinClass />} />
          <Route path="profile" element={<ProfileUser />} />
          <Route path="change-password" element={<ChangePasswordUser />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
