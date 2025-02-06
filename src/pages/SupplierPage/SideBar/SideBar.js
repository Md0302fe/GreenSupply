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
          onClick={() => navigate("/")}
        />
      </div>

      <ul className="mt-4">
        <li>
          <Button
            onClick={() => isOpenSubMenu(1)}
            className="w-full !capitalize flex items-center gap-3 text-[14px] !text-black !font-[500] !py-4 hover:!bg-[#f1f1f1]"
          >
            <RiBillLine className="text-[24px] shrink-0" />
            <span className="whitespace-nowrap">Quản lý đơn hàng</span>
            <span className="ml-auto flex items-center justify-center w-[30px] h-[30px] shrink-0">
              <FaAngleDown
                className={`transition-all ${
                  subMenuIndex === 1 ? "rotate-180" : ""
                }`}
              />
            </span>
          </Button>

          <Collapse isOpened={subMenuIndex === 1}>
            <ul className="w-full">
              <li className="w-full">
                <Button
                  className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full text-[13px] !font-[500] !pl-11 flex gap-3"
                  onClick={() => handleClick("/supplier/harvest-request-management")}
                >
                  <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                  Đơn Thu Hàng
                </Button>
              </li>
              <li className="w-full">
                <Button
                  className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full text-[13px] !font-[500] !pl-11 flex gap-3"
                  onClick={() => handleClick("/supplier/order-management")}
                >
                  <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                  Đơn Nhập Hàng
                </Button>
              </li>
              <li className="w-full">
                <Button
                  className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full text-[13px] !font-[500] !pl-11 flex gap-3"
                  onClick={() => handleClick("/supplier/order-management")}
                >
                  <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                  Đơn Cung Cấp Hàng
                </Button>
              </li>
            </ul>
          </Collapse>
        </li>

        <li>
          <Button
            onClick={() => navigate("/supplier/harvest-request")}
            className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-black !font-[500] items-center !py-5 hover:!bg-[#f1f1f1]"
          >
            <MdOutlineBorderColor className="text-[20px]" />
            <span>Tạo yêu cầu thu hàng</span>
          </Button>
        </li>
        <li>
          <Button
            onClick={() => navigate("/supplier/transactions-histories")}
            className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-black !font-[500] items-center !py-5 hover:!bg-[#f1f1f1]"
          >
            <LuHistory className="text-[20px]" />
            <span>Lịch sử giao dịch</span>
          </Button>
        </li>
        <li>
          <Button
            onClick={() => navigate("/supplier/tracking-shipment")}
            className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-black !font-[500] items-center !py-5 hover:!bg-[#f1f1f1]"
          >
            <IoBagCheckOutline className="text-[20px]" />
            <span>Theo dõi lô hàng</span>
          </Button>
        </li>
        <li>
          <Button
            onClick={() => navigate("/supplier/logout")}
            className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-black !font-[500] items-center !py-5 hover:!bg-[#f1f1f1]"
          >
            <FiLogOut className="text-[20px]" />
            <span>Đăng xuất</span>
          </Button>
        </li>
      </ul>
    </div>
  );
};

export default SideBar;
