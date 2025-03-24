import React, { useEffect, useState } from "react";
import { Form } from "antd";

import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";

import { getAllProductionProcessing } from "../../services/ProductionProcessingServices";
import Loading from "../../components/LoadingComponent/Loading";
import { Divider } from "@mui/material/Divider";

import ProcessingComponent  from "./ProcessingComponent";

const ProcessingManagement = () => {
  const user = useSelector((state) => state.user);

  const [filters, setFilters] = useState({
    status: null,
    searchText: "",
    start_date: null,
    end_date: null,
    sortField: "createdAt",
    sortOrder: "descend",
  });

  // Drawer & Modal state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [form] = Form.useForm();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Fetch data từ API
  const fetchProductionProcessing = async () => {
    const access_token = user?.access_token;
    return await getAllProductionProcessing(filters, access_token);
  };

  const { isLoading, data : dataProcessing, refetch } = useQuery({
    queryKey: ["production_processing", filters],
    queryFn: fetchProductionProcessing,
    retry: false,
  });

  // Khi filters thay đổi, gọi API lại
  useEffect(() => {
    refetch();
  }, [filters, refetch]);

  useEffect(() => {
    if (selectedProcess && isEditModalOpen) {
      form.setFieldsValue({
        production_name: selectedProcess.production_name,
        note: selectedProcess.note,
      });
    }
  }, [isEditModalOpen, selectedProcess, form]);

  return (
    <div  className="production-processing-list">
      <div class="container flex gap-3 mx-auto">
        {dataProcessing?.map((process,index) => {
            return <ProcessingComponent key={index} data={process} />
        })}
      </div>
    </div>
  );
};

export default ProcessingManagement;
