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

const HistoriesProcess = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const searchInput = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

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
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
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
      title: "Mã quy trình",
      dataIndex: "processCode",
      key: "processCode",
      ...getColumnSearchProps("processCode"),
    },
    {
      title: "Tên quy trình",
      dataIndex: "processName",
      key: "processName",
      ...getColumnSearchProps("processName"),
      sorter: (a, b) => a?.full_name.length - b?.full_name.length,
    },
    {
      title: "Bắt đầu",
      dataIndex: "start_time",
      key: "start_time",
      sorter: true,
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Kết thúc",
      dataIndex: "end_time",
      key: "end_time",
      sorter: true,
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "green"; // Màu mặc định
        if (status === "Hoàn thành") color = "green"; // Tím
        return (
          <Tag color={color} style={{ fontWeight: 600 }}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
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
            Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="production-processing-list">
      <h5 className="text-2xl font-bold text-gray-800">Lịch Sử Quy Trình</h5>
      <Loading isPending={isLoading}>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={{ pageSize: 6 }}
          onRow={(record, rowIndex) => {}}
        />
      </Loading>
    </div>
  );
};

export default HistoriesProcess;
