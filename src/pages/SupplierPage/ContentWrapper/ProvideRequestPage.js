import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  getAllFuelEntry,
  getFuelEntryDetail,
} from "../../../services/FuelEntryServices";
import { createFuelSupplyRequest } from "../../../services/FuelSupplyRequestService";
import { useSelector } from "react-redux";
import { message } from "antd";
import { getUserAddresses } from "./../../../services/UserService";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";

const ProvideRequestPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const userRedux = useSelector((state) => state.user);
  const [adminOrders, setAdminOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    quantity: "",
    quality: "",
    note: "",
    address: "",
  });
  const formRef = useRef(null);
  const [error, setError] = useState("");
  const [noteError, setNoteError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [timeLeft, setTimeLeft] = useState(null);
  const [addressError, setAddressError] = useState("");

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const access_token = userRedux?.access_token;
      const user_id = userRedux?.id;
      const response = await getAllFuelEntry(
        { page, limit: 6 },
        access_token,
        user_id
      );
      console.log(response)
      setAdminOrders(response.data);
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
    } finally {
      setLoading(false);
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

  const getTimeRemaining = (endTime) => {
    const total = Date.parse(endTime) - Date.now();
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return {
      total,
      days,
      hours,
      minutes,
      seconds,
    };
  };
  const fetchUserAddresses = async () => {
    try {
      const res = await getUserAddresses(userRedux.id); // giả sử API trả { success, addresses }
      setAddresses(res.addresses || []);
      if (res.addresses.length > 0) {
        setSelectedAddressId(res.addresses[0]._id);
      }
    } catch (error) {
      console.error("Lỗi lấy địa chỉ người dùng:", error);
    }
  };
  useEffect(() => {
    if (id) {
      fetchOrderById(id);
    }
    fetchOrders(currentPage);
    fetchUserAddresses();
  }, [currentPage]);

  useEffect(() => {
    if (selectedOrder && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedOrder]);

  // useEffect tính time
  useEffect(() => {
    if (!selectedOrder?.end_received) return;

    const interval = setInterval(() => {
      const remaining = getTimeRemaining(selectedOrder.end_received);
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedOrder]);

  const handleSelectOrder = (orderId) => {
    const foundOrder = adminOrders.find((order) => order._id === orderId);
    setSelectedOrder(foundOrder);
    setFormData({
      quantity: foundOrder.quantity_remain,
      quality: "",
      note: "",
    });
  };

  const totalPrice = () => {
    return (selectedOrder?.quantity_remain || 0) * (selectedOrder?.price || 0);
  };

  const handleNoteChange = (e) => {
    if (e.target.value.length > 2000) {
      setNoteError(t("provideRequest.note_length_error"));
    } else {
      setFormData({ ...formData, note: e.target.value });
    }
  };

  const handleSubmit = async () => {
    if (!selectedOrder) {
      message.error(t("provideRequest.select_order_warning"));
      return;
    }
    console.log(selectedAddressId);
    if (!selectedAddressId || !selectedAddressId.trim()) {
      setAddressError(t("harvestRequest.empty_address"));
      return;
    }
    const quantity = selectedOrder.quantity_remain;
    const selectedAddressText =
      addresses.find((addr) => addr._id === selectedAddressId)?.address || "";

    const supplyOrder = {
      supplier_id: userRedux.id,
      request_id: selectedOrder._id,
      fuel_name: selectedOrder.request_name,
      quantity,
      quality: "Tốt",
      price: selectedOrder.price,
      start_received: "",
      end_received: "",
      user_address: selectedAddressText || formData.address,
      total_price: totalPrice(),
      note: formData.note,
    };

    try {
      await createFuelSupplyRequest(supplyOrder);
      message.success(t("provideRequest.success_create"));
      setSelectedOrder(null);
      fetchOrders();
      setFormData({ quantity: "", quality: "", note: "" });
    } catch (error) {
      console.error("Lỗi khi tạo đơn cung cấp:", error);
      message.error(t("provideRequest.failed_create"));
    }
  };

  return (
    <div>
      <div className="p-6 bg-white shadow-md rounded">
        <h2 className="text-xl font-bold mb-4">
          {t("provideRequest.create_title")}
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {loading ? (
            <div className="col-span-full text-center py-6 text-gray-600 flex flex-col items-center gap-2">
              <Spin size="large" />
              {t("common.loading")}
            </div>
          ) : adminOrders.length === 0 ? (
            <div className="col-span-full text-center py-6 text-gray-600">
              {t("provideRequest.no_requests")}
            </div>
          ) : (
            adminOrders.map((order) => (
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
                    {t("provideRequest.remaining_quantity")}{" "}
                    <span className="font-semibold">
                      {order.quantity_remain} kg
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    {t("provideRequest.unit_price")}{" "}
                    <span className="font-semibold">
                      {order.price.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    {t("provideRequest.time_left")}{" "}
                    {(() => {
                      const time = getTimeRemaining(order.end_received);
                      return time.total > 0
                        ? `${time.days} ${t("common.days")} ${time.hours} ${t(
                            "common.hours"
                          )} ${time.minutes} ${t("common.minutes")}`
                        : t("provideRequest.expired");
                    })()}
                  </p>

                  <button
                    onClick={() => handleSelectOrder(order._id)}
                    className="mt-3 bg-[#006838] text-white px-4 py-2 rounded hover:bg-[#008c4a] hover:scale-105 transition-transform"
                  >
                    {t("provideRequest.create_button")}
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
            ))
          )}
        </div>
        <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
          {/* Trang trước */}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            &lt;
          </button>

          {/* Các nút số trang */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded ${
                currentPage === page
                  ? "bg-green-600 text-white font-semibold"
                  : "bg-white text-gray-700"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Trang sau */}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            &gt;
          </button>
        </div>

        {selectedOrder && (
          <div
            ref={formRef}
            className="animate-fade-in-down transition-all duration-500 bg-gray-50 border border-gray-200 rounded-md p-5 mt-6"
          >
            <h3 className="text-lg font-bold mb-4 text-green-700">
              {t("provideRequest.selected_order_info")}
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  {t("provideRequest.material_name")}
                </label>
                <p className="bg-white border border-gray-300 rounded px-3 py-2">
                  {selectedOrder.request_name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  {t("provideRequest.your_quantity")}
                </label>
                <p className="bg-white border border-gray-300 rounded px-3 py-2">
                  {selectedOrder.quantity_remain} kg
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  {t("provideRequest.time_left")}
                </label>
                <p className="text-gray-800 font-medium bg-white border border-gray-300 rounded px-3 py-2">
                  {timeLeft?.total > 0
                    ? `${timeLeft.days} ${t("common.days")} ${
                        timeLeft.hours
                      } ${t("common.hours")} ${timeLeft.minutes} ${t(
                        "common.minutes"
                      )} ${timeLeft.seconds} ${t("common.seconds")}`
                    : t("provideRequest.expired_receive_time")}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  {t("provideRequest.request_price")}
                </label>
                <p className="bg-white border border-gray-300 rounded px-3 py-2">
                  {selectedOrder.price.toLocaleString("vi-VN")} VNĐ / kg
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  {t("provideRequest.total_price")}
                </label>
                <p className="bg-white border border-gray-300 rounded px-3 py-2">
                  {selectedOrder.total_price?.toLocaleString("vi-VN")} VNĐ
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold mb-1">
                  {t("provideRequest.delivery_time")}
                </label>
                <p className="bg-white border border-gray-300 rounded px-3 py-2">
                  {new Date(selectedOrder.start_received).toLocaleString(
                    "vi-VN"
                  )}{" "}
                  →{" "}
                  {new Date(selectedOrder.end_received).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-semibold mb-1">
                  {t("provideRequest.delivery_address")}
                </label>
                {addresses.length === 0 ? (
                  // Nếu không có địa chỉ nào, hiển thị input cho người dùng nhập
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder={t("harvestRequest.enter_pickup_address")}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                  />
                ) : (
                  // Nếu có địa chỉ, hiển thị select cho người dùng chọn
                  <select
                    value={selectedAddressId || addresses[0].address}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                  >
                    {addresses.map((addr) => (
                      <option key={addr._id} value={addr._id}>
                        {addr.address}
                      </option>
                    ))}
                  </select>
                )}
                {addressError && (
                  <p className="text-red-500 text-sm">{addressError}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold mb-1">
                  {t("provideRequest.system_note")}
                </label>
                <p className="bg-white border border-gray-300 rounded px-3 py-2 min-h-[44px]">
                  {selectedOrder.note
                    ? selectedOrder.note
                    : t("common.no_data")}
                </p>
              </div>
            </div>

            {/* Ghi chú của người dùng */}
            <div className="mt-6">
              <label className="block text-sm font-semibold mb-1">
                {t("provideRequest.your_note")}
              </label>
              <textarea
                name="note"
                placeholder="Nhập ghi chú"
                value={formData.note}
                onChange={handleNoteChange}
                rows={4}
                className="border border-gray-300 rounded px-3 py-2 w-full resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {noteError && (
                <p className="text-red-500 text-sm mt-1">{noteError}</p>
              )}
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded transition"
              >
                {t("provideRequest.send_request")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProvideRequestPage;
