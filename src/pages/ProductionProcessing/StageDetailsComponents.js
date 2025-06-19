import React, { useEffect, useState } from "react";
import { converDateString } from "../../ultils";
import "./process.css";
import { useTranslation } from "react-i18next";
import { json, useParams } from "react-router-dom";

const StageComponent = ({
  stage,
  noStage,
  isOpen,
  onToggle,
  stageName,
  handleComplete,
  data,
}) => {
  const { t } = useTranslation();
  const { quantity, dataStage } = data;
  const [prevDataStage, setPrevDataStage] = useState();

  // dataUpdateStage1
  const [dataUpdateStage1, setDataUpdateStage1] = useState({
    lastQuantityStage1: 0,
    lossPercentStage1: 0,
    currentQuantity: 0,
  });
  // dataUpdateStage2
  const [dataUpdateStage2, setDataUpdateStage2] = useState({
    lastQuantityStage2: 0,
    lossPercentStage2: 0,
    currentQuantity: 0,
  });

  // dataUpdateStage4
  const [dataUpdateStage4, setDataUpdateStage4] = useState({
    lastQuantityStage4: 0,
    lossPercentStage4: 0,
    solutionConcentration: 0,
    soakingTime: 0,
    moistureBeforeDrying: 0,

    currentQuantity: 0,
    currentSolutionConcentration: 0,
    curentSoakingTime: 0,
    currentMoistureBeforeDrying: 0,
  });

  // dataUpdateStage5
  const [dataUpdateStage5, setDataUpdateStage5] = useState({
    lastQuantityStage5: 0,
    lossQuantityByDrying: 0,
    dryingTime: 0,
    currentDryingTime: 0,
    currentQuantity: 0,
  });

  // dataUpdateStage6
  const [dataUpdateStage6, setDataUpdateStage6] = useState({
    finalQuantityProduction: dataStage?.finalQuantityProduction,
    totalVacum: 0,
    totalBag: 0,
    currentQuantity: 0,
  });

  // useEffect
  useEffect(() => {
    if (
      dataStage &&
      JSON.stringify(dataStage) !== JSON.stringify(prevDataStage)
    ) {
      setDataUpdateStage1({
        ...dataStage[0],
        currentQuantity: dataStage[0]?.lastQuantityStage1,
      });
      setDataUpdateStage2({
        ...dataStage[1],
        currentQuantity: dataStage[1]?.lastQuantityStage2,
      });
      // setDataUpdateStage2({...dataStage[2], });
      setDataUpdateStage4({
        ...dataStage[3],
        currentQuantity: dataStage[3]?.lastQuantityStage4,
        curentSoakingTime: dataStage[3]?.curentSoakingTime,
        currentSolutionConcentration:
          dataStage[3]?.currentSolutionConcentration,
        currentMoistureBeforeDrying: dataStage[3]?.currentMoistureBeforeDrying,
      });
      setDataUpdateStage5({
        ...dataStage[4],
        currentQuantity: dataStage[4]?.lastQuantityStage5,
      });
      setDataUpdateStage6({
        ...dataStage[5],
        currentQuantity: dataStage[5]?.lastQuantityStage6,
        currentDryingTime: dataStage[5]?.dryingTime || 0,
      });
      // setDataUpdateStage2({...dataStage[6], });
      setPrevDataStage(dataStage);
    }
  }, [dataStage]);

  const getDataUpdateByStage = () => {
    switch (parseInt(noStage)) {
      case 1:
        return dataUpdateStage1;
      case 2:
        return dataUpdateStage2;
      case 4:
        return dataUpdateStage4;
      case 5:
        return dataUpdateStage5;
      case 6:
        return dataUpdateStage6;
      default:
        return null;
    }
  };

  const statusKeyMap = {
    "Đang thực thi": "executing",
    "Hoàn thành": "done",
    "Đã hủy": "cancelled",
    // Nếu API trả key tiếng Anh (executing, done...) thì có thể map ngược lại cũng được
    executing: "executing",
    done: "done",
    cancelled: "cancelled",
  };

  console.log("check 1", dataUpdateStage1);
  console.log("check 2", dataUpdateStage2);
  console.log("check 4", dataUpdateStage4);
  console.log("check 5", dataUpdateStage5);
  console.log("check 6", dataUpdateStage6);

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

  // Render form infomation for each stage
  const renderInfomation = () => {
    // render following stage
    switch (parseInt(noStage)) {
      case 1: {
        return renderNoStage1();
      }
      case 2: {
        return renderNoStage2();
      }
      case 3: {
        return renderNoStage3();
      }
      case 4: {
        return renderNoStage4();
      }
      case 5: {
        return renderNoStage5();
      }
      case 6: {
        return renderNoStage6();
      }
      case 7: {
        return renderNoStage7();
      }

      default:
        return null;
    }
  };

  // renderNoStage1
  const renderNoStage1 = () => {
    return (
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id1"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ⚖️K.lg sau phân loại & chọn nguyên liệu
          </label>
          <input
            type="number"
            id="id1"
            value={dataUpdateStage1?.lastQuantityStage1 || ""}
            disabled={!!dataUpdateStage1?.currentQuantity > 0}
            onChange={(e) => {
              const inputValue = parseFloat(e.target.value) || 0;
              setDataUpdateStage1({
                lastQuantityStage1: inputValue,
                lossPercentStage1: ((quantity - inputValue) / quantity) * 100,
              });
            }}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
              dataUpdateStage1?.lastQuantityStage1
                ? "bg-gray-100 cursor-not-allowed"
                : ""
            }`}
            placeholder="Nhập khối lượng (kg)"
          />
        </div>

        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id2"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ❌🥭Tỷ lệ loại bỏ (% hỏng, vỡ)
          </label>
          <div
            id="id2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {`${dataUpdateStage1.lossPercentStage1}%`}
          </div>
        </div>
      </div>
    );
  };

  // renderNoStage2
  const renderNoStage2 = () => {
    return (
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id1"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ⚖️K.lg sau gọt - tách hạt - cắt lát (kg)
          </label>
          <input
            type="number"
            id="id2"
            value={dataUpdateStage2?.lastQuantityStage2 || ""}
            disabled={!!dataUpdateStage2?.currentQuantity > 0}
            onChange={(e) => {
              const inputValue = parseFloat(e.target.value) || 0;
              const baseQuantity =
                parseFloat(dataUpdateStage1?.lastQuantityStage1) || 1; // tránh chia 0

              setDataUpdateStage2({
                lastQuantityStage2: inputValue,
                lossPercentStage2: parseFloat(
                  (((baseQuantity - inputValue) / baseQuantity) * 100).toFixed(
                    2
                  )
                ),
              });
            }}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
              dataUpdateStage2?.lastQuantityStage2
                ? "bg-gray-100 cursor-not-allowed"
                : ""
            }`}
            placeholder="Nhập khối lượng (kg)"
          />
        </div>

        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id2"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ❌🥭Tỷ lệ loại bỏ (% vỏ , hạt bị loại bỏ)
          </label>
          <div
            id="id2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {dataUpdateStage2?.lossPercentStage2} %
          </div>
        </div>
      </div>
    );
  };

  // renderNoStage3
  const renderNoStage3 = () => {
    return <> </>;
  };

  // renderNoStage4
  const renderNoStage4 = () => {
    return (
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Nồng độ dung dịch */}
        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id1"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ⚖️K.lg sau ngâm (kg)
          </label>
          <input
            type="number"
            id="id4"
            value={dataUpdateStage4?.lastQuantityStage4 || ""}
            disabled={!!dataUpdateStage4?.currentQuantity > 0}
            onChange={(e) => {
              const inputValue = parseFloat(e.target.value) || 0;
              const baseQuantity = parseFloat(quantity) || 1; // quantity: khối lượng ban đầu hoặc từ stage trước

              setDataUpdateStage4((prev) => ({
                ...prev,
                lastQuantityStage4: inputValue,
                lossPercentStage4: parseFloat(
                  (((baseQuantity - inputValue) / baseQuantity) * 100).toFixed(
                    2
                  )
                ),
              }));
            }}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
              dataUpdateStage4?.lastQuantityStage4
                ? "bg-gray-100 cursor-not-allowed"
                : ""
            }`}
            placeholder="K.lg sau ngâm (kg)"
          />
        </div>

        {/* Nồng độ dung dịch */}
        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id1"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ⚖️Nồng độ dung dịch (%)
          </label>
          <input
            type="text"
            id="id1"
            value={dataUpdateStage4?.moistureBeforeDrying || ""}
            disabled={!!dataUpdateStage4?.currentMoistureBeforeDrying > 0}
            onChange={(e) => {
              setDataUpdateStage4((prev) => ({
                ...prev,
                solutionConcentration: e.target.value,
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Nồng độ dung dịch (%)"
          />
        </div>

        {/* Thời gian ngâm */}
        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id1"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ⚖️Thời gian ngâm (giờ)
          </label>
          <input
            type="number"
            id="id1"
            value={dataUpdateStage4?.soakingTime || ""}
            disabled={!!dataUpdateStage4?.soakingTime > 0}
            onChange={(e) => {
              setDataUpdateStage4((prev) => ({
                ...prev,
                soakingTime: e.target.value,
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Thời gian ngâm (giờ)"
          />
        </div>

        {/* Độ ẩm trước khi xấy */}
        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id1"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ⚖️Độ ẩm trước khi xấy (%)
          </label>
          <input
            type="number"
            id="id1"
            onChange={(e) => {
              setDataUpdateStage4((prev) => ({
                ...prev,
                moistureBeforeDrying: e.target.value,
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Độ ẩm trước khi xấy (%)"
          />
        </div>
      </div>
    );
  };

  // renderNoStage5
  const renderNoStage5 = () => {
    return (
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Nồng độ dung dịch */}
        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id1"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ⚖️K.lg sau khi sấy (kg)
          </label>
          <input
            type="text"
            id="id1"
            value={dataUpdateStage5?.currentQuantity}
            disabled={!dataUpdateStage5?.currentQuantity > 0}
            onChange={(e) => {
              setDataUpdateStage5((prev) => ({
                ...prev,
                lastQuantityStage5: e.target.value,
                lossQuantityByDrying:
                  ((dataUpdateStage4?.lastQuantityStage4 -
                    parseFloat(e.target.value)) /
                    dataUpdateStage4?.lastQuantityStage4) *
                  100,
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="K.lg sau khi sấy (kg)"
          />
        </div>
        {/* % hao hụt do mất nước */}
        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id2"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ❌🥭% Tỷ lệ mất khối lượng (% mất nước)
          </label>
          <div
            id="id2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {`${dataUpdateStage5.lossQuantityByDrying}%`}
          </div>
        </div>

        {/* Thời gian ngâm */}
        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id1"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ⚖️Thời gian sấy (giờ)
          </label>
          <input
            type="number"
            id="id1"
            value={dataUpdateStage6?.finalQuantityProduction || ""}
            disabled={!!dataUpdateStage6?.currentDryingTime > 0}
            onChange={(e) => {
              setDataUpdateStage5((prev) => ({
                ...prev,
                dryingTime: e.target.value,
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Thời gian sấy (giờ)"
          />
        </div>
      </div>
    );
  };

  // renderNoStage6
  const renderNoStage6 = () => {
    return (
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Nồng độ dung dịch */}
        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id1"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ⚖️K.lg sau làm nguội (kg Thành Phẩm)
          </label>
          <input
            type="text"
            id="id1"
            value={dataUpdateStage6?.finalQuantityProduction}
            disabled={!dataUpdateStage6?.currentQuantity > 0}
            onChange={(e) => {
              setDataUpdateStage6((prev) => ({
                ...prev,
                finalQuantityProduction: e.target.value,
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="K.lg sau làm nguội (kg Thành Phẩm)"
          />
        </div>
        {/* Thời gian ngâm */}
        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id2"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            💨Số lượng túi (cái)
          </label>
          <div
            id="id2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {`${dataUpdateStage1.lossPercentStage1}`}
          </div>
        </div>

        {/* Thời gian ngâm */}
        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id2"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            📦Số lượng thùng (cái)
          </label>
          <div
            id="id2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {`${dataUpdateStage1.lossPercentStage1}`}
          </div>
        </div>
      </div>
    );
  };

  // renderNoStage1
  const renderNoStage7 = () => {
    return (
      <div className="info-box flex flex-col items-start text-left mr-1">
        <p className="text-gray-500 text-xs mb-1">
          🔄 {t("stage.field.status")}
        </p>
        <span
          className={`inline-block text-xs px-1 py-0.5 rounded
            ${
              stage?.status === t("processDetails.status.executing")
                ? "bg-yellow-100 text-yellow-700"
                : stage?.status === t("processDetails.status.done")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
        >
          {stage?.status}
        </span>
      </div>
    );
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
          className={`bg-white transition-all duration-500 ease-in-out overflow-hidden p-3 rounded-md m-2
          ${
            isOpen
              ? "opacity-100 scale-y-100 max-h-[500px]"
              : "opacity-0 scale-y-0 max-h-0"
          }
          `}
        >
          {stage && Object.keys(stage).length > 0 ? (
            <>
              <div className="grid grid-cols-1 mt-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs p-0 lg:p-3 min-h-[50px]">
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
            ${
              stage?.status === t("processDetails.status.executing")
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
              </div>

              {/* Box confirm infomation each stage */}
              <div className="flex flex-col gap-3 mt-3">
                {/* Infomation Render Following NoStage */}
                {renderInfomation()}

                {/* Box note and finish button */}
                <div className="flex gap-4">
                  {/* Ghi chú */}
                  <div className="bg-white shadow-sm border border-gray-200 rounded p-1 w-[85%] col-span-2 sm:col-span-2 md:col-span-3">
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
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-semibold py-2 px-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                        onClick={() =>
                          handleComplete({
                            noStage,
                            stage_id: stage._id,
                            dataUpdate: getDataUpdateByStage(),
                          })
                        }
                      >
                        ✅ {t("stage.button.complete")}
                      </button>
                    </div>
                  )}
                </div>
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
