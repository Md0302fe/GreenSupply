import { React } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import ProcessingComponent from "./ProcessingComponent";
import Loading from "../../components/LoadingComponent/Loading";
import { getAllExecuteProcess } from "../../services/ProductionProcessingServices";


const ProcessingManagement = () => {
  const user = useSelector((state) => state.user);

  // Fetch data từ API
  const fetchGetAllExecuteProcess = async () => {
    const access_token = user?.access_token;
    return await getAllExecuteProcess(access_token);
  };

  const { isLoading, data: dataProcessing } = useQuery({
    queryKey: ["executed_process"],
    queryFn: fetchGetAllExecuteProcess,
    retry: false,
  });

  return (
    <Loading isPending={isLoading}>
      <div className="production-processing-list">
        <div className="grid grid-cols-3 gap-4 mx-auto px-20 py-8">
          {dataProcessing?.map((process, index) => {
            return <ProcessingComponent key={index} data={process} />;
          })}
        </div>
      </div>
    </Loading>
  );
};

export default ProcessingManagement;
