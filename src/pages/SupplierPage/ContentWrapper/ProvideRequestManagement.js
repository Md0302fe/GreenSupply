import React, { useState, useEffect } from "react";
import { Button, Form, Input, Modal, Table, Tag, Space, message } from "antd";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as FuelSupplyRequestService from "../../../services/FuelSupplyRequestService";
import * as FuelEntryServices from "../../../services/FuelEntryServices";
import { converDateString } from "../../../ultils";
import Loading from "../../../components/LoadingComponent/Loading";
import DrawerComponent from "../../../components/DrawerComponent/DrawerComponent";
import { IoDocumentText } from "react-icons/io5";
import { SearchOutlined } from "@ant-design/icons";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import Highlighter from "react-highlight-words";
import { useRef } from "react";
import { AiFillEdit } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import Shop from "../../../assets/NewProject/Icon-GreenSupply/shop-illustration.webp";
import { convertPrice } from "../../../ultils";
import { useTranslation } from "react-i18next";
import ButtonComponent from "../../../components/ButtonComponent/ButtonComponent";

const ProvideRequestManagement = () => {
  const { t } = useTranslation();

  const user = useSelector((state) => state.user);
  const [rowSelected, setRowSelected] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [quantityRemain, setQuantityRemain] = useState(null);
  const [formUpdate] = Form.useForm();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [note, setNote] = useState("");

  const fetchGetAllRequests = async () => {
    const access_token = user?.access_token;
    const user_id = user?.id;

    const res = await FuelSupplyRequestService.getAllFuelSupplyRequest(
      access_token,
      user_id
    );
    return res;
  };

  const { data: fuelRequests, isLoading } = useQuery({
    queryKey: ["fuelRequests"],
    queryFn: () => fetchGetAllRequests(),
  });

  const selectedRequest = fuelRequests?.find(
    (request) => request._id === rowSelected
  ) || {
    fuel_name: "",
    quantity: 0,
    note: "",
    status: "",
    supplier_id: "",
    updatedAt: "",
  };

  const mutationUpdate = useMutation({
    mutationFn: ({ id, data }) =>
      FuelSupplyRequestService.updateFuelSupplyRequest(id, data),
    onSuccess: () => {
      message.success(t("provideRequest.update_success"));
      queryClient.invalidateQueries("fuelRequests");
      handleCancelUpdate();
    },
    onError: () => {
      message.error(t("provideRequest.update_fail"));
    },
  });

  // Mutation for Deleting Fuel Request
  const mutationDelete = useMutation({
    mutationFn: (id) => FuelSupplyRequestService.deleteFuelRequest(id),
    onSuccess: () => {
      message.success(t("provideRequest.delete_success"));
      queryClient.invalidateQueries("fuelRequests");
      setIsOpenDelete(false);
    },
    onError: () => {
      message.error(t("provideRequest.delete_fail"));
    },
  });

  // Handle Confirm Delete Request
  const handleConfirmDelete = () => {
    mutationDelete.mutate(rowSelected);
  };

  const onFinishUpdate = (values) => {
    const fullValues = {
      ...values,
      quantity: formUpdate.getFieldValue("quantity"),
      price: formUpdate.getFieldValue("price"),
      note: note,
    };

    mutationUpdate.mutate({ id: rowSelected, data: fullValues });
  };

  // Handle Cancel Edit Drawer
  const handleCancelUpdate = () => {
    formUpdate.resetFields();
    setIsDrawerOpen(false);
  };

  // Open Drawer and Set Selected Request
  const handleEdit = async (record) => {
    setRowSelected(record._id);
    try {
      const res = await FuelSupplyRequestService.getFuelSupplyRequestById(
        user?.access_token,
        record._id
      );

      if (res) {
        setIsDrawerOpen(true);
        formUpdate.setFieldsValue({
          fuel_name: res.fuel_name,
          quantity: res.quantity,
          price: res.price,
          note: res.note || "",
        });
        setNote(res.note || "");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleViewDetail = async (record) => {
    try {
      console.log("Calling API to get details for request ID:", record._id);
      const res = await FuelSupplyRequestService.getFuelSupplyRequestById(
        user?.access_token,
        record._id
      );
      console.log("Response from API:", res);
      if (res) {
        setDetailData({
          ...res,
          total_price: res.price * res.quantity,
        });
        setIsDetailDrawerOpen(true);
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    }
  };

  const statusMap = {
    "Chờ duyệt": { color: "orange", label: t("status.pending") },
    "Đã duyệt": { color: "green", label: t("status.approve") },
    "Hoàn Thành": { color: "gold", label: t("status.completed") },
    "Đang xử lý": { color: "blue", label: t("status.completed") },
    "Đã huỷ": { color: "red", label: t("status.cancelled") },
    "Đã hủy": { color: "red", label: t("status.cancelled") },
    "Thất bại": { color: "magenta", label: t("status.failed") },
    "Vô hiệu hóa": { color: "gray", label: t("status.disable") },
  };

  const getStatusClasses = (status) => {
    if (status === "Chờ duyệt") return "bg-yellow-100 text-yellow-800";
    if (status === "Đã duyệt") return "bg-green-100 text-green-800";
    if (status === "Đã hủy") return "bg-red-100 text-red-800";
    if (status === "Đang xử lý") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  // Hàm cập nhật tổng giá
  const updateTotalPrice = (quantity, price) => {
    // Kiểm tra nếu số lượng và giá hợp lệ
    if (!isNaN(quantity) && !isNaN(price) && quantity > 0 && price > 0) {
      const totalPrice = quantity * price;
      formUpdate.setFieldsValue({ total_price: totalPrice });
    } else {
      formUpdate.setFieldsValue({ total_price: "" });
      // message.error("Giá và số lượng phải là số hợp lệ và lớn hơn 0!");
    }
  };

  // Search
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
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

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Table Columns
  const allColumns = [
    {
      title: t("provideRequest.request_name"),
      dataIndex: "fuel_name",
      key: "fuel_name",
      ...getColumnSearchProps("fuel_name"),
      sorter: (a, b) => a.fuel_name.localeCompare(b.fuel_name),
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>
          {t("provideRequest.quantity_kg")}
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
        <div style={{ textAlign: "center" }}>
          {t("provideRequest.unit_price")}
        </div>
      ),
      dataIndex: "price",
      key: "price",
      className: "text-center",
      sorter: (a, b) => a.price - b.price,
      render: (price) => convertPrice(price) || "Không có giá mỗi kg",
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>
          {t("provideRequest.total_price")}
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
        <div style={{ textAlign: "center" }}>{t("provideRequest.status")}</div>
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
        { text: t("status.failed"), value: "Thất bại" },
        { text: t("status.disable"), value: "Vô hiệu hóa" },
      ],
    },
  ];

  const actionColumn = {
    title: (
      <div style={{ textAlign: "center" }}>{t("provideRequest.actions")}</div>
    ),
    key: "actions",
    className: "text-center",
    render: (_, record) => {
      const isPending = record.status === "Chờ duyệt";
      return (
        <Space size={8}>
          <Button
            icon={<AiFillEdit />}
            onClick={() => handleEdit(record)}
            disabled={!isPending}
            size="middle"
          />
          <Button
            icon={<MdDelete style={{ color: "red" }} />}
            onClick={() => {
              setRowSelected(record._id);
              setIsOpenDelete(true);
            }}
            disabled={!isPending}
            size="middle"
          />
          <Button
            icon={<HiOutlineDocumentSearch style={{ color: "dodgerblue" }} />}
            type="default"
            onClick={() => handleViewDetail(record)}
            size="middle"
          />
        </Space>
      );
    },
  };

  const columns = isMobile
    ? [
      allColumns[0],
      allColumns[1],
      allColumns[2],
      allColumns[3],
      allColumns[4],
      actionColumn,
    ] // Tên nguyên liệu, Trạng thái, Hành động
    : [...allColumns, actionColumn];

  const drawerWidth = isMobile ? "100%" : "40%";

  return (
    <div className="Wrapper-Admin-FuelRequest">
      <div className="text-center font-bold text-2xl mb-5">
        {t("provideRequest.title")}
      </div>

      <hr />

      <div className="Main-Content">
        <h5 className="content-title"> </h5>
        <Table
          columns={columns}
          dataSource={fuelRequests}
          loading={isLoading}
          rowKey={(record) => record._id}
          pagination={{ pageSize: 6 }}
          scroll={{ x: "max-content" }}
        />
      </div>

      {/* Drawer for Editing */}
      {/* <DrawerComponent
        title="Chi Tiết Yêu Cầu"
        isOpen={isDrawerOpen}
        onClose={handleCancelUpdate}
        placement="right"
        width="30%"
      >
        <Loading isPending={mutationUpdate.isPending}>
          <Form
            name="update-form"
            form={formUpdate}
            onFinish={onFinishUpdate}
            layout="vertical" // 🔹 Ensures proper alignment
          >
            <Form.Item label="Tên Nguyên liệu" name="fuel_name">
              <Input value={selectedRequest.fuel_name} disabled />
            </Form.Item>

            <Form.Item label="Số Lượng">
              {quantityRemain !== null && (
                <div
                  style={{ marginBottom: 5, fontSize: "14px", color: "gray" }}
                >
                  Số lượng còn lại: <strong>{quantityRemain}</strong>
                </div>
              )}
              <Form.Item
                name="quantity"
                rules={[
                  { required: true, message: "Vui lòng nhập số lượng!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value) {
                        return Promise.resolve();
                      }
                      if (value > quantityRemain) {
                        return Promise.reject(
                          new Error(
                            `Số lượng không được vượt quá ${quantityRemain}!`
                          )
                        );
                      }
                      if (value % 10 !== 0) {
                        return Promise.reject(
                          new Error("Số lượng phải chia hết cho 10!")
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input
                  type="number"
                  onKeyDown={(e) => {
                    if (["-", "e", "E", "+", ".", ","].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>
            </Form.Item>
            <Form.Item label="Ghi Chú" name="note">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={mutationUpdate.isPending}
                style={{ width: "100%" }}
              >
                {mutationUpdate.isPending ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </Form.Item>
          </Form>
        </Loading>
      </DrawerComponent> */}

      {/* Update Request */}
      <DrawerComponent
        title={
          <div style={{ textAlign: "center" }}>
            {t("provideRequest.editTitle")}
          </div>
        }
        isOpen={isDrawerOpen}
        placement="right"
        width={drawerWidth}
        onClose={handleCancelUpdate}
      >
        <Loading isPending={mutationUpdate.isPending}>
          <div className="w-full p-6 bg-white rounded-md shadow">
            <Form
              form={formUpdate}
              name="update-form"
              onFinish={onFinishUpdate}
              layout="vertical"
            >
              {/* Request Name */}
              <div className="mb-4">
                <label className="font-semibold block mb-1">
                  {t("provideRequest.request_name")}
                </label>
                <Input
                  value={formUpdate.getFieldValue("fuel_name")}
                  readOnly
                  className="bg-white text-black cursor-default w-full"
                  style={{ cursor: "default" }}
                />
              </div>

              {/* Quantity (hiển thị nhưng không cho sửa) */}
              <div className="mb-4">
                <label className="font-semibold block mb-1">
                  {t("provideRequest.enter_quantity")}
                </label>
                <Input
                  value={formUpdate.getFieldValue("quantity")}
                  readOnly
                  className="bg-white text-black cursor-default w-full"
                  style={{ cursor: "default" }}
                />
              </div>

              {/* Quantity remain (nếu cần)
              {quantityRemain !== null && (
                <div
                  style={{
                    fontSize: "14px",
                    color: "gray",
                    marginBottom: "12px",
                  }}
                >
                  <strong>
                    {t("provideRequest.quantityRemain")} {quantityRemain} KG
                  </strong>
                </div>
              )} */}

              {/* Unit Price */}
              <div className="mb-4">
                <label className="font-semibold block mb-1">
                  {t("provideRequest.unit_price")}
                </label>
                <Input
                  value={formUpdate.getFieldValue("price")}
                  readOnly
                  className="bg-white text-black cursor-default w-full"
                  style={{ cursor: "default" }}
                />
              </div>

              {/* Total Price */}
              <div className="mb-4">
                <label className="font-semibold block mb-1">
                  {t("provideRequest.total_price")}
                </label>
                <Input
                  readOnly
                  value={
                    formUpdate.getFieldValue("quantity") &&
                      formUpdate.getFieldValue("price")
                      ? (
                        Number(formUpdate.getFieldValue("quantity")) *
                        Number(formUpdate.getFieldValue("price"))
                      ).toLocaleString("vi-VN") + " VNĐ"
                      : "Chưa tính"
                  }
                />
              </div>

              {/* Updated At */}
              <div className="mb-4">
                <label className="font-semibold block mb-1">
                  {t("provideRequest.updated_at")}
                </label>
                <Input
                  readOnly
                  value={converDateString(selectedRequest?.updatedAt)}
                />
              </div>

              {/* Note */}
              <Form.Item label={t("provideRequest.note")} name="note">
                <Input.TextArea
                  rows={3}
                  placeholder={t("provideRequest.note")}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Form.Item>

              {/* Status */}
              <div className="flex items-center gap-2 mb-4">
                <label className="font-semibold block">
                  {t("provideRequest.status")}:
                </label>
                {(() => {
                  const { color, label } = statusMap[
                    selectedRequest?.status
                  ] || {
                    color: "default",
                    label: selectedRequest?.status,
                  };
                  return <Tag color={color}>{label}</Tag>;
                })()}
              </div>

              {/* Submit Button */}
              <div className="flex flex-col md:flex-row justify-end gap-4 mt-4">
                <div className="w-full md:w-auto">
                  <ButtonComponent
                    type="update"
                    htmlType="submit"
                    loading={mutationUpdate.isPending}
                  />
                </div>

                <div className="w-full md:w-auto">
                  <ButtonComponent
                    type="cancel"
                    onClick={handleCancelUpdate}
                    htmlType="button"
                  />
                </div>
              </div>

            </Form>
          </div>
        </Loading>
      </DrawerComponent>

      {/* Modal Confirm Delete */}
      <Modal
        title={t("provideRequest.confirmDelete")}
        open={isOpenDelete}
        onCancel={() => setIsOpenDelete(false)}
        onOk={handleConfirmDelete}
        confirmLoading={mutationDelete.isPending}
        okButtonProps={{ danger: true }}
        okText={t("harvestRequest.confirm")}
        cancelText={t("harvestRequest.close")}
      >
        <p>{t("provideRequest.deleteConfirmMessage")}</p>
      </Modal>

      {/* Request Detail */}
      <DrawerComponent
        title={
          <div style={{ textAlign: "center" }}>
            {t("provideRequest.detail_title")}
          </div>
        }
        isOpen={isDetailDrawerOpen}
        placement="right"
        width={drawerWidth} // Điều chỉnh chiều rộng Drawer nếu cần
        onClose={() => setIsDetailDrawerOpen(false)}
      >
        {detailData ? (
          <div className="w-full p-6 bg-white rounded-md shadow">
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block mb-1 font-semibold">
                  {t("provideRequest.request_name")}
                </label>
                <input
                  type="text"
                  value={detailData.fuel_name}
                  readOnly
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">
                  {t("provideRequest.unit_price")}
                </label>
                <input
                  type="text"
                  value={detailData.price.toLocaleString("vi-VN")}
                  readOnly
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">
                  {t("provideRequest.quantity_kg")}
                </label>
                <input
                  type="text"
                  value={detailData.quantity}
                  readOnly
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">
                  {t("provideRequest.total_price")}
                </label>
                <input
                  type="text"
                  value={detailData.total_price.toLocaleString("vi-VN")}
                  readOnly
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">
                  {t("provideRequest.updated_at")}
                </label>
                <input
                  type="text"
                  value={converDateString(detailData.updatedAt)}
                  readOnly
                  className="border p-2 rounded w-full"
                />
              </div>

              <div className="">
                <label className="block mb-1 font-semibold">
                  {t("provideRequest.note")}
                </label>
                <textarea
                  value={detailData.note}
                  readOnly
                  className="w-full h-auto border p-2 rounded"
                />
              </div>

              {/* Trạng thái */}
              <div className="flex items-center gap-2">
                <label className="block font-semibold">
                  {t("provideRequest.status")}{" "}
                </label>
                {(() => {
                  const { color, label } = statusMap[detailData.status] || {
                    color: "default",
                    label: detailData.status,
                  };
                  return <Tag color={color}>{label}</Tag>;
                })()}
              </div>
            </div>

            {/* Nút đóng */}
            <div className="flex justify-end">
              <ButtonComponent
                type="close"
                onClick={() => setIsDetailDrawerOpen(false)}
                htmlType="button"
              />
            </div>
          </div>
        ) : (
          <p>{t("no_data")}</p>
        )}
      </DrawerComponent>
    </div>
  );
};

export default ProvideRequestManagement;
