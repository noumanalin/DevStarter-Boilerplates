import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";

const AuthorizedUserOnly = ({
    allowedRoles = [],
}) => {
    const { user } = useSelector(
        (state) => state?.auth
    );

    const toastShown = useRef(false);

    const userRole = user?.role;

    const isAllowed =
        allowedRoles.includes(userRole);

    useEffect(() => {
        if (!isAllowed && !toastShown.current) {
            toast.error(
                "You are not authorized to access this page.",
                {
                    position: "bottom-right",
                }
            );

            toastShown.current = true;
        }
    }, [isAllowed]);

    if (!isAllowed) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default AuthorizedUserOnly; 
