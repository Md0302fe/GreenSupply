import React, { useEffect, useState } from "react";
import { convertDateStringV1 } from "../../ultils";

import { message } from "antd";
import { useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";

import StageDetailsComponents from "./StageDetailsComponents";
import Loading from "../../components/LoadingComponent/Loading";
import * as ProductionsProcessServices from "../../services/ProductionProcessingServices";

import {
  getDetailsProcessByID,
  getProcessStageDetails,
  getDetailsConsolidateProcessByID,
  getConsolidateProcessStageDetails,
} from "../../services/ProductionProcessingServices";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const ProcessDetails = () => {
  const { t } = useTranslation();

  const { process_id , process_type } = useParams();
  const user = useSelector((state) => state.user);
  const [dataProcess, setDataProcess] = useState();
  const [dataStage, setDataStage] = useState();
  const [activeStage, setActiveStage] = useState(null); // stage nào đang mở
  const [rawMaterialFromRequest, setRawMaterialFromRequest] = useState(0);

  const [stage1, setStage1] = useState();
  const [stage2, setStage2] = useState();
  const [stage3, setStage3] = useState();
  const [stage4, setStage4] = useState();
  const [stage5, setStage5] = useState();
  const [stage6, setStage6] = useState();
  const [stage7, setStage7] = useState();

  // Fetch process details từ API
  const fetchBothDetails = async () => {
    if (process_type && process_type === "single_processes") {
      const [processDetails, processStages] = await Promise.all([
        getDetailsProcessByID(process_id, user?.access_token),
        getProcessStageDetails(process_id, user?.access_token),
      ]);
      setDataProcess(processDetails);
      setDataStage(processStages);
      return { processDetails, processStages };
    }
    if (process_type && process_type === "consolidated_processes") {
      const [processDetails, processStages] = await Promise.all([
        getDetailsConsolidateProcessByID(process_id, user?.access_token),
        getConsolidateProcessStageDetails(process_id, user?.access_token),
      ]);
      setDataProcess(processDetails);
      setDataStage(processStages);
      return { processDetails, processStages };
    }
  };

  const { data, isLoading, isSuccess, refetch } = useQuery({
    queryKey: ["both_process_details", process_id],
    queryFn: fetchBothDetails,
    retry: 0,
    staleTime: 0, // <- luôn coi là stale, refetch luôn lấy mới
  });

  useEffect(() => {
    if (dataStage) {
      setStage1(dataStage?.data[0] || []);
      setStage2(dataStage?.data[1] || []);
      setStage3(dataStage?.data[2] || []);
      setStage4(dataStage?.data[3] || []);
      setStage5(dataStage?.data[4] || []);
      setStage6(dataStage?.data[5] || []);
      setStage7(dataStage?.data[6] || []);

      // set quantity following type of process
      if (dataProcess?.data?.process_type === "consolidated_processes") {
        setRawMaterialFromRequest(dataProcess?.data?.total_raw_material);
      } else {
        setRawMaterialFromRequest(
          dataProcess?.data?.production_request_id?.material_quantity
        );
      }
    }
  }, [dataStage]);

  // Handle finish stage => next stage for process
  const handleComplete = async (data) => {
    const { noStage, stage_id, dataUpdate } = data;
    // Handle đảm bảo dữ liệu từ data đã có
    if (!dataProcess?.data) {
      message.warning("Dữ liệu của quy trình không hợp lệ");
    }

    const response = await ProductionsProcessServices.handleFinishStage({
      process_id, // id của quy trình
      noStage, // số giai đoạn
      process_type: dataProcess?.data?.process_type, // loại quy trình
      stage_id, // id của stage nhằm tìm ra và cập nhật process-status
      dataUpdate, // dữ liệu cập nhật
      access_token: user?.access_token, // token của người thực thi chức năng
    });
    if (response?.data?.success) {
      // reload quy trình
      message.success(t("processDetails.message.completeSuccess"));
      await refetch();
      // Thông báo
    } else {
      message.error(t("processDetails.message.completeError"));
      await refetch();
    }
    await refetch();
  };

  return (
    <Loading isPending={isLoading}>
      <div
        id="processBox"
        className="flex flex-col items-center justify-center"
      >
        <div className="w-full max-w-[1000px] p-3 rounded-lg shadow-md bg-green-100">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-1 gap-4">
            {/* Tên + ID */}
            <div className="w-full md:w-[80%]">
              <div className="text-lg font-bold text-center rounded p-2 text-green-600">
                🔖 {dataProcess?.data?.production_name}
              </div>
              <div className="bg-white shadow-sm border border-gray-200 rounded p-1 max-w-[200px] mx-auto mt-2">
                <p className="text-gray-500 text-xs mb-2 text-center">
                  🆔 {dataProcess?.data?._id}
                </p>
              </div>
            </div>

            {/* Trạng thái */}
            <div className="w-full md:w-[20%]">
              <span className="text-left font-bold block mb-2">
                {t("processDetails.label.status")}
              </span>

              {/* Trạng thái ngang ở mobile, dọc ở desktop */}
              <div className="flex flex-col items-left md:items-start gap-2 md:space-y-2">
                <div className="flex items-left">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2" />
                  <span>{t("processDetails.status.executing")}</span>
                </div>
                <div className="flex items-left">
                  <div className="w-4 h-4 bg-gray-400 rounded-full mr-2" />
                  <span>{t("processDetails.status.waiting")}</span>
                </div>
                <div className="flex items-left">
                  <div className="w-4 h-4 bg-green-400 rounded-full mr-2" />
                  <span>{t("processDetails.status.done")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Thêm nền trắng cho phần hiển thị thông tin */}
          <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-2 mb-2">
              {/* Start Time */}
              <div className="bg-white rounded-lg shadow-sm p-2">
                <p className="text-gray-500 text-xs mb-1 font-bold">
                  📅 {t("processDetails.info.start")}
                </p>
                <p className="font-medium text-gray-800 text-sm">
                  {convertDateStringV1(dataProcess?.data?.start_time)}
                </p>
              </div>

              {/* End Time */}
              <div className="bg-white rounded-lg shadow-sm p-2">
                <p className="text-gray-500 text-xs mb-1 font-bold">
                  📅 {t("processDetails.info.etaEnd")}
                </p>
                <p className="font-medium text-gray-800 text-sm">
                  {convertDateStringV1(dataProcess?.data?.end_time)}
                </p>
              </div>

              {/* Current Stage */}
              <div className="bg-white rounded-lg shadow-sm p-2">
                <p className="text-gray-500 text-xs mb-1 font-bold">
                  ⏳ {t("processDetails.info.currentStage")}
                </p>
                <p className="font-medium text-gray-800 text-sm">
                  {dataProcess?.data?.current_stage}
                </p>
              </div>

              {/* Status */}
              <div className="bg-white rounded-lg shadow-sm p-2">
                <p className="text-gray-500 text-xs mb-1 font-bold">
                  🔄 {t("processDetails.info.status")}
                </p>
                <span
                  className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${
                    dataProcess?.data?.status === "Hoàn thành"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {dataProcess?.data?.status}
                </span>
              </div>

              {/* Assigned User */}
              <div className="bg-white rounded-lg shadow-sm p-2">
                <p className="text-gray-500 text-xs mb-1 font-bold">
                  👤 {t("processDetails.info.assignedUser")}
                </p>
                <p className="font-medium text-gray-800 text-sm">
                  {dataProcess?.user_id?.name || "Chưa gán"}
                </p>
              </div>

              {/* Nguyên liệu */}
              <div className="bg-white rounded-lg shadow-sm p-2">
                <p className="text-gray-500 text-xs mb-1 font-bold">
                  🍋 Nguyên liệu
                </p>
                <p className="font-medium text-gray-800 text-sm">
                  {
                    dataProcess?.data?.production_request_id?.material
                      ?.fuel_type_id?.type_name
                  }
                </p>
              </div>

              {/* Khối lượng nguyên liệu */}
              <div className="bg-white rounded-lg shadow-sm p-2">
                <p className="text-gray-500 text-xs mb-1 font-bold">
                  ⚖️ Khối lượng nguyên liệu
                </p>
                <p className="font-medium text-gray-800 text-sm">
                  {dataProcess?.data?.production_request_id?.material_quantity}
                </p>
              </div>

              {/* Khối lượng thành phẩm */}
              <div className="bg-white rounded-lg shadow-sm p-2">
                <p className="text-gray-500 text-xs mb-1 font-bold">
                  ⚖️ Khối lượng thành phẩm
                </p>
                <p className="font-medium text-gray-800 text-sm">
                  {dataProcess?.data?.production_request_id?.product_quantity}
                </p>
              </div>
            </div>
            {/* Note box */}
            <div className="bg-white shadow-sm border border-gray-200 rounded p-1 w-full col-span-2 sm:col-span-2 md:col-span-3">
              <p className="text-gray-500 text-xs mb-2 font-bold">
                📝 {t("processDetails.info.note")}
              </p>
              <p className="font-medium text-gray-800 text-sm">
                {dataProcess?.data?.note}
              </p>
            </div>
          </div>
        </div>
        {/* Handle Stage */}
        <div className="w-full max-w-[1000px] p-0 lg:p-4 mt-3 rounded-lg shadow-md flex flex-col gap-3">
          <StageDetailsComponents
            stage={stage1}
            stageName={t("processDetails.stages.stage1")}
            noStage="1"
            isOpen={activeStage === 1}
            handleComplete={handleComplete}
            onToggle={() => setActiveStage(activeStage === 1 ? null : 1)}
            // props tổng số lượng nguyên liệu thô đề xuất
            data={{
              quantity: rawMaterialFromRequest,
              dataStage: dataStage?.data,
              dataProcess: dataProcess?.data,
            }}
          />
          <StageDetailsComponents
            stage={stage2}
            noStage="2"
            stageName={t("processDetails.stages.stage2")}
            isOpen={activeStage === 2}
            handleComplete={handleComplete}
            onToggle={() => setActiveStage(activeStage === 2 ? null : 2)}
            // props tổng số lượng nguyên liệu thô sau phân loại (after stage1)
            data={{
              dataStage: dataStage?.data,
              dataProcess: dataProcess?.data,
            }}
          />
          <StageDetailsComponents
            stage={stage3}
            noStage="3"
            stageName={t("processDetails.stages.stage3")}
            isOpen={activeStage === 3}
            handleComplete={handleComplete}
            onToggle={() => setActiveStage(activeStage === 3 ? null : 3)}
            // props tổng số lượng nguyên liệu thô sau rọt - gửa - tách hạt - cắt lát (after stage2)
            data={{
              dataStage: dataStage?.data,
              dataProcess: dataProcess?.data,
            }}
          />
          <StageDetailsComponents
            stage={stage4}
            noStage="4"
            stageName={t("processDetails.stages.stage4")}
            isOpen={activeStage === 4}
            handleComplete={handleComplete}
            onToggle={() => setActiveStage(activeStage === 4 ? null : 4)}
            // props tổng số lượng nguyên liệu thô sau chần (after stage3)
            data={{
              dataStage: dataStage?.data,
              dataProcess: dataProcess?.data,
            }}
          />
          <StageDetailsComponents
            stage={stage5}
            noStage="5"
            stageName={t("processDetails.stages.stage5")}
            isOpen={activeStage === 5}
            handleComplete={handleComplete}
            onToggle={() => setActiveStage(activeStage === 5 ? null : 5)}
            // props tổng số lượng nguyên liệu thô sau điều vị ngâm (after stage4)
            data={{
              dataStage: dataStage?.data,
              dataProcess: dataProcess?.data,
            }}
          />
          <StageDetailsComponents
            stage={stage6}
            noStage="6"
            stageName={t("processDetails.stages.stage6")}
            isOpen={activeStage === 6}
            handleComplete={handleComplete}
            onToggle={() => setActiveStage(activeStage === 6 ? null : 6)}
            // props tổng số lượng nguyên liệu thô sau sấy (after stage5)
            data={{
              dataStage: dataStage?.data,
              dataProcess: dataProcess?.data,
            }}
          />  
          <StageDetailsComponents
            stage={stage7}
            noStage="7"
            stageName={t("processDetails.stages.stage7")}
            isOpen={activeStage === 7}
            handleComplete={handleComplete}
            onToggle={() => setActiveStage(activeStage === 7 ? null : 7)}
            data={{
              dataStage: dataStage?.data,
              dataProcess: dataProcess?.data,
            }}
          />
        </div>
      </div>
    </Loading>
  );
};

export default ProcessDetails;
