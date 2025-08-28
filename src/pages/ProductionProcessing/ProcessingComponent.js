import React from "react";
import { convertDateStringV1 } from "../../ultils";
import { useNavigate } from "react-router-dom";

const ProcessingComponent = ({ data , type }) => {
  const navigate = useNavigate();

  const colorOfBox = [
    { stage: 1, color: "#FFFBEA" },
    { stage: 2, color: "#FFF3C4" },
    { stage: 3, color: "#FCE588" },
    { stage: 4, color: "#FADB5F" },
    { stage: 5, color: "#F7C948" },
    { stage: 6, color: "#F0B429" },
    { stage: 7, color: "#DE911D" },
    { stage: 7, color: "#B2EBF2" },
  ];

  // Lấy màu tương ứng với current_stage
  const currentColor =
    colorOfBox.find((box) => box.stage === data.current_stage)?.color ||
    "#FFFFFF"; // Mặc định là trắng nếu không tìm thấy
  
  const handleDetailProcess = (process_id) => {
    // Open Process Details Page
    navigate(`/system/admin/process_details/${type}/${process_id}`, {
      state: { type: type },
    });
  };

  return (
    <div
      id="processBox"
      className="max-w-full p-2 lg:p-4 rounded-lg shadow-md cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
      style={{ backgroundColor: currentColor }}
      onClick={() => handleDetailProcess(data._id)}
    >
      {/* Box Title & ID */}
      <div className="mb-4">
        <div
          className="text-black text-lg font-bold text-center rounded p-2"
          style={{ backgroundColor: currentColor }}
        >
          🔖 {data.production_name}
        </div>
        <div className="bg-white shadow-sm border border-gray-200 rounded p-1 max-w-[200px] mx-auto mt-2">
          <p className="text-gray-500 text-xs text-center">🆔 {data._id}</p>
        </div>
      </div>
      {/* Box informations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
        <div className="bg-white shadow-sm border border-gray-200 rounded p-1 max-w-[200px]">
          <p className="text-gray-500 text-xs">📅 Start Time</p>
          <p className="font-medium text-gray-800 text-sm">
            {convertDateStringV1(data.start_time)}
          </p>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded p-1 max-w-[200px]">
          <p className="text-gray-500 text-xs">📅 ETA End Time</p>
          <p className="font-medium text-gray-800 text-sm">
            {convertDateStringV1(data.end_time)}
          </p>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded p-1 max-w-[200px]">
          <p className="text-gray-500 text-xs">⏳ Current Stage</p>
          <p className="font-medium text-gray-800 text-sm">
            {data.current_stage}
          </p>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded p-1 max-w-[200px]">
          <p className="text-gray-500 text-xs">🔄 Status</p>
          <span className="inline-block text-xs px-1 py-0.5 rounded bg-yellow-100 text-yellow-700">
            {data.status}
          </span>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded p-1 max-w-[200px]">
          <p className="text-gray-500 text-xs">👤 Assigned User</p>
          <p className="font-medium text-gray-800 text-sm">System</p>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded p-1 w-full col-span-2 sm:col-span-2 md:col-span-3">
          <p className="text-gray-500 text-xs">📝 Note</p>
          <p className="font-medium text-gray-800 text-sm">{data.note}</p>
        </div>
      </div>
    </div>
  );
};

export default ProcessingComponent;
