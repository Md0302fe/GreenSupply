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
      <div className="production-processing-list">
        <div className="my-6 px-0 md:px-20">
          <div className="flex items-center justify-between my-6">
            {/* Nút quay lại bên trái */}
            <Button
              onClick={() => navigate(-1)}
              type="primary"
              className="flex items-center justify-center md:justify-start text-white font-semibold transition duration-300 shadow-sm px-2 md:px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-md min-w-[20px] md:min-w-[100px]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 md:h-4 md:w-4 md:mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H3m0 0l6-6m-6 6l6 6" />
              </svg>
              <span className="hidden md:inline">{t("processingManagement.button.back")}</span>
            </Button>

            {/* Tiêu đề ở giữa */}
            <h5 className="text-center font-bold text-[20px] md:text-2xl flex-grow mx-4 flex items-center justify-center gap-2">
              <Cog6ToothIcon className="w-6 h-6 md:w-8 md:h-8 animate-spin text-gray-600" />
              {t("processingManagement.title.executingProcesses")}
            </h5>

            {/* Phần tử trống bên phải để cân bằng */}
            <div className="min-w-[20px] md:min-w-[100px]"></div>
          </div>

        </div>

        {/* type of process */}
        <div className="px-0 lg:px-20">
          <div className="flex justify-center md:justify-end">
            <div className="p-1 lg:p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm space-y-2 mb-2 w-[288px]">
              <p>{t("processingManagement.label.processType")}</p>
              <div className="flex gap-2 mt-2">
                <span
                  className={`text-sm font-medium text-white hover:bg-green-600 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${type_process === "single"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-slate-500 hover:bg-slate-600"
                    }`}
                  onClick={handleSingleLoadData}
                >
                  {t("processingManagement.button.single")}
                </span>
                <span
                  className={`text-sm font-medium text-white hover:bg-green-600 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${type_process === "consolidate"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-slate-500 hover:bg-slate-600"
                    }`}
                  onClick={() => handleLoadConsolidate()}
                >
                  {t("processingManagement.button.consolidated")}
                </span>
              </div>
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
