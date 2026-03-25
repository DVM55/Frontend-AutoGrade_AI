// App.js
import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { useAuth } from "./context/AuthContext";
import RootRedirect from "./context/RootRedirect";

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

import Test from "./pages/teacher/Test";
import QuestionBank from "./pages/teacher/QuestionBank";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* Public routes */}

        <Route path="/media" element={<Test />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-account" element={<VerifyAccount />} />

        {/* Root redirect theo role */}
        <Route path="/" element={<RootRedirect />} />

        {/* Admin routes */}
        {user?.role === "ADMIN" && (
          <Route path="/admin" element={<LayoutAdmin />}>
            <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<User />} />
            <Route path="teachers" element={<Teacher />} />
            <Route path="profile" element={<ProfileAdmin />} />
            <Route path="change-password" element={<Password />} />
          </Route>
        )}

        {/* Teacher routes */}
        {user?.role === "TEACHER" && (
          <Route path="/teacher" element={<Layout />}>
            <Route index element={<Navigate to="classes" replace />} />
            <Route path="exams" element={<Exam />} />
            <Route path="classes" element={<Class />} />
            <Route path="classes/:classId" element={<ClassDetail />} />
            <Route path="profile" element={<Profile />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="question-bank" element={<QuestionBank />} />
          </Route>
        )}

        {/* User routes */}
        {user?.role === "USER" && (
          <Route path="/user" element={<LayoutUser />}>
            <Route index element={<Navigate to="class" replace />} />
            <Route path="class" element={<ClassUser />} />
            <Route path="class/:classId" element={<ClassDetailUser />} />
            <Route path="join/class/:classCode" element={<JoinClass />} />
            <Route path="profile" element={<ProfileUser />} />
            <Route path="change-password" element={<ChangePasswordUser />} />
          </Route>
        )}
      </Routes>
    </>
  );
}

export default App;
