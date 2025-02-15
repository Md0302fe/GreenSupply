import React from "react";

// import layout
import {
  ProSidebar,
  Menu,
  MenuItem,
  SubMenu,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from "react-pro-sidebar";

// import icons
import { FaGem, FaGithub } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa"

import sidebarBg from "../../assets/bg2.jpg";
import logo from "../../assets/NewProject/Logo/GreenSupply.png";

import { MdDashboardCustomize } from "react-icons/md";
import { FaUserGear } from "react-icons/fa6";

import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Sidebar = ({ image, collapsed, rtl, toggled, handleToggleSidebar }) => {
  const user = useSelector((state) => state.user);
  return (
    <>
      <ProSidebar
        image={sidebarBg}
        toggled={toggled}
        collapsed={collapsed}
        breakPoint="md"
        onToggle={handleToggleSidebar}
      >
        <SidebarHeader>
          <div className="SiderWrapper">
            {/* title here */}
            <div className="SidebarHeader-top">
              <div
                className="SidebarHeader-avatar object-contain"
                style={{ backgroundImage: `url(${logo})` }}
              ></div>
              <span className="SidebarHeader-title">ADMIN</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <Menu iconShape="circle">
            <MenuItem icon={<MdDashboardCustomize />}>
              Dashboard
              <Link to={"/system/admin"} />
            </MenuItem>
            {/* <MenuItem icon={<FaGem />}> components</MenuItem> */}
          </Menu>
          <Menu iconShape="circle">
            <SubMenu
              // suffix={<span className="badge yellow">3</span>}
              icon={<FaUserGear />}
              title="Người Dùng"
            >
              <MenuItem>
                Quản lý người dùng
                <Link to={"manage-users"} />
              </MenuItem>
              <MenuItem>
                Quản lý tài khoản
                <Link to={"manage-blocked-users"} />
              </MenuItem>
            </SubMenu>
          </Menu>

          <Menu iconShape="circle">
          <SubMenu
            icon={<FaShoppingCart />}
            title="Quản Lý Đơn Hàng"
          >
            <MenuItem>
              Đơn yêu cầu thu nguyên liệu
              <Link to={"manage-fuel-orders"} />
            </MenuItem>
            <MenuItem>
              Đơn cung cấp nguyên liệu
              <Link to={"manage-provide-orders"} />
            </MenuItem>
            <MenuItem>
              Đơn Chờ Nhập Kho
              <Link to={"View-Order-Success"} />
            </MenuItem>
          </SubMenu>
        </Menu>


        </SidebarContent>

        <SidebarFooter className="SidebarFooter">
          <div className="sidebar-btn-wrapper">
            <a
              href="https://github.com/Md0302fe/Md.dev.QuizApp"
              target="_blank"
              className="sidebar-btn"
              rel="noopener noreferrer"
            >
              <FaGithub />
              <span
                style={{
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                {/* footer link */}
                <span>minhduc.lmd Dev</span>
              </span>
            </a>
          </div>
        </SidebarFooter>
      </ProSidebar>
    </>
  );
};

export default Sidebar;
