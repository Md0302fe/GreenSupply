import React, { useEffect, useState } from "react";
import { Table, Button, message, Descriptions, Tag, Input, Space } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import axios from "axios";
import { useSelector } from "react-redux";
import _ from "lodash";
import { useMutationHooks } from "../../../../hooks/useMutationHook";
import Loading from "../../../LoadingComponent/Loading";
import DrawerComponent from "../../../DrawerComponent/DrawerComponent";
import * as MaterialServices from "../../../../services/MaterialStorageExportService";
import * as RawMaterialBatches from "../../../../services/RawMaterialBatch";
import { useLocation, useNavigate } from "react-router-dom";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import Highlighter from "react-highlight-words";

const statusColors = {
  "Chờ duyệt": "gold",
  "Đã duyệt": "green",
  "Hoàn thành": "blue",
};

const MaterialStorageExportList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExport, setSelectedExport] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showSearchInput, setShowSearchInput] = useState(false); // Quản lý việc hiển thị thanh tìm kiếm nhỏ
  const [showStatusFilter, setShowStatusFilter] = useState(false); // Quản lý việc hiển thị lọc trạng thái
  const [searchedColumn, setSearchedColumn] = useState("");

  const userRedux = useSelector((state) => state.user);
  const token = userRedux?.access_token || localStorage.getItem("access_token");

  const fetchExports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/material-storage-export/getAllRawMaterialBatch`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            search: debouncedSearch,
            status: statusFilter,
            sortOrder: sortOrder,
          },
        }
      );

      if (response.data.success) {
        setExports(response.data.exports);
      } else {
        message.error("Lỗi khi lấy danh sách đơn xuất kho!");
      }
    } catch (error) {
      message.error("Không thể kết nối đến server!");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (location.state?.createdSuccess) {
      message.success("Tạo đơn xuất kho thành công!");

      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const debounceFn = _.debounce(() => {
      setDebouncedSearch(searchText);
    }, 500);

    debounceFn();
    return () => debounceFn.cancel();
  }, [searchText]);

  useEffect(() => {
    fetchExports();
  }, [debouncedSearch, statusFilter, sortOrder]);

  const getColumnSearchProps = (dataIndex, placeholder) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          placeholder={placeholder || `Tìm kiếm ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
          autoFocus
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
            onClick={() => {
              clearFilters();
              setSearchText("");
              fetchExports();
            }}
            size="small"
            style={{ width: 70 }}
          >
            Đặt lại
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
              setShowSearchInput(false);
            }}
          >
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : false,
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setShowSearchInput(true);
      } else {
        setShowSearchInput(false);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
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

  const columns = [
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>Loại Xuất Kho</div>
      ),
      dataIndex: "type_export",
      key: "type_export",
      align: "center",
      render: (text) => (
        <div style={{ textAlign: "center" }}>{text || "Không rõ"}</div>
      ),
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>Đơn sản xuất</div>
      ),
      key: "production_request",
      align: "center",
      render: (_, record) => (
        <div style={{}}>
          {record?.production_request_id?.request_name || "Không rõ"}
        </div>
      ),
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>Lô nguyên liệu</div>
      ),
      key: "batch",
      align: "center",
      render: (_, record) => (
        <div style={{}}>{record?.batch_id?.batch_name || "Không rõ"}</div>
      ),
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>Trạng Thái</div>
      ),
      dataIndex: "status",
      key: "status",
      align: "center",
      filters: [
        {
          text: "Chờ duyệt",
          value: "Chờ duyệt",
        },
        {
          text: "Hoàn thành",
          value: "Hoàn thành",
        },
      ],
      onFilter: (value, record) => record.status === value,
      filteredValue: statusFilter ? [statusFilter] : null,
      render: (status) => {
        let color = "";
        switch (status) {
          case "Chờ duyệt":
            color = "orange";
            break;
          case "Đã duyệt":
            color = "green";
            break;
          case "Đã Hủy":
            color = "red";
            break;
          case "Hoàn thành":
            color = "blue";
            break;
          case "Đang xử lý":
            color = "yellow";
            break;
          default:
            color = "default";
        }
        return (
          <div style={{ textAlign: "center" }}>
            <Tag color={color}>{status}</Tag>
          </div>
        );
      },
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>Hành động</div>
      ),
      key: "action",
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button
            type="link"
            icon={
              <HiOutlineDocumentSearch
                style={{ fontSize: "20px", color: "dodgerblue" }}
              />
            }
            onClick={() => showExportDetails(record._id)}
          />
        </div>
      ),
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    // Cập nhật filter trạng thái
    if (filters.status) {
      setStatusFilter(filters.status[0] || "");
    } else {
      setStatusFilter("");
    }

    // Cập nhật sortOrder theo createdAt hoặc export_name nếu muốn
    if (sorter.order) {
      // sorter.order là 'ascend' hoặc 'descend'
      setSortOrder(sorter.order === "ascend" ? "asc" : "desc");
    }
  };
  // Accept Request
  const mutationAccept = useMutationHooks(async (data) => {
    const response = await MaterialServices.handleAcceptMaterialExport(data);
    return response;
  });
  const { isPending, isSuccess, data } = mutationAccept;

  const handleAccept = async () => {
    try {
      await mutationAccept.mutateAsync({
        access_token: userRedux?.access_token,
        storage_export_id: selectedExport._id,
      });

      const batchId = selectedExport?.batch_id?._id;

      if (batchId) {
        await RawMaterialBatches.updateRawMaterialBatchStatus(
          batchId,
          "Đã xuất kho",
          userRedux?.access_token
        );
      }

      message.success("Duyệt đơn thành công");
      setIsDrawerOpen(false);
      fetchExports();
    } catch (error) {
      console.error("Lỗi khi duyệt đơn:", error);
      message.error("Lỗi khi duyệt đơn hoặc cập nhật trạng thái!");
    }
  };

  // useEffect(() => {
  //   if (isSuccess) {
  //     if (data?.success) {
  //       message.success("Xác nhận đơn thành công");
  //       setIsDrawerOpen(false);
  //     } else {
  //       message.error("Xác nhận đơn thất bại");
  //       setIsDrawerOpen(false);
  //     }
  //     fetchExports();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isSuccess, data]);

  // useEffect(() => {
  //   if (isSuccess) {
  //     if (data?.success) {
  //       message.success("Xác nhận đơn thành công");
  //       setIsDrawerOpen(false);
  //     } else {
  //       message.error("Xác nhận đơn thất bại");
  //       setIsDrawerOpen(false);
  //     }
  //     fetchExports();
  //   }
  // }, [isSuccess, data]);

  const handleSortChange = (value) => {
    setSortOrder(value);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
  };

  const showExportDetails = (id) => {
    setLoading(true);
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/material-storage-export/getRawMaterialBatchById/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        if (response.data.success) {
          setSelectedExport(response.data.export);
          setIsDrawerOpen(true); // ✅ mở drawer
        } else {
          message.error("Không tìm thấy đơn xuất kho!");
        }
      })
      .catch(() => message.error("Lỗi khi lấy chi tiết đơn xuất kho!"))
      .finally(() => setLoading(false));
  };

  // Reject Request
  const mutationReject = useMutationHooks(async (data) => {
    const response = await MaterialServices.handleRejectMaterialExport(data);
    return response;
  });

  const {
    isPending: isPendingDelete,
    isSuccess: isSuccessDelete,
    data: dataDelete,
  } = mutationReject;

  const handleReject = () => {
    mutationReject.mutate({
      access_token: userRedux?.access_token,
      storage_export_id: selectedExport._id,
    });
  };

  useEffect(() => {
    if (isSuccessDelete) {
      if (dataDelete?.success) {
        message.success("Xóa đơn thành công");
        setIsDrawerOpen(false);
      } else {
        message.error("Xóa đơn thất bại");
        setIsDrawerOpen(false);
      }
      fetchExports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessDelete, dataDelete]);

  return (
    <div className="material-storage-export-list">
      <div className="flex items-center justify-between my-6">
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

        <h5 className="text-3xl font-bold text-gray-800 absolute left-1/2 transform -translate-x-1/2">
          Quản lý Đơn Xuất Kho
        </h5>
        <div style={{ width: 120 }} />
      </div>

      <div className="flex flex-wrap gap-4 mb-2">
        {/* <Select
          onChange={handleStatusChange}
          value={statusFilter}
          placeholder="Lọc theo trạng thái"
          style={{ width: 200 }}
        >
          <Option value="">Tất cả</Option>
          <Option value="Chờ duyệt">Chờ duyệt</Option>
          <Option value="Hoàn thành">Hoàn thành</Option>
        </Select> */}

        {/* <Select
          onChange={handleSortChange}
          value={sortOrder}
          style={{ width: 200 }}
        >
          <Option value="desc">Mới nhất</Option>
          <Option value="asc">Cũ nhất</Option>
        </Select> */}
      </div>

      <Loading isPending={loading}>
        <Table
          columns={columns}
          dataSource={exports}
          rowKey="_id"
          pagination={{ pageSize: 6 }}
          onChange={handleTableChange}
        />
      </Loading>

      {/* ✅ Drawer hiển thị chi tiết */}
      <DrawerComponent
        title="Chi tiết Đơn Xuất Kho"
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedExport(null);
        }}
        placement="right"
        width="40%"
      >
        {selectedExport ? (
          <Descriptions
            bordered
            column={1}
            labelStyle={{ width: "40%", fontWeight: "600" }}
            contentStyle={{ width: "60%" }}
          >
            <Descriptions.Item label="Người tạo đơn">
              {selectedExport?.user_id?.full_name || "Không rõ"}
            </Descriptions.Item>
            <Descriptions.Item label="Yêu cầu sản xuất">
              {selectedExport?.production_request_id?.request_name ||
                "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Tên lô">
              {selectedExport?.batch_id?.batch_name || "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Mã lô">
              {selectedExport?.batch_id?.batch_id || "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Tên Xuất Kho">
              {selectedExport?.export_name || "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Loại Xuất Kho">
              {selectedExport?.type_export || "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng Thái">
              <Tag color={statusColors[selectedExport.status] || "default"}>
                {selectedExport.status || "Không rõ"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo đơn">
              {new Date(selectedExport.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              {selectedExport?.note || "Không có ghi chú"}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <p className="text-center">Đang tải dữ liệu...</p>
        )}
        {selectedExport?.status === "Chờ duyệt" && (
          <div className="flex flex-col md:flex-row md:justify-between gap-4 mt-4">
            <Button danger onClick={handleReject} className="w-full md:w-auto">
              Hủy yêu cầu
            </Button>
            <Button
              type="primary"
              onClick={handleAccept}
              className="w-full md:w-auto"
            >
              Duyệt đơn
            </Button>
          </div>
        )}
      </DrawerComponent>

      {/* messageContainer */}
      <messageContainer
        hideProgressBar={false}
        position="top-right"
        newestOnTop={false}
        pauseOnFocusLoss
        autoClose={3000}
        closeOnClick
        pauseOnHover
        theme="light"
        rtl={false}
        draggable
      />
    </div>
  );
};

export default MaterialStorageExportList;
