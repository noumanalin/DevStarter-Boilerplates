import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "../authSlice";

const AuthCheck = ({ children }) => {
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state?.auth || { isLoading: true });

    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-primary)] mx-auto mb-4"></div>
                    <p className="text-[var(--text-secondary)]">Loading...</p>
                </div>
            </div>
        );
    }

    return children;
};

export default AuthCheck;