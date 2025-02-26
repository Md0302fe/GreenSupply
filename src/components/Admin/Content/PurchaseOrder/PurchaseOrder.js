import React, { useState, useEffect } from "react";

import Shop from "../../../../assets/NewProject/Icon-GreenSupply/shop-illustration.webp";
import { toast } from "react-toastify";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Upload } from "antd";

import { getBase64 } from "../../../../ultils";
import { useMutationHooks } from "../../../../hooks/useMutationHook";
import { MDBCardText } from "mdb-react-ui-kit";

import * as PurchaseOrderServices from "../../../../services/PurchaseOrderServices";
import * as FuelTypeServices from "../../../../services/FuelTypesServices";

import { useSelector } from "react-redux";
import { useQueries, useQuery } from "@tanstack/react-query";

const HarvestRequestPage = () => {
  const [formData, setFormData] = useState({
    request_name: "", // Tên yêu cầu (Tên của đơn hàng hoặc nhiệm vụ thu gom nhiên liệu)
    fuel_type: "", // Loại nhiên liệu cần thu (VD: Xăng, Dầu, Khí)
    fuel_image: "",
    quantity: "", // Số lượng nhiên liệu yêu cầu thu gom
    quantity_remain: "", // Số lượng nhiên liệu còn lại cần thu (nếu chưa hoàn thành)
    start_received: null, // Ngày bắt đầu nhận nhiên liệu
    due_date: null, // Hạn chót cần hoàn thành đơn hàng (YYYY-MM-DD)
    end_received: null, // Ngày kết thúc nhận nhiên liệu
    price: "", // Giá thực tế đã được chốt cho đơn hàng
    total_price: 0, // Tổng giá của yêu cầu cần thu
    priority: "", // Mức độ ưu tiên của đơn hàng (VD: Cao, Trung bình, Thấp)
    status: "", // Trạng thái đơn hàng (VD: Đang chờ, Đã hoàn thành, Đã hủy)
    note: "", // Ghi chú thêm về đơn hàng
    is_deleted: false, // Trạng thái xóa (true/false hoặc 0/1) - đánh dấu đơn hàng đã bị xóa hay chưa
  });

  const [fuelImage, setFuelImage] = useState(null);
  const [fuel_types, setFuel_Types] = useState({});
  const user = useSelector((state) => state.user);

  // Tính tổng giá
  const totalPrice = () => {
    const q = Number(formData.quantity) || 0;
    const p = Number(formData.price) || 0;
    return q * p;
  };

  // Xử lý input
  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === "quantity" || name === "price") && value === "0") {
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Tuy nhiên, cần lưu ý rằng event trong trường hợp này sẽ là một đối tượng chứa thông tin về tệp tải lên,
  // Ant Design cung cấp một đối tượng info trong onChange, chứa thông tin chi tiết về tệp và quá trình tải lên.
  const handleChangeFuelImage = async (info) => {
    // C2: getBase64
    if (!info.fileList.length) {
      setFuelImage(null);
      return;
    }

    const file = info.fileList[0];
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setFuelImage(file.preview);
  };

  // Gửi form
  const handleSubmit = async () => {
    // Danh sách kiểm tra dữ liệu
    const today = new Date(); // Lấy ngày hiện tại
    today.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00 để so sánh chính xác

    // Danh sách kiểm tra dữ liệu
    const validationRules = [
      {
        condition: !formData.request_name.trim(),
        message: "Tên đơn hàng không được để trống!",
      },
      {
        condition: !formData.fuel_type.trim(),
        message: "Loại nhiên liệu không được để trống!",
      },
      {
        condition: !fuelImage || fuelImage.trim() === "",
        message: "Hình ảnh nhiên liệu không được để trống!",
      },
      {
        condition: !formData.start_received,
        message: "Vui lòng chọn ngày bắt đầu nhận đơn!",
      },
      {
        condition: new Date(formData.start_received) < today,
        message: "Ngày bắt đầu nhận đơn phải từ hôm nay trở đi!",
      }, // Kiểm tra ngày hợp lệ
      {
        condition: !formData.end_received,
        message: "Vui lòng chọn ngày kết thúc nhận đơn!",
      },
      {
        condition: !formData.due_date,
        message: "Vui lòng chọn hạn chót hoàn thành đơn!",
      },
      {
        condition:
          new Date(formData.start_received) > new Date(formData.end_received),
        message: "Ngày kết thúc nhận đơn phải sau ngày bắt đầu!",
      },
      {
        condition:
          new Date(formData.end_received) > new Date(formData.due_date),
        message: "Hạn chót hoàn thành đơn phải sau ngày kết thúc nhận đơn!",
      },
      {
        condition: !formData.priority.trim(),
        message: "Vui lòng chọn mức độ ưu tiên!",
      },
    ];

    // Lặp qua danh sách và kiểm tra điều kiện
    const error = validationRules.find((rule) => rule.condition);
    if (error) {
      toast.warning(error.message);
      return;
    } else {
      const fuelRequest = {
        request_name: formData.request_name,
        fuel_type: formData.fuel_type,
        fuel_image: fuelImage,
        quantity: Number(formData.quantity),
        quantity_remain: Number(formData.quantity),
        due_date: formData.due_date,
        is_deleted: formData.is_deleted,
        start_received: formData.start_received,
        end_received: formData.end_received,
        price: Number(formData.price),
        total_price: totalPrice(),
        priority: formData.priority,
        note: formData.note,
        status: "Chờ duyệt",
      };

      mutationCreateOrder.mutate({
        access_token: user?.access_token,
        dataRequest: fuelRequest,
      });
    }
  };

  const mutationCreateOrder = useMutationHooks((data) => {
    return PurchaseOrderServices.createPurchaseOrder(data);
  });


  // Get All Fuel List here
  const fetchGetAllFuelType = async () => {
    const response = await FuelTypeServices.getAllFuelType();
    return response;
  }

  const queryAllFuelType = useQuery({
    queryKey: ["fuel_list"],
    queryFn: fetchGetAllFuelType
  })

  const { data: fuelType , isSuccess: getFuelSuccess } = queryAllFuelType;

  useEffect(() => {
    if(getFuelSuccess){
      if(fuelType.success){
        setFuel_Types(fuelType.requests)
      }
    }
  }, [getFuelSuccess])

  const { data, isError, isPending, isSuccess } = mutationCreateOrder;

  const setNewForm = () => {
    setFormData({
      request_name: "", // Tên yêu cầu (Tên của đơn hàng hoặc nhiệm vụ thu gom nhiên liệu)
      fuel_type: "", // Loại nhiên liệu cần thu (VD: Xăng, Dầu, Khí)
      fuel_image: "",
      quantity: "", // Số lượng nhiên liệu yêu cầu thu gom
      quantity_remain: "", // Số lượng nhiên liệu còn lại cần thu (nếu chưa hoàn thành)
      start_received: null, // Ngày bắt đầu nhận nhiên liệu
      due_date: null, // Hạn chót cần hoàn thành đơn hàng (YYYY-MM-DD)
      end_received: null, // Ngày kết thúc nhận nhiên liệu
      price: "", // Giá thực tế đã được chốt cho đơn hàng
      total_price: 0, // Tổng giá của yêu cầu cần thu
      priority: "", // Mức độ ưu tiên của đơn hàng (VD: Cao, Trung bình, Thấp)
      status: "", // Trạng thái đơn hàng (VD: Đang chờ, Đã hoàn thành, Đã hủy)
      note: "", // Ghi chú thêm về đơn hàng
      is_deleted: false, // Trạng thái xóa (true/false hoặc 0/1) - đánh dấu đơn hàng đã bị xóa hay chưa
    })
    setFuelImage(null);
  }

  console.log("data > ", data);
  // Notification when created success
  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.PurchaseOrder.status)
      setTimeout(() => {
        setNewForm();
      }, 1000)
    } else {
      toast.error(data?.PurchaseOrder.message)
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isSuccess) {
      if (data?.status === "OK") {
        toast.success("Tạo yêu cầu thu hàng thành công!");
        setFormData({
          request_name: "", // Tên yêu cầu (Tên của đơn hàng hoặc nhiệm vụ thu gom nhiên liệu)
          fuel_type: "", // Loại nhiên liệu cần thu (VD: Xăng, Dầu, Khí)
          fuel_image: "",
          quantity: "", // Số lượng nhiên liệu yêu cầu thu gom
          quantity_remain: "", // Số lượng nhiên liệu còn lại cần thu (nếu chưa hoàn thành)
          due_date: "", // Hạn chót cần hoàn thành đơn hàng (YYYY-MM-DD)
          is_deleted: "", // Trạng thái xóa (true/false hoặc 0/1) - đánh dấu đơn hàng đã bị xóa hay chưa
          start_received: "", // Ngày bắt đầu nhận nhiên liệu
          end_received: "", // Ngày kết thúc nhận nhiên liệu
          price: "", // Giá thực tế đã được chốt cho đơn hàng
          total_price: "",
          priority: "", // Mức độ ưu tiên của đơn hàng (VD: Cao, Trung bình, Thấp)
          status: "", // Trạng thái đơn hàng (VD: Đang chờ, Đã hoàn thành, Đã hủy)
          note: "", // Ghi chú thêm về đơn hàng
        });
        setFuelImage(null);
      } else {
        return ;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isError, isPending, isSuccess]);

  return (
    <div className="px-2">
      {/* Bố cục chính: Flex ngang trên desktop, dọc trên mobile */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Form chính (80%) */}
        <div className="w-full md:w-4/5 bg-gray-100 p-6">
          <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              🚀 Đơn Thu Nhiên Liệu
            </h2>
            <div className="space-y-4">
              {/* Tên đơn */}
              <div>
                <label className="block text-gray-800 font-semibold mb-2">
                  Tên Đơn
                </label>
                <input
                  type="text"
                  name="request_name"
                  maxLength="50"
                  placeholder="Tên đơn thu nhiên liệu..."
                  value={formData.request_name}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                />
              </div>

              {/* Loại nhiên liệu */}
              <div>
                <label className="block text-gray-800 font-semibold mb-2">
                  Loại nhiên liệu cần thu
                </label>
                <select
                  name="fuel_type"
                  value={formData.fuel_type}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                >
                  <option value="" disabled>
                    Chọn loại nhiên liệu
                  </option>
                  {fuel_types && fuel_types.length > 0 ? (
                      fuel_types.map((fuel) => (
                        <option key={fuel._id} value={fuel._id}>
                          {fuel.type_name}
                        </option>
                      ))
                    ) : (
                      <option disabled>Không có dữ liệu</option>
                    )}
                </select>
              </div>

              {/* Ảnh nhiên liệu */}
              <div className="flex justify-between items-center min-h-[20vh]">
                <div className="flex-[0.25] block text-gray-800 font-semibold mb-2">
                  <MDBCardText className="block text-gray-800 font-semibold mb-2">
                    Hình ảnh
                  </MDBCardText>
                </div>
                <div className="flex-[0.74]">
                  <Upload.Dragger
                    listType="picture"
                    showUploadList={{ showRemoveIcon: true }}
                    accept=".png, .jpg, .jpeg, .gif, .webp, .avif, .eps"
                    maxCount={1}
                    beforeUpload={() => false}
                    onChange={handleChangeFuelImage}
                  >
                    <button> Upload Your Image</button>
                  </Upload.Dragger>
                </div>
              </div>

              {/* Số lượng cần thu */}
              <div>
                <label className="block text-gray-800 font-semibold mb-2">
                  Tổng số lượng cần thu (Kg)
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  placeholder="Nhập số lượng..."
                  value={formData.quantity}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                />
              </div>

              {/* Giá trên mỗi kg */}
              <div>
                <label className="block text-gray-800 font-semibold mb-2">
                  Giá trên mỗi Kg / Đơn vị (VND)
                </label>
                <input
                  type="number"
                  name="price"
                  min="1"
                  placeholder="Nhập giá..."
                  value={formData.price}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                />
              </div>

              {/* Ngày nhận đơn */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    Ngày bắt đầu nhận đơn
                  </label>
                  <DatePicker
                    selected={formData.start_received}
                    onChange={(date) =>
                      handleChange({
                        target: { name: "start_received", value: date },
                      })
                    }
                    dateFormat="dd/MM/yyyy"
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                    placeholderText="Chọn ngày"
                  />
                </div>
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    Ngày kết thúc nhận đơn
                  </label>
                  <DatePicker
                    selected={formData.end_received}
                    onChange={(date) =>
                      handleChange({
                        target: { name: "end_received", value: date },
                      })
                    }
                    dateFormat="dd/MM/yyyy"
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                    placeholderText="Chọn ngày"
                  />
                </div>
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    Hạn chót hoàn thành đơn
                  </label>
                  <DatePicker
                    selected={formData.due_date}
                    onChange={(date) =>
                      handleChange({
                        target: { name: "due_date", value: date },
                      })
                    }
                    dateFormat="dd/MM/yyyy"
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                    placeholderText="Chọn ngày"
                  />
                </div>
              </div>

              {/* Mức độ ưu tiên */}
              <div>
                <label className="block text-gray-800 font-semibold mb-2">
                  Mức độ ưu tiên
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                >
                  <option value="" disabled>
                    Chọn mức độ ưu tiên
                  </option>
                  <option value="Cao">Cao</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Thấp">Thấp</option>
                </select>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-gray-800 font-semibold mb-2">
                  Ghi chú
                </label>
                <textarea
                  name="note"
                  placeholder="Nhập ghi chú..."
                  rows="3"
                  value={formData.note}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                />
              </div>

              {/* Tổng giá */}
              <div className="font-semibold text-lg text-gray-800">
                Tổng giá :{" "}
                <span className="text-red-500 font-bold">
                  {(formData.quantity * formData.price || 0).toLocaleString(
                    "vi-VN"
                  )}{" "}
                  VNĐ
                </span>
              </div>

              {/* Nút bấm */}
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <button
                  onClick={() => handleSubmit()} // Gọi hàm trực tiếp, không truyền reference
                  className="bg-yellow-400 text-gray-800 font-bold px-4 py-2 rounded hover:bg-yellow-500 w-full md:w-auto"
                >
                  📨 Gửi Yêu Cầu
                </button>
                <button
                  type="button" // Tránh việc form bị submit khi nhấn nút làm mới
                  onClick={() => setNewForm()} // Reset dữ liệu khi nhấn
                  className="bg-green-600 text-white font-bold px-4 py-2 rounded hover:bg-green-700 w-full md:w-auto"
                >
                  🔄 Làm mới
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Box "Giới thiệu" (20%) */}
        <div className="w-full md:w-[15%] border border-gray-200 flex flex-col items-center justify-center text-center rounded-md px-6 bg-white shadow py-4">
          <div className="info max-w-xs">
            <h3 className="text-xl md:text-lg font-bold text-black">
              Tạo Đơn{" "}
              <span className="text-[#006838]">
                <br></br>Thu Nhiên Liệu
              </span>{" "}
              🌿
            </h3>
          </div>
          <img
            src={Shop}
            className="w-[140px] md:w-[120px] lg:w-[140px] object-contain mt-3"
            alt="Shop Illustration"
          />
        </div>
      </div>
    </div>
  );
};

export default HarvestRequestPage;
