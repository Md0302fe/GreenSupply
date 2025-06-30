import { useEffect, useRef, useState } from "react";
import {
  Form,
  DatePicker,
  Input,
  Button,
  message,
  Drawer,
  Descriptions,
  Checkbox,
} from "antd";

import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import * as ProductionRequestService from "../../services/ProductionRequestServices";
import * as BatchService from "../../services/RawMaterialBatch";
import * as ProductionProcessingService from "../../services/ProductionProcessingServices";
import { isEmpty } from "lodash";

// Giả lập API call danh sách Kế hoạch sản xuất
const getAllProductionRequests = async (access_token) => {
  const productionRequestData = await ProductionRequestService.getAllv2({
    status: "Đã duyệt",
    access_token: access_token,
  });
  return productionRequestData.requests;
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
  const [numberOfPreparingBatch, setNumberOfPreparingBatch] = useState(0);

  const prevCheckRef = useRef([]);

  const { id: requestIdFromURL } = useParams();

  const [consolidated, setConsolidated] = useState({
    total_raw_material: 0,
    total_loss_percentage: 0,
    total_finish_product: 0,
  });

  const navigate = useNavigate();

  // console.log("batchs => ", batchs);
  // console.log("consolidated => ", consolidated);

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
            // set batchs in to batchs list
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
    const payload = {
      ...values,
      total_raw_material: consolidated?.total_raw_material,
      total_finish_product: consolidated?.total_finish_product,
      total_loss_percentage: consolidated?.total_loss_percentage,
      start_time: values.start_time?.toISOString(),
      end_time: values.end_time?.toISOString(),
    };

    const response =
      await ProductionProcessingService.createConsolidateProcessing({
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

  // Giả lập API call danh sách Kế hoạch sản xuất
  const getAllBatchsById = async (requestId) => {
    const batchData = await BatchService.getBatchByRequestId(requestId);
    const data = batchData.data.batches[0];
    handleSetConsolidated(data);
    return batchData.data.batches;
  };

  const handleSetConsolidated = (data) => {
    // set infomation for consolidated form
    setConsolidated((prev) => ({
      ...prev,
      total_finish_product:
        prev?.total_finish_product +
        data?.production_request_id?.product_quantity,
      total_raw_material:
        prev?.total_raw_material +
        data?.production_request_id?.material_quantity,
      total_loss_percentage:
        prev?.total_loss_percentage +
        data?.production_request_id?.loss_percentage,
    }));
  };

  console.log(batchs?.length);

  // handler checked & unchecked checkbox group
  const handleCheckBoxChange = async (checkedValues) => {
    const prevChecked = prevCheckRef.current || [];

    if (isEmpty(prevChecked)) {
      setConsolidated({
        total_raw_material: 0,
        total_loss_percentage: 0,
        total_finish_product: 0,
      });
    }

    if (requests?.length > 1) {
      const uncheckValues = prevChecked.filter(
        (val) => !checkedValues.includes(val)
      );
      const newChecked = checkedValues.filter(
        (val) => !prevChecked.includes(val)
      );

      prevCheckRef.current = checkedValues;

      // Trừ dữ liệu & xoá batch khi uncheck
      if (uncheckValues.length > 0) {
        setBatchs((prev) => {
          const filtered = prev.filter(
            (batch) =>
              !uncheckValues.includes(batch?.production_request_id?._id)
          );

          prev.forEach((batch) => {
            const id = batch?.production_request_id?._id;
            if (uncheckValues.includes(id)) {
              setConsolidated((prev) => ({
                ...prev,
                total_raw_material:
                  prev.total_raw_material -
                  batch?.production_request_id?.material_quantity,
                total_loss_percentage:
                  prev.total_loss_percentage -
                  batch?.production_request_id?.loss_percentage,
                total_finish_product:
                  prev.total_finish_product -
                  batch?.production_request_id?.product_quantity,
              }));
            }
          });

          // Cập nhật số lượng batch "Đang chuẩn bị"
          const preparingCount = filtered.filter(
            (b) => b.status === "Đang chuẩn bị"
          ).length;
          setNumberOfPreparingBatch(preparingCount);

          return filtered;
        });
      }

      // Thêm batch mới nếu có ID mới được chọn
      if (newChecked.length > 0) {
        try {
          const allBatchLists = await Promise.all(
            newChecked.map((id) => getAllBatchsById(id))
          );
          const newBatches = allBatchLists.flat();

          setBatchs((prev) => {
            const combined = [...prev, ...newBatches];
            const map = new Map();
            combined.forEach((batch) => {
              const key = batch?.production_request_id?._id;
              if (key) map.set(key, batch);
            });

            const uniqueBatches = Array.from(map.values());

            // Cập nhật số lượng batch "Đang chuẩn bị"
            const preparingCount = uniqueBatches.filter(
              (b) => b.status === "Đang chuẩn bị"
            ).length;
            setNumberOfPreparingBatch(preparingCount);

            return uniqueBatches;
          });
        } catch (error) {
          console.error("Lỗi lấy danh sách lô:", error);
          message.error("Không thể tải danh sách lô nguyên liệu!");
        }
      }

      // Cập nhật form
      form.setFieldsValue({
        production_request_id: checkedValues,
      });
    } else {
      return false;
    }
  };

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // cập nhật ngay khi component mount

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const drawerWidth = isMobile ? "100%" : "40%";

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 p-0 lg:p-4">
      <div className="flex justify-between items-center mb-2 w-full p-4">
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H3m0 0l6-6m-6 6l6 6" />
          </svg>
          <span className="hidden md:inline">Quay lại</span>
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
      <div className="max-w-4xl w-full mx-auto bg-white p-2 lg:p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Tạo Quy Trình Sản Xuất Tổng Hợp
        </h2>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 lg:gap-6">
            {/* Cột trái: Kế hoạch sản xuất */}
            <div className="mb-0 lg:mb-4">
              <Form.Item
                name="production_request_id"
                label="Chọn kế hoạch cho quy trình"
                rules={[
                  {
                    required: true,
                    message: "Chọn ít nhất 2 Kế hoạch sản xuất",
                  },
                ]}
              >
                <Checkbox.Group
                  className="flex flex-col flex-nowrap space-y-2 max-h-64 overflow-y-auto rounded-lg border border-black border-solid p-2"
                  options={requests.map((r) => ({
                    label: r.request_name,
                    value: r._id,
                  }))}
                  disabled={!!requestIdFromURL}
                  onChange={handleCheckBoxChange}
                />
              </Form.Item>
              {requests?.length <= 1 ? (
                <div className="bg-yellow-100 flex flex-col border-l-4 border-yellow-500 text-yellow-800 p-2 mb-2 rounded-md shadow-sm">
                  <span>
                    Bạn{" "}
                    <span className="font-bold">
                      không thể tạo quy trình tổng hợp
                    </span>{" "}
                    nếu kế hoạch ít hơn 2
                  </span>
                </div>
              ) : (
                ""
              )}
            </div>

            {/* Cột phải: Danh sách lô nguyên liệu */}
            <div>
              {batchs.length > 0 && (
                <>
                  <p className="text-sm font-semibold mb-1">
                    Lô nguyên liệu tương ứng
                  </p>
                  {/* Infomation of batchs */}
                  <div className="grid grid-cols-1 gap-2 mb-4 max-h-[270px] overflow-y-auto">
                    {batchs.map((batch) => (
                      <div
                        key={batch._id}
                        onClick={() => {
                          setSelectedBatch(batch);
                          setDrawerVisible(true);
                        }}
                        className={`cursor-pointer border-2 p-2 rounded shadow transition-all hover:shadow-md ${batch.status === "Đã xuất kho"
                            ? "border-green-500"
                            : batch.status === "Đang chuẩn bị" ||
                              batch.status === "Chờ xuất kho"
                              ? "border-yellow-500"
                              : "border-gray-300"
                          }`}
                      >
                        {/* infomation batchs */}
                        <div className="flex">
                          <div className="flex justify-between items-center w-full">
                            <p className="text-sm font-bold max-w-40 truncate">
                              {batch.batch_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Mã lô: {batch.batch_id}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-between items-center w-full">
                          <p className="text-sm">Số lượng: {batch.quantity}</p>
                          <p className="text-sm">Trạng thái: {batch.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          {/* logic hindent batches when empty */}
          {requests?.length > 1 ? (
            <>
              {batchs?.length > 0 && numberOfPreparingBatch > 0 ? (
                <div className="bg-yellow-100 flex flex-col border-l-4 border-yellow-500 text-yellow-800 p-2 mb-2 rounded-md shadow-sm">
                  <span>
                    Hiện có{" "}
                    <span className="font-bold">{numberOfPreparingBatch}</span>{" "}
                    lô nguyên liệu đang được bộ phận kho chuẩn bị
                  </span>
                  <span>
                    Bạn có thể <span className="font-bold">tạo quy trình</span>{" "}
                    ngay khi các lô nguyên liệu đã được chuẩn bị!
                  </span>
                </div>
              ) : batchs?.length > 0 ? (
                <div className="bg-green-100 flex flex-col border-l-4 border-green-500 text-green-800 p-2 mb-2 rounded-md shadow-sm">
                  <span>Các lô nguyên liệu thô đã được chuẩn bị</span>
                  <span>
                    Bạn có thể <span className="font-bold">tạo quy trình</span>{" "}
                    ngay
                  </span>
                </div>
              ) : null}
            </>
          ) : (
            ""
          )}

          {/* Extra Consolidated Information */}
          <div className="flex flex-col lg:flex-row justify-between icon-next">
            <Form.Item
              name="total_raw_material"
              label="Tổng K.lg nguyên liệu (Kg)"
              className="flex-1 min-w-[250px]"
            >
              <div className="font-bold">
                {consolidated?.total_raw_material}
              </div>
            </Form.Item>
            <Form.Item
              name="total_loss_percentage"
              label="Tỷ lệ % hao hụt tổng quy trình"
              className="flex-1 min-w-[250px]"
            >
              <div className="font-bold">
                {consolidated?.total_loss_percentage}
              </div>
            </Form.Item>
            <Form.Item
              name="total_finish_product"
              label="Tổng K.lg sản phẩm ước tính (Kg)"
              className="flex-1 min-w-[250px]"
            >
              <div className="font-bold">
                {consolidated?.total_finish_product}
              </div>
            </Form.Item>
          </div>

          {/* form date time */}
          <div className="flex flex-wrap gap-4">
            <Form.Item
              name="start_time"
              label="Thời gian bắt đầu"
              className="flex-1 min-w-[250px]"
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
              className="flex-1 min-w-[250px]"
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
          </div>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full"
              disabled={
                numberOfPreparingBatch?.length > 0 || batchs?.length <= 1
              }
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
          width={drawerWidth}
        >
          {selectedBatch ? (
            <Descriptions
              bordered
              column={1}
              size="middle"
              labelStyle={{
                fontWeight: 600,
                backgroundColor: "#f5f5f5",
                width: 100,
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
          <div className="flex justify-end mt-4">
          <button
            onClick={() => setDrawerVisible(false)}
            className="bg-gray-500 text-white font-bold px-4 py-2 rounded hover:bg-gray-600"
          >
            Đóng
          </button>
        </div>
        </Drawer>
      </div>
    </div>
  );
};

export default ProductionProcessForm;
