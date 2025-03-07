import React, { useEffect, useState, useRef } from "react";
import { Table, Button, message, Space, Input, Modal, Descriptions, Tag } from "antd";
import axios from "axios";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { Excel } from "antd-table-saveas-excel";
import "./FuelOrderStatus.scss";
import { converDateString } from "../../../../ultils";
import { useSelector } from "react-redux";
import { AiOutlineEdit } from "react-icons/ai";

const FuelOrderStatus = () => {
  const [orders, setOrders] = useState([]); // Danh sách đơn hàng
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterType, setFilterType] = useState("all"); 
  const userRedux = useSelector((state) => state.user);
  // 🟢 Gọi API dựa trên bộ lọc
  const fetchOrders = async () => {
    setLoading(true);
    try {
        let url = "http://localhost:3001/api/orders/fuel-request/GetALLstatusSuccess";

        if (filterType === "fuelRequests") {
            url = "http://localhost:3001/api/orders/approved-fuel-requests";
        } else if (filterType === "fuelSupplyOrders") {
            url = "http://localhost:3001/api/orders/approved-fuel-supply-orders";
        }

        const response = await axios.get(url);
        if (response.data.success) {
            let sortedOrders = response.data.data;

            sortedOrders = sortedOrders
                .map(order => ({
                    ...order,
                    createdAt: new Date(order.createdAt)
                }))
                .sort((a, b) => b.createdAt - a.createdAt);

            setOrders(sortedOrders);
        } else {
            message.error("Lỗi khi lấy danh sách đơn hàng!");
        }
    } catch (error) {
        message.error("Không thể kết nối đến server!");
    }
    setLoading(false);
};

// const fetchOrders = async () => {
//   setLoading(true);
//   try {
//       const response = await axios.get("http://localhost:3001/api/orders/fuel-request/GetALLstatusSuccess");

//       if (response.data.success) {
//           let sortedOrders = response.data.data;

//           sortedOrders = sortedOrders
//               .map(order => ({
//                   ...order,
//                   createdAt: new Date(order.createdAt)
//               }))
//               .sort((a, b) => b.createdAt - a.createdAt);

//           setOrders(sortedOrders);
//       } else {
//           message.error("Lỗi khi lấy danh sách đơn hàng!");
//       }
//   } catch (error) {
//       message.error("Không thể kết nối đến server!");
//   }
//   setLoading(false);
// };

  
const confirmCreateFuelStorageReceipt = (order) => {
  Modal.confirm({
      title: "Xác nhận tạo đơn nhập kho",
      content: `Bạn có chắc chắn muốn tạo đơn nhập kho cho đơn hàng này không?`,
      cancelText: "Hủy",
      okText: "Xác nhận",
      
      onOk: () => createFuelStorageReceipt(order), // ✅ Nếu nhấn OK, gọi hàm tạo đơn
  });
};  

//   const createFuelStorageReceipt = async (order) => {
//     try {
//         const token = localStorage.getItem("access_token");
//         if (!token) {
//             message.error("Bạn chưa đăng nhập!");
//             return;
//         }

//         if (!order || !order._id) {
//             message.error("Lỗi: Không tìm thấy thông tin đơn hàng.");
//             return;
//         }

//         if (!order.receipt_type) {
//             message.error("Lỗi: Không xác định được loại đơn hàng!");
//             return;
//         }

//         const payload = order.receipt_type === "supply"
//             ? { receipt_supply_id: order._id }
//             : { receipt_request_id: order._id };

//         console.log("📌 Dữ liệu gửi đi:", payload);

//         // 🟢 Gửi yêu cầu tạo đơn nhập kho
//         const response = await axios.post(
//             "http://localhost:3001/api/fuel-storage/create",
//             payload,
//             {
//                 headers: { Authorization: `Bearer ${userRedux.access_token}`, "Content-Type": "application/json" },
//             }
//         );
//         console.log("📌 Phản hồi API:", response.data);

//         if (response.data.success) {
//             message.success("Tạo đơn nhập kho thành công!");

//             // ✅ Gọi API cập nhật trạng thái đơn hàng thành "Đang xử lý"
//             await updateOrderStatus(order._id, "Đang xử lý");

//             // ✅ Cập nhật danh sách hiển thị ngay lập tức để UI thay đổi mà không cần reload
//             setOrders(prevOrders =>
//                 prevOrders.map(o => o._id === order._id ? { ...o, status: "Đang xử lý" } : o)
//             );
//         } else {
//             message.error(`Tạo đơn nhập kho thất bại: ${response.data.message}`);
//         }
//     } catch (error) {
//         console.error("📌 Lỗi chi tiết:", error.response?.data || error.message);
//         message.error("Lỗi khi tạo đơn nhập kho!");
//     }
// };

const createFuelStorageReceipt = async (order) => {
  try {
      const token = localStorage.getItem("access_token");
      if (!token) {
          message.error("Bạn chưa đăng nhập!");
          return;
      }

      if (!order || !order._id) {
          message.error("Lỗi: Không tìm thấy thông tin đơn hàng.");
          return;
      }

      if (!order.receipt_type) {
          message.error("Lỗi: Không xác định được loại đơn hàng!");
          return;
      }

      const payload = order.receipt_type === "supply"
          ? { receipt_supply_id: order._id }
          : { receipt_request_id: order._id };

      const response = await axios.post(
          "http://localhost:3001/api/fuel-storage/create",
          payload,
          { headers: { Authorization: `Bearer ${userRedux.access_token}`, "Content-Type": "application/json" } }
      );

      if (response.data.success) {
          message.success("Tạo đơn nhập kho thành công!");

          // ✅ Gọi lại API để cập nhật danh sách
          fetchOrders();
      } else {
          message.error(`Tạo đơn nhập kho thất bại: ${response.data.message}`);
      }
  } catch (error) {
      message.error("Lỗi khi tạo đơn nhập kho!");
  }
};



// 🟢 Hàm cập nhật trạng thái đơn hàng
const updateOrderStatus = async (orderId, newStatus) => {
    try {
        const response = await axios.put(
            `http://localhost:3001/api/orders/${orderId}/update-status`,
            { status: newStatus },
            {
                headers: { Authorization: `Bearer ${userRedux.access_token}`, "Content-Type": "application/json" },
            }
        );

        if (response.data.success) {
            console.log(`✅ Cập nhật trạng thái đơn hàng ${orderId} thành công: ${newStatus}`);
        } else {
            console.error(`❌ Lỗi cập nhật trạng thái: ${response.data.message}`);
        }
    } catch (error) {
        console.error("📌 Lỗi khi cập nhật trạng thái:", error.response?.data || error.message);
    }
};


  
  

  // 🟢 Gọi API khi component render hoặc filterType thay đổi
  useEffect(() => {
    fetchOrders();
  }, [filterType]);


  // 🟢 Chuyển đổi bộ lọc
  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  // 🟢 Xuất file Excel
  const handleExportFileExcel = () => {
    const excel = new Excel();
    excel
      .addSheet("Danh sách đơn hàng chờ nhập kho")
      .addColumns(columns.filter((col) => col.dataIndex !== "action")) // Bỏ cột "Hành động"
      .addDataSource(tableData, {
        str2Percent: true,
      })
      .saveAs("DanhSachDonChoNhapkho.xlsx");
  };

  // 🟢 Hiển thị chi tiết đơn hàng
  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // 🟢 Chuẩn bị dữ liệu bảng
  const tableData = orders?.map((order) => ({
    ...order,
    key: order._id,
    customerName: order?.supplier_id?.full_name,
  }));

  // 🟢 Cấu hình bảng hiển thị đơn hàng
  const columns = [
    {
      title: "Khách Hàng",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Loại Nhiên Liệu",
      dataIndex: "fuel_name",
      key: "fuel_name",
    },
    {
      title: "Giá Tiền",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Số Lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Tổng Giá",
      dataIndex: "total_price",
      key: "total_price",
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "Chờ Nhập Kho") color = "gold";
        else if (status === "Đang xử lý") color = "blue";
        else if (status === "Nhập kho thành công") color = "green";
        else if (status === "Nhập kho thất bại") color = "red";
    
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Loại Đơn Hàng",
      dataIndex: "receipt_type",
      key: "receipt_type",
      render: (text) => <Tag color={text === "supply" ? "blue" : "green"}>{text === "supply" ? "Cung cấp" : "Thu hàng"}</Tag>,
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      render: (_, record) => (
        <Space>
          {/* <Button type="default" icon={<EyeOutlined />} onClick={() => showOrderDetails(record)}> */}
          <AiOutlineEdit className="text-xl" style={{ color: "blueviolet", borderRadius: 18, border: 1 }} onClick={() => showOrderDetails(record)} />
          {/* </Button> */}
          <span className="border-b-2 border-transparent hover:border-black transition-all duration-200" onClick={() => showOrderDetails(record)}>
          Chi tiết
        </span>
          <Button type="default" onClick={() => confirmCreateFuelStorageReceipt(record)}> 
            Tạo Đơn Nhập Kho
          </Button>
        </Space>
      ),
    },
    
    

  ];

  return (
    <div className="fuel-order-status">
      <h2>Danh sách đơn hàng chờ nhập kho</h2>

      {/* 🟢 Nút chọn danh sách */}
      <Space style={{ marginBottom: 16 }}>
        <Button  type={filterType === "all" ? "primary" : "default"} onClick={() => handleFilterChange("all")}>
          Đơn chờ Nhập kho
        </Button>
        <Button type={filterType === "fuelRequests" ? "primary" : "default"} onClick={() => handleFilterChange("fuelRequests")}>
          Đơn yêu cầu thu hàng
        </Button>
        <Button type={filterType === "fuelSupplyOrders" ? "primary" : "default"} onClick={() => handleFilterChange("fuelSupplyOrders")}>
          Đơn cung cấp nhiên liệu
        </Button>
        <Button type="primary" onClick={handleExportFileExcel} style={{ backgroundColor: "black", borderColor: "black" }}>
        Xuất File
      </Button>
      </Space>

    

      <Table columns={columns} dataSource={tableData} loading={loading} rowKey="_id" pagination={{ pageSize: 8 }} />

      {/* 🟢 Modal hiển thị chi tiết đơn hàng */}
      <Modal title="Chi tiết đơn hàng" open={isModalOpen} onCancel={handleCancel} footer={null}>
        {selectedOrder && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Khách Hàng">{selectedOrder.supplier_id.full_name}</Descriptions.Item>
            <Descriptions.Item label="Loại Nhiên Liệu">{selectedOrder.fuel_name}</Descriptions.Item>
            <Descriptions.Item label="Giá Tiền">{selectedOrder.price}</Descriptions.Item>
            <Descriptions.Item label="Số Lượng">{selectedOrder.quantity}</Descriptions.Item>
            <Descriptions.Item label="Tổng Giá">{selectedOrder.total_price}</Descriptions.Item>
            <Descriptions.Item label="Trạng Thái">{selectedOrder.status}</Descriptions.Item>
            <Descriptions.Item label="Ghi Chú">{selectedOrder.note}</Descriptions.Item>
            <Descriptions.Item label="Ngày Tạo">{converDateString(selectedOrder.createdAt)}</Descriptions.Item>
            <Descriptions.Item label="Cập Nhật">{converDateString(selectedOrder.updatedAt)}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default FuelOrderStatus;
