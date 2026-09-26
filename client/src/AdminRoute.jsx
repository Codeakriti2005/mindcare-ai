import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userData);

    if (user.role !== "admin") {
      return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
  } catch (error) {
    console.error("Admin Route Error:", error);
    return <Navigate to="/login" replace />;
  }
};

export default AdminRoute;