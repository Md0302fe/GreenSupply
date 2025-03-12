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
import { FaGithub } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { FaWarehouse } from "react-icons/fa";
import { FaClipboard } from "react-icons/fa6";
import { AiFillProduct } from "react-icons/ai";

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
            <MenuItem icon={<MdDashboardCustomize />}>
              Lên Lịch
              <Link to={"/system/admin"} />
            </MenuItem>
            {/* <MenuItem icon={<FaGem />}> components</MenuItem> */}
          </Menu>
          <Menu iconShape="circle">
            <MenuItem icon={<MdDashboardCustomize />}>
              Phân tích thị trường
              <Link to={"/system/admin"} />
            </MenuItem>
            {/* <MenuItem icon={<FaGem />}> components</MenuItem> */}
          </Menu>
          <Menu iconShape="circle">
            <MenuItem icon={<MdDashboardCustomize />}>
              Kết nối supplier
              <Link to={"/system/admin"} />
            </MenuItem>
            {/* <MenuItem icon={<FaGem />}> components</MenuItem> */}
          </Menu>

          {/* Purchase Order Request */}
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
