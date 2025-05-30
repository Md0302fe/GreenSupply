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

const SideBar = ({ onItemClick }) => {
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
          className="w-[150px] cursor-pointer ml-0 lg:ml-7"
          onClick={() => navigate("/home")}
        />
      </div>

      <ul className="mt-4">
        <li>
          <Button
            onClick={() => isOpenSubMenu(1)}
            className="w-full !capitalize flex items-center gap-3 text-[14px] !text-black !font-[500] !py-4 hover:!bg-[#f1f1f1]"
          >
            <RiBillLine className="text-[24px] shrink-0" />
            <span className="whitespace-nowrap text-base lg:text-[15px] md:text-[13px]">Đơn Đã Tạo</span>
            <span className="flex items-center justify-center w-[30px] h-[30px] shrink-0">
              <FaAngleDown
                className={`transition-all ${subMenuIndex === 1 ? "rotate-180" : ""
                  }`}
              />
            </span>
          </Button>

          <Collapse isOpened={subMenuIndex === 1}>
            <ul className="w-full">
              <li className="w-full">
                <Button
                  className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !items-center !w-full text-[13px] !font-[500] !pl-4 flex gap-2 min-h-[40px]"
                  onClick={() =>
                    {handleClick("/supplier/harvest-request-management");
                      onItemClick?.(); // Tự động ẩn sidebar nếu prop này được truyền;
                    }}
                >
                  <span className="block w-[6px] h-[6px] rounded-full bg-[rgba(0,0,0,0.2)] mt-[2px]"></span>
                  <span className="truncate ml-[8px]">Đơn Thu Nguyên Liệu</span>
                </Button>
              </li>
              <li className="w-full">
                <Button
                  className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !items-center !w-full text-[13px] !font-[500] !pl-4 flex gap-2 min-h-[40px]"
                  onClick={() => {navigate("/supplier/provide-request-management");
                onItemClick?.(); // Tự động ẩn sidebar nếu prop này được truyền}
                  }}
                >
                  <span className="block w-[6px] h-[6px] rounded-full bg-[rgba(0,0,0,0.2)] mt-[2px]"></span>
                  <span className="truncate ml-[8px]">Đơn Cung Cấp Nguyên Liệu</span>
                </Button>
              </li>
            </ul>
          </Collapse>
        </li>

        <li>
          <Button
            onClick={() => {navigate("/supplier/harvest-request");
              onItemClick?.(); // Tự động ẩn sidebar nếu prop này được truyền
            }}
            className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-black !font-[500] items-center !py-5 hover:!bg-[#f1f1f1]"
          >
            <MdOutlineBorderColor className="text-[20px]" />
            <span>Tạo yêu cầu thu hàng</span>
          </Button>
        </li>
        <li>
          <Button
            onClick={() => {navigate("/supplier/provide-request");
              onItemClick?.(); // Tự động ẩn sidebar nếu prop này được truyền
            }}
            className="w-full !capitalize !justify-start flex gap-3 text-[12px] !text-black !font-[500] items-center !py-5 hover:!bg-[#f1f1f1]"
          >
            <MdOutlineBorderColor className="text-[20px]" />
            <span>Tạo đơn cung cấp hàng</span>
          </Button>
        </li>
        <li>
          <Button
            onClick={() => isOpenSubMenu(2)}
            className="w-full !capitalize flex items-center gap-2 text-[14px] !text-black !font-[500] !py-4 hover:!bg-[#f1f1f1] text-left"
          >
            <RiBillLine className="text-[24px] shrink-0" />
            <span className="whitespace-nowrap">Lịch sử đơn </span>
            <span className="flex items-center justify-center w-[30px] h-[30px] shrink-0">
              <FaAngleDown
                className={`transition-all ${subMenuIndex === 2 ? "rotate-180" : ""
                  }`}
              />
            </span>
          </Button>

          <Collapse isOpened={subMenuIndex === 2}>
            <ul className="w-full">
              <li className="w-full">
                <Button
                  className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full text-[13px] !font-[500] !pl-9 flex gap-2 text-left"
                  onClick={() => {
                    handleClick("/supplier/history-request-order");
                  onItemClick?.();
                }}
                >
                  <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                  L.s Đơn yêu cầu thu nguyên liệu
                </Button>
              </li>
              <li className="w-full">
                <Button
                  className="!text-[rgba(0,0,0,0.7)] !capitalize !justify-start !w-full text-[13px] !font-[500] !pl-9 flex gap-2 text-left"
                  onClick={() => {
                    handleClick("/supplier/history-provide-order");
                    onItemClick?.(); // Tự động ẩn sidebar nếu prop này được truyền
                  }}
                >
                  <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                  L.s Đơn cung cấp nguyên liệu
                </Button>
              </li>
            </ul>
          </Collapse>
        </li>
        <li>
          <Button
            onClick={() => {navigate("/supplier/tracking-shipment");
              onItemClick?.(); // Tự động ẩn sidebar nếu prop này được truyền
            }}
            className="w-full !capitalize !justify-start flex gap-3 text-[14px] !text-black !font-[500] items-center !py-5 hover:!bg-[#f1f1f1]"
          >
            <IoBagCheckOutline className="text-[20px]" />
            <span>Theo dõi lô hàng</span>
          </Button>
        </li>
      </ul>
    </div>
  );
};

export default SideBar;
