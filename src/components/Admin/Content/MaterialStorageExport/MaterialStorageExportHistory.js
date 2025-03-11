import { useSelector } from "react-redux";
import Highlighter from "react-highlight-words";
import { useQuery } from "@tanstack/react-query";
import { SearchOutlined } from "@ant-design/icons";
import Loading from "../../../LoadingComponent/Loading";
import React, { useState, useRef, useEffect } from "react";
import DrawerComponent from "../../../DrawerComponent/DrawerComponent";
import { Input, Space, Tag, Button } from "antd";
import * as MaterialServices from "../../../../services/MaterialStorageExportService";
import TableHistories from "./TableHistories";
import {converDateString} from "../../../../ultils"

const statusColors = {
  "Đã duyệt": "green",
  "Hoàn thành": "green",
  "Đã xóa": "red",
};

const RawMaterialBatchList = () => {
  const user = useSelector((state) => state.user);
  // Loading status
  const [loadingDetails, setIsLoadDetails] = useState(false);
  // selected Row
  const [rowSelected, setRowSelected] = useState("");

  // Drawer state
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Search state
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  // Details State
  const [stateDetailsBatch, setStateDetailsBatch] = useState({
    production_request_id: {},
    batch_id: "",
    user_id: "",
    export_name: "",
    type_export: "",
    note: "",
    status: "",
    createdAt: "",
    is_deleted: false,
    batch_history : {},
  });

  // GET ALL PRODUCT FROM DB
  const fetchBatchHistories = async () => {
    const access_token = user?.access_token;
    const res = await MaterialServices.getAllBatchStorageExportHistory(
      access_token
    );
    return res;
  };

  const queryBatchHistories = useQuery({
    queryKey: ["batch_histories"],
    queryFn: fetchBatchHistories,
  });
  const { isLoading, data } = queryBatchHistories;

  const tableData = Array.isArray(data?.requests)
    ? data?.requests?.map((batch) => ({
        ...batch,
        key: batch._id,
        batch_id: batch.material_export_id.batch_id.batch_id,
        batch_name: batch.material_export_id.batch_id.batch_name,
        type_export: batch.material_export_id.type_export,
        status: batch.material_export_id.status,
      }))
    : [];

  // Fetch : Get User Details
  const fetchGetUserDetails = async ({ storage_export_id, access_token }) => {
    const res = await MaterialServices.getAllBatchStorageExportHistoryDetail(
      storage_export_id,
      access_token
    );
    // Get respone từ api và gán vào state update details

    if (res?.data) {
      console.log(
        "res?.data => ",
        res?.data.batch
      );
      const batchData = res?.data.batch.material_export_id;
      setStateDetailsBatch({
        production_request_id: batchData?.production_request_id,
        batch_id: batchData?.batch_id,
        user_id: batchData?.user_id,
        export_name: batchData?.export_name,
        type_export: batchData?.type_export,
        note: batchData?.note,
        status: batchData?.status,
        is_deleted: batchData?.is_deleted,
        batch_history : res?.data.batch
      });
    }

    setIsLoadDetails(false);
    return res;
  };
  console.log("stateDetailsBatch => ", stateDetailsBatch);
  console.log("stateDetailsBatch?.batch_id?.createdAt => ", stateDetailsBatch?.batch_id?.createdAt);
  // Handle each time rowSelected was call
  useEffect(() => {
    if (rowSelected) {
      if (isDrawerOpen) {
        setIsLoadDetails(true);
        fetchGetUserDetails({
          storage_export_id: rowSelected,
          access_token: user?.access_token,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelected, isDrawerOpen]);

  // Search trong bảng
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Tìm kiếm`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 70 }}
          >
            Tìm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 70 }}
          >
            Đặt lại
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => confirm()}
            style={{ padding: 0 }}
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
      record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
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

  const columns = [
    {
      title: "Mã lô",
      dataIndex: "batch_id",
      key: "batch_id",
      ...getColumnSearchProps("batch_id"),
    },
    {
      title: "Tên lô",
      dataIndex: "batch_name",
      key: "batch_name",
      ...getColumnSearchProps("batch_name"),
      sorter: (a, b) => a.batch_name.localeCompare(b.batch_name),
    },
    {
      title: "Loại đơn",
      dataIndex: "type_export",
      key: "type_export",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: Object.keys(statusColors).map((status) => ({
        text: status,
        value: status,
      })),
      render: (stt) => <Tag color={statusColors[stt] || "default"}>{stt}</Tag>,
    },
    {
      title: "Hành động",
      key: "action",
      render: (record) => (
        <Space>
          <Button type="link" onClick={() => handleViewDetail(record)}>
            Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const handleViewDetail = (record) => {
    setSelectedBatch(record);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedBatch(null);
  };

  console.log("stateDetailsBatch.batch?.createdAt -> ", stateDetailsBatch.batch?.createdAt)

  return (
    <div className="raw-material-batch-list">
      <div className="flex justify-between items-center mb-4">
        <h5 className="text-2xl font-bold text-gray-800">Lịch Sử Xuất Lô</h5>
      </div>

      <Loading isPending={isLoading || loadingDetails}>
        <TableHistories
          // Props List
          columns={columns}
          isLoading={isLoading}
          data={tableData}
          setRowSelected={setRowSelected}
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                setRowSelected(record._id);
              },
            };
          }}
        ></TableHistories>
      </Loading>

      <DrawerComponent
        title="Chi tiết Lô Nguyên Liệu"
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        placement="right"
        width="50%"
      >
        <Loading isPending={loadingDetails}>
          {/* Form cập nhật đơn thu nhiên liệu */}
          <div className="w-full bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
              <div className="space-y-4">
                {/* Tên đơn */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    Tên Đơn
                  </label>
                  <input
                    type="text"
                    name="request_name"
                    maxLength="50"
                    placeholder="Tên đơn thu nhiên liệu..."
                    value={stateDetailsBatch.batch_id.batch_name || ""}
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  />
                </div>

                {/* Ảnh nhiên liệu */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 min-h-[20vh]">
                  {/* Tiêu đề */}
                  <div className="w-full md:w-1/4 text-gray-800 font-semibold">
                    Hình ảnh
                  </div>

                  {/* Hiển thị hình ảnh */}
                  {stateDetailsBatch?.fuel_image && (
                    <div className="w-full md:w-1/2">
                      <img
                        src={stateDetailsBatch.fuel_image}
                        alt="Hình ảnh nhiên liệu"
                        className="w-full h-auto max-h-[300px] object-contain rounded-lg shadow-md border border-gray-300"
                      />
                    </div>
                  )}
                </div>

                {/* Số lượng cần thu */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    Tổng số lượng nguyên liệu (Kg)
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    placeholder="Nhập số lượng..."
                    value={stateDetailsBatch?.batch_id?.quantity}
                    onChange={() => {}}
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  />
                </div>

                {/* Giá trên mỗi kg */}


                {/* Mức độ ưu tiên */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    Loại xuất kho
                  </label>
                  <input
                    type="text"
                    name="type_export"
                    min="1"
                    placeholder="Nhập số lượng..."
                    value={stateDetailsBatch?.type_export}
                    onChange={() => {}}
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  />
                </div>

                {/* Ngày tạo lô */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    Ngày Tạo Lô
                  </label>
                  <input
                    type="text"
                    name="type_export"
                    min="1"
                    placeholder="Nhập số lượng..."
                    value={converDateString(stateDetailsBatch?.batch_id?.createdAt)}
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  />
                </div>

                {/* Ngày tạo lô */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    Ngày Xuất Lô
                  </label>
                  <input
                    type="text"
                    name="type_export"
                    min="1"
                    placeholder="Nhập số lượng..."
                    value={converDateString(stateDetailsBatch?.batch_history?.createdAt)  }
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  />
                </div>

                {/* Ghi chú */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    name="note"
                    placeholder="Nhập ghi chú..."
                    rows="3"
                    value={stateDetailsBatch?.note}
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  />
                </div>

                {/* Tổng giá */}
                <div className="font-semibold text-lg text-gray-800">
                  Tổng giá:{" "}
                  <span className="text-red-500 font-bold">
                    {(
                      stateDetailsBatch?.quantity * stateDetailsBatch?.price
                    ).toLocaleString("vi-VN")}{" "}
                    VNĐ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Loading>
      </DrawerComponent>
    </div>
  );
};

export default RawMaterialBatchList;
