import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

/**
 * Wraps protected pages.
 * If the user is not logged in, redirects to /login
 */
const ProtectedRoute = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  // Return children directly (React elements)
  return children;
};

export default ProtectedRoute;