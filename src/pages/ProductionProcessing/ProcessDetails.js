import React, { useEffect, useState } from "react";

import { convertDateStringV1 } from "../../ultils";

import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import StageDetailsComponents from "./StageDetailsComponents";

import {
  getDetailsProcessByID,
  getProcessStageDetails,
} from "../../services/ProductionProcessingServices";
import { useQuery } from "@tanstack/react-query";

const ProcessDetails = () => {
  const { process_id } = useParams();
  const user = useSelector((state) => state.user);

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
  const [stage8, setStage8] = useState();

  // Fetch process details từ API
  const fetchBothDetails = async () => {
    const [processDetails, processStages] = await Promise.all([
      getDetailsProcessByID(process_id, user?.access_token),
      getProcessStageDetails(process_id, user?.access_token),
    ]);

    return { processDetails, processStages };
  };

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ["both_process_details"],
    queryFn: fetchBothDetails,
    retry: false,
  });

  // Cập nhật giá trị process details và từng quy trình của nó
  useEffect(() => {
    if (isSuccess) {
      if (data) {
        setDataProcess(data.processDetails);
        setDataStage(data.processStages);
      }
    }
  }, [isSuccess]);

  useEffect(() => {
    if (dataStage) {
      setStage1(dataStage.data[0] || []);
      setStage2(dataStage.data[1] || []);
      setStage3(dataStage.data[2] || []);
      setStage4(dataStage.data[3] || []);
      setStage5(dataStage.data[4] || []);
      setStage6(dataStage.data[5] || []);
      setStage7(dataStage.data[6] || []);
      setStage8(dataStage.data[7] || []);
    }
  }, [dataStage]);

  return (
    <div id="processBox" className="flex flex-col items-center justify-center">
      <div className="w-full max-w-[1000px] p-4 rounded-lg shadow-md bg-green-200">
        <div className="mb-4">
          <div className= "text-lg font-bold text-center rounded p-2 text-green-600">
            🔖 {dataProcess?.data.production_name}
          </div>
          <div className="bg-white shadow-sm border border-gray-200 rounded p-1 max-w-[200px] mx-auto mt-2">
            <p className="text-gray-500 text-xs text-center">
              🆔 {dataProcess?.data._id}
            </p>
          </div>
        </div>

        {/* Thêm nền trắng cho phần hiển thị thông tin */}
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            <div className="info-box">
              <p className="text-gray-500 text-xs">📅 Start Time</p>
              <p className="font-medium text-gray-800 text-sm">
                {convertDateStringV1(dataProcess?.data.start_time)}
              </p>
            </div>
            <div className="info-box">
              <p className="text-gray-500 text-xs">📅 End Time</p>
              <p className="font-medium text-gray-800 text-sm">
                {convertDateStringV1(dataProcess?.data.end_time)}
              </p>
            </div>
            <div className="info-box">
              <p className="text-gray-500 text-xs">⏳ Current Stage</p>
              <p className="font-medium text-gray-800 text-sm">
                {dataProcess?.data.current_stage}
              </p>
            </div>
            <div className="info-box">
              <p className="text-gray-500 text-xs">🔄 Status</p>
              <span className="inline-block text-xs px-1 py-0.5 rounded bg-yellow-100 text-yellow-700">
                {dataProcess?.data.status}
              </span>
            </div>
            <div className="info-box">
              <p className="text-gray-500 text-xs">👤 Assigned User</p>
              <p className="font-medium text-gray-800 text-sm">
                {/* {dataProcess?.user_id?.name || "Chưa gán"} */}
              </p>
            </div>
            <div className="bg-white shadow-sm border border-gray-200 rounded p-1 w-full col-span-2 sm:col-span-2 md:col-span-3">
              <p className="text-gray-500 text-xs">📝 Note</p>
              <p className="font-medium text-gray-800 text-sm">
                {dataProcess?.data.note}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Handle Stage */}
      <div className="w-full max-w-[1000px] p-4 rounded-lg shadow-md flex flex-col gap-3">
        <StageDetailsComponents
          stage={stage1}
          noStage="1"
          isOpen={activeStage === 1}
          onToggle={() => setActiveStage(activeStage === 1 ? null : 1)}
        />
        <StageDetailsComponents
          stage={stage2}
          noStage="2"
          isOpen={activeStage === 2}
          onToggle={() => setActiveStage(activeStage === 2 ? null : 2)}
        />
        <StageDetailsComponents
          stage={stage3}
          noStage="3"
          isOpen={activeStage === 3}
          onToggle={() => setActiveStage(activeStage === 3 ? null : 3)}
        />
        <StageDetailsComponents
          stage={stage4}
          noStage="4"
          isOpen={activeStage === 4}
          onToggle={() => setActiveStage(activeStage === 4 ? null : 4)}
        />
        <StageDetailsComponents
          stage={stage5}
          noStage="5"
          isOpen={activeStage === 5}
          onToggle={() => setActiveStage(activeStage === 5 ? null : 5)}
        />
        <StageDetailsComponents
          stage={stage6}
          noStage="6"
          isOpen={activeStage === 6}
          onToggle={() => setActiveStage(activeStage === 6 ? null : 6)}
        />
        <StageDetailsComponents
          stage={stage7}
          noStage="7"
          isOpen={activeStage === 7}
          onToggle={() => setActiveStage(activeStage === 7 ? null : 7)}
        />
        <StageDetailsComponents
          stage={stage8}
          noStage="8"
          isOpen={activeStage === 8}
          onToggle={() => setActiveStage(activeStage === 8 ? null : 8)}
        />
      </div>
    </div>
  );
};

export default ProcessDetails;
