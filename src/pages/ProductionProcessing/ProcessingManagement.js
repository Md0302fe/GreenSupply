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

const ProcessingManagement = () => {
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
      message.error("Có lỗi trong quá trình tải dữ liệu quy trình");
    }
  };

  const handleSingleLoadData = () => {
    set_type_process("single");
    setDataProcessing(singleProcessData);
  };

  return (
    <Loading isPending={isLoading}>
      <div className="production-processing-list">
        <div className="my-6 px-20">
          <div className="absolute">
            <Button
              onClick={() => navigate(-1)}
              type="primary"
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-md shadow-sm transition duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
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
              Quay lại
            </Button>
          </div>

          <h5 className="content-title font-bold text-2xl text-center flex items-center justify-center gap-2">
            <Cog6ToothIcon className="w-8 h-8 animate-spin text-gray-600" />
            Quy Trình Đang Thực Thi
          </h5>
        </div>

        {/* type of process */}
        <div className="px-20">
          <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm space-y-2 mb-2 w-fit">
            <p>Phân loại quy trình</p>
            <div className="flex gap-2 mt-2">
              <span
                className={`text-sm font-medium text-white hover:bg-green-600 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${
                  type_process === "single"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-slate-500 hover:bg-slate-600"
                }`}
                onClick={handleSingleLoadData}
              >
                Quy trình đơn
              </span>
              <span
                className={`text-sm font-medium text-white hover:bg-green-600 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${
                  type_process === "consolidate"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-slate-500 hover:bg-slate-600"
                }`}
                onClick={() => handleLoadConsolidate()}
              >
                Quy trình tổng hợp
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mx-auto px-20 py-8">
          {dataProcessing?.map((process, index) => {
            return <ProcessingComponent key={index} type={type_process} data={process} />;
          })}
        </div>
      </div>
    </Loading>
  );
};

export default ProcessingManagement;
