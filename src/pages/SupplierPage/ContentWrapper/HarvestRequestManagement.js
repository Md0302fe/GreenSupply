import React, { useState, useEffect } from "react";
import { Input, Button, Table, Tag, Space, message } from "antd";
import { AiFillEdit } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import { useSelector } from "react-redux";
import ButtonComponent from "../../../components/ButtonComponent/ButtonComponent";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as HarverstRequestService from "../../../services/HarvestRequestService";
// import Shop from "../../../assets/NewProject/Icon-GreenSupply/shop-illustration.webp";
import DrawerComponent from "../../../components/DrawerComponent/DrawerComponent";
import { useRef } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { HiOutlineDocumentSearch } from "react-icons/hi";

import Highlighter from "react-highlight-words";

import { convertPrice } from "../../../ultils";
import { useTranslation } from "react-i18next";

import { Modal } from "antd";

// Định nghĩa hàm quản lý yêu cầu thu hoạch
const HarvestRequestManagement = () => {
  const { t } = useTranslation();

  const user = useSelector((state) => state.user);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCancelPopupOpen, setIsCancelPopupOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
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

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const drawerWidth = isMobile ? "100%" : "40%";
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
      await HarverstRequestService.updateHarvestRequest(
        selectedRequest._id,
        updatedData
      );
      message.success(t("harvestRequest.success_update"));
      queryClient.invalidateQueries("harvestRequests");
      setIsDrawerOpen(false);
    } catch (error) {
      message.error(t("harvestRequest.fail_update") + `: ${error.message}`);
    }
  };

  const handleCancelClick = (requestId, status) => {
    if (status !== "Chờ duyệt") {
      message.warning(t("harvestRequest.only_cancel_pending"));
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
      message.success(t("harvestRequest.success_cancel"));
      queryClient.invalidateQueries("harvestRequests");
    } catch (error) {
      message.error(t("harvestRequest.fail_cancel") + `: ${error.message}`);
    } finally {
      // Close the modal after the operation
      setIsCancelPopupOpen(false);
      setCancelRequestId(null);
    }
  };

  const allColumns = [
    {
      title: t("harvestRequest.name"),
      dataIndex: "fuel_name",
      key: "fuel_name",
      ...getColumnSearchProps("fuel_name"),
      sorter: (a, b) => a.fuel_name.localeCompare(b.fuel_name),
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>
          {t("harvestRequest.quantity")}
        </div>
      ),
      dataIndex: "quantity",
      key: "quantity",
      className: "text-center",
      sorter: (a, b) => a.quantity - b.quantity,
      render: (quantity) => convertPrice(quantity),
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>{t("harvestRequest.price")}</div>
      ),
      dataIndex: "price",
      key: "price",
      className: "text-center",
      sorter: (a, b) => a.price - b.price,
      render: (price) => convertPrice(price),
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>
          {t("harvestRequest.total_price")}
        </div>
      ),
      dataIndex: "total_price",
      key: "total_price",
      className: "text-center",
      sorter: (a, b) => a.total_price - b.total_price,
      render: (total_price) => convertPrice(total_price),
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>{t("harvestRequest.status")}</div>
      ),
      dataIndex: "status",
      key: "status",
      className: "text-center",
      render: (status) => {
        const { color, label } = statusMap[status] || {
          color: "default",
          label: status,
        };
        return <Tag color={color}>{label}</Tag>;
      },
      onFilter: (value, record) => {
        // Kiểm tra xem giá trị status có phải là "Hoàn Thành" hay "Đang xử lý" không
        if (value === "Hoàn Thành") {
          return (
            record.status === "Hoàn Thành" || record.status === "Đang xử lý"
          );
        }
        console.log(value);
        return record.status.indexOf(value) === 0;
      },
      filters: [
        { text: t("status.pending"), value: "Chờ duyệt" },
        { text: t("status.approve"), value: "Đã duyệt" },
        { text: t("status.cancelled"), value: "Đã huỷ" },
        { text: t("status.completed"), value: "Hoàn Thành" },
      ],
    },
  ];

  const statusMap = {
    "Chờ duyệt": { color: "orange", label: t("status.pending") },
    "Đã duyệt": { color: "green", label: t("status.approve") },
    "Hoàn Thành": { color: "gold", label: t("status.completed") },
    "Đang xử lý": { color: "gold", label: t("status.completed") },
    "Đã huỷ": { color: "red", label: t("status.cancelled") },
    "Đã hủy": { color: "red", label: t("status.cancelled") },
    "Từ chối": { color: "magenta", label: t("status.rejected") },
    "Đang chuẩn bị": { color: "blue", label: t("status.preparing") },
  };

  const actionColumn = {
    title: (
      <div style={{ textAlign: "center" }}>{t("harvestRequest.action")}</div>
    ),
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
  };

  // Chọn cột hiển thị tùy theo thiết bị
  const columns = isMobile
    ? [
        allColumns[0],
        allColumns[1],
        allColumns[2],
        allColumns[3],
        allColumns[4],
        actionColumn,
      ] // Tên yêu cầu, Trạng thái, Hành động
    : [...allColumns, actionColumn];

  const handleViewDetail = (record) => {
    setViewDetailRequest(record);
    setIsViewDrawerOpen(true);
  };

  return (
    <div className="Wrapper-Admin-HarvestRequest">
      <div className="text-center font-bold text-2xl mb-5">
        {t("harvestRequest.title")}
      </div>

      <hr />

      <Table
        columns={columns}
        dataSource={requests}
        loading={isLoading}
        rowKey={(record) => record._id}
        pagination={{ pageSize: 6 }}
        scroll={{ x: "max-content" }}
      />

      {/* Drawer Update Request */}
      <DrawerComponent
        title={t("harvestRequest.edit_title")}
        isOpen={isDrawerOpen}
        placement="right"
        width={drawerWidth}
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedRequest ? (
          <div className="w-full p-6 bg-white rounded-md shadow">
            <div className="grid grid-cols-1 gap-4 mb-4">
              {/* Tên yêu cầu */}
              <div>
                <label className="block mb-1 font-semibold">
                  {t("harvestRequest.name")}
                </label>
                <input
                  type="text"
                  name="fuel_name"
                  maxLength="50"
                  placeholder={t("harvestRequest.name")}
                  value={editForm.fuel_name}
                  onChange={handleEditChange}
                  className="border p-2 rounded w-full mb-1"
                />
                {errors.fuel_name && (
                  <p className="text-red-500 text-xs">{errors.fuel_name}</p>
                )}
              </div>

              {/* Số lượng + Giá mỗi đơn vị */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">
                    {t("harvestRequest.quantity")}
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    placeholder={t("harvestRequest.quantity")}
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
                    {t("harvestRequest.price")}
                  </label>
                  <input
                    type="number"
                    name="price"
                    min="1"
                    placeholder={t("harvestRequest.price")}
                    value={editForm.price}
                    onChange={handleEditChange}
                    className="border p-2 rounded w-full mb-1"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-xs">{errors.price}</p>
                  )}
                </div>
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="block mb-1 font-semibold">
                  {t("harvestRequest.address")}
                </label>
                <input
                  type="text"
                  name="address"
                  maxLength="120"
                  placeholder={t("harvestRequest.address")}
                  value={editForm.address}
                  onChange={handleEditChange}
                  className="border p-2 rounded w-full mb-1"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs">{errors.address}</p>
                )}
              </div>
            </div>

            {/* Tổng giá */}
            <div className="mt-4 mb-4">
              <p>
                <span className="font-semibold mr-2">
                  {t("harvestRequest.total_price_display")}:
                </span>
                {(editForm.quantity * editForm.price).toLocaleString("vi-VN")}{" "}
                VNĐ
              </p>
            </div>

            {/* Ghi chú */}
            <div className="mb-4">
              <label className="block mb-1 font-semibold">
                {t("harvestRequest.note")}
              </label>
              <textarea
                name="note"
                maxLength="200"
                placeholder={t("harvestRequest.note_limit")}
                value={editForm.note}
                onChange={handleEditChange}
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="flex flex-col md:flex-row justify-end gap-4 mt-4">
              <ButtonComponent type="update" onClick={handleEditSubmit} />
              <ButtonComponent
                type="cancel"
                onClick={() => setIsDrawerOpen(false)}
              />
            </div>
          </div>
        ) : (
          <p>{t("harvestRequest.no_data")}</p>
        )}
      </DrawerComponent>

      {/* Drawer View Detail */}
      <DrawerComponent
        title={t("harvestRequest.detail_title")}
        isOpen={isViewDrawerOpen}
        placement="right"
        width={drawerWidth}
        onClose={() => setIsViewDrawerOpen(false)}
      >
        {viewDetailRequest ? (
          <div className="w-full p-6 bg-white rounded-md shadow">
            <div className="grid grid-cols-1 gap-4 mb-4">
              {/* Tên yêu cầu */}
              <div>
                <label className="block mb-1 font-semibold">
                  {t("harvestRequest.name")}
                </label>
                <input
                  type="text"
                  value={viewDetailRequest.fuel_name}
                  readOnly
                  className="border p-2 rounded w-full mb-1"
                />
              </div>

              {/* Số lượng + Giá mỗi đơn vị */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">
                    {t("harvestRequest.quantity")}
                  </label>
                  <input
                    type="number"
                    value={viewDetailRequest.quantity}
                    readOnly
                    className="border p-2 rounded w-full mb-1"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold">
                    {t("harvestRequest.price")}
                  </label>
                  <input
                    type="number"
                    value={viewDetailRequest.price}
                    readOnly
                    className="border p-2 rounded w-full mb-1"
                  />
                </div>
              </div>

              {/* Tổng giá */}
              <div>
                <label className="block mb-1 font-semibold">
                  {t("harvestRequest.total_price")}
                </label>
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
                  {t("harvestRequest.address")}
                </label>
                <input
                  type="text"
                  value={viewDetailRequest.address}
                  readOnly
                  className="border p-2 rounded w-full h-auto mb-1"
                />
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block mb-1 font-semibold">
                  {t("harvestRequest.note")}
                </label>
                <textarea
                  value={viewDetailRequest.note}
                  readOnly
                  className="w-full h-auto border p-2 rounded"
                />
              </div>

              {/* Trạng thái */}
              <div className="flex items-center gap-2">
                <label className="font-semibold">
                  {t("harvestRequest.status")}:
                </label>
                {(() => {
                  const { color, label } = statusMap[
                    viewDetailRequest.status
                  ] || {
                    color: "default",
                    label: viewDetailRequest.status,
                  };
                  return <Tag color={color}>{label}</Tag>;
                })()}
              </div>
            </div>

            {/* Nút đóng */}
            <div className="flex justify-end">
              <button
                onClick={() => setIsViewDrawerOpen(false)}
                className="bg-gray-500 text-white font-bold px-4 py-2 rounded hover:bg-gray-600"
              >
                {t("harvestRequest.close")}
              </button>
            </div>
          </div>
        ) : (
          <p>{t("harvestRequest.no_data")}</p>
        )}
      </DrawerComponent>

      {/* Modal Popup cho hủy yêu cầu */}
      <Modal
        open={isCancelPopupOpen}
        onCancel={() => setIsCancelPopupOpen(false)}
        onOk={handleCancelRequest}
        okText={t("harvestRequest.confirm")}
        cancelText={t("harvestRequest.close")}
        title={t("harvestRequest.cancel_confirm_msg")}
        okButtonProps={{ danger: true }}
      >
        <p>{t("harvestRequest.cancel_confirm_msg")}</p>
      </Modal>
    </div>
  );
};

export default HarvestRequestManagement;
