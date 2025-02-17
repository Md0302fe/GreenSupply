import React, { useState } from "react";
import { Button, Form, Input, Modal, Table, Tag, Space, message } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as FuelSupplyRequestService from "../../../services/FuelSupplyRequestService";
import * as FuelEntryServices from "../../../services/FuelEntryServices";
import { converDateString } from "../../../ultils";
import Loading from "../../../components/LoadingComponent/Loading";
import DrawerComponent from "../../../components/DrawerComponent/DrawerComponent";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { useRef } from "react";

const FuelSupplyRequestComponent = () => {
  const [rowSelected, setRowSelected] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [quantityRemain, setQuantityRemain] = useState(null);
  const [formUpdate] = Form.useForm();
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.user);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const fetchGetAllRequests = async () => {
    const access_token = user?.access_token;
    const user_id = user?.id;

    return await FuelSupplyRequestService.getAllFuelSupplyRequest(access_token, { user_id });
  };

  const { data: fuelRequests, isLoading } = useQuery({
    queryKey: ["fuelRequests", user?.id],
    queryFn: fetchGetAllRequests,
  });

  const selectedRequest = fuelRequests?.find((request) => request._id === rowSelected) || {
    fuel_name: "",
    quantity: 0,
    note: "",
    status: "",
    supplier_id: "",
    updatedAt: "",
  };

  const mutationUpdate = useMutation({
    mutationFn: ({ id, data }) => FuelSupplyRequestService.updateFuelSupplyRequest(id, data),
    onSuccess: () => {
      message.success("Cập nhật thành công!");
      queryClient.invalidateQueries("fuelRequests");
      handleCancelUpdate();
    },
    onError: () => {
      message.error("Cập nhật thất bại!");
    },
  });

  // Mutation for Deleting Fuel Request
  const mutationDelete = useMutation({
    mutationFn: (id) => FuelSupplyRequestService.deleteFuelRequest(id),
    onSuccess: () => {
      message.success("Yêu cầu đã bị xóa!");
      queryClient.invalidateQueries("fuelRequests");
      setIsOpenDelete(false);
    },
    onError: () => {
      message.error("Xóa thất bại!");
    },
  });

  // Handle Confirm Delete Request
  const handleConfirmDelete = () => {
    mutationDelete.mutate(rowSelected);
  };

  // Handle Update Submission
  const onFinishUpdate = (values) => {
    mutationUpdate.mutate({ id: rowSelected, data: values });
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
      const res = await FuelEntryServices.getFuelEntryDetail(record.request_id);
      if (res) {
        setIsDrawerOpen(true);
        formUpdate.setFieldsValue({
          fuel_name: record.fuel_name,
          quantity: record.quantity,
          note: record.note || "",
        });
        console.log(res)
        // Save `quantity_remain` in state for validation later
        setQuantityRemain(res.res.quantity_remain);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleViewDetail = async (record) => {
    try {
      const res = await FuelEntryServices.getFuelEntryDetail(record.request_id);
      if (res) {
        setDetailData({
          ...res.res,
          total_price: res.res.estimate_price * res.res.quantity, // Calculate total price
        });
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
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
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Tìm kiếm ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
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

  // Table Columns
  const columns = [
    {
      title: "Tên Nhiên Liệu",
      dataIndex: "fuel_name",
      key: "fuel_name",
      ...getColumnSearchProps("fuel_name"), // 🔍 Enable search
      sorter: (a, b) => a.fuel_name.localeCompare(b.fuel_name),
    },
    {
      title: "Số Lượng",
      dataIndex: "quantity",
      key: "quantity",
      sorter: (a, b) => a.quantity - b.quantity, // 🔽 Sorting
    },
    {
      title: "Tổng Giá (VNĐ)",
      dataIndex: "total_price",
      key: "total_price",
      sorter: (a, b) => a.total_price - b.total_price, // Enable sorting
      render: (_, record) => record.total_price, // Calculate dynamically
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Đã duyệt", value: "Đã duyệt" },
        { text: "Chờ duyệt", value: "Chờ duyệt" },
        { text: "Đã hủy", value: "Đã hủy" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        let color = "orange"; // Default for "Chờ duyệt"
        if (status === "Đã duyệt") color = "green";
        if (status === "Đã hủy") color = "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Ghi Chú",
      dataIndex: "note",
      key: "note",
      render: (note) => note || "Không có ghi chú",
    },
    {
      title: "Cập Nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt), // 🔽 Sorting by date
      render: (updatedAt) => converDateString(updatedAt),
    },
    {
      title: "Hành Động",
      key: "actions",
      render: (_, record) => {
        const isPending = record.status === "Chờ duyệt";
        return (
          <Space>
            <Button
              type="default"
              onClick={() => handleViewDetail(record)} // Gọi hàm xem chi tiết
            >
              Xem Chi Tiết
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={!isPending || mutationUpdate.isPending}
            >
              {mutationUpdate.isPending && rowSelected === record._id ? "Đang cập nhật..." : "Sửa"}
            </Button>
            <Button
              type="danger"
              icon={<DeleteOutlined />}
              onClick={() => { setRowSelected(record._id); setIsOpenDelete(true); }}
              disabled={!isPending || mutationDelete.isPending}
            >
              {mutationDelete.isPending && rowSelected === record._id ? "Đang xóa..." : "Xóa"}
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="Wrapper-Admin-FuelRequest">
      <div className="Main-Content">
        <h5 className="content-title">Quản lý Yêu Cầu Cung Cấp Nhiên Liệu</h5>
        <Table columns={columns} dataSource={fuelRequests} loading={isLoading} rowKey={(record) => record._id} pagination={{ pageSize: 5 }} />
      </div>

      {/* Drawer for Editing */}
      <DrawerComponent title="Chi Tiết Yêu Cầu" isOpen={isDrawerOpen} onClose={handleCancelUpdate} placement="right" width="40%">
        <Loading isPending={mutationUpdate.isPending}>
          <Form
            name="update-form"
            form={formUpdate}
            onFinish={onFinishUpdate}
            layout="vertical"  // 🔹 Ensures proper alignment
          >
            <Form.Item label="Tên Nhiên Liệu" name="fuel_name">
              <Input value={selectedRequest.fuel_name} disabled />
            </Form.Item>

            <Form.Item label="Số Lượng">
              {quantityRemain !== null && (
                <div style={{ marginBottom: 5, fontSize: "14px", color: "gray" }}>
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
                        return Promise.reject(new Error(`Số lượng không được vượt quá ${quantityRemain}!`));
                      }
                      if (value % 10 !== 0) {
                        return Promise.reject(new Error("Số lượng phải chia hết cho 10!"));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input type="number" />
              </Form.Item>
            </Form.Item>
            <Form.Item label="Ghi Chú" name="note">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={mutationUpdate.isPending} style={{ width: "100%" }}>
                {mutationUpdate.isPending ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </Form.Item>
          </Form>
        </Loading>
      </DrawerComponent>


      {/* Modal Confirm Delete */}
      <Modal title="Xóa Yêu Cầu" open={isOpenDelete} onCancel={() => setIsOpenDelete(false)} onOk={handleConfirmDelete} confirmLoading={mutationDelete.isPending}>
        <p>Bạn có chắc muốn xóa yêu cầu này?</p>
      </Modal>

      {/* Modal chi tiết */}
      <Modal
        title="Chi Tiết Đơn Cung Cấp"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
      >
        {detailData ? (
          <div>
            <p><strong>Tên Nhiên Liệu:</strong> {detailData.request_name}</p>
            <p><strong>Ghi Chú:</strong> {detailData.note || "Không có ghi chú"}</p>
            <p><strong>Trạng Thái:</strong> {detailData.status}</p>
            <p><strong>Giá Mỗi KG:</strong> {detailData.estimate_price} VND</p>
            <p><strong>Số Lượng:</strong> {detailData.quantity} KG</p>
            <p><strong>Tổng Giá:</strong> {detailData.total_price} VND</p>
            <p><strong>Ngày Cập Nhật:</strong> {converDateString(detailData.updatedAt)}</p>
          </div>
        ) : (
          <Loading isPending={true} />
        )}
      </Modal>

    </div>
  );
};

export default FuelSupplyRequestComponent;
