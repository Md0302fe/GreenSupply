import React from "react";
import { converDateString } from "../../ultils";
import "./process.css";
import { useTranslation } from "react-i18next";

const StageComponent = ({
  stage,
  noStage,
  isOpen,
  onToggle,
  stageName,
  handleComplete,
}) => {
  const { t } = useTranslation();

  const statusKeyMap = {
    "Đang thực thi": "executing",
    "Hoàn thành": "done",
    "Đã hủy": "cancelled",
    // Nếu API trả key tiếng Anh (executing, done...) thì có thể map ngược lại cũng được
    "executing": "executing",
    "done": "done",
    "cancelled": "cancelled",
  };

  const statusKey = statusKeyMap[stage?.status];



  const getBackgroundColor = (statusKey) => {
    switch (statusKey) {
      case "executing":
        return "bg-yellow-200";
      case "done":
        return "bg-green-200";
      case "cancelled":
        return "bg-red-200";
      default:
        return "bg-gray-200";
    }
  };


  return (
    <>
      <div
        className={`
    ${statusKey === "executing" ? "bg-animated" : ""}
    w-full max-w-[1000px] rounded-lg shadow-md transition-all duration-300 ease-in-out overflow-hidden flex flex-col relative z-10
    ${getBackgroundColor(statusKey)}
    ${isOpen ? "p-1 lg:p-6 max-h-[500px]" : "px-1 lg:px-4 max-h-[50px]"}
  `}
      >
        <div
          className="grid grid-cols-12 items-center cursor-pointer"
          onClick={onToggle}
        >
          {/* Giai đoạn X - không xuống hàng */}
          <div className="text-black text-sm md:text-lg font-bold p-2 col-span-4 sm:col-span-3 whitespace-nowrap">
            {t("stage.title", { no: noStage })}
          </div>

          {/* Tên giai đoạn - truncate khi đóng, hiển thị đầy đủ khi mở */}
          <div
            className={`
      text-black text-sm md:text-lg font-bold p-2 col-span-7 sm:col-span-8
      ${isOpen ? "whitespace-normal break-words" : "truncate"}
    `}
          >
            🔖 {stageName}
          </div>

          {/* Icon mũi tên */}
          <div className="flex justify-end col-span-1">
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
          ${isOpen
              ? "opacity-100 scale-y-100 max-h-[500px]"
              : "opacity-0 scale-y-0 max-h-0"
            }
          `}
        >
          {stage && Object.keys(stage).length > 0 ? (
            <>
              <div className="grid grid-cols-1 mt-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs p-0 lg:p-3 min-h-[150px]">

                {/* Gộp ngày bắt đầu và kết thúc thành 1 block để hiển thị dọc ở mobile */}
                <div className="flex flex-col sm:flex-row sm:col-span-2 gap-2 w-full">
                  {/* Ngày bắt đầu */}
                  <div className="info-box flex flex-col items-start text-left w-full">
                    <p className="text-gray-500 text-xs mb-1">
                      📅 {t("stage.field.start")}
                    </p>
                    <p className="font-medium text-gray-800 text-sm">
                      {converDateString(stage?.start_time) || ""}
                    </p>
                  </div>

                  {/* Ngày kết thúc */}
                  <div className="info-box flex flex-col items-start text-left w-full">
                    <p className="text-gray-500 text-xs mb-1">
                      📅 {t("stage.field.end")}
                    </p>
                    <p className="font-medium text-gray-800 text-sm">
                      {converDateString(stage?.end_time)}
                    </p>
                  </div>
                </div>

                {/* Trạng thái */}
                <div className="info-box flex flex-col items-start text-left mr-1">
                  <p className="text-gray-500 text-xs mb-1">
                    🔄 {t("stage.field.status")}
                  </p>
                  <span
                    className={`inline-block text-xs px-1 py-0.5 rounded
            ${stage?.status === t("processDetails.status.executing")
                        ? "bg-yellow-100 text-yellow-700"
                        : stage?.status === t("processDetails.status.done")
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                  >
                    {stage?.status}
                  </span>
                </div>

                {/* Người xử lý */}
                <div className="info-box flex flex-col items-start text-left">
                  <p className="text-gray-500 text-xs mb-1">
                    👤 {t("stage.field.user")}
                  </p>
                  <p className="font-medium text-gray-800 text-sm">
                    {stage?.user?.name || t("stage.system")}
                  </p>
                </div>

                {/* Ghi chú */}
                <div className="bg-white shadow-sm border border-gray-200 rounded p-1 w-full col-span-2 sm:col-span-2 md:col-span-3">
                  <p className="text-gray-500 text-xs mb-2">
                    📝 {t("stage.field.note")}
                  </p>
                  <p className="font-medium text-gray-800 text-sm">
                    {stage?.note}
                  </p>
                </div>

                {/* Nút hoàn thành */}
                {stage?.status === t("processDetails.status.executing") && (
                  <div className="info-box flex justify-end items-end">
                    <button
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-semibold py-[3px] px-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                      onClick={() =>
                        handleComplete({ noStage, stage_id: stage._id })
                      }
                    >
                      ✅ {t("stage.button.complete")}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center p-6 min-h-[150px]">
              <p className="text-gray-500 italic text-sm">
                ⚠️ {t("stage.empty")}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StageComponent;
