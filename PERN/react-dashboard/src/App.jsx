import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import AuthLayout from "./components/myAuth/AuthLayout";
import ProtectedRoute from "./components/myAuth/ProtectedRoute";
import RoleGuard from "./components/myAuth/RoleGuard";

import AddBlog from "./pages/Blog/AddBlog";
import ManageBlogs from "./pages/Blog/ManageBlogs";
import EditBlog from "./pages/Blog/EditBlog";

import Newsletter from "./pages/Newsletter";
import ManageMedia from "./pages/ManageMedia";
import ManageBlogCategories from "./pages/Blog/ManageBlogCategories";
import DashBoardOutlet from "./components/layout/DashBoardOutlet";

import LoginPage from "./pages/Auth/LoginPage";
import SignUpPage from "./pages/Auth/SignUpPage";
import VerifyOtppage from "./pages/Auth/VerifyOtppage";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";
import PageNotFoundDB from "./pages/PageNotFoundDB";
import PageNotFound from "./pages/PageNotFound";
import HomePage from "./pages/HomePage";
import HomeHeader from "./components/HomeHeader";

const App = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  const hideHeader = pathname === '/dashboard' || pathname.startsWith("/dashboard/");

  useEffect(() => {
    window.scroll(0, 0);
  }, [pathname]);

  return (
    <>
      {!hideHeader && <HomeHeader />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignUpPage />} />
          <Route path="/verify-otp" element={<VerifyOtppage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Protected Dashboard Routes - Only these require authentication */}
        <Route  element={<ProtectedRoute />}>
          <Route element={<DashBoardOutlet />}>
            <Route path="/dashboard" element={<>{"Dashboard Home"}</>} />

            {/* Admin/Super Admin only routes */}
            <Route element={<RoleGuard roles={["ADMIN", "SUPER_ADMIN"]} fallback={<p>You need Super Admin / Admin access.</p>} />}>
              <Route path="/dashboard/add-blog" element={<AddBlog />} />
              <Route path="/dashboard/manage-blogs" element={<ManageBlogs />} />
              <Route path="/dashboard/manage-blogs-catgories" element={<ManageBlogCategories />} />
              <Route path="/dashboard/edit-blog/:id" element={<EditBlog />} />
            </Route>

            {/* These routes don't need role guard */}
            <Route path="/dashboard/newsletter" element={<Newsletter />} />
            <Route path="/dashboard/manage-media" element={<ManageMedia />} />

            {/* Dashboard 404 */}
            <Route path="/dashboard/*" element={<PageNotFoundDB />} />
          </Route>
        </Route>

        {/* Public 404 - Catch all unmatched routes */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>

      <ToastContainer limit={3} pauseOnHover />
    </>
  );
};

export default App;