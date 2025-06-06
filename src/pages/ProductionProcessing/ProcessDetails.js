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

const ProcessDetails = () => {
  const { process_id } = useParams();
  const user = useSelector((state) => state.user);

  const location = useLocation();
  const processType = location.state?.type;

  const [dataProcess, setDataProcess] = useState();
  const [dataStage, setDataStage] = useState();
  const [activeStage, setActiveStage] = useState(null); // stage nào đang mở

  const [stage1, setStage1] = useState();
  const [stage2, setStage2] = useState();
  const [stage3, setStage3] = useState();
  const [stage4, setStage4] = useState();
  const [stage5, setStage5] = useState();
  const [stage6, setStage6] = useState();
  const [stage7, setStage7] = useState();

  // Fetch process details từ API
  const fetchBothDetails = async () => {
    if (processType === "single") {
      const [processDetails, processStages] = await Promise.all([
        getDetailsProcessByID(process_id, user?.access_token),
        getProcessStageDetails(process_id, user?.access_token),
      ]);
      setDataProcess(processDetails);
      setDataStage(processStages);
      return { processDetails, processStages };
    }
    if (processType === "consolidate") {
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
    }
  }, [dataStage]);

  // Handle finish stage => next stage for process
  const handleComplete = async (data) => {
    const { noStage, stage_id } = data;
    const response = await ProductionsProcessServices.handleFinishStage({
      process_id,
      noStage,
      process_type : dataProcess?.data?.process_type,
      stage_id,
      access_token: user?.access_token,
    });
    if (response?.data?.success) {
      // reload quy trình
      message.success("Xác nhận hoàn thành stage thành công");
      await refetch();
      // Thông báo
    } else {
      message.error("Hệ thống gặp lỗi trong quá trình hoàn thành quá trình");
      await refetch();
    }
  };

  return (
    <Loading isPending={isLoading}>
      <div
        id="processBox"
        className="flex flex-col items-center justify-center"
      >
        <div className="w-full max-w-[1000px] px-4 pb-4 rounded-lg shadow-md bg-green-100">
          <div className="flex justify-between items-center mb-1">
            {/* Name & ID */}
            <div class="w-[80%]">
              <div className="text-lg font-bold text-center rounded p-2 text-green-600">
                🔖 {dataProcess?.data?.production_name}
              </div>
              <div className="bg-white shadow-sm border border-gray-200 rounded p-1 max-w-[200px] mx-auto mt-2">
                <p className="text-gray-500 text-xs mb-2 text-center">
                  🆔 {dataProcess?.data?._id}
                </p>
              </div>
            </div>

            {/* Status Process */}
            <div className="flex flex-col w-[20%] mt-4 items-start justify-start">
              <span className="text-center font-bold">Trạng thái:</span>
              <div className="flex flex-col space-y-2 mt-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2"></div>
                  <span>Đang thực thi</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-400 rounded-full mr-2"></div>
                  <span>Đợi thực thi</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-400 rounded-full mr-2"></div>
                  <span>Đã hoàn thành</span>
                </div>
              </div>
            </div>
          </div>

          {/* Thêm nền trắng cho phần hiển thị thông tin */}
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              <div className="info-box">
                <p className="text-gray-500 text-xs mb-2">📅 Start Time</p>
                <p className="font-medium text-gray-800 text-sm">
                  {convertDateStringV1(dataProcess?.data?.start_time)}
                </p>
              </div>
              <div className="info-box">
                <p className="text-gray-500 text-xs mb-2">📅 ETA End Time</p>
                <p className="font-medium text-gray-800 text-sm">
                  {convertDateStringV1(dataProcess?.data?.end_time)}
                </p>
              </div>
              <div className="info-box">
                <p className="text-gray-500 text-xs mb-2">⏳ Current Stage</p>
                <p className="font-medium text-gray-800 text-sm">
                  {dataProcess?.data?.current_stage}
                </p>
              </div>
              <div className="info-box">
                <p className="text-gray-500 text-xs mb-2">🔄 Status</p>
                <span
                  className={`inline-block text-xs px-1 py-0.5 rounded text-black ${
                    dataProcess?.data?.status === "Hoàn thành"
                      ? "bg-green-500"
                      : "bg-yellow-200"
                  }`}
                >
                  {dataProcess?.data.status}
                </span>
              </div>
              <div className="info-box">
                <p className="text-gray-500 text-xs mb-2">👤 Assigned User</p>
                <p className="font-medium text-gray-800 text-sm">
                  {/* {dataProcess?.user_id?.name || "Chưa gán"} */}
                </p>
              </div>
              <div className="bg-white shadow-sm border border-gray-200 rounded p-1 w-full col-span-2 sm:col-span-2 md:col-span-3">
                <p className="text-gray-500 text-xs mb-2">📝 Note</p>
                <p className="font-medium text-gray-800 text-sm">
                  {dataProcess?.data?.note}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Handle Stage */}
        <div className="w-full max-w-[1000px] p-4 rounded-lg shadow-md flex flex-col gap-3">
          <StageDetailsComponents
            stage={stage1}
            stageName={"Phân loại nguyên liệu"}
            noStage="1"
            isOpen={activeStage === 1}
            handleComplete={handleComplete}
            onToggle={() => setActiveStage(activeStage === 1 ? null : 1)}
          />
          <StageDetailsComponents
            stage={stage2}
            noStage="2"
            stageName={"Rửa và làm sạch"}
            isOpen={activeStage === 2}
            handleComplete={handleComplete}
            onToggle={() => setActiveStage(activeStage === 2 ? null : 2)}
          />
          <StageDetailsComponents
            stage={stage3}
            noStage="3"
            stageName={"Khử trùng/diệt khuẩn bề mặt"}
            isOpen={activeStage === 3}
            handleComplete={handleComplete}
            onToggle={() => setActiveStage(activeStage === 3 ? null : 3)}
          />
          <StageDetailsComponents
            stage={stage4}
            noStage="4"
            stageName={"Phủ màng sinh học & làm khô"}
            isOpen={activeStage === 4}
            handleComplete={handleComplete}
            onToggle={() => setActiveStage(activeStage === 4 ? null : 4)}
          />
          <StageDetailsComponents
            stage={stage5}
            noStage="5"
            stageName={"Ủ chín (kiểm soát nhiệt độ/độ ẩm)"}
            isOpen={activeStage === 5}
            handleComplete={handleComplete}
            onToggle={() => setActiveStage(activeStage === 5 ? null : 5)}
          />
          <StageDetailsComponents
            stage={stage6}
            noStage="6"
            stageName={"Đóng gói thành phẩm"}
            isOpen={activeStage === 6}
            handleComplete={handleComplete}
            onToggle={() => setActiveStage(activeStage === 6 ? null : 6)}
          />
          <StageDetailsComponents
            stage={stage7}
            noStage="7"
            stageName={"Ghi nhãn & truy xuất nguồn gốc"}
            isOpen={activeStage === 7}
            handleComplete={handleComplete}
            onToggle={() => setActiveStage(activeStage === 7 ? null : 7)}
          />
        </div>
      </div>
    </Loading>
  );
};

export default ProcessDetails;
