import React, { useState } from "react";
import { Input, Button, Table, Tag, Space, message } from "antd";
import { AiFillEdit } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import { useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as HarverstRequestService from "../../../services/HarvestRequestService";
// import Shop from "../../../assets/NewProject/Icon-GreenSupply/shop-illustration.webp";
import DrawerComponent from "../../../components/DrawerComponent/DrawerComponent";
import { useRef } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { HiOutlineDocumentSearch } from "react-icons/hi";

import Highlighter from "react-highlight-words";

import { convertPrice } from "../../../ultils";

// Định nghĩa hàm quản lý yêu cầu thu hoạch
const HarvestRequestManagement = () => {
  const user = useSelector((state) => state.user);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCancelPopupOpen, setIsCancelPopupOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [rowSelected, setRowSelected] = useState(null);
  const [editForm, setEditForm] = useState({
    fuel_name: "",
    quantity: "",
    price: "",
    address: "",
    note: "",
  });
  const [viewDetailRequest, setViewDetailRequest] = useState(null);
  const [cancelRequestId, setCancelRequestId] = useState(null);
  const [errors, setErrors] = useState({});
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const [selectedRequest, setSelectedRequest] = useState(null);

  const getAllHarvestRequests = async () => {
      const access_token = user?.access_token;
      const user_id = user?.id;
  
      const res = await HarverstRequestService.getAllHarvestRequests(
        access_token, 
        user_id
      );
      return res;
    };

  const { data: requests, isLoading } = useQuery({
    queryKey: ["harvestRequests"],
    queryFn: () => getAllHarvestRequests(), 
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

  const getStatusClasses = (status) => {
    if (status === "Chờ duyệt") return "bg-yellow-100 text-yellow-800";
    if (status === "Đã duyệt") return "bg-green-100 text-green-800";
    if (status === "Đã huỷ") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  // Search and filter
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Tìm kiếm ${dataIndex}`}
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
            style={{ width: 90 }}
          >
            Tìm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Đặt lại
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
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

  // Handle Edit click
  const handleEdit = (record) => {
    setSelectedRequest(record);
    setEditForm({
      fuel_name: record.fuel_name,
      quantity: record.quantity,
      price: record.price,
      address: record.address,
      note: record.note,
    });
    setErrors({});
    setIsDrawerOpen(true);
  };

  // Handle input change for form fields
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Submit form
  const handleEditSubmit = async () => {
    const updatedData = {
      fuel_name: editForm.fuel_name,
      quantity: Number(editForm.quantity),
      price: Number(editForm.price),
      total_price: Number(editForm.quantity) * Number(editForm.price),
      address: editForm.address,
      note: editForm.note,
    };

    try {
      await HarverstRequestService.updateHarvestRequest(selectedRequest._id, updatedData);
      message.success("Cập nhật yêu cầu thành công!");
      queryClient.invalidateQueries("harvestRequests");
      setIsDrawerOpen(false);
    } catch (error) {
      message.error(`Cập nhật yêu cầu thất bại: ${error.message}`);
    }
  };

  const handleCancelClick = (requestId, status) => {
    if (status !== "Chờ duyệt") {
      message.warning("Chỉ có thể hủy yêu cầu ở trạng thái 'Chờ duyệt'.");
      return;
    }
    // Set the cancelRequestId and show the popup
    setCancelRequestId(requestId);
    setIsCancelPopupOpen(true);
  };

  // Define the cancel request confirmation function
  const handleCancelRequest = async () => {
    if (!cancelRequestId) return;

    try {
      // Call the cancel API
      await HarverstRequestService.cancelHarvestRequest(cancelRequestId);
      message.success("Yêu cầu đã được hủy thành công!");
      queryClient.invalidateQueries("harvestRequests");
    } catch (error) {
      message.error(
        `Hủy yêu cầu thất bại: ${error.message || "Lỗi không xác định"}`
      );
    } finally {
      // Close the modal after the operation
      setIsCancelPopupOpen(false);
      setCancelRequestId(null);
    }
  };

  const columns = [
    {
      title: "Yêu cầu",
      dataIndex: "fuel_name",
      key: "fuel_name",
      ...getColumnSearchProps("fuel_name"),
      sorter: (a, b) => a.fuel_name.localeCompare(b.fuel_name),
    },
    {
      title: <div style={{ textAlign: "center" }}>Số lượng</div>,
      dataIndex: "quantity",
      key: "quantity",
      className: "text-center",
      sorter: (a, b) => a.quantity - b.quantity,
      render: (quantity) => convertPrice(quantity)
    },
    {
      title: <div style={{ textAlign: "center" }}>Giá mỗi Kg</div>,
      dataIndex: "price",
      key: "price",
      className: "text-center",
      sorter: (a, b) => a.price - b.price,
      render: (price) => convertPrice(price)
    },
    {
      title: <div style={{ textAlign: "center" }}>Tổng giá (VNĐ)</div>,
      dataIndex: "total_price",
      key: "total_price",
      className: "text-center",
      sorter: (a, b) => a.total_price - b.total_price,
      render: (total_price) => convertPrice(total_price),
    },
    {
      title: <div style={{ textAlign: "center" }}>Trạng thái</div>,
      dataIndex: "status",
      key: "status",
      className: "text-center",
      render: (status) => {
        let color = "orange"; // Mặc định là "Chờ duyệt"
        if (status === "Đã duyệt") color = "green";
        if (status === "Hoàn thành" || status === "Đang xử lý") color = "yellow";
        if (status === "Đã huỷ") color = "red"

        const displayText =
          status === "Đang xử lý" || status === "Hoàn thành"
            ? "Hoàn thành"
            : status;

        return <Tag color={color}>{displayText}</Tag>;
      },
      onFilter: (value, record) => record.status.indexOf(value) === 0,
      filters: [
        { text: "Chờ duyệt", value: "Chờ duyệt" },
        { text: "Đã duyệt", value: "Đã duyệt" },
        { text: "Đã huỷ", value: "Đã huỷ" },
      ],
    },
    {
      title: <div style={{ textAlign: "center" }}>Hành động</div>,
      key: "actions",
      className: "text-center",
      render: (_, record) => (
        <Space>
          <Button
            icon={<AiFillEdit />}
            onClick={() => handleEdit(record)}
            disabled={record.status !== "Chờ duyệt"}
            size="middle"
          />
          <Button
            icon={<MdDelete style={{ color: "red" }} />}
            onClick={() => handleCancelClick(record._id, record.status)}
            disabled={record.status !== "Chờ duyệt"}
            size="middle"
          />
          <Button
            icon={<HiOutlineDocumentSearch style={{ color: "dodgerblue" }} />}
            onClick={() => handleViewDetail(record)}
            size="middle"
          />
        </Space>
      ),
    },
  ];

  const handleViewDetail = (record) => {
    setViewDetailRequest(record);
    setIsViewDrawerOpen(true);
  };

  return (
    <div className="Wrapper-Admin-HarvestRequest">
      {/* <div className="w-full border border-gray-200 flex items-center gap-20 mb-4 justify-between rounded-md p-6 bg-white shadow">
        <div className="info">
          <h1 className="flex items-center text-3xl font-bold mb-3 text-[#006838]">
            Quản Lý Yêu Cầu Thu Nguyên Liệu <MdAttachMoney />
          </h1>
          <div className="max-w-[44rem]">
            <p className="w-full text-[16px] text-gray-700">
              Đây là trang danh sách các yêu cầu thu nguyên liệu mà{" "}
              <span className="font-semibold text-[#006838]">
                {userRedux?.full_name || "nhà cung cấp"}
              </span>{" "}
              đã tạo. Tại đây, bạn có thể theo dõi, chỉnh sửa hoặc hủy các đơn
              thu mua nông sản của mình trước khi được hệ thống duyệt.
            </p>
          </div>
        </div>
        <img src={Shop} className="w-[250px]" alt="Shop Illustration" />
      </div> */}
      <div className="text-center font-bold text-2xl mb-5">
        ĐƠN YÊU CẦU THU NGUYÊN LIỆU
      </div>

      <hr />

      <Table
        columns={columns}
        dataSource={requests}
        loading={isLoading}
        rowKey={(record) => record._id}
        pagination={{ pageSize: 6 }}
      />

      {/* Drawer Update Request */}
      <DrawerComponent
        title="Chỉnh sửa yêu cầu thu nguyên liệu"
        isOpen={isDrawerOpen}
        placement="right"
        width="40%"
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedRequest ? (
          <div className="w-full p-6 bg-white rounded-md shadow">
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block mb-1 font-semibold">Tên yêu cầu</label>
                <input
                  type="text"
                  name="fuel_name"
                  maxLength="50"
                  placeholder="Tên yêu cầu..."
                  value={editForm.fuel_name}
                  onChange={handleEditChange}
                  className="border p-2 rounded w-full mb-1"
                />
                {errors.fuel_name && (
                  <p className="text-red-500 text-xs">{errors.fuel_name}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 font-semibold">
                  Số lượng (kg)
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  placeholder="Số lượng..."
                  value={editForm.quantity}
                  onChange={handleEditChange}
                  className="border p-2 rounded w-full mb-1"
                />
                {errors.quantity && (
                  <p className="text-red-500 text-xs">{errors.quantity}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 font-semibold">
                  Giá mỗi đơn vị (VNĐ)
                </label>
                <input
                  type="number"
                  name="price"
                  min="1"
                  placeholder="Giá bán..."
                  value={editForm.price}
                  onChange={handleEditChange}
                  className="border p-2 rounded w-full mb-1"
                />
                {errors.price && (
                  <p className="text-red-500 text-xs">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 font-semibold">
                  Địa chỉ lấy hàng
                </label>
                <input
                  type="text"
                  name="address"
                  maxLength="120"
                  placeholder="Nhập địa chỉ..."
                  value={editForm.address}
                  onChange={handleEditChange}
                  className="border p-2 rounded w-full mb-1"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs">{errors.address}</p>
                )}
              </div>
            </div>

            <div className="mt-4 mb-4">
              <p>
                <span className="font-semibold mr-2">Tổng giá:</span>
                {(editForm.quantity * editForm.price).toLocaleString(
                  "vi-VN"
                )}{" "}
                VNĐ
              </p>
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-semibold">Ghi chú</label>
              <textarea
                name="note"
                maxLength="200"
                placeholder="Ghi chú (tối đa 200 ký tự)"
                value={editForm.note}
                onChange={handleEditChange}
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="flex flex-col md:flex-row md:justify-between gap-4 mt-4">
              <button
                onClick={handleEditSubmit}
                className="bg-[#006838] text-white font-bold px-4 py-2 rounded hover:bg-[#028A48] w-full"
              >
                Cập nhật yêu cầu
              </button>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="bg-gray-500 text-white font-bold px-4 py-2 rounded hover:bg-gray-600 w-full"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <p>Không có dữ liệu.</p>
        )}
      </DrawerComponent>

      {/* Drawer View Detail */}
      <DrawerComponent
        title="Chi tiết yêu cầu thu nguyên liệu"
        isOpen={isViewDrawerOpen}
        placement="right"
        width="40%"
        onClose={() => setIsViewDrawerOpen(false)}
      >
        {viewDetailRequest ? (
          <div className="w-full p-6 bg-white rounded-md shadow">
            <div className="grid grid-cols-1 gap-4 mb-4">
              {/* Tên yêu cầu */}
              <div>
                <label className="block mb-1 font-semibold">Tên yêu cầu</label>
                <input
                  type="text"
                  value={viewDetailRequest.fuel_name}
                  readOnly
                  className="border p-2 rounded w-full mb-1"
                />
              </div>

              {/* Số lượng */}
              <div>
                <label className="block mb-1 font-semibold">
                  Số lượng (kg)
                </label>
                <input
                  type="number"
                  value={viewDetailRequest.quantity}
                  readOnly
                  className="border p-2 rounded w-full mb-1"
                />
              </div>

              {/* Giá mỗi đơn vị */}
              <div>
                <label className="block mb-1 font-semibold">
                  Giá mỗi đơn vị (VNĐ)
                </label>
                <input
                  type="number"
                  value={viewDetailRequest.price}
                  readOnly
                  className="border p-2 rounded w-full mb-1"
                />
              </div>

              {/* Tổng giá */}
              <div>
                <label className="block mb-1 font-semibold">Tổng giá</label>
                <input
                  type="text"
                  value={
                    viewDetailRequest.total_price.toLocaleString("vi-VN") +
                    " VNĐ"
                  }
                  readOnly
                  className="border p-2 rounded w-full mb-1"
                />
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="block mb-1 font-semibold">
                  Địa chỉ lấy hàng
                </label>
                <input
                  type="text"
                  value={viewDetailRequest.address}
                  readOnly
                  className="border p-2 rounded w-full h-auto mb-1"
                />
              </div>

              {/* Ghi chú */}
              <div className="">
                <label className="block mb-1 font-semibold">Ghi chú</label>
                <textarea
                  value={viewDetailRequest.note}
                  readOnly
                  className="w-full h-auto border p-2 rounded"
                />
              </div>

              {/* Trạng thái */}
              <div className="flex items-center gap-2 mb-2">
                <label className="font-semibold">Trạng thái:</label>
                <span
                  className={`px-4 py-2 rounded text-sm font-medium inline-block w-30 text-center whitespace-nowrap ${getStatusClasses(
                    viewDetailRequest.status 
                  )}`} 
                >
                  {viewDetailRequest.status}
                </span>
              </div>
            </div>

            {/* Nút đóng */}
            <div className="flex justify-start">
              <button
                onClick={() => setIsViewDrawerOpen(false)}
                className="bg-gray-500 text-white font-bold px-4 py-2 rounded hover:bg-gray-600"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <p>Không có dữ liệu.</p>
        )}
      </DrawerComponent>

      {/* Modal Popup cho hủy yêu cầu */}
      {isCancelPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow p-6 w-80">
            <p className="mb-4">Bạn có chắc chắn muốn hủy yêu cầu này?</p>
            <div className="flex justify-between gap-4">
              <button
                onClick={() => setIsCancelPopupOpen(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Đóng
              </button>
              <button
                onClick={handleCancelRequest}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HarvestRequestManagement;
