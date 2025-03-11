import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/NewProject/Logo/logo-green.png";
import { Button } from "@mui/material";
import { RxDashboard } from "react-icons/rx";
import { MdOutlineBorderColor } from "react-icons/md";
import { LuHistory } from "react-icons/lu";
import { RiBillLine } from "react-icons/ri";
import { IoBagCheckOutline } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import { FaAngleDown } from "react-icons/fa6";
import { Collapse } from "react-collapse";
import "../../../styles/css/SidebarSupplier.css";
import { FaShoppingCart } from "react-icons/fa";
const SideBar = () => {
  const [subMenuIndex, setSubMenuIndex] = useState(null);
  const navigate = useNavigate();

  const isOpenSubMenu = (index) => {
    setSubMenuIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const handleClick = (path) => {
    navigate(path);
  };

  return (
    <div className="sidebar w-full h-full border-r border-[rgba(0,0,0,0.1)] py-2 px-3 bg-[#fff]">
      <div className="py-2 w-full">
        <img
          src={logo}
          className="w-[150px] cursor-pointer ml-7"
          onClick={() => navigate("/home")}
        />
      </div>

      <ul className="mt-4">


        <li>
          <Button
            onClick={() => navigate("/customer/orders-production")}
            className="w-full !capitalize !justify-start flex gap-3 text-[12px] !text-black !font-[500] items-center !py-5 hover:!bg-[#f1f1f1]"
          >
            <MdOutlineBorderColor className="text-[20px]" />
            <span>Tạo đơn mua sản phẩm</span>
          </Button>
        </li>

        <li>
          <Button
            onClick={() => navigate("/customer/orders-management")}
            className="w-full !capitalize !justify-start flex gap-3 text-[12px] !text-black !font-[500] items-center !py-5 hover:!bg-[#f1f1f1]"
          >
            <FaShoppingCart className="text-[20px]" />
            <span>Quản lý sách đơn mua phẩm</span>
          </Button>
        </li>


      </ul>
    </div>
  );
};

export default SideBar;
