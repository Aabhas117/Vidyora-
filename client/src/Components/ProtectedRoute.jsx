import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Wait for the localStorage session check to finish before deciding —
  // otherwise a logged-in user gets bounced to /login for a split second on refresh.
  if (loading) return null;

  if (!isAuthenticated) {
    // `state={{ from: location }}` remembers where the user was headed,
    // so Login can send them back there after a successful sign-in.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}