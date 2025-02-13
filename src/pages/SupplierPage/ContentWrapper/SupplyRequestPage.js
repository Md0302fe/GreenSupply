import React, { useState, useEffect } from "react";
import { AiFillEdit } from "react-icons/ai";
import { FiRefreshCw } from "react-icons/fi";
import Shop from "../../../assets/NewProject/Icon-GreenSupply/shop-illustration.webp";
import { toast } from "react-toastify";
import { createSupplyRequest } from "../../../services/SupplyRequestService";
import { useSelector } from "react-redux";

const SupplyRequestPage = () => {
  const [formData, setFormData] = useState({
      fuel_name: "",
      quantity: "",
      price: "",
      address: "",
      note: "",
    });
    const userRedux = useSelector((state) => state.user);
  
    const [errors, setErrors] = useState({}); // Lưu thông báo lỗi
    // eslint-disable-next-line no-unused-vars
    const [fadeOut, setFadeOut] = useState(false);
  
    // Tính tổng giá
    const totalPrice = () => {
      const q = Number(formData.quantity) || 0;
      const p = Number(formData.price) || 0;
      return q * p;
    };
  
    // Xử lý input
    const handleChange = (e) => {
      const { name, value } = e.target;
      let newErrors = { ...errors };
  
      // Kiểm tra tên mặt hàng (Không chứa ký tự đặc biệt)
      if (name === "fuel_name") {
        if (!/^[a-zA-Z0-9\s\u00C0-\u1EF9]+$/.test(value)) {
          newErrors.fuel_name = "Tên mặt hàng chỉ chứa chữ, số và khoảng trắng!";
        } else {
          delete newErrors.fuel_name;
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors(newErrors);
        return;
      }
  
      if ((name === "quantity" || name === "price") && value === "0") {
        return;
      }
  
      if (name === "address") {
        if (!/^[a-zA-Z0-9\s\u00C0-\u1EF9,.-]+$/.test(value)) {
          newErrors.address = "Địa chỉ không được chứa ký tự đặc biệt!";
        } else {
          delete newErrors.address;
        }
      }
  
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors(newErrors);
    };
  
    // 🕒 Tự động ẩn lỗi sau 3 giây
    useEffect(() => {
      if (Object.keys(errors).length > 0) {
        setFadeOut(false);
        const fadeTimer = setTimeout(() => setFadeOut(true), 2500); // Sau 2.5s bắt đầu mờ dần
        const removeTimer = setTimeout(() => setErrors({}), 3000); // Sau 3s xoá lỗi
  
        return () => {
          clearTimeout(fadeTimer);
          clearTimeout(removeTimer);
        };
      }
    }, [errors]);
  
    // Gửi form
    const handleSubmit = async () => {
      let newErrors = {};
  
      // Kiểm tra dữ liệu trước khi gửi
      if (!formData.fuel_name.trim())
        newErrors.fuel_name = "Tên mặt hàng không được để trống!";
      if (!formData.quantity.trim())
        newErrors.quantity = "Số lượng không được để trống!";
      if (!formData.price.trim()) newErrors.price = "Giá không được để trống!";
      if (!formData.address.trim())
        newErrors.address = "Địa chỉ không được để trống!";
  
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return; // Không gửi form nếu có lỗi
      }
  
      const fuelRequest = {
        supplier_id: userRedux.id,
        fuel_name: formData.fuel_name,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        total_price: totalPrice(),
        address: formData.address,
        note: formData.note,
        status: "Chờ duyệt",
      };
  
      try {
        await createSupplyRequest(fuelRequest);
        toast.success("Tạo yêu cầu thu hàng thành công!");
  
        setFormData({
          fuel_name: "",
          quantity: "",
          price: "",
          address: "",
          note: "",
        });
        setErrors({});
      } catch (error) {
        console.error("Lỗi khi tạo yêu cầu:", error);
        toast.error("Tạo yêu cầu thất bại! Vui lòng thử lại.");
      }
    };

  return (
    <div className="px-2">
      {/* Giới thiệu */}
      <div className="w-full border border-gray-200 flex flex-col md:flex-row items-center gap-10 md:gap-16 lg:gap-20 mb-5 justify-between rounded-md p-6 bg-white shadow">
        <div className="info md:text-left max-w-xl">
          <h3 className="text-2xl md:text-3xl font-bold mb-3 text-black">
            Chào mừng bạn đến với{" "}
            <span className="text-[#006838]">Green Supply</span>🌿
          </h3>
          <p className="text-gray-700">
            Hãy bắt đầu bằng cách{" "}
            <span className="font-bold"> tạo đơn cung cấp hàng </span> cho chúng
            tôi. Sau khi gửi yêu cầu, bạn có thể theo dõi trạng thái xử lý và
            nhận phản hồi nhanh chóng từ hệ thống của chúng tôi.
          </p>
          <p className="text-gray-700 mt-3">
            Chúng tôi mong muốn xây dựng một mối quan hệ hợp tác bền vững và
            cùng nhau phát triển!
          </p>
        </div>
        <img
          src={Shop}
          className="w-[180px] md:w-[220px] lg:w-[250px] object-contain"
          alt="Shop Illustration"
        />
      </div>

      {/* Form Tạo Yêu Cầu Thu Hàng */}
      <div className="w-full border border-gray-200 p-6 rounded-md bg-white shadow">
        <h2 className="text-xl font-[800] mb-4 text-black flex items-center gap-3">
          <AiFillEdit />
          Tạo Đơn Cung Cấp Hàng
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* fuel_name */}
          <div>
            <label className="block mb-1 font-semibold">Tên mặt hàng</label>
            <input
              type="text"
              name="fuel_name"
              maxLength="50"
              placeholder="Tên mặt hàng..."
              value={formData.fuel_name}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (!/^[a-zA-Z0-9\s\u00C0-\u1EF9]*$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              className="border p-2 rounded w-full mb-2"
            />
            {errors.fuel_name && (
              <p className="text-red-500 text-sm">{errors.fuel_name}</p>
            )}
          </div>

          {/* quantity */}
          <div>
            <label className="block mb-1 font-semibold">Số lượng (kg )</label>
            <input
              type="number"
              name="quantity"
              min="1"
              placeholder="Số lượng..."
              value={formData.quantity}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (["e", "E", "-", "+", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              className="border p-2 rounded w-full mb-2"
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm">{errors.quantity}</p>
            )}
          </div>

          {/* price */}
          <div>
            <label className="block mb-1 font-semibold">
              Giá mỗi đơn vị (VNĐ)
            </label>
            <input
              type="number"
              name="price"
              min="1"
              placeholder="Giá bán..."
              value={formData.price}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (["e", "E", "-", "+", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              className="border p-2 rounded w-full mb-2"
            />
            {errors.price && (
              <p className="text-red-500 text-sm">{errors.price}</p>
            )}
          </div>

          {/* address */}
          <div>
            <label className="block mb-1 font-semibold">Địa chỉ lấy hàng</label>
            <input
              type="text"
              name="address"
              maxLength="120"
              placeholder="Nhập địa chỉ..."
              value={formData.address}
              onChange={handleChange}
              className="border p-2 rounded w-full mb-2"
            />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address}</p>
            )}
          </div>
        </div>

        {/* Hiển thị total_price */}
        <div className="mt-4 mb-4">
          <p>
            <span className="font-semibold mr-2">Tổng giá:</span>
            {totalPrice().toLocaleString("vi-VN")} VNĐ
          </p>
        </div>

        {/* note */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Ghi chú</label>
          <textarea
            name="note"
            maxLength="200"
            placeholder="Ghi chú (tối đa 200 ký tự)"
            value={formData.note}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Nút bấm */}
        <div className="flex flex-col md:flex-row md:justify-between gap-4 mt-4">
          <button
            onClick={handleSubmit}
            className="bg-[#FFE814] text-[#F14A00] font-bold px-4 py-2 rounded hover:bg-[#FBC02D] w-full md:w-auto"
          >
            Gửi Yêu Cầu
          </button>
          <button
            onClick={() =>
              setFormData({
                fuel_name: "",
                quantity: "",
                price: "",
                address: "",
                note: "",
              })
            }
            className="bg-[#006838] flex items-center text-white font-bold px-3 py-2 rounded hover:bg-[#028A48] w-full md:w-auto gap-2"
          >
            <FiRefreshCw />
            Làm mới
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplyRequestPage;
