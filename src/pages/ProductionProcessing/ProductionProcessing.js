import React, { useEffect, useState } from "react";
import {
  Form,
  Select,
  DatePicker,
  Input,
  Button,
  message,
  Drawer,
  Descriptions
} from "antd";
import * as ProductionRequestService from "../../services/ProductionRequestServices";
import * as BatchService from "../../services/RawMaterialBatch";
import * as ProductionProcessingService from "../../services/ProductionProcessingServices";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { LeftOutlined } from "@ant-design/icons";

// Giả lập API call danh sách yêu cầu sản xuất
const getAllProductionRequests = async (access_token) => {
  const productionRequestData = await ProductionRequestService.getAll({ status: "Đã duyệt", access_token: access_token });
  return productionRequestData.requests;
};
// Giả lập API call danh sách yêu cầu sản xuất
const getAllBatchsById = async (requestId) => {
  const batchData = await BatchService.getBatchByRequestId(requestId);
  console.log(batchData.data.batches)
  return batchData.data.batches;
};

const ProductionProcessForm = () => {
  const [form] = Form.useForm();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [batchs, setBatchs] = useState([]);
  const user = useSelector((state) => state.user);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const startTime = Form.useWatch("start_time", form);
  const { id: requestIdFromURL } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const productionRequestData = await getAllProductionRequests(user?.access_token);
        setRequests(productionRequestData);

        // Nếu có id truyền vào từ URL, set sẵn vào form + load batch
        if (requestIdFromURL) {
          const matched = productionRequestData.find((r) => r._id === requestIdFromURL);
          if (matched) {
            form.setFieldsValue({ production_request_id: matched._id });
            const batchList = await getAllBatchsById(matched._id);
            setBatchs(batchList);
          } else {
            toast.error("Không tìm thấy yêu cầu sản xuất tương ứng!");
          }
        }
      } catch (error) {
        message.error("Không thể tải danh sách yêu cầu sản xuất.");
        console.log(error);
      }
    };

    fetchRequests();
  }, [user?.access_token, requestIdFromURL]);

  // ❌ Không cho chọn ngày bắt đầu trước hôm nay
  const disabledStartDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  // ❌ Không cho chọn ngày kết thúc trước ngày bắt đầu
  const disabledEndDate = (current) => {
    const start = form.getFieldValue("start_time");
    if (!start) return current && current < dayjs().startOf("day");
    return current && current.isBefore(start, "minute");
  };
  const onFinish = async (values) => {
    // Kiểm tra nếu có lô đang ở trạng thái "Đang chuẩn bị"
    const hasPreparingBatch = batchs.some(batch => batch.status === "Đang chuẩn bị");

    if (hasPreparingBatch) {
      toast.warning("Có lô nguyên liệu đang trong trạng thái 'Đang chuẩn bị'. Vui lòng chờ trước khi tạo quy trình sản xuất.");
      return; // Không cho phép tiếp tục
    }

    const payload = {
      ...values,
      start_time: values.start_time?.toISOString(),
      end_time: values.end_time?.toISOString(),
    };

    const response = await ProductionProcessingService.createProductionProcessing({
      access_token: user.access_token,
      dataRequest: payload,
    });

    if (response.success) {
      toast.success("Tạo quy trình sản xuất thành công!");
      form.resetFields();
      setBatchs([]);
    } else {
      toast.error("Tạo quy trình sản xuất thất bại!");
    };

  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow mt-10">
      <div className="flex  mb-2 justify-between items-center">
        <Button
          type="link"
          icon={<LeftOutlined />} // Mũi tên
          className="text-blue-600"
          onClick={() => navigate(-1)} // Quay lại trang trước
        >
          Quay lại
        </Button>

        <Button
          type="default"
          onClick={() => navigate("/system/admin/production-processing-list")} // Chuyển đến danh sách
        >
          Xem danh sách đã tạo
        </Button>
      </div>
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Tạo Quy Trình Sản Xuất
      </h2>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="production_request_id"
          label="Yêu cầu sản xuất"
          rules={[{ required: true, message: "Chọn yêu cầu sản xuất" }]}
        >
          <Select
            placeholder="Chọn yêu cầu sản xuất"
            disabled={!!requestIdFromURL} // Nếu có id → disable Select
            onChange={async (value) => {
              form.setFieldsValue({ production_request_id: value });
              try {
                const batchList = await getAllBatchsById(value);
                setBatchs(batchList);
              } catch (error) {
                console.error("Lỗi lấy danh sách lô:", error);
                message.error("Không thể tải danh sách lô nguyên liệu!");
              }
            }}
          >
            {requests.map((r) => (
              <Select.Option key={r._id} value={r._id}>
                {r.request_name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        {batchs.length > 0 && (
          <div className="my-4">
            <h3 className="text-lg font-semibold mb-4">Danh sách lô nguyên liệu</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {batchs.map((batch) => (
                <div
                  key={batch._id}
                  onClick={() => {
                    setSelectedBatch(batch);
                    setDrawerVisible(true);
                  }}
                  className={`cursor-pointer border-2 p-2 rounded shadow transition-all hover:shadow-md ${batch.status === "Đã xuất kho"
                    ? "border-green-500"
                    : batch.status === "Đang chuẩn bị" || batch.status === "Chờ xuất kho"
                      ? "border-yellow-500"
                      : "border-gray-300"
                    }`}
                >
                  <p className="font-medium">{batch.batch_name}</p>
                  <p className="text-sm text-gray-500">Mã lô: {batch.batch_id}</p>
                  <p className="text-sm">Số lượng: {batch.quantity}</p>
                  <p className="text-sm">Trạng thái: {batch.status}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <Form.Item
          name="start_time"
          label="Thời gian bắt đầu"
          rules={[{ required: true, message: "Chọn thời gian bắt đầu" }]}
        >
          <DatePicker
            showTime
            format="DD/MM/YYYY HH:mm"
            className="w-full"
            placeholder="Chọn thời gian bắt đầu"
            disabledDate={disabledStartDate}
          />
        </Form.Item>

        <Form.Item
          name="end_time"
          label="Thời gian kết thúc"
          rules={[{ required: true, message: "Chọn thời gian kết thúc" }]}
          dependencies={["start_time"]}
        >
          <DatePicker
            showTime
            format="DD/MM/YYYY HH:mm"
            className="w-full"
            placeholder={
              !startTime ? "Chọn thời gian bắt đầu trước" : "Chọn thời gian kết thúc"
            }
            disabledDate={disabledEndDate}
            disabled={!startTime}
          />
        </Form.Item>

        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} className="w-full">
            Xác nhận
          </Button>
        </Form.Item>
      </Form>
      <Drawer
        title="Chi tiết lô nguyên liệu"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={500}
      >
        {selectedBatch ? (
          <Descriptions
            bordered
            column={1}
            size="middle"
            labelStyle={{ fontWeight: 600, backgroundColor: "#f5f5f5", width: 180 }}
            contentStyle={{ backgroundColor: "#ffffff" }}
          >
            <Descriptions.Item label="Tên lô">{selectedBatch.batch_name}</Descriptions.Item>
            <Descriptions.Item label="Mã lô">{selectedBatch.batch_id}</Descriptions.Item>
            <Descriptions.Item label="Số lượng">{selectedBatch.quantity}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">{selectedBatch.status}</Descriptions.Item>
            <Descriptions.Item label="Ghi chú">{selectedBatch.note || "Không có"}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {dayjs(selectedBatch.createdAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>

            {/* Fuel Type Info nếu có */}
            {selectedBatch.fuel_type_id && (
              <>
                <Descriptions.Item label="Số lượng nguyên liệu">
                  {selectedBatch.fuel_type_id.quantity}
                </Descriptions.Item>
                <Descriptions.Item label="Kho lưu trữ">
                  {selectedBatch.fuel_type_id.storage_id?.storage_name || "Không rõ"}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        ) : (
          <p>Đang tải...</p>
        )}
      </Drawer>

    </div>
  );
};

export default ProductionProcessForm;
