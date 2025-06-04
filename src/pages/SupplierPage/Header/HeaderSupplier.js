import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { styled } from "@mui/material/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import "../../../styles/css/HeaderSupplier.css";

import { RiMenuUnfold4Line } from "react-icons/ri";
import { RiMenuFold4Line } from "react-icons/ri";

import { FaRegBell } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa6";
import { FiLogOut } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as UserServices from "../../../services/UserServices";
import { resetUser } from "../../../redux/slides/userSlides";
import { persistor } from "../../../redux/store";


import { MdDashboardCustomize } from "react-icons/md";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
  },
}));

const HeaderSupplier = ({ toggleSidebar, isSidebarOpen, windowWidth }) => {
  const [anchorMyAcc, setAnchorMyAcc] = React.useState(null);
  const openMyAcc = Boolean(anchorMyAcc);
  const userRedux = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClickMyAcc = (event) => {
    setAnchorMyAcc(event.currentTarget);
  };
  const handleCloseMyAcc = () => {
    setAnchorMyAcc(null);
  };

  const truncateText = (text, maxLength = 20) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Hàm xử lý đăng xuất, tương tự như Header của HomePage
  const handleLogout = async () => {
    try {
      // Gọi API đăng xuất
      await UserServices.logoutUser();
      // Reset state của user trong Redux
      dispatch(resetUser());
      // Xóa dữ liệu trong Redux Persist
      persistor.purge();
      // Xóa dữ liệu lưu trong localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      // Chuyển hướng về trang chủ (hoặc trang login)
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const [openUserInfo, setOpenUserInfo] = useState(false);
  const handleOpenUserInfo = () => {
    setOpenUserInfo(true);
  };
  const handleCloseUserInfo = () => {
    setOpenUserInfo(false);
  };


  return (
    <header
      className="
        w-full h-[auto]
        py-2 pr-5 bg-[#fff]
        shadow-md border-b
        flex items-center justify-between
        fixed top-0 left-0 right-0 z-20 bg-white shadow
      "
    >
      <div className="part1 transition-all duration-500 ease-in-out w-fit">
        <Button
          sx={{ color: "rgba(0,0,0,0.8)" }}
          className={`
      !w-[40px] !h-[40px] !rounded-full !min-w-[40px]
      transition-all duration-500 ease-in-out
    `}
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? (
            <RiMenuFold4Line className="text-[18px] transition-all duration-500 ease-in-out" />
          ) : (
            <RiMenuUnfold4Line className="text-[18px] transition-all duration-500 ease-in-out" />
          )}
        </Button>
      </div>

      <div className="part2 w-[40%] flex items-center justify-end gap-4">
        <IconButton aria-label="cart">
          <StyledBadge badgeContent={4} color="secondary">
            <FaRegBell />
          </StyledBadge>
        </IconButton>

        <div className="relative">
          <div
            className="rounded-full w-[35px] h-[35px] overflow-hidden cursor-pointer"
            onClick={handleClickMyAcc}
          >
            <img
              src={
                userRedux?.avatar ||
                "https://ecme-react.themenate.net/img/avatars/thumb-1.jpg"
              }
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>

          <Menu
            anchorEl={anchorMyAcc}
            id="account-menu"
            open={openMyAcc}
            onClose={handleCloseMyAcc}
            onClick={handleCloseMyAcc}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  position: "absolute",
                  top: "50px",
                  right: "10px",
                  width: "250px",
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  "&::before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={handleCloseMyAcc} className="!bg-white">
              <div
                className="flex items-center gap-3"
                onClick={handleOpenUserInfo}
              >
                <div className="rounded-full w-[35px] h-[35px] overflow-hidden cursor-pointer">
                  <img
                    src={
                      userRedux?.avatar ||
                      "https://ecme-react.themenate.net/img/avatars/thumb-1.jpg"
                    }
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="info">
                  <h3 className="text-[15px] font-[500] leading-5">
                    {truncateText(userRedux?.full_name, 13) || "User"}
                  </h3>
                  <p className="text-[12px] font-[400] opacity-70">
                    {truncateText(userRedux?.email, 15) || "supplier@gmail.com"}
                  </p>
                </div>
              </div>
            </MenuItem>
            <Divider sx={{ borderColor: "black" }} />
            <MenuItem
              onClick={handleCloseMyAcc}
              className="flex items-center gap-3"
            >
              <FaRegUser className="text-[16px]" />
              <a href="/profile" className="text-[14px]">
                Profile
              </a>
            </MenuItem>

            <MenuItem
              onClick={handleCloseMyAcc}
              className="flex items-center gap-3"
            >
              <MdDashboardCustomize className="text-[16px]" />
              <a href="/system/admin" className="text-[14px]">
                Quản lý hệ thống
              </a>
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleCloseMyAcc();
                handleLogout();
              }}
              className="flex items-center gap-3"
            >
              <FiLogOut className="text-[18px]" />
              <span className="text-[14px]">Đăng Xuất</span>
            </MenuItem>
          </Menu>

          {/* Popup hiển thị thông tin user */}
          <Dialog open={openUserInfo} onClose={handleCloseUserInfo}>
            <DialogTitle>Thông tin người dùng</DialogTitle>
            <DialogContent dividers>
              <div className="flex items-center gap-3">
                <div className="rounded-full w-[50px] h-[50px] overflow-hidden">
                  <img
                    src={
                      userRedux?.avatar ||
                      "https://ecme-react.themenate.net/img/avatars/thumb-1.jpg"
                    }
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="info">
                  <h3 className="text-[15px] font-[500] leading-5">
                    {userRedux?.full_name || "User"}
                  </h3>
                  <p className="text-[12px] font-[400] opacity-70">
                    {userRedux?.email || "supplier@gmail.com"}
                  </p>
                  {/* Bạn có thể hiển thị thêm thông tin khác nếu cần */}
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseUserInfo} color="primary">
                Đóng
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </header>
  );
};

export default HeaderSupplier;
