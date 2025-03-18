import React, { useState, useEffect } from "react";
import { Button, Form, Input, InputNumber, Select } from "antd";
import { useSelector } from "react-redux";
import * as RawMaterialBatchServices from "../../../../services/RawMaterialBatch";
import * as ProductionRequestServices from "../../../../services/ProductionRequestServices";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const RawMaterialBatch = () => {
  const [form] = Form.useForm();
  const [fuel_managements, set_fuel_managements] = useState([]);
  const [storages, setStorages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState([]);
  const user = useSelector((state) => state.user);
  const [requiredMaterial, setRequiredMaterial] = useState(0);
  const [isFuelSelected, setIsFuelSelected] = useState(false);
  const navigate = useNavigate();

  const generateBatchId = (prefix = "XMTH") => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Định dạng 2 số
    const day = String(today.getDate()).padStart(2, "0"); // Định dạng 2 số

    const batchNumber = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    return `${prefix}${day}${month}${year}-${batchNumber}`;
  };
  console.log("fuel_managements => ", fuel_managements);
  const [formData, setFormData] = useState({
    batch_id: generateBatchId(),
    batch_name: "",
    fuel_type_id: "",
    production_request_id: "",
    status: "Đang chuẩn bị",
    quantity: 0,
    storage_id: "",
    note: "",
    is_automatic: false,
    is_deleted: false,
  });

  const handleBatchNameChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      batch_name: value,
    }));
  };

  // Xử lý onchange <-> input
  const handleChange = (e) => {
    const { name, value } = e.target || {};

    if (name === "production_request_id") {
      const selectedRequest = processing.find((item) => item._id === value);
      if (selectedRequest) {
        console.log("selectedRequest:", selectedRequest);
        console.log("selectedRequest.material:", selectedRequest.material);

        setFormData((prev) => ({
          ...prev,
          production_request_id: value,
          fuel_type_id: selectedRequest.material?._id,
          storage_id: selectedRequest.material?.storage_id?.name_storage || "",
        }));
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = { access_token: user?.access_token };
        const processingRes = await ProductionRequestServices.getAllProcessing(
          data
        );
        const storageRes = await RawMaterialBatchServices.getAllStorages(data);
        console.log("Dữ liệu API trả về:", processingRes);
        const getAllManagements =
          await RawMaterialBatchServices.getAllFuelManagements();
        if (processingRes.success) {
          setProcessing(processingRes.requests);
        } else {
          toast.warning("Có lỗi trong quá trình lấy dữ liệu");
        }
        if (storageRes.success) {
          setStorages(storageRes.data);
        } else {
          toast.warning("Có lỗi trong quá trình lấy dữ liệu");
        }
        if (getAllManagements) {
          set_fuel_managements(getAllManagements.requests);
        } else {
          toast.warning("Có lỗi trong quá trình lấy dữ liệu");
        }
      } catch (error) {
        toast.error("Lỗi khi tải dữ liệu kho hoặc nhiên liệu!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleKeyDown = (event) => {
    if (
      /[^0-9]/.test(event.key) &&
      event.key !== "Backspace" &&
      event.key !== "Tab"
    ) {
      event.preventDefault();
    }
  };

  const handleEstimatedProductionChange = (value) => {
    if (value === null || value === undefined || value === "") {
      form.setFieldsValue({ quantity: null }); // Không đặt về 0
      setRequiredMaterial(0);
      return;
    }

    if (value === 0 || /e|E|[^0-9]/.test(value)) {
      toast.error("Sản lượng không hợp lệ! Vui lòng nhập một số hợp lệ.");
      form.setFieldsValue({ quantity: null });
      return;
    }

    const required = Math.ceil(value / 0.9);
    setRequiredMaterial(required);

    const selectedFuelId = form.getFieldValue("storage_id");

    if (selectedFuelId) {
      const selectedFuel = fuel_managements.find(
        (fuel) => fuel._id === selectedFuelId
      );
      if (selectedFuel) {
        const availableFuel = selectedFuel.quantity;
        if (required > availableFuel) {
          const maxProduction = Math.floor(availableFuel * 0.9);
          toast.warning(
            `Sản lượng mong muốn vượt quá số lượng nhiên liệu hiện có. Sản lượng tối đa có thể làm được là ${maxProduction} Kg.`
          );
          form.setFieldsValue({
            quantity: maxProduction,
          });
          setRequiredMaterial(Math.ceil(maxProduction / 0.9));
          return;
        }
      }
    }

    form.setFieldsValue({ quantity: value });
  };

  const handleFuelTypeChange = (value) => {
    form.setFieldsValue({ fuel_type_id: value });
    setIsFuelSelected(true); // Khi chọn loại nhiên liệu, mở khóa ô nhập sản lượng mong muốn
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const dataRequest = {
        access_token: user?.access_token,
        formData: {
          ...formData,
          production_request_id: formData.production_request_id, // production_request_id là ObjectId
          storage_id: formData.storage_id, // storage_id là ObjectId
          quantity: requiredMaterial,
          note: formData.note,
        },
      };
      console.log("dataRequest => ", dataRequest);

      const response = await RawMaterialBatchServices.createRawMaterialBatch(
        dataRequest
      );

      if (response.success) {
        toast.success("Tạo lô nguyên liệu thành công!");
        form.resetFields();
        // 👉 Chuyển hướng sau khi tạo thành công
        navigate("/system/admin/raw-material-batch-list", {
          state: { createdSuccess: true },
        });
      } else {
        toast.error("Tạo lô thất bại!");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạo lô!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-center mb-5 text-black">
          Tạo Lô Nguyên Liệu Bổ Sung
        </h2>

        {/* {loading && (
          <div className="text-center text-blue-600 font-medium">
            Đang tải dữ liệu...
          </div>
        )} */}

        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Mã lô */}
          <div className="mb-4">
            <span className="text-xl font-bold text-gray-800">Mã Lô: </span>
            <span className="text-xl font-semibold text-[#A31D1D]">
              {formData?.batch_id}
            </span>
          </div>

          {/* Nhập tên lô */}
          <Form.Item
            label="Tên lô"
            name="batch_name"
            rules={[{ required: true, message: "Vui lòng nhập tên lô!" }]}
          >
            <Input
              name="batch_name"
              placeholder="Nhập tên lô nguyên liệu"
              value={formData.batch_name} // Đảm bảo rằng giá trị trong form được gắn với state
              onChange={handleBatchNameChange} // Xử lý thay đổi khi người dùng nhập
            />
          </Form.Item>

          {/* Chọn đơn yêu cầu sản xuất */}
          <Form.Item
            label="Đơn yêu cầu sản xuất"
            name="production_request_id"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn đơn yêu cầu sản xuất!",
              },
            ]}
          >
            <Select
              placeholder="Chọn đơn yêu cầu sản xuất"
              className="rounded border-gray-300"
              value={formData.production_request_id}
              onChange={(value) =>
                handleChange({
                  target: { name: "production_request_id", value },
                })
              }
            >
              {processing?.map((request) => (
                <Option key={request._id} value={request._id}>
                  {request.request_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Chọn loại nhiên liệu */}
          <Form.Item
            label="Loại nguyên liệu"
            name="fuel_type_id"
            rules={[
              { required: true, message: "Vui lòng chọn loại nguyên liệu!" },
            ]}
          >
            <Select
              placeholder="Chọn loại nguyên liệu"
              className="rounded border-gray-300"
              onChange={handleFuelTypeChange}
            >
              {fuel_managements
                ?.filter((fuel) => fuel.quantity > 0)
                .map((fuel) => (
                  <Select.Option key={fuel._id} value={fuel._id}>
                    {fuel.fuel_type_id?.type_name} ({fuel.quantity} Kg)
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          {/* Nhập số lượng */}
          <Form.Item
            label="Sản lượng mong muốn (Kg)"
            name="quantity"
            rules={[
              { required: true, message: "Vui lòng nhập sản lượng mong muốn!" },
            ]}
          >
            <InputNumber
              min={null}
              className="w-full rounded border-gray-300"
              placeholder="Nhập sản lượng mong muốn"
              onChange={handleEstimatedProductionChange}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                const currentValue = form.getFieldValue("quantity");
                if (!currentValue) {
                  form.setFieldsValue({ quantity: null }); // Không thay đổi giá trị thành 0
                }
              }}
              disabled={!isFuelSelected}
            />
          </Form.Item>

          <Form.Item label="Số lượng nguyên liệu cần thiết ước tính (Kg)">
            <InputNumber
              disabled
              className="w-full rounded border-gray-300 bg-gray-50"
              value={requiredMaterial}
            />
          </Form.Item>

          {/* Chọn kho lưu trữ */}
          <Form.Item
            label="Kho Lưu Trữ"
            name="storage_id"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn kho lưu trữ!",
              },
            ]}
          >
            <Select
              placeholder="Vui lòng chọn kho lưu trữ!"
              className="rounded border-gray-300"
              value={formData.storage_id}
              onChange={(value) =>
                handleChange({
                  target: { name: "storage_id", value },
                })
              }
            >
              {storages?.map((storage) => (
                <Option key={storage._id} value={storage._id}>
                  {storage.name_storage}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Nhập ghi chú */}
          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea
              rows={4}
              placeholder="Nhập ghi chú (nếu có)"
              value={formData.note}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
              }
            />
          </Form.Item>

          {/* Nút xác nhận */}
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full py-2">
              Xác nhận
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* ToastContainer */}
      <ToastContainer
        hideProgressBar={false}
        position="top-right"
        newestOnTop={false}
        pauseOnFocusLoss
        autoClose={3000}
        closeOnClick
        pauseOnHover
        theme="light"
        rtl={false}
        draggable
      />
    </div>
  );
};

export default RawMaterialBatch;
