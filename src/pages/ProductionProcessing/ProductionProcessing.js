import React, { useEffect, useState } from "react";
import {
  Form,
  Select,
  DatePicker,
  Input,
  Button,
  message,
  Drawer,
  Descriptions,
} from "antd";
import * as ProductionRequestService from "../../services/ProductionRequestServices";
import * as BatchService from "../../services/RawMaterialBatch";
import * as ProductionProcessingService from "../../services/ProductionProcessingServices";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

// Giả lập API call danh sách Kế hoạch sản xuất
const getAllProductionRequests = async (access_token) => {
  const productionRequestData = await ProductionRequestService.getAll({
    status: "Đã duyệt",
    access_token: access_token,
  });
  return productionRequestData.requests;
};
// Giả lập API call danh sách Kế hoạch sản xuất
const getAllBatchsById = async (requestId) => {
  const batchData = await BatchService.getBatchByRequestId(requestId);
  console.log(batchData.data.batches);
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
        const productionRequestData = await getAllProductionRequests(
          user?.access_token
        );
        setRequests(productionRequestData);

        // Nếu có id truyền vào từ URL, set sẵn vào form + load batch
        if (requestIdFromURL) {
          const matched = productionRequestData.find(
            (r) => r._id === requestIdFromURL
          );
          if (matched) {
            form.setFieldsValue({ production_request_id: matched._id });
            const batchList = await getAllBatchsById(matched._id);
            setBatchs(batchList);
          } else {
            message.error("Không tìm thấy Kế hoạch sản xuất tương ứng!");
          }
        }
      } catch (error) {
        message.error("Không thể tải danh sách Kế hoạch sản xuất.");
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
    const hasPreparingBatch = batchs.some(
      (batch) => batch.status === "Đang chuẩn bị"
    );

    if (hasPreparingBatch) {
      message.warning(
        "Có lô nguyên liệu đang trong trạng thái 'Đang chuẩn bị'. Vui lòng chờ trước khi tạo quy trình sản xuất."
      );
      return; // Không cho phép tiếp tục
    }

    const payload = {
      ...values,
      start_time: values.start_time?.toISOString(),
      end_time: values.end_time?.toISOString(),
    };

    const response =
      await ProductionProcessingService.createProductionProcessing({
        access_token: user.access_token,
        dataRequest: payload,
      });

    if (response) {
      message.success("Tạo quy trình sản xuất thành công!");
      form.resetFields();
      setBatchs([]);
    } else {
      message.error("Tạo quy trình sản xuất thất bại!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-4 w-full">
        <Button
          onClick={() => navigate(-1)}
          type="primary"
          className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-md shadow-sm transition duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
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
          Quay lại
        </Button>
        <Button
          onClick={() => navigate("/system/admin/production-processing-list")}
          type="default"
          className="flex items-center border border-gray-400 text-gray-700 font-medium py-2 px-3 rounded-md shadow-sm hover:bg-gray-100 transition duration-300 ml-2"
        >
          <span className="border-b border-black border-solid">
            Xem danh sách đã tạo
          </span>
        </Button>
      </div>
      <div className="max-w-3xl w-[600px] mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Tạo Quy Trình Sản Xuất
        </h2>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="production_request_id"
            label="Kế hoạch sản xuất"
            rules={[{ required: true, message: "Chọn Kế hoạch sản xuất" }]}
          >
            <Select
              placeholder="Chọn Kế hoạch sản xuất"
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
              <h3 className="text-lg font-semibold mb-4">
                Danh sách lô nguyên liệu
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {batchs.map((batch) => (
                  <div
                    key={batch._id}
                    onClick={() => {
                      setSelectedBatch(batch);
                      setDrawerVisible(true);
                    }}
                    className={`cursor-pointer border-2 p-2 rounded shadow transition-all hover:shadow-md ${
                      batch.status === "Đã xuất kho"
                        ? "border-green-500"
                        : batch.status === "Đang chuẩn bị" ||
                          batch.status === "Chờ xuất kho"
                        ? "border-yellow-500"
                        : "border-gray-300"
                    }`}
                  >
                    <p className="font-medium">{batch.batch_name}</p>
                    <p className="text-sm text-gray-500">
                      Mã lô: {batch.batch_id}
                    </p>
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
                !startTime
                  ? "Chọn thời gian bắt đầu trước"
                  : "Chọn thời gian kết thúc"
              }
              disabledDate={disabledEndDate}
              disabled={!startTime}
            />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>

          <Form.Item>
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-2 mb-2 rounded-md shadow-sm">
              Bạn có thể <span className="font-bold">tạo quy trình</span> ngay
              khi các lô nguyên liệu đã được chuẩn bị!
            </div>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full"
            >
              Tạo quy trình
            </Button>
          </Form.Item>
        </Form>
        <Drawer
          title="Chi tiết lô nguyên liệu"
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={"40%"}
        >
          {selectedBatch ? (
            <Descriptions
              bordered
              column={1}
              size="middle"
              labelStyle={{
                fontWeight: 600,
                backgroundColor: "#f5f5f5",
                width: 180,
              }}
              contentStyle={{ backgroundColor: "#ffffff" }}
            >
              <Descriptions.Item label="Tên lô">
                {selectedBatch.batch_name}
              </Descriptions.Item>
              <Descriptions.Item label="Mã lô">
                {selectedBatch.batch_id}
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng">
                {selectedBatch.quantity}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {selectedBatch.status}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                {selectedBatch.note || "Không có"}
              </Descriptions.Item>
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
                    {selectedBatch.fuel_type_id.storage_id?.storage_name ||
                      "Không rõ"}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          ) : (
            <p>Đang tải...</p>
          )}
        </Drawer>
      </div>
    </div>
  );
};

export default ProductionProcessForm;
