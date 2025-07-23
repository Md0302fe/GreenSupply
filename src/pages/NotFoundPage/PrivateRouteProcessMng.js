import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRouteProcessMng = () => {
  const user = useSelector((state) => state.user);

  const accessRole = ["Admin", "Process Manager"];
  // Giả sử user.role là chuỗi: "admin", "supplier", "guest",...
  if (accessRole.includes(user?.role_name)) {
    return <Outlet />;
  }

  // Nếu không phải admin, chuyển hướng về trang chủ hoặc 404 tùy bạn chọn
  return <Navigate to="/cannot-access" replace />;
};

export default PrivateRouteProcessMng;
