import React from "react";
import { converDateString } from "../../ultils";

const StageComponent = ({
  stage,
  noStage,
  isOpen,
  onToggle,
  stageName,
  handleComplete,
}) => {
  const getBackgroundColor = (status) => {
    switch (status) {
      case "Đang thực thi":
        return "bg-yellow-200";
      case "Hoàn thành":
        return "bg-green-200";
      case "Đã hủy":
        return "bg-red-200";
      default:
        return "bg-gray-200";
    }
  };

  return (
    <>
      <div
        className={`
          w-full max-w-[1000px] rounded-lg shadow-md transition-all duration-300 ease-in-out overflow-hidden flex flex-col
          ${getBackgroundColor(stage?.status)}
          ${isOpen ? "p-6 max-h-[500px]" : "px-4 max-h-[50px]"}
        `}
      >
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={onToggle}
        >
          <div className="text-black text-lg font-bold p-2 w-[35%]">
            Stage {noStage}
          </div>
          <div className="text-black text-lg font-bold p-2  w-[65%]">
            🔖 {stageName}
          </div>
          <div className="flex justify-end mt-2">
            <div
              className="text-black text-lg font-bold rounded p-2 cursor-pointer"
              onClick={onToggle}
            >
              {isOpen ? (
                <span className="transition-transform duration-300 rotate-180">
                  ⬆️
                </span>
              ) : (
                <span className="transition-transform duration-300">⬇️</span>
              )}
            </div>
          </div>
        </div>

        {/* ✨ Animation sổ xuống */}
        <div
          className={`bg-white transition-all duration-500 ease-in-out overflow-hidden rounded-md
          ${
            isOpen
              ? "opacity-100 scale-y-100 max-h-[500px]"
              : "opacity-0 scale-y-0 max-h-0"
          }
          `}
        >
          {stage && Object.keys(stage).length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs p-3 min-h-[150px]">
                <div className="info-box">
                  <p className="text-gray-500 text-xs mb-2">📅 Start Time</p>
                  <p className="font-medium text-gray-800 text-sm">
                    {converDateString(stage?.start_time) || ""}
                  </p>
                </div>
                <div className="info-box">
                  <p className="text-gray-500 text-xs mb-2">📅 End Time</p>
                  <p className="font-medium text-gray-800 text-sm">
                    {converDateString(stage?.end_time)}
                    
                  </p>
                </div>
                <div className="info-box">
                  <p className="text-gray-500 text-xs mb-2">🔄 Status</p>
                  <span
                    className={`inline-block text-xs px-1 py-0.5 rounded
                  ${
                    stage?.status === "Đang thực thi"
                      ? "bg-yellow-100 text-yellow-700"
                      : stage?.status === "Hoàn thành"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                  >
                    {stage?.status}
                  </span>
                </div>
                <div className="info-box">
                  <p className="text-gray-500 text-xs mb-2">👤 Assigned User</p>
                  <p className="font-medium text-gray-800 text-sm">
                    {stage?.user?.name || "hệ thống"}
                  </p>
                </div>
                <div className="bg-white shadow-sm border border-gray-200 rounded p-1 w-full col-span-2 sm:col-span-2 md:col-span-3">
                  <p className="text-gray-500 text-xs mb-2">📝 Note</p>
                  <p className="font-medium text-gray-800 text-sm">
                    {stage?.note}
                  </p>
                </div>
                {/* Button finish stage */}
                {stage?.status === "Đang thực thi" && (
                  <div className="info-box flex justify-end items-end">
                    <button
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-semibold py-[3px] px-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                      onClick={() =>
                        handleComplete({ noStage, stage_id: stage._id })
                      }
                    >
                      ✅ Hoàn thành
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center p-6 min-h-[150px]">
              <p className="text-gray-500 italic text-sm">
                ⚠️ Quy trình chưa thực thi
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StageComponent;
