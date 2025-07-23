import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateOnlyAdmin = () => {
  const user = useSelector((state) => state.user);
  // Giả sử user.role là chuỗi: "admin", "supplier", "guest",...
  if (user?.role_name === "Admin") {
    return <Outlet />;
  }

  // Nếu không phải admin, chuyển hướng về trang chủ hoặc 404 tùy bạn chọn
  return <Navigate to="/cannot-access" replace />;
};

export default PrivateOnlyAdmin;
