import React, { Component } from "react";
import Icon1 from "../../../assets/NewProject/Icon-GreenSupply/OrderManagement.png";
import Icon2 from "../../../assets/NewProject/Icon-GreenSupply/Truck-icon.png";
import Icon3 from "../../../assets/NewProject/Icon-GreenSupply/Headset-icon.png";

export class FeatureButtons extends Component {
  render() {
    const features = [
      {
        id: 1,
        icon: Icon1,
        text: "QUẢN LÝ ĐƠN",
      },
      {
        id: 2,
        icon: Icon2,
        text: "YÊU CẦU THU HÀNG",
      },
      {
        id: 3,
        icon: Icon3,
        text: "LIÊN HỆ HỖ TRỢ",
      },
    ];

    return (
      <div className="flex justify-center items-center mb-4 gap-x-4">
        {features.map((feature, index) => (
          <React.Fragment key={feature.id}>
            {/* Button */}
            <button className="flex flex-col items-center justify-center bg-yellow-400 text-black font-bold w-[340px] h-[140px] rounded-3xl hover:bg-yellow-500 hover:scale-105 transition duration-300">
              <img
                src={feature.icon}
                alt={feature.text}
                className="w-16 h-16 mb-2"
              />
              <span className="text-center text-xl">{feature.text}</span>
            </button>

            {/* Circle Between Buttons */}
            <div className="absolute flex w-[70px] h-[50px] bg-white rounded-full mr-[355px]"></div>
            <div className="absolute flex w-[70px] h-[50px] bg-white rounded-full ml-[355px]"></div>
          </React.Fragment>
        ))}
      </div>
    );
  }
}

export default FeatureButtons;
