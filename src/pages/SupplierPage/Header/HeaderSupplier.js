/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import { Button } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import "../../../styles/css/HeaderSupplier.css";
import { styled } from "@mui/material/styles";

import { RiMenuUnfold4Line } from "react-icons/ri";
import { RiMenuFold4Line } from "react-icons/ri";

import { FaRegBell } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa6";
import { FiLogOut } from "react-icons/fi";


const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
  },
}));

// eslint-disable-next-line react-hooks/rules-of-hooks


const HeaderSupplier = ({ toggleSidebar, isSidebarOpen }) => {
  const [anchorMyAcc, setAnchorMyAcc] = React.useState(null);
  const openMyAcc = Boolean(anchorMyAcc);

  const handleClickMyAcc = (event) => {
    setAnchorMyAcc(event.currentTarget);
  };
  const handleCloseMyAcc = () => {
    setAnchorMyAcc(null);
  };

  return (
    <header
      className="
        w-full h-[auto]
        py-2 pr-5 bg-[#fff]
        shadow-md border-b
        flex items-center justify-between
      "
    >
      <div className="part1">
        <Button
          sx={{ color: "rgba(0,0,0,0.8)" }}
          className="!w-[40px] !h-[40px] !rounded-full !min-w-[40px]"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? (
            <RiMenuFold4Line className="text-[18px] transition-all duration-300" />
          ) : (
            <RiMenuUnfold4Line className="text-[18px] transition-all duration-300" />
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
              src="https://ecme-react.themenate.net/img/avatars/thumb-1.jpg"
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
                  width: "200px",
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
              <div className="flex items-center gap-3">
                <div className="rounded-full w-[35px] h-[35px] overflow-hidden cursor-pointer">
                  <img
                    src="https://ecme-react.themenate.net/img/avatars/thumb-1.jpg"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="info">
                  <h3 className="text-[15px] font-[500] leading-5">Whisky39</h3>
                  <p className="text-[12px] font-[400] opacity-70">
                    supplier@gmail.com
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
              <a href="/profile"  className="text-[14px]">Profile</a>
            </MenuItem>

            <MenuItem
              onClick={handleCloseMyAcc}
              className="flex items-center gap-3"
            >
              <FiLogOut className="text-[18px]" />
              <span className="text-[14px]">Đăng Xuất</span>
            </MenuItem>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default HeaderSupplier;
