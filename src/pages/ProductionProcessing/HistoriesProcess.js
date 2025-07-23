import moment from "moment";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Highlighter from "react-highlight-words";
import { BsBuildingFillGear } from "react-icons/bs";
import { Table, Button, Space, Tag, Input } from "antd";
import React, { useEffect, useRef, useState } from "react";
import Loading from "../../components/LoadingComponent/Loading";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { getHistoriesProcess } from "../../services/ProductionProcessingServices";

import { useTranslation } from "react-i18next";

import { FaGears } from "react-icons/fa6";
import { FaGear } from "react-icons/fa6";

const HistoriesProcess = () => {
  const { t } = useTranslation();

  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const searchInput = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [type_process, set_type_process] = useState("single_processes");
  const statusMap = {
    "Chờ duyệt": "pending",
    "Đã duyệt": "approve",
    "Đã huỷ": "cancelled",
    "Đã hủy": "cancelled",
    "Hoàn thành": "completed",
    "Đang xử lý": "processing",
    "thất bại": "failed",
    "Vô hiệu hóa": "disable",
    "Nhập kho thành công": "imported",
    "Đang sản xuất": "in_production",
  };

  // Fetch data từ API
  const fetchHistoriesProcess = async () => {
    const access_token = user?.access_token;
    return await getHistoriesProcess({access_token , type_process});
  };

  const { isLoading, data, refetch } = useQuery({
    queryKey: ["histories_process", type_process], // thêm 1 fiel tại s2 value , khi fiel này thay đổi useQueries sẽ tự retch dữ liệu mới
    queryFn: fetchHistoriesProcess,
    retry: false,
  });

  const handleLoadingData = async (typeProcess) => {
    set_type_process(typeProcess);
  };

  // DATA FROM USERS LIST
  const tableData =
    (data?.requests?.length &&
      data?.requests?.map((process) => {
        console.log(
          "process.production_process => ",
          process.production_process
        );
        return {
          ...process,
          key: process._id,
          processCode: process?.production_process?._id,
          processName: process?.production_process?.production_name,
          start_time: process?.production_process?.start_time,
          end_time: process?.production_process?.end_time,
          final_time_finish: process?.production_process?.final_time_finish,
          status: process?.production_process?.status,
        };
      })) ||
    [];

  // Customize Filter Search Props
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            {t("common.search")}
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            {t("common.reset")}
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            {t("common.close")}
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const columns = [
    {
      title: t("histories.field.processCode"),
      dataIndex: "processCode",
      key: "processCode",
      ...getColumnSearchProps("processCode"),
    },
    {
      title: t("histories.field.processName"),
      dataIndex: "processName",
      key: "processName",
      ...getColumnSearchProps("processName"),
      sorter: (a, b) => a?.full_name.length - b?.full_name.length,
    },
    {
      title: <div className="text-center">{t("histories.field.start")}</div>,
      dataIndex: "start_time",
      key: "start_time",
      className: "text-center",
      sorter: true,
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: <div className="text-center">{t("histories.field.end")}</div>,
      dataIndex: "end_time",
      key: "end_time",
      className: "text-center",
      sorter: true,
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: <div className="text-center">{t("histories.field.status")}</div>,
      dataIndex: "status",
      key: "status",
      className: "text-center",
      render: (status) => {
        let color = "green"; // Màu mặc định
        if (status === "Hoàn thành") color = "green"; // Tím
        return (
          <Tag color={color} style={{ fontWeight: 600 }}>
            {t(`status.${statusMap[status]}`) || status}
          </Tag>
        );
      },
    },
    {
      title: <div className="text-center">{t("histories.field.action")}</div>,
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            type="link"
            onClick={() =>
              navigate(`/system/admin/process_details/${type_process}/${record?.processCode}`)
            }
          >
            {t("histories.button.viewDetails")}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="production-processing-list px-8">
      <div className="my-9">
        <div className="flex items-center justify-between">
          {/* Nút quay lại responsive */}
          <button
            onClick={() => navigate(-1)}
            type="button"
            className="flex items-center justify-center md:justify-start text-white font-semibold transition duration-300 shadow-sm px-2 md:px-3 py-1 bg-black hover:opacity-70 rounded-md min-w-[32px] md:min-w-[100px]"
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
              {t("productionProcess.button.back")}
            </span>
          </button>

          {/* Tiêu đề căn giữa */}
          <h5 className="flex justify-center items-center gap-2 text-center font-bold text-xl md:text-2xl flex-grow mx-2 text-gray-800">
            <BsBuildingFillGear></BsBuildingFillGear>
            {t("histories.title")}
          </h5>

          {/* Phần tử trống để cân layout */}
          <div className="min-w-[32px] md:min-w-[100px]"></div>
        </div>

        {/* selection type of process to view histories */}
        <div className="px-6 mt-4">
          <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm space-y-2 mb-2 w-full md:w-fit">
            <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1 mt-2">
              <button
                className={`
        inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
        text-sm font-medium transition-all duration-300
        ${
          type_process === "single_processes"
            ? "bg-white text-green-600 shadow-sm transform scale-105"
            : "text-gray-600 hover:text-green-600 hover:bg-white/50"
        }
      `}
                onClick={() => handleLoadingData("single_processes")}
              >
                <FaGear
                  className={`text-base ${
                    type_process === "single_processes" ? "text-green-500" : ""
                  }`}
                />
                <span>{t("processingManagement.button.single")}</span>
              </button>

              <button
                className={`
        inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
        text-sm font-medium transition-all duration-300
        ${
          type_process === "consolidated_processes"
            ? "bg-white text-green-600 shadow-sm transform scale-105"
            : "text-gray-600 hover:text-green-600 hover:bg-white/50"
        }
      `}
                onClick={() => handleLoadingData("consolidated_processes")}
              >
                <FaGears
                  className={`text-base ${
                    type_process === "consolidated_processes" ? "text-green-500" : ""
                  }`}
                />
                <span>{t("processingManagement.button.consolidated")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Loading isPending={isLoading}>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={{ pageSize: 6 }}
          onRow={(record, rowIndex) => {}}
          scroll={{ x: "max-content" }}
        />
      </Loading>
    </div>
  );
};

export default HistoriesProcess;
