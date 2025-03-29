import React, { useState, useRef, useEffect } from "react";
import { Button, Form, Input, Modal, Table, Tag, Space, message, Select } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as OrderProductionService from "../../../services/OrderProductionService";
import { converDateString } from "../../../ultils";
import Loading from "../../../components/LoadingComponent/Loading";
import DrawerComponent from "../../../components/DrawerComponent/DrawerComponent";
import Highlighter from "react-highlight-words";
import { getUserAddresses } from "../../../services/UserService";
import { Card, List, Col, Row } from "antd";

const OrdersComponent = () => {
  const [rowSelected, setRowSelected] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [formUpdate] = Form.useForm();
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.user);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [userAddresses, setUserAddresses] = useState([]);

  const fetchOrders = async () => {
    const access_token = user?.access_token;
    const user_id = user?.id;
    if (!user_id || !access_token) {
      throw new Error("Không có thông tin user hoặc token!");
    }
    const allOrders = await OrderProductionService.getAllOrders(access_token);
    console.log("All orders from API:", allOrders);
    console.log("First order sample:", allOrders[0]);
    console.log("Current user ID:", user_id);
    console.log("All user IDs in orders:", allOrders.map(order => order.user_id?._id));
    if (!Array.isArray(allOrders)) {
      console.error("API did not return an array:", allOrders);
      return [];
    }
    const filteredOrders = allOrders.filter((order) => order.user_id?._id === user_id);
    console.log("Filtered orders:", filteredOrders);
    return filteredOrders;
  };

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: fetchOrders,
    enabled: !!user?.id && !!user?.access_token,
  });

  const handleEdit = async (record) => {
    setRowSelected(record._id);
    try {
      const res = await OrderProductionService.getAllOrdersDetail(record._id);
      if (res) {
        const orderDetail = res.res;
        let userAddressesList = [];
        let selectedAddress = null;

        if (orderDetail.user_id) {
          const addressRes = await getUserAddresses(orderDetail.user_id);
          userAddressesList = addressRes.addresses;
          selectedAddress = userAddressesList.find((addr) => addr._id === orderDetail.shippingAddressId);
        }

        setUserAddresses(userAddressesList);
        setIsDrawerOpen(true);
        formUpdate.setFieldsValue({
          shippingAddressId: selectedAddress ? selectedAddress._id : null,
          note: orderDetail.note || "",
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    }
  };

  const mutationUpdate = useMutation({
    mutationFn: ({ id, data }) => OrderProductionService.updateOrderAddress(id, data),
    onSuccess: () => {
      message.success("Cập nhật thành công!");
      queryClient.invalidateQueries("orders");
    },
    onError: () => {
      message.error("Cập nhật thất bại!");
    },
  });

  const onFinishUpdate = (values) => {
    mutationUpdate.mutate({ id: rowSelected, data: values });
  };

  const handleCancelUpdate = () => {
    formUpdate.resetFields();
    setIsDrawerOpen(false);
  };

  const handleViewDetail = async (record) => {
    try {
      const res = await OrderProductionService.getAllOrdersDetail(record._id);
      if (res) {
        const orderDetail = {
          ...res.res,
          total_price: res.res.price * res.res.quantity,
        };

        if (orderDetail.shippingAddressId) {
          const addressRes = await getUserAddresses(orderDetail.user_id);
          const selectedAddress = addressRes.addresses.find((addr) => addr._id === orderDetail.shippingAddressId);
          if (selectedAddress) {
            orderDetail.shippingAddress = selectedAddress;
          }
        }

        setDetailData(orderDetail);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    }
  };

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
          <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Đặt lại
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex].some((item) => item.name.toLowerCase().includes(value.toLowerCase())),
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
      title: "Tên Sản Phẩm",
      dataIndex: "items",
      key: "items",
      ...getColumnSearchProps("items"),
      sorter: (a, b) =>
        a.items
          .map((item) => item.name)
          .join(", ")
          .localeCompare(b.items.map((item) => item.name).join(", ")),
      render: (items) => items.map((item) => item.name).join(", "),
    },
    {
      title: "Số Lượng (Kg)",
      dataIndex: "items",
      key: "quantity",
      render: (items) =>
        items.map((item, index) => <div key={index}>{item.quantity}</div>),
    },
    {
      title: "Tổng Tiền (VNĐ)",
      dataIndex: "totalAmount",
      key: "totalAmount",
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (amount) => amount.toLocaleString("vi-VN") + " đ",
    },
    {
      title: "Phương Thức Thanh Toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
    {
      title: "Trạng Thái Thanh Toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status) => {
        let color = status === "Đã thanh toán" ? "green" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Trạng Thái Đơn",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Chờ xác nhận", value: "Chờ xác nhận" },
        { text: "Đang xử lý", value: "Đang xử lý" },
        { text: "Đang vận chuyển", value: "Đang vận chuyển" },
        { text: "Đã giao hàng", value: "Đã giao hàng" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        let color = "orange";
        if (status === "Đang vận chuyển") color = "blue";
        if (status === "Đã giao hàng") color = "green";
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
      title: "Ngày Dự Kiến Giao",
      dataIndex: "expectedDeliveryDate",
      key: "expectedDeliveryDate",
      render: (date) => (date ? converDateString(date) : "Chưa có"),
    },
    {
      title: "Hành Động",
      key: "actions",
      render: (_, record) => {
        const canUpdate = record.status === "Chờ xác nhận";
        return (
          <Space>
            <Button type="default" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} />
            <Button
              type="primary"
              disabled={!canUpdate}
              loading={mutationUpdate.isPending && rowSelected === record._id}
              onClick={() => canUpdate && handleEdit(record)}
              style={{
                backgroundColor: !canUpdate ? "rgba(0, 136, 255, 0.5)" : undefined,
                borderColor: !canUpdate ? "rgba(0, 136, 255, 0.5)" : undefined,
              }}
            >
              {mutationUpdate.isPending && rowSelected === record._id ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="Wrapper-Admin-Orders">
      <div className="Main-Content">
        <h5 className="content-title">Danh sách đơn hàng</h5>
        <Table
          columns={columns}
          dataSource={orders}
          loading={isLoading}
          rowKey={(record) => record._id}
          pagination={{ pageSize: 5 }}
        />
      </div>

      <DrawerComponent title="Cập Nhật Địa Chỉ & Ghi Chú" isOpen={isDrawerOpen} placement="right" width="40%">
        <Loading isPending={mutationUpdate.isPending}>
          <Form name="update-form" form={formUpdate} onFinish={onFinishUpdate} layout="vertical">
            <Form.Item
              label="Địa Chỉ Giao Hàng"
              name="shippingAddressId"
              rules={[{ required: true, message: "Vui lòng chọn địa chỉ!" }]}
            >
              <Select placeholder="Chọn địa chỉ">
                {userAddresses?.map((addr) => (
                  <Select.Option key={addr._id} value={addr._id}>
                    {addr.full_name} - {addr.address} - {addr.phone}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Ghi Chú" name="note">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item>
              <Space style={{ width: "100%", display: "flex", gap: 10 }}>
                <Button onClick={() => setIsDrawerOpen(false)}>Đóng</Button>
                <Button type="primary" htmlType="submit" loading={mutationUpdate.isPending}>
                  {mutationUpdate.isPending ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Loading>
      </DrawerComponent>

      <Modal
        title="Chi Tiết Đơn Hàng"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
      >
        {detailData ? (
          <Card bordered={false} style={{ textAlign: "left" }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <p>
                  <strong>Mã Đơn Hàng:</strong> {detailData.orderCode}
                </p>
              </Col>
              <Col span={24}>
                <strong>Sản Phẩm:</strong>
              </Col>
              <Col span={18}>
                <List
                  dataSource={detailData.items}
                  renderItem={(item) => (
                    <List.Item>
                      <strong>
                        {item.name} - {item.quantity} Kg - {item.price.toLocaleString("vi-VN")} VND/KG
                      </strong>
                    </List.Item>
                  )}
                />
              </Col>
              <Col span={24}>
                <strong>Thông Tin Thanh Toán:</strong>
              </Col>
              <Col span={18}>
                <p>
                  <strong>Tổng Tiền Hàng:</strong> {detailData.totalAmount.toLocaleString("vi-VN")} VND
                </p>
                <p>
                  <strong>Giảm Giá:</strong> {detailData.discount.toLocaleString("vi-VN")} VND
                </p>
                <p>
                  <strong>Phí Vận Chuyển:</strong> {detailData.shippingFee.toLocaleString("vi-VN")} VND
                </p>
                <p>
                  <strong>Thuế VAT:</strong> {detailData.taxAmount.toLocaleString("vi-VN")} VND
                </p>
                <p>
                  <strong>Phương Thức Thanh Toán:</strong> {detailData.paymentMethod}
                </p>
                <p>
                  <strong>Tổng Tiền Thanh Toán:</strong> {detailData.grandTotal.toLocaleString("vi-VN")} VND
                </p>
              </Col>
              <Col span={24}>
                <strong>Thông Tin Vận Chuyển:</strong>
              </Col>
              <Col span={18}>
                <p>
                  <strong>Trạng Thái Đơn Hàng:</strong> {detailData.status}
                </p>
                <p>
                  <strong>Trạng Thái Thanh Toán:</strong> {detailData.paymentStatus}
                </p>
                <p>
                  <strong>Ngày Tạo Đơn:</strong> {converDateString(detailData.createdAt)}
                </p>
                <p>
                  <strong>Ngày Cập Nhật:</strong> {converDateString(detailData.updatedAt)}
                </p>
                <p>
                  <strong>Ngày Dự Kiến Giao:</strong>{" "}
                  {detailData.expectedDeliveryDate ? converDateString(detailData.expectedDeliveryDate) : "Chưa xác định"}
                </p>
                <p>
                  <strong>Ngày Giao Hàng:</strong>{" "}
                  {detailData.deliveryDate ? converDateString(detailData.deliveryDate) : "Chưa giao"}
                </p>
                {detailData.shippingAddress ? (
                  <>
                    <p>
                      <strong>Họ và Tên:</strong> {detailData.shippingAddress.full_name}
                    </p>
                    <p>
                      <strong>Địa Chỉ:</strong> {detailData.shippingAddress.address}
                    </p>
                    <p>
                      <strong>Số Điện Thoại:</strong> {detailData.shippingAddress.phone}
                    </p>
                  </>
                ) : (
                  <p>Không có thông tin địa chỉ</p>
                )}
              </Col>
              <Col span={24}>
                <strong>Ghi Chú:</strong>
              </Col>
              <Col span={18}>
                <p>{detailData.note || "Không có ghi chú"}</p>
              </Col>
            </Row>
          </Card>
        ) : (
          <Loading isPending={true} />
        )}
      </Modal>
    </div>
  );
};

export default OrdersComponent;