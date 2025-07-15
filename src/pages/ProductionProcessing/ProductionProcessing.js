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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
            message.error(t("messages.requestNotFound"));
          }
        }
      } catch (error) {
        message.error(t("messages.loadRequestError"));
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
      message.warning(t("messages.batchPreparingWarning"));
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
      message.success(t("messages.createSuccess"));
      form.resetFields();
      setBatchs([]);
    } else {
      message.error(t("messages.createFail"));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-4 w-full">
        <Button
          onClick={() => navigate(-1)}
          type="primary"
          className="flex items-center justify-center md:justify-start text-white font-semibold transition duration-300 shadow-sm px-2 md:px-3 py-1 bg-black hover:opacity-70 rounded-md min-w-[20px] md:min-w-[100px]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 md:h-4 md:w-4 md:mr-1"
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
          <span className="hidden md:inline">{t("common.back")}</span>
        </Button>
        <Button
          onClick={() => navigate("/system/admin/production-processing-list")}
          type="default"
          className="flex items-center border border-gray-400 text-gray-700 font-medium py-2 px-3 rounded-md shadow-sm hover:bg-gray-100 transition duration-300 ml-2"
        >
          <span className="border-b border-black border-solid">
            {t("createProductionProcess.viewCreatedList")}
          </span>
        </Button>
      </div>
      <div className="w-full max-w-3xl mx-auto bg-white p-4 sm:p-6 rounded shadow">
        <h2 className="text-[16px] lg:text-2xl font-bold mb-4 text-center">
          {t("createProductionProcess.title")}
        </h2>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="production_request_id"
            label={t("createProductionProcess.productionRequest")}
            rules={[
              {
                required: true,
                message: t("validation.selectProductionRequest"),
              },
            ]}
          >
            <Select
              placeholder={t("createProductionProcess.selectRequest")}
              disabled={!!requestIdFromURL} // Nếu có id → disable Select
              onChange={async (value) => {
                form.setFieldsValue({ production_request_id: value });
                try {
                  const batchList = await getAllBatchsById(value);
                  setBatchs(batchList);
                } catch (error) {
                  console.error("Lỗi lấy danh sách lô:", error);
                  message.error(t("messages.loadBatchError"));
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
              <h3 className="text-[16px] lg:text-lg font-semibold mb-4">
                {t("createProductionProcess.batchListTitle")}
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
            label={t("createProductionProcess.startTime")}
            rules={[
              {
                required: true,
                message: t("validation.productionDateRequired"),
              },
            ]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              className="w-full"
              placeholder={t("createProductionProcess.selectStartTime")}
              disabledDate={disabledStartDate}
            />
          </Form.Item>

          <Form.Item
            name="end_time"
            label={t("createProductionProcess.endTime")}
            rules={[
              { required: true, message: t("validation.endDateRequired") },
            ]}
            dependencies={["start_time"]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              className="w-full"
              placeholder={
                !startTime
                  ? t("createProductionProcess.selectStartTimeFirst")
                  : t("createProductionProcess.selectEndTime")
              }
              disabledDate={disabledEndDate}
              disabled={!startTime}
            />
          </Form.Item>

          <Form.Item name="note" label={t("common.note")}>
            <Input.TextArea rows={3} placeholder={t("common.note")} />
          </Form.Item>

          <Form.Item>
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-2 mb-2 rounded-md shadow-sm">
              {t("createProductionProcess.tipCanCreateWhenReady")}
            </div>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full"
            >
              {t("createProductionProcess.createButton")}
            </Button>
          </Form.Item>
        </Form>
        <Drawer
          title={t("createProductionProcess.batchDetailTitle")}
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
              <Descriptions.Item label={t("batch.name")}>
                {selectedBatch.batch_name}
              </Descriptions.Item>
              <Descriptions.Item label={t("batch.code")}>
                {selectedBatch.batch_id}
              </Descriptions.Item>
              <Descriptions.Item label={t("batch.quantity")}>
                {selectedBatch.quantity}
              </Descriptions.Item>
              <Descriptions.Item label={t("batch.status")}>
                {selectedBatch.status}
              </Descriptions.Item>
              <Descriptions.Item label={t("common.note")}>
                {selectedBatch.note || t("common.emptyNote")}
              </Descriptions.Item>
              <Descriptions.Item label={t("common.createdAt")}>
                {dayjs(selectedBatch.createdAt).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>

              {/* Fuel Type Info nếu có */}
              {selectedBatch.fuel_type_id && (
                <>
                  <Descriptions.Item label={t("fuel.quantity")}>
                    {selectedBatch.fuel_type_id.quantity}
                  </Descriptions.Item>
                  <Descriptions.Item label={t("storage.name")}>
                    {selectedBatch.fuel_type_id.storage_id?.storage_name ||
                      t("common.unknown")}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          ) : (
            <p>{t("common.unknown")}</p>
          )}
        </Drawer>
      </div>
    </div>
  );
};

export default ProductionProcessForm;
