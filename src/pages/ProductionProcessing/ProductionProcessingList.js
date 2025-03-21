import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  DatePicker,
  Drawer,
  Descriptions,
  Modal,
  message,
  Form,
  Tag
} from "antd";
import { CheckCircleOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { getAllProductionProcessing, approveProductionProcessing, updateProductionRequest } from "../../services/ProductionProcessingServices";
import Loading from "../../components/LoadingComponent/Loading";
import dayjs from "dayjs";

const { TextArea } = Input;

const ProductionProcessingList = () => {
  const user = useSelector((state) => state.user);
  const [filters, setFilters] = useState({
    status: null,
    searchText: "",
    start_date: null,
    end_date: null,
    sortField: "createdAt",
    sortOrder: "descend",
  });

  // Drawer & Modal state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [form] = Form.useForm();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Fetch data từ API
  const fetchProductionProcessing = async () => {
    const access_token = user?.access_token;
    return await getAllProductionProcessing(filters, access_token);
  };

  const { isLoading, data, refetch } = useQuery({
    queryKey: ["production_processing", filters],
    queryFn: fetchProductionProcessing,
    retry: false,
  });
  // Khi filters thay đổi, gọi API lại
  useEffect(() => {
    refetch();
  }, [filters, refetch]);

  // Mở Drawer xem chi tiết
  const handleViewDetail = (record) => {
    setSelectedProcess(record);
    setIsDrawerOpen(true);
  };

  // Mở Modal cập nhật
  const handleOpenEditDrawer = () => {
    if (!selectedProcess) return;

    if (selectedProcess.status !== "Chờ duyệt") {
      message.warning("Chỉ có thể cập nhật đơn ở trạng thái 'Chờ duyệt'!");
      return;
    }

    // Đảm bảo giá trị hợp lệ khi mở drawer
    setStartDate(selectedProcess.start_time ? dayjs(selectedProcess.start_time) : null);
    setEndDate(selectedProcess.end_time ? dayjs(selectedProcess.end_time) : null);

    form.setFieldsValue({
      production_name: selectedProcess.production_name,
      note: selectedProcess.note,
      start_time: selectedProcess.start_time ? dayjs(selectedProcess.start_time) : null,
      end_time: selectedProcess.end_time ? dayjs(selectedProcess.end_time) : null,
    });

    setIsEditModalOpen(true); // Biến này giờ để mở Drawer thay vì Modal
  };

  useEffect(() => {
    if (selectedProcess && isEditModalOpen) {
      form.setFieldsValue({
        production_name: selectedProcess.production_name,
        note: selectedProcess.note,
      });
    }
  }, [isEditModalOpen, selectedProcess, form]);

  // Cập nhật thông tin đơn
  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const updatedData = {
        production_name: values.production_name,
        start_time: startDate ? startDate.toISOString() : null, // Dùng state
        end_time: endDate ? endDate.toISOString() : null, // Dùng state
        note: values.note,
      };
      const access_token = user?.access_token;
      await updateProductionRequest({
        id: selectedProcess._id,
        dataUpdate: updatedData,
        token: access_token,
      });

      message.success("Cập nhật thành công!");
      setIsEditModalOpen(false);
      setIsDrawerOpen(false);
      refetch();
    } catch (error) {
      message.error("Cập nhật thất bại, vui lòng thử lại.");
    }
  };

  // Xử lý duyệt đơn
  const handleApprove = async () => {
    Modal.confirm({
      title: "Xác nhận duyệt quy trình?",
      content: "Bạn có chắc muốn duyệt quy trình này không?",
      onOk: async () => {
        try {
          const access_token = user?.access_token;
          await approveProductionProcessing({ id: selectedProcess._id, token: access_token });
          message.success("Duyệt quy trình thành công!");
          setIsDrawerOpen(false);
          refetch();
        } catch (error) {
          message.error("Duyệt thất bại, vui lòng thử lại.");
        }
      },
    });
  };

  const columns = [
    {
      title: "Mã quy trình",
      dataIndex: "_id",
      key: "_id",
    },
    {
      title: "Tên quy trình",
      dataIndex: "production_name",
      key: "production_name",
    },
    {
      title: "Bắt đầu",
      dataIndex: "start_time",
      key: "start_time",
      sorter: true,
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Kết thúc",
      dataIndex: "end_time",
      key: "end_time",
      sorter: true,
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default"; // Màu mặc định
        if (status === "Chờ duyệt") color = "gold"; // Vàng
        if (status === "Đang sản xuất") color = "green"; // Xanh lá
        if (status === "Hoàn thành") color = "blue"; // Tím
    
        return <Tag color={color} style={{ fontWeight: 600 }}>{status}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} type="link" onClick={() => handleViewDetail(record)}>
            Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="production-processing-list">
      <h5 className="text-2xl font-bold text-gray-800">Danh sách quy trình sản xuất</h5>

      <Loading isPending={isLoading}>
        <Table
          columns={columns}
          dataSource={data?.map((item) => ({ ...item, key: item._id })) || []}
          pagination={{ pageSize: 10 }}
        />
      </Loading>

      {/* Drawer Chi Tiết */}
      <Drawer
        title="Chi tiết quy trình sản xuất"
        width={600}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
      >
        {selectedProcess && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Mã quy trình">
              {selectedProcess._id}
            </Descriptions.Item>
            <Descriptions.Item label="Tên quy trình">
              {selectedProcess.production_name || selectedProcess.production_request_id.request_name}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {selectedProcess.status}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian bắt đầu">
              {selectedProcess.start_time ? moment(selectedProcess.start_time).format("DD/MM/YYYY HH:mm") : "Chưa có"}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian kết thúc">
              {selectedProcess.end_time ? moment(selectedProcess.end_time).format("DD/MM/YYYY HH:mm") : "Chưa có"}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              {selectedProcess.note || "Không có"}
            </Descriptions.Item>

            {/* Hiển thị thời gian của từng giai đoạn nếu có */}
            {selectedProcess.process_stage1_start && (
              <Descriptions.Item label="Giai đoạn 1">
                {moment(selectedProcess.process_stage1_start).format("DD/MM/YYYY HH:mm")} -{" "}
                {selectedProcess.process_stage1_end
                  ? moment(selectedProcess.process_stage1_end).format("DD/MM/YYYY HH:mm")
                  : "Chưa kết thúc"}
              </Descriptions.Item>
            )}
            {selectedProcess.process_stage2_start && (
              <Descriptions.Item label="Giai đoạn 2">
                {moment(selectedProcess.process_stage2_start).format("DD/MM/YYYY HH:mm")} -{" "}
                {selectedProcess.process_stage2_end
                  ? moment(selectedProcess.process_stage2_end).format("DD/MM/YYYY HH:mm")
                  : "Chưa kết thúc"}
              </Descriptions.Item>
            )}
            {selectedProcess.process_stage3_start && (
              <Descriptions.Item label="Giai đoạn 3">
                {moment(selectedProcess.process_stage3_start).format("DD/MM/YYYY HH:mm")} -{" "}
                {selectedProcess.process_stage3_end
                  ? moment(selectedProcess.process_stage3_end).format("DD/MM/YYYY HH:mm")
                  : "Chưa kết thúc"}
              </Descriptions.Item>
            )}
            {selectedProcess.process_stage4_start && (
              <Descriptions.Item label="Giai đoạn 4">
                {moment(selectedProcess.process_stage4_start).format("DD/MM/YYYY HH:mm")} -{" "}
                {selectedProcess.process_stage4_end
                  ? moment(selectedProcess.process_stage4_end).format("DD/MM/YYYY HH:mm")
                  : "Chưa kết thúc"}
              </Descriptions.Item>
            )}
            {selectedProcess.process_stage5_start && (
              <Descriptions.Item label="Giai đoạn 5">
                {moment(selectedProcess.process_stage5_start).format("DD/MM/YYYY HH:mm")} -{" "}
                {selectedProcess.process_stage5_end
                  ? moment(selectedProcess.process_stage5_end).format("DD/MM/YYYY HH:mm")
                  : "Chưa kết thúc"}
              </Descriptions.Item>
            )}
            {selectedProcess.process_stage6_start && (
              <Descriptions.Item label="Giai đoạn 6">
                {moment(selectedProcess.process_stage6_start).format("DD/MM/YYYY HH:mm")} -{" "}
                {selectedProcess.process_stage6_end
                  ? moment(selectedProcess.process_stage6_end).format("DD/MM/YYYY HH:mm")
                  : "Chưa kết thúc"}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}

        <Space style={{ marginTop: 16, width: "100%" }}>
          {selectedProcess?.status === "Chờ duyệt" && (
            <Button type="primary" icon={<EditOutlined />} onClick={handleOpenEditDrawer} style={{ flex: 1 }}>
              Cập nhật
            </Button>
          )}

          {selectedProcess?.status === "Chờ duyệt" && (
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleApprove} style={{ flex: 1 }}>
              Duyệt
            </Button>
          )}
        </Space>
      </Drawer>


      {/* Drawer Cập Nhật */}
      <Drawer
        title="Cập nhật quy trình sản xuất"
        width={500}
        onClose={() => setIsEditModalOpen(false)}
        open={isEditModalOpen}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên quy trình"
            name="production_name"
            rules={[{ required: true, message: "Vui lòng nhập tên quy trình!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Ngày bắt đầu"
            name="start_time"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              value={startDate}
              onChange={(date) => setStartDate(date)}
              disabledDate={(current) => current && current < moment().startOf("day")}
            />
          </Form.Item>

          <Form.Item
            label="Ngày kết thúc"
            name="end_time"
            dependencies={["start_time"]}
            rules={[
              { required: true, message: "Vui lòng chọn ngày kết thúc!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue("start_time") || value.isAfter(getFieldValue("start_time"))) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Ngày kết thúc phải sau ngày bắt đầu!"));
                },
              }),
            ]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              value={endDate}
              onChange={(date) => setEndDate(date)}
              disabledDate={(current) => {
                return current && startDate && current.isBefore(startDate);
              }}
            />
          </Form.Item>

          <Form.Item label="Ghi chú" name="note">
            <TextArea rows={3} />
          </Form.Item>
          <Space>
            <Button type="primary" onClick={handleUpdate}>Lưu</Button>
            <Button onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
          </Space>
        </Form>
      </Drawer>



    </div>
  );
};

export default ProductionProcessingList;
