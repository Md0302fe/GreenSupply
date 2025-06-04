import React from "react";
import { useNavigate } from "react-router-dom";
import Icon1 from "../../../assets/NewProject/Icon-GreenSupply/OrderManagement.png";
import Icon2 from "../../../assets/NewProject/Icon-GreenSupply/Truck-icon.png";
import Icon3 from "../../../assets/NewProject/Icon-GreenSupply/Headset-icon.png";
import { useSelector } from "react-redux";

const FeatureButtons = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const features = [
    {
      id: 1,
      icon: Icon1,
      text: "QUẢN LÝ ĐƠN",
      path: "/supplier/harvest-request-management",
    },
    {
      id: 2,
      icon: Icon2,
      text: "YÊU CẦU THU HÀNG",
      path: "/supplier/harvest-request",
    },
    {
      id: 3,
      icon: Icon3,
      text: "CUNG CẤP NGUYÊN LIỆU",
      path: "/supplier/provide-request",
    },
  ];

  return (
    <div className="flex justify-center items-center mb-0 md:mb-2 lg:mb-3 gap-x-4">
      {features.map((feature, index) => (
        <React.Fragment key={feature.id}>
          {/* Button */}
          {/* {if (feature.text !== "YÊU CẦU THU HÀNG" && user) } */}
          <button
            key={feature.id}
            className="
    flex flex-col items-center justify-center 
    bg-yellow-400 text-black font-bold 
    w-[260px] h-[110px] 
    w-[80px] h-[60px] 
    md:w-[150px] md:h-[70px]
    lg:w-[340px] lg:h-[140px] 
    rounded-3xl hover:bg-yellow-500 hover:scale-105 
    transition duration-300
  "
            onClick={() => navigate(feature.path)}
          >
            <img
              src={feature.icon}
              alt={feature.text}
              className="w-5 h-5 md:w-6 md:h-6 lg:w-16 lg:h-16 mb-2"
            />
            <span className="text-center text-[6px] md:text-[10px] lg:text-lg font-semibold">
              {feature.text}
            </span>
          </button>

          {/* Circle Between Buttons
          <div className="absolute flex w-[70px] h-[50px] bg-white rounded-full mr-[355px]"></div>
          <div className="absolute flex w-[70px] h-[50px] bg-white rounded-full ml-[355px]"></div> */}
        </React.Fragment>
      ))}
    </div>
  );
};

export default FeatureButtons;
