import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const storedUser = localStorage.getItem("care360_user");

  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(storedUser);

    if (!user?.patient_id) {
      localStorage.removeItem("care360_user");
      return <Navigate to="/login" replace />;
    }

    return children;

  } catch (error) {
    console.error("Invalid login data:", error);

    localStorage.removeItem("care360_user");

    return <Navigate to="/login" replace />;
  }
}

export default ProtectedRoute;