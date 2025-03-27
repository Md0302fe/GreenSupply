import React, { useState } from "react";
import { Button, Form, Input, Modal, Table, Tag, Space, message, Select } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ProductOrderAdminServices from "../../../../services/ProductOrderAdminServices";
import axios from "axios";
import { converDateString } from "../../../../ultils";
import Loading from "../../../../components/LoadingComponent/Loading";
import DrawerComponent from "../../../../components/DrawerComponent/DrawerComponent";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { useRef } from "react";
import { EyeOutlined } from "@ant-design/icons";
import { Card, List, Divider, Col, Row, Dropdown, Menu } from "antd";
import { getUserAddresses } from "../../../../services/UserService"; 
import { updateOrderProcessing, updateOrderShipping, updateOrderDelivered } from "../../../../services/ProductOrderAdminServices";

const OrdersComponent = () => {
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
  const [addresses, setAddresses] = useState([]); // Danh sách địa chỉ
  const userRedux = useSelector((state) => state.user);
  const [userAddresses, setUserAddresses] = useState([]);
  const [setOrders] = useState([]); // Quản lý danh sách đơn hàng
  const [orderStatus, setOrderStatus] = useState(""); // Khởi tạo trạng thái đơn hàng


  const fetchOrders = async () => {
    const access_token = user?.access_token;
    const user_id = user?.id;
    return await ProductOrderAdminServices.getAllOrders(access_token, { user_id });
  };

  const queryOrders = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: fetchOrders,
  });
  
  const { isLoading, data: orders } = queryOrders;
  


  const handleEdit = async (record) => {
    setRowSelected(record._id);
    try {
      const res = await ProductOrderAdminServices.getAllOrdersDetail(record._id);
      console.log("Order details response:", res);

      if (res) {
        const orderDetail = res.res;
        console.log("Order Detail:", orderDetail);

        // Gọi API lấy danh sách địa chỉ
        let userAddressesList = [];
        let selectedAddress = null;

        if (orderDetail.user_id) {
          const addressRes = await getUserAddresses(orderDetail.user_id);
          console.log("User addresses:", addressRes);

          userAddressesList = addressRes.addresses;
          selectedAddress = userAddressesList.find(addr => addr._id === orderDetail.shippingAddressId);
        }

        console.log("Selected Address:", selectedAddress);

        // Cập nhật danh sách địa chỉ vào state
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

  const handleUpdateProcessing = async () => {
    try {
      const response = await ProductOrderAdminServices.updateOrderProcessing(detailData._id);
      if (response) {
        setOrderStatus('Đang xử lý');
        message.success("Cập nhật trạng thái thành 'Đang xử lý' thành công!");
        queryOrders.refetch();
      } else {
        message.error("Cập nhật trạng thái thất bại!");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật trạng thái!");
    }
  };
  
  const handleUpdateShipping = async () => {
    try {
      const response = await ProductOrderAdminServices.updateOrderShipping(detailData._id);
      if (response) {
        setOrderStatus('Đang vận chuyển');
        message.success("Cập nhật trạng thái thành 'Đang vận chuyển' thành công!");
        queryOrders.refetch();
      } else {
        message.error("Cập nhật trạng thái thất bại!");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật trạng thái!");
    }
  };
  
  const handleUpdateDelivered = async () => {
    try {
      const response = await ProductOrderAdminServices.updateOrderDelivered(detailData._id);
      if (response) {
        setOrderStatus('Đã giao hàng');
        message.success("Cập nhật trạng thái thành 'Đã giao hàng' thành công!");
        queryOrders.refetch();
      } else {
        message.error("Cập nhật trạng thái thất bại!");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật trạng thái!");
    }
  };
  







  // Handle Confirm Delete Request
  //   const handleConfirmDelete = () => {
  //     mutationDelete.mutate(rowSelected);
  //   };



  const handleViewDetail = async (record) => {
    try {
      const res = await ProductOrderAdminServices.getAllOrdersDetail(record._id);
      if (res) {
        const orderDetail = {
          ...res.res,
          total_price: res.res.price * res.res.quantity, // Tính tổng tiền
        };

        // Gọi API lấy thông tin địa chỉ
        if (orderDetail.shippingAddressId) {
          const addressRes = await getUserAddresses(orderDetail.user_id);
          const selectedAddress = addressRes.addresses.find(addr => addr._id === orderDetail.shippingAddressId);

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
        <Highlighter highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }} searchWords={[searchText]} autoEscape textToHighlight={text ? text.toString() : ""} />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: "Tên Sản Phẩm",
      dataIndex: "items",
      key: "items",
      ...getColumnSearchProps("items"), // 🔍 Thêm tìm kiếm
      sorter: (a, b) => {
        const nameA = a.items.map((item) => item.name).join(", ").toLowerCase();
        const nameB = b.items.map((item) => item.name).join(", ").toLowerCase();
        return nameA.localeCompare(nameB);
      },
      render: (items) => items.map((item) => item.name).join(", "),
    },


    {
      title: "Số Lượng (Kg)",
      dataIndex: "items",
      key: "quantity",
      render: (items) => (
        <div>
          {items.map((item, index) => (
            <div key={index}>{item.quantity}</div>
          ))}
        </div>
      ),
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
        const isPending = record.status === "Chờ duyệt";
        return (
          <Space>
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />


          </Space>
        );
      },
    },
  ];

  return (
    <div className="Wrapper-Admin-Orders">
      <div className="Main-Content">
        <h5 className="content-title">Danh sách đơn hàng</h5>
        <Table columns={columns} dataSource={orders} loading={isLoading} rowKey={(record) => record._id} pagination={{ pageSize: 5 }} />
      </div>



      {/* Modal chi tiết */}
      <Modal
        title=" Chi Tiết Đơn Hàng"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={
          detailData
            ? [
                detailData.status !== "Đang xử lý" && (
                  <Button
                    key="processing"
                    type="primary"
                    style={{ backgroundColor: "#fa8c16", borderColor: "#fa8c16", marginRight: 8 }}
                    onClick={() => handleUpdateProcessing("Đang xử lý")}
                  >
                    Đang xử lý
                  </Button>
                ),
                detailData.status !== "Đang vận chuyển" && (
                  <Button
                    key="shipping"
                    type="primary"
                    style={{ backgroundColor: "#1890ff", borderColor: "#1890ff", marginRight: 8 }}
                    onClick={() => handleUpdateShipping("Đang vận chuyển")}
                  >
                    Đang vận chuyển
                  </Button>
                ),
                detailData.status !== "Đã giao hàng" && (
                  <Button
                    key="delivered"
                    type="primary"
                    style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                    onClick={() => handleUpdateDelivered("Đã giao hàng")}
                  >
                    Đã giao hàng
                  </Button>
                ),
              ].filter(Boolean)
            : null
        }
      >
        {detailData ? (
          <Card bordered={false} style={{ textAlign: "left" }}>
            <Row gutter={[16, 16]}>
              {/* Mã đơn hàng */}
              <Col span={24}>
                <p><strong>Mã Đơn Hàng:</strong> {detailData.orderCode}</p>
              </Col>

              {/* Sản Phẩm */}
              <Col span={24}>
                <strong>Sản Phẩm:</strong>
              </Col>
              <Col span={18}>
                <List
                  dataSource={detailData.items}
                  renderItem={(item) => (
                    <List.Item>
                      <strong>{item.name} - {item.quantity} Kg - {item.price.toLocaleString("vi-VN")} VND/KG</strong>
                    </List.Item>
                  )}
                />
              </Col>


              {/* Thông Tin Thanh Toán */}
              <Col span={24}>
                <strong>Thông Tin Thanh Toán:</strong>
              </Col>
              <Col span={18}>
                <p><strong> Tổng Tiền Hàng:</strong> {detailData.totalAmount.toLocaleString("vi-VN")} VND</p>
                <p><strong> Giảm Giá:</strong> {detailData.discount.toLocaleString("vi-VN")} VND</p>
                <p><strong> Phí Vận Chuyển:</strong> {detailData.shippingFee.toLocaleString("vi-VN")} VND</p>
                <p><strong> Thuế VAT:</strong> {detailData.taxAmount.toLocaleString("vi-VN")} VND</p>
                <p><strong> Phương Thức Thanh Toán:</strong> {detailData.paymentMethod}</p>
                <p><strong> Tổng Tiền Thanh Toán:</strong> {detailData.grandTotal.toLocaleString("vi-VN")} VND</p>
              </Col>

              {/* Thông Tin Vận Chuyển */}
              <Col span={24}>
                <strong>Thông Tin Vận Chuyển:</strong>
              </Col>
              <Col span={18}>
                <p><strong> Trạng Thái Đơn Hàng:</strong> {detailData.status}</p>
                <p><strong> Trạng Thái Thanh Toán:</strong> {detailData.paymentStatus}</p>
                <p><strong> Ngày Tạo Đơn:</strong> {converDateString(detailData.createdAt)}</p>
                <p><strong> Ngày Cập Nhật:</strong> {converDateString(detailData.updatedAt)}</p>
                <p><strong> Ngày Dự Kiến Giao:</strong> {detailData.expectedDeliveryDate ? converDateString(detailData.expectedDeliveryDate) : "Chưa xác định"}</p>
                <p><strong> Ngày Giao Hàng:</strong> {detailData.deliveryDate ? converDateString(detailData.deliveryDate) : "Chưa giao"}</p>
                {detailData.shippingAddress ? (
                  <>
                    <p><strong>Họ và Tên:</strong> {detailData.shippingAddress.full_name}</p>
                    <p><strong>Địa Chỉ:</strong> {detailData.shippingAddress.address}</p>
                    <p><strong>Số Điện Thoại:</strong> {detailData.shippingAddress.phone}</p>
                  </>
                ) : (
                  <p>Không có thông tin địa chỉ</p>
                )}

              </Col>

              {/* Ghi Chú */}
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
