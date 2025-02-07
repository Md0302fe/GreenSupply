import React, { useState, useEffect } from "react";
import axios from "axios";
import Shop from "../../../assets/NewProject/Icon-GreenSupply/shop-illustration.webp";
import { FiRefreshCw } from "react-icons/fi";
import { AiFillEdit } from "react-icons/ai";
import { toast } from "react-toastify";

const HarvestRequestPage = () => {
  const [formData, setFormData] = useState({
    fuel_name: "",
    quantity: "",
    price: "",
    address: "",
    note: "",
  });

  const [errors, setErrors] = useState({}); // Lưu thông báo lỗi

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

    // Kiểm tra số lượng & giá (Chỉ được nhập số nguyên dương)
    // if (name === "quantity" || name === "price") {
    //   if (!/^\d+$/.test(value) && value !== "") {
    //     newErrors[name] = "Chỉ được nhập số nguyên dương!";
    //   } else if (parseInt(value) <= 0) {
    //     newErrors[name] = "Giá trị phải lớn hơn 0!";
    //   } else {
    //     delete newErrors[name];
    //   }
    //   setFormData((prev) => ({ ...prev, [name]: value }));
    //   setErrors(newErrors);
    //   return;
    // }

    // Kiểm tra địa chỉ (Không chứa ký tự đặc biệt)
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

  // 🕒 Tự động ẩn lỗi sau 5 giây
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const timer = setTimeout(() => {
        setErrors({});
      }, 3000); // 3 giây

      return () => clearTimeout(timer);
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
      supplier_id: "6795145e3ab5ca4dfb3afab5",
      fuel_name: formData.fuel_name,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      total_price: totalPrice(),
      address: formData.address,
      note: formData.note,
      status: "Chờ duyệt",
    };

    try {
      const res = await axios.post(
        "http://localhost:3001/api/harvest-request/createHarvestRequest",
        fuelRequest
      );

      console.log("Response data:", res.data);
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
      <div className="w-full border border-gray-200 flex items-center gap-20 mb-5 justify-between rounded-md p-6 bg-white shadow">
        <div className="info">
          <h1 className="text-3xl font-bold mb-3 text-black">Good Morning</h1>
          <p>
            Here's what's happening in your store today. See the statistics.
          </p>
        </div>
        <img src={Shop} className="w-[250px]" alt="Shop Illustration" />
      </div>

      {/* Form Tạo Yêu Cầu Thu Hàng */}
      <div className="w-full border border-gray-200 p-6 rounded-md bg-white shadow">
        <h2 className="text-xl font-[800] mb-4 text-black flex items-center gap-3">
          <AiFillEdit />
          Tạo Yêu Cầu Thu Hàng
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
              className="border p-2 rounded w-full"
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
              className="border p-2 rounded w-full"
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
              className="border p-2 rounded w-full"
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
              className="border p-2 rounded w-full"
            />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address}</p>
            )}
          </div>
        </div>

        {/* Hiển thị total_price */}
        <div className="mt-3 mb-4">
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

export default HarvestRequestPage;
