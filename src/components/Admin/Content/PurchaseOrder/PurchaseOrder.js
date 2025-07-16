import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Upload } from "antd";
import {
  ArrowLeft,
  FileText,
  UploadIcon,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

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
    <div className="min-h-screen bg-white from-blue-50 via-indigo-50 to-purple-50 px-4 py-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center bg-white/80 backdrop-blur-sm text-gray-700 font-medium py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md hover:bg-white transition-all duration-200 border-2 border-gray-200/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          {t("harvest.back")}
        </button>

        <button
          type="button"
          onClick={() => navigate("/system/admin/R_purchase-orders")}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
        >
          {t("harvest.viewList") || "Material Purchase List"}
        </button>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              {t("harvest.title")}
            </h1>
            <p className="text-gray-600 text-lg">
              {t("harvest.title_description")}
            </p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              {t("harvest.detail")}
            </h2>
          </div>

          {/* Form Content */}
          <div className="p-8 space-y-8">
            {/* Request Name */}
            <div className="space-y-3">
              <label className="text-gray-800 font-semibold text-sm flex items-center gap-1">
                <span className="text-red-500 text-base">*</span>
                {t("harvest.form.name")}
              </label>
              <input
                type="text"
                name="request_name"
                maxLength="50"
                placeholder={t("harvest.form.name_placeholder")}
                value={formData.request_name}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400 bg-gray-50/50"
              />
            </div>

            {/* Material Type */}
            <div className="space-y-3">
              <label className="text-gray-800 font-semibold text-sm flex items-center gap-1">
                <span className="text-red-500 text-base">*</span>
                {t("harvest.form.fuel_type")}
              </label>
              <select
                name="fuel_type"
                value={formData.fuel_type}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-700 bg-gray-50/50"
              >
                <option value="" disabled>
                  {t("harvest.form.fuel_type_placeholder")}
                </option>
                {fuel_types && fuel_types.length > 0 ? (
                  fuel_types.map((fuel) => (
                    <option key={fuel._id} value={fuel._id}>
                      {fuel?.fuel_type_id?.type_name}
                    </option>
                  ))
                ) : (
                  <option disabled>{t("harvest.form.no_data")}</option>
                )}
              </select>
            </div>

            {/* Fuel Image */}
            <div className="space-y-3">
              <label className=" text-gray-800 font-semibold text-sm flex items-center gap-1">
                <span className="text-red-500 text-base">*</span>
                {t("harvest.form.image")}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300">
                <Upload.Dragger
                  listType="picture-card"
                  fileList={fileList}
                  showUploadList={false}
                  accept=".png, .jpg, .jpeg, .gif, .webp, .avif, .eps"
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={handleChangeFuelImage}
                  className="border-0 bg-transparent"
                >
                  {fuelImage ? (
                    <div className="relative">
                      <img
                        src={fuelImage || "/placeholder.svg"}
                        alt="preview"
                        className="max-w-[250px] max-h-[250px] object-cover rounded-lg shadow-md"
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <UploadIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg font-medium">
                        {t("harvest.form.image_placeholder")}
                      </p>
                      <p className="text-gray-400 mt-2">
                        {t("harvest.form.image_description")}
                      </p>
                    </div>
                  )}
                </Upload.Dragger>
              </div>
            </div>

            {/* Quantity and Price Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-gray-800 font-semibold text-sm flex items-center gap-1">
                  <span className="text-red-500 text-base">*</span>
                  {t("harvest.form.quantity")}
                </label>
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
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400 bg-gray-50/50"
                />
              </div>

              <div className="space-y-3">
                <label className="text-gray-800 font-semibold text-sm flex items-center gap-1">
                  <span className="text-red-500 text-base">*</span>
                  {t("harvest.form.price")}
                </label>
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
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400 bg-gray-50/50"
                />
              </div>
            </div>

            {/* Date Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    {t("harvest.form.start_date")}
                  </label>
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
                    className="w-full h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    {t("harvest.form.end_date")}
                  </label>
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
                    className="w-full h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    {t("harvest.form.due_date")}
                  </label>
                  <DatePicker
                    value={formData.due_date}
                    onChange={(date) =>
                      handleChange({
                        target: { name: "due_date", value: date },
                      })
                    }
                    showTime={{ format: "HH:mm" }}
                    format="DD/MM/YYYY HH:mm"
                    disabledDate={disabledDueDate}
                    disabled={!formData.end_received}
                    placeholder={t("harvest.form.due_date_placeholder")}
                    className="w-full h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-3">
              <label className="text-gray-800 font-semibold text-sm flex items-center gap-1">
                <span className="text-red-500 text-base">*</span>
                {t("harvest.form.priority")}
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-700 bg-gray-50/50"
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

            {/* Notes */}
            <div className="space-y-3">
              <label className="block text-gray-800 font-semibold text-sm">
                {t("harvest.form.note")}
              </label>
              <textarea
                name="note"
                placeholder={t("harvest.form.note_placeholder")}
                rows="4"
                value={formData.note}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400 bg-gray-50/50 resize-none"
              />
            </div>

            {/* Total Price Display */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-100">
              <div className="flex items-center justify-between">
                <span className="text-xl font-semibold text-gray-700">
                  {t("harvest.form.total_price")}:
                </span>
                <div className="text-right">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {(formData.quantity * formData.price || 0).toLocaleString(
                      "vi-VN"
                    )}{" "}
                    VNĐ
                  </span>
                  {formData.priority && (
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          formData.priority === "Cao"
                            ? "bg-red-100 text-red-800"
                            : formData.priority === "Trung bình"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {formData.priority === "Cao"
                          ? "High"
                          : formData.priority === "Trung bình"
                          ? "Medium"
                          : "Low"}{" "}
                        Priority
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => setNewForm()}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-4 rounded-xl transition-all duration-200 border-2 border-gray-200 hover:border-gray-300"
              >
                {t("harvest.actions.reset")}
              </button>
              <button
                onClick={() => handleSubmit()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {t("harvest.actions.submit")}
              </button>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>{t("harvest.note_require.note")}</strong>{" "}
                    {t("harvest.note_require.note_parent")}{" "}
                    <span className="text-red-500 font-semibold">*</span>{" "}
                    {t("harvest.note_require.note_child")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HarvestRequestPage;
