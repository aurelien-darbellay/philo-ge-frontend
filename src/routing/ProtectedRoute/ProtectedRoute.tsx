import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { LoadingIndicator } from "../../components/ui/LoadingIndicator/LoadingIndicator";
export function ProtectedRoute({ admin = false }: { admin?: boolean }) { const { user, loading } = useAuth(); if (loading) return <LoadingIndicator />; if (!user) return <Navigate to="/login" replace />; if (admin && user.role !== "admin") return <Navigate to="/espace-membre" replace />; return <Outlet />; }
