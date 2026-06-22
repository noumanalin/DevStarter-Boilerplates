import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const AuthRoutes = () => {
    const authState = useSelector((state) => state?.auth);
    const { isAuthenticated, isLoading } = authState || { isAuthenticated: false, isLoading: true };
    const location = useLocation();
    const toastShown = useRef(false);
    
    const from = location.state?.from || "/dashboard";

    useEffect(() => {
        if (!isLoading && isAuthenticated && !toastShown.current && 
            (location.pathname === "/nexora-login" || 
             location.pathname === "/forget-password" ||
             location.pathname === "/verify-otp" ||
             location.pathname === "/reset-password")) {
            toast.info("You are already logged in.", {
                position: "bottom-right",
                autoClose: 3000,
            });
            toastShown.current = true;
        }
    }, [isAuthenticated, location.pathname, isLoading]);

    if (isLoading) {
        return null;
    }

    if (isAuthenticated) {
        return <Navigate to={from} replace />;
    }

    return <Outlet />;
};

export default AuthRoutes;
