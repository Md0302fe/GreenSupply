import moment from "moment";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Table, Button, Space, Tag, Input } from "antd";
import React, { useEffect, useRef, useState } from "react";
import Loading from "../../components/LoadingComponent/Loading";
import { getHistoriesProcess } from "../../services/ProductionProcessingServices";
import Highlighter from "react-highlight-words";
import { useTranslation } from "react-i18next";

const HistoriesProcess = () => {
  const { t } = useTranslation();

  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const searchInput = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
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
    return await getHistoriesProcess(access_token);
  };

  const { isLoading, data, refetch } = useQuery({
    queryKey: ["histories_process"],
    queryFn: fetchHistoriesProcess,
    retry: false,
  });

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
              navigate(`/system/admin/process_details/${record?.processCode}`)
            }
          >
            {t("histories.button.viewDetails")}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="production-processing-list">
      <h5 className="text-center font-bold text-[20px] md:text-2xl flex-grow mx-4">{t("histories.title")}</h5>
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
