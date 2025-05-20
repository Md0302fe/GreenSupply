import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getAllFuelEntry,
  getFuelEntryDetail,
} from "../../../services/FuelEntryServices";
import { createFuelSupplyRequest } from "../../../services/FuelSupplyRequestService";
import { useSelector } from "react-redux";
import { message } from "antd";
import { useSearchParams } from "react-router-dom";
const SupplyRequestPage = () => {
  const { id } = useParams();
  const userRedux = useSelector((state) => state.user);
  const [adminOrders, setAdminOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    quantity: "",
    quality: "",
    note: "",
  });
  const [error, setError] = useState(""); // Lưu lỗi nhập liệu
  const [noteError, setNoteError] = useState(""); // Lưu lỗi ghi chú
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const fetchOrders = async (page = 1) => {
    try {
      const response = await getAllFuelEntry({ page, limit: 6 });
      const filteredOrders = response.data.filter(
        (order) => order.status === "Đang xử lý" && !order.is_deleted
      );

      setAdminOrders(filteredOrders);
      setTotalPages(response.pagination?.totalPages || 1);
      setCurrentPage(page);

      if (id) {
        const foundOrder = response.data.find((order) => order._id === id);
        if (foundOrder) {
          setSelectedOrder(foundOrder);
          if (foundOrder.quantity_remain <= 50) {
            setFormData({ ...formData, quantity: foundOrder.quantity_remain });
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    }
  };
  const fetchOrderById = async (id) => {
    try {
      const response = await getFuelEntryDetail(id);
      if (response.res) {
        setSelectedOrder(response.res);
        setFormData((prev) => ({
          ...prev,
          quantity:
            response.res.quantity_remain <= 50
              ? response.res.quantity_remain
              : "",
        }));
      }
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng theo id:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderById(id);
    }
    fetchOrders(currentPage);
  }, [currentPage]);

  const handleSelectOrder = (orderId) => {
    if (!orderId) {
      // Nếu chọn "Chọn đơn hàng", đặt selectedOrder thành null
      setSelectedOrder(null);
      setFormData({ quantity: "", quality: "", note: "" });
      setError("");
      return;
    }

    const foundOrder = adminOrders.find((order) => order._id === orderId);
    setSelectedOrder(foundOrder);
    setError("");

    // Nếu đơn còn dưới 50kg, đặt giá trị cố định
    if (foundOrder.quantity_remain <= 50) {
      setFormData({
        quantity: foundOrder.quantity_remain,
        quality: "",
        note: "",
      });
    } else {
      setFormData({ quantity: "", quality: "", note: "" });
    }
  };

  const totalPrice = () => {
    return (Number(formData.quantity) || 0) * (selectedOrder?.price || 0);
  };

  // Xử lý khi người dùng nhập số lượng
  const handleQuantityChange = (e) => {
    setError(""); // Xóa lỗi khi người dùng nhập
    setFormData({ ...formData, quantity: e.target.value });
  };

  const handleNoteChange = (e) => {
    if (e.target.value.length > 2000) {
      setNoteError("Số lượng không được vượt quá 2000 ký tự!");
    } else {
      setFormData({ ...formData, note: e.target.value });
    }
  };

  // Validate khi người dùng rời khỏi ô input hoặc nhấn gửi
  const validateQuantity = () => {
    if (!selectedOrder) return;
    const quantity = Number(formData.quantity);

    if (isNaN(quantity) || quantity <= 0) {
      setError("Số lượng không hợp lệ.");
      return false;
    }

    if (
      selectedOrder.quantity <= 50 &&
      quantity !== selectedOrder.quantity_remain
    ) {
      setError(`Bạn phải nhập đúng ${selectedOrder.quantity_remain} kg.`);
      return false;
    }

    if (quantity > selectedOrder.quantity_remain) {
      setError(
        `Số lượng không được vượt quá ${selectedOrder.quantity_remain} kg.`
      );
      return false;
    }

    if (quantity % 10 !== 0) {
      setError("Số lượng phải chia hết cho 10.");
      return false;
    }

    setError(""); // Xóa lỗi nếu hợp lệ
    return true;
  };

  const handleSubmit = async () => {
    if (!selectedOrder) {
      message.error("Vui lòng chọn đơn hàng!");
      return;
    }
    if (!formData.quantity) {
      message.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (!validateQuantity()) {
      message.error("Vui lòng kiểm tra lại số lượng!");
      return;
    }

    const quantity = Number(formData.quantity);

    const supplyOrder = {
      supplier_id: userRedux.id,
      request_id: selectedOrder._id,
      fuel_name: selectedOrder.request_name,
      quantity: quantity,
      quality: "Tốt",
      price: selectedOrder.price,
      start_received: "",
      end_received: "",
      total_price: totalPrice(),
      note: formData.note,
    };

    try {
      await createFuelSupplyRequest(supplyOrder);
      message.success("Tạo đơn cung cấp thành công!");
      setSelectedOrder(null);
      fetchOrders();
      setFormData({ quantity: "", quality: "", note: "" });
    } catch (error) {
      console.error("Lỗi khi tạo đơn cung cấp:", error);
      message.error("Tạo đơn thất bại!");
    }
  };

  return (
    <div>
      <div className="p-6 bg-white shadow-md rounded">
        <h2 className="text-xl font-bold mb-4">Tạo Đơn Cung Cấp Hàng</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {adminOrders.map((order) => (
            <div
              key={order._id}
              onClick={() => handleSelectOrder(order._id)}
              className={`flex justify-between items-center border rounded p-4 cursor-pointer transition-all duration-300 ${
                selectedOrder?._id === order._id
                  ? "border-green-600 bg-green-50 shadow-lg scale-[1.01]"
                  : "border-gray-300 bg-white shadow"
              }`}
            >
              {/* Nội dung bên trái */}
              <div className="flex-1 pr-4">
                <h3 className="font-bold text-lg line-clamp-1">
                  {order.request_name}
                </h3>
                <p className="text-sm text-gray-600">
                  Số lượng còn:{" "}
                  <span className="font-semibold">
                    {order.quantity_remain} kg
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Đơn giá:{" "}
                  <span className="font-semibold">
                    {order.price.toLocaleString("vi-VN")} VNĐ
                  </span>
                </p>
                <button
                  onClick={() => handleSelectOrder(order._id)}
                  className="mt-3 bg-[#006838] text-white px-4 py-2 rounded hover:bg-[#008c4a] hover:scale-105 transition-transform"
                >
                  Tạo đơn
                </button>
              </div>

              {/* Ảnh bên phải */}
              <div className="w-24 h-24 flex-shrink-0">
                <img
                  src={order.fuel_image || "/default-image.jpg"}
                  alt={order.request_name}
                  className="w-full h-full object-cover rounded"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Trang trước
          </button>
          <span className="font-semibold">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Trang sau
          </button>
        </div>

        {selectedOrder && (
          <div className="animate-fade-in-down transition-all duration-500">
            <div className="mb-4">
              <label className="block font-semibold">Tên nguyên liệu:</label>
              <p className="border p-2 rounded bg-gray-100">
                {selectedOrder.request_name}
              </p>
            </div>

            <div className="mb-4">
              <label className="block font-semibold">
                Số lượng bạn cung cấp:
              </label>
              <p className="border p-2 rounded bg-gray-100 w-full">
                {selectedOrder.quantity_remain} kg
              </p>

              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            {/* Nhập ghi chú */}
            <div className="mb-4">
              <label className="block font-semibold">Ghi chú:</label>
              <textarea
                type="text"
                name="note"
                placeholder="Nhập ghi chú"
                value={formData.note}
                onChange={handleNoteChange}
                rows={4}
                className="border p-2 rounded w-full resize-none"
              />
              {noteError && (
                <p className="text-red-500 text-sm mt-1">{noteError}</p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Gửi Yêu Cầu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplyRequestPage;
