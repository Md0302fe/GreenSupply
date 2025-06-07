import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Upload } from "antd";

import { getBase64 } from "../../../../ultils";
import { useMutationHooks } from "../../../../hooks/useMutationHook";
import { MDBCardText } from "mdb-react-ui-kit";

import * as PurchaseOrderServices from "../../../../services/PurchaseOrderServices";
import * as FuelTypeServices from "../../../../services/FuelTypesServices";

import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { message, DatePicker } from "antd";

import { useTranslation } from "react-i18next";

const HarvestRequestPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    request_name: "", // Tên yêu cầu (Tên của đơn hàng hoặc nhiệm vụ thu gom Nguyên liệu)
    fuel_type: "", // Loại Nguyên liệu cần thu (VD: Xăng, Dầu, Khí)
    fuel_image: "",
    quantity: "", // Số lượng Nguyên liệu yêu cầu thu gom
    quantity_remain: "", // Số lượng Nguyên liệu còn lại cần thu (nếu chưa hoàn thành)
    start_received: null,
    end_received: null,
    due_date: null,
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [fileList, setFileList] = useState([]);
  const navigate = useNavigate();

  // Tính tổng giá
  const totalPrice = () => {
    const q = Number(formData.quantity) || 0;
    const p = Number(formData.price) || 0;
    return q * p;
  };

  // Xử lý onchange <-> input
  const handleChange = (e) => {
    const { name, value } = e?.target || {};
    if (
      name === "start_received" ||
      name === "end_received" ||
      name === "due_date"
    ) {
      // value là moment object hoặc null
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const disabledStartDate = (current) => {
    return current && current < moment().startOf("day");
  };

  const disabledEndDate = (current) => {
    if (!formData.start_received)
      return current && current < moment().startOf("day");
    return current && current < formData.start_received;
  };

  const disabledDueDate = (current) => {
    if (!formData.end_received)
      return current && current < moment().startOf("day");
    return current && current < formData.end_received;
  };

  // Tuy nguyên, cần lưu ý rằng event trong trường hợp này sẽ là một đối tượng chứa thông tin về tệp tải lên,
  // Ant Design cung cấp một đối tượng info trong onChange, chứa thông tin chi tiết về tệp và quá trình tải lên.
  const handleChangeFuelImage = async ({ fileList: newFileList }) => {
    setFileList(newFileList);

    if (newFileList.length === 0) {
      setFuelImage(null);
      return;
    }

    const file = newFileList[0];
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await getBase64(file.originFileObj);
    }
    setFuelImage(file.preview || file.url);
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
        message: t("harvest.validation.empty_name"),
      },
      {
        condition: !formData.fuel_type.trim(),
        message: t("harvest.validation.empty_fuel_type"),
      },
      {
        condition: !fuelImage || fuelImage.trim() === "",
        message: t("harvest.validation.empty_image"),
      },
      {
        condition: !formData.quantity || formData.quantity.trim() === "",
        message: t("harvest.validation.empty_quantity"),
      },
      {
        condition: !formData.price || formData.price.trim() === "",
        message: t("harvest.validation.empty_price"),
      },
      {
        condition: !formData.start_received,
        message: t("harvest.validation.empty_start_date"),
      },
      {
        condition: new Date(formData.start_received) < today,
        message: t("harvest.validation.invalid_start_date"),
      }, // Kiểm tra ngày hợp lệ
      {
        condition: !formData.end_received,
        message: t("harvest.validation.empty_end_date"),
      },
      {
        condition: !formData.due_date,
        message: t("harvest.validation.empty_due_date"),
      },
      {
        condition:
          new Date(formData.start_received) > new Date(formData.end_received),
        message: t("harvest.validation.invalid_end_date"),
      },
      {
        condition:
          new Date(formData.due_date) < new Date(formData.end_received),
        message: t("harvest.validation.invalid_due_date"),
      },
      {
        condition: !formData.priority.trim(),
        message: t("harvest.validation.empty_priority"),
      },
    ];

    // Lặp qua danh sách và kiểm tra điều kiện
    const error = validationRules.find((rule) => rule.condition);
    if (error) {
      message.warning(error.message);
      return;
    } else {
      const fuelRequest = {
        request_name: formData.request_name,
        fuel_type: formData.fuel_type,
        fuel_image: fuelImage,
        quantity: Number(formData.quantity),
        quantity_remain: Number(formData.quantity),
        is_deleted: formData.is_deleted,
        start_received: formData.start_received
          ? formData.start_received.toISOString()
          : null,
        end_received: formData.end_received
          ? formData.end_received.toISOString()
          : null,
        due_date: formData.due_date ? formData.due_date.toISOString() : null,
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
  };

  const queryAllFuelType = useQuery({
    queryKey: ["fuel_list"],
    queryFn: fetchGetAllFuelType,
  });

  const { data: fuelType, isSuccess: getFuelSuccess } = queryAllFuelType;

  useEffect(() => {
    if (getFuelSuccess) {
      if (fuelType.success) {
        setFuel_Types(fuelType.requests);
      }
    }
  }, [getFuelSuccess]);

  const { data, isError, isPending, isSuccess } = mutationCreateOrder;

  const setNewForm = () => {
    setFormData({
      request_name: "",
      fuel_type: "",
      fuel_image: "",
      quantity: "",
      quantity_remain: "",
      start_received: null,
      due_date: null,
      end_received: null,
      price: "",
      total_price: 0,
      priority: "",
      status: "",
      note: "",
      is_deleted: false,
    });
    setFuelImage(null);
    setFileList([]); // Reset fileList cho Upload
  };

  // Notification when created success
  useEffect(() => {
    if (isSuccess) {
      if (data?.PurchaseOrder?.status) {
        message.success(data?.PurchaseOrder.status);
      }
      setTimeout(() => {
        setNewForm();
      }, 1000);
    } else if (data?.PurchaseOrder?.message) {
      message.error(data?.PurchaseOrder.message);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isSuccess) {
      if (data?.status === "OK") {
        message.success(t("	harvest.success.created"));
        setFormData({
          request_name: "", // Tên yêu cầu (Tên của đơn hàng hoặc nhiệm vụ thu gom Nguyên liệu)
          fuel_type: "", // Loại Nguyên liệu cần thu (VD: Xăng, Dầu, Khí)
          fuel_image: "",
          quantity: "", // Số lượng Nguyên liệu yêu cầu thu gom
          quantity_remain: "", // Số lượng Nguyên liệu còn lại cần thu (nếu chưa hoàn thành)
          due_date: "", // Hạn chót cần hoàn thành đơn hàng (YYYY-MM-DD)
          is_deleted: "", // Trạng thái xóa (true/false hoặc 0/1) - đánh dấu đơn hàng đã bị xóa hay chưa
          start_received: "", // Ngày bắt đầu nhận Nguyên liệu
          end_received: "", // Ngày kết thúc nhận Nguyên liệu
          price: "", // Giá thực tế đã được chốt cho đơn hàng
          total_price: "",
          priority: "", // Mức độ ưu tiên của đơn hàng (VD: Cao, Trung bình, Thấp)
          status: "", // Trạng thái đơn hàng (VD: Đang chờ, Đã hoàn thành, Đã hủy)
          note: "", // Ghi chú thêm về đơn hàng
        });
        setFuelImage(null);
      } else {
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isError, isPending, isSuccess]);

  return (
    <div className="px-2">
      {/* Bố cục chính: Flex ngang trên desktop, dọc trên mobile */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Form chính (80%) */}
        <div className="w-full md:w-full bg-gray-100 p-4">
          <button
            onClick={() => navigate(-1)} // Quay lại trang trước đó
            className="flex mb-1 items-center bg-blue-500 text-white font-semibold py-1 px-3 rounded-md shadow-sm hover:bg-blue-600 transition duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1" // Kích thước biểu tượng nhỏ hơn
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12H3m0 0l6-6m-6 6l6 6"
              />
            </svg>
            {t("harvest.back")}
          </button>
          <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center justify-center gap-2">
              🛒 {t("harvest.title")}
            </h2>
            <div className="space-y-4">
              {/* Tên đơn */}
              <div>
                <label className="block text-gray-800 font-semibold mb-2">
                  {t("harvest.form.name")}
                </label>
                <input
                  type="text"
                  name="request_name"
                  maxLength="50"
                  placeholder={t("harvest.form.name_placeholder")}
                  value={formData.request_name}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                />
              </div>

              {/* Loại Nguyên liệu */}
              <div>
                <label className="block text-gray-800 font-semibold mb-2">
                  {t("harvest.form.fuel_type")}
                </label>
                <select
                  name="fuel_type"
                  value={formData.fuel_type}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                >
                  <option value="" disabled>
                    {t("harvest.form.fuel_type_placeholder")}
                  </option>
                  {fuel_types && fuel_types.length > 0 ? (
                    fuel_types.map((fuel) => (
                      <option key={fuel._id} value={fuel._id}>
                        {fuel.fuel_type_id.type_name}
                      </option>
                    ))
                  ) : (
                    <option disabled>{t("harvest.form.no_data")}</option>
                  )}
                </select>
              </div>

              {/* Ảnh Nguyên liệu */}
              <div className="flex justify-between items-center min-h-[20vh]">
                <div className="flex-[0.25] block text-gray-800 font-semibold mb-2">
                  <MDBCardText className="block text-gray-800 font-semibold mb-2">
                    {t("harvest.form.image")}
                  </MDBCardText>
                </div>
                <div>
                  <Upload.Dragger
                    listType="picture-card"
                    fileList={fileList}
                    showUploadList={false}
                    accept=".png, .jpg, .jpeg, .gif, .webp, .avif, .eps"
                    maxCount={1}
                    beforeUpload={() => false}
                    onChange={handleChangeFuelImage}
                  >
                    {fuelImage ? (
                      <img
                        src={fuelImage}
                        alt="preview"
                        style={{
                          width: "100%",
                          height: "auto",
                          maxWidth: "200px",
                        }}
                      />
                    ) : (
                      <div>{t("harvest.form.image_placeholder")}</div>
                    )}
                  </Upload.Dragger>
                </div>
              </div>

              {/* Số lượng cần thu (Kg) */}
              <div>
                <label className="block text-gray-800 font-semibold mb-2">
                  {t("harvest.form.quantity")}
                </label>
                <div className="relative w-full">
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    placeholder={t("harvest.form.quantity_placeholder")}
                    value={formData.quantity}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if (["e", "E", "-", "."].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className="border border-gray-300 p-2 pr-12 rounded w-full focus:ring focus:ring-yellow-300"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    Kg
                  </span>
                </div>
              </div>

              {/* Giá trên mỗi Kg / Đơn vị */}
              <div>
                <label className="block text-gray-800 font-semibold mb-2">
                  {t("harvest.form.price")}
                </label>
                <div className="relative w-full">
                  <input
                    type="number"
                    name="price"
                    min="1"
                    placeholder={t("harvest.form.price_placeholder")}
                    value={formData.price}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if (["e", "E", "-", "."].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className="border border-gray-300 p-2 pr-14 rounded w-full focus:ring focus:ring-yellow-300"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    VND
                  </span>
                </div>
              </div>

              {/* Ngày nhận đơn */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Ngày bắt đầu nhận đơn */}
                <DatePicker
                  value={formData.start_received}
                  onChange={(date) =>
                    handleChange({
                      target: { name: "start_received", value: date },
                    })
                  }
                  showTime={{ format: "HH:mm" }}
                  format="DD/MM/YYYY HH:mm"
                  disabledDate={disabledStartDate}
                  placeholder={t("harvest.form.start_date_placeholder")}
                  className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                />

                <DatePicker
                  value={formData.end_received}
                  onChange={(date) =>
                    handleChange({
                      target: { name: "end_received", value: date },
                    })
                  }
                  showTime={{ format: "HH:mm" }}
                  format="DD/MM/YYYY HH:mm"
                  disabledDate={disabledEndDate}
                  disabled={!formData.start_received}
                  placeholder={t("harvest.form.end_date_placeholder")}
                  className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                />

                <DatePicker
                  value={formData.due_date}
                  onChange={(date) =>
                    handleChange({ target: { name: "due_date", value: date } })
                  }
                  showTime={{ format: "HH:mm" }}
                  format="DD/MM/YYYY HH:mm"
                  disabledDate={disabledDueDate}
                  disabled={!formData.end_received}
                  placeholder={t("harvest.form.due_date_placeholder")}
                  className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                />
              </div>

              {/* Mức độ ưu tiên */}
              <div>
                <label className="block text-gray-800 font-semibold mb-2">
                  {t("harvest.form.priority")}
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                >
                  <option value="" disabled>
                    {t("harvest.form.priority_placeholder")}
                  </option>
                  <option value="Cao">{t("harvest.priority.high")}</option>
                  <option value="Trung bình">
                    {t("harvest.priority.medium")}
                  </option>
                  <option value="Thấp">{t("harvest.priority.low")}</option>
                </select>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-gray-800 font-semibold mb-2">
                  {t("harvest.form.note")}
                </label>
                <textarea
                  name="note"
                  placeholder={t("harvest.form.note_placeholder")}
                  rows="3"
                  value={formData.note}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                />
              </div>

              {/* Tổng giá */}
              <div className="font-semibold text-lg text-gray-800">
                {t("harvest.form.total_price")} :{" "}
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
                  type="button" // Tránh việc form bị submit khi nhấn nút làm mới
                  onClick={() => setNewForm()} // Reset dữ liệu khi nhấn
                  className="bg-yellow-400 text-gray-800 font-bold px-4 py-2 rounded hover:bg-yellow-500 w-full md:w-auto"
                >
                  {t("harvest.actions.reset")}
                </button>
                <button
                  onClick={() => handleSubmit()} // Gọi hàm trực tiếp, không truyền reference
                  className="bg-green-600 text-white font-bold px-4 py-2 rounded hover:bg-green-700 w-full md:w-auto"
                >
                  {t("harvest.actions.submit")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HarvestRequestPage;
