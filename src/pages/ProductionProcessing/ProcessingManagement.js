import { React, useState } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import ProcessingComponent from "./ProcessingComponent";
import Loading from "../../components/LoadingComponent/Loading";
import {
  getAllExecuteProcess,
  getAllExecuteConsolidateProcess,
} from "../../services/ProductionProcessingServices";
import { Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

import { FaGear } from "react-icons/fa6";
import { FaGears } from "react-icons/fa6";

const ProcessingManagement = () => {
  const { t } = useTranslation();

  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [type_process, set_type_process] = useState("single");
  const [dataProcessing, setDataProcessing] = useState([]);
  const [singleProcessData, setSingleProcessData] = useState([]);
  // Fetch data từ API
  const fetchGetAllExecuteProcess = async () => {
    const access_token = user?.access_token;
    const res = await getAllExecuteProcess(access_token);
    if (res?.success) {
      setDataProcessing(res?.requests || []);
      setSingleProcessData(res?.requests || []);
    }
    return res;
  };

  console.log("dataProcessing => ", dataProcessing);

  const { isLoading } = useQuery({
    queryKey: ["executed_process"],
    queryFn: fetchGetAllExecuteProcess,
  });

  const handleLoadConsolidate = async () => {
    set_type_process("consolidate");
    const access_token = user?.access_token;
    const response = await getAllExecuteConsolidateProcess(access_token);

    if (response?.success) {
      setDataProcessing(response?.requests || []);
    } else {
      message.error(t("processingManagement.message.loadError"));
    }
  };

  const handleSingleLoadData = () => {
    set_type_process("single");
    setDataProcessing(singleProcessData);
  };

  return (
    <Loading isPending={isLoading}>
      <div className="production-processing-list px-8">
        <div className="my-6 px-6">
          <div className="flex items-center justify-between my-6">
            {/* Nút quay lại bên trái */}
            <Button
              onClick={() => navigate(-1)}
              type="primary"
              className="flex items-center justify-center md:justify-start text-white font-semibold transition duration-300 shadow-sm px-2 md:px-3 py-1 bg-black hover:opacity-70 rounded-md min-w-[20px] md:min-w-[100px]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 md:h-4 md:w-4 md:mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12H3m0 0l6-6m-6 6l6 6"
                />
              </svg>
              <span className="hidden md:inline">
                {t("processingManagement.button.back")}
              </span>
            </Button>

            {/* Tiêu đề ở giữa */}
            <h5 className="text-center font-bold text-[20px] md:text-2xl flex-grow mx-4 flex items-center justify-center gap-2 text-gray-800">
              <Cog6ToothIcon className="w-6 h-6 md:w-8 md:h-8 animate-spin text-gray-800" />
              {t("processingManagement.title.executingProcesses")}
            </h5>

            {/* Phần tử trống bên phải để cân bằng */}
            <div className="min-w-[20px] md:min-w-[100px]"></div>
          </div>
        </div>

        {/* type of process */}
        <div className="px-6">
          <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm space-y-2 mb-2 w-full md:w-fit">
            <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1 mt-2">
              <button
                className={`
        inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
        text-sm font-medium transition-all duration-300
        ${
          type_process === "single"
            ? "bg-white text-green-600 shadow-sm transform scale-105"
            : "text-gray-600 hover:text-green-600 hover:bg-white/50"
        }
      `}
                onClick={handleSingleLoadData}
              >
                <FaGear
                  className={`text-base ${
                    type_process === "single" ? "text-green-500" : ""
                  }`}
                />
                <span>{t("processingManagement.button.single")}</span>
              </button>

              <button
                className={`
        inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
        text-sm font-medium transition-all duration-300
        ${
          type_process === "consolidate"
            ? "bg-white text-green-600 shadow-sm transform scale-105"
            : "text-gray-600 hover:text-green-600 hover:bg-white/50"
        }
      `}
                onClick={handleLoadConsolidate}
              >
                <FaGears
                  className={`text-base ${
                    type_process === "consolidate" ? "text-green-500" : ""
                  }`}
                />
                <span>{t("processingManagement.button.consolidated")}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mx-auto px-4 md:px-20 py-8">
          {dataProcessing?.map((process, index) => {
            return (
              <ProcessingComponent
                key={index}
                type={type_process}
                data={process}
              />
            );
          })}
        </div>
      </div>
    </Loading>
  );
};

export default ProcessingManagement;
