"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

interface ProtectedRouteProps {
    children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {

    const router = useRouter();
    const pathname = usePathname();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {

        const token = sessionStorage.getItem("access_token");

        if (!token) {
            router.replace("/");
            return;
        }

        setIsAuthenticated(true);
        setChecking(false);

    }, [router, pathname]);

    if (checking) {
        return (
            <div className="protected-loading">
                <div className="protected-spinner"></div>
                <p>Checking authentication...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}

export default ProtectedRoute;