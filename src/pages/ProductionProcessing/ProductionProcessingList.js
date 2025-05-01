import React, { useEffect, useState, useRef } from "react";
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
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { CheckCircleOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { getAllProductionProcessing, approveProductionProcessing, updateProductionRequest } from "../../services/ProductionProcessingServices";
import Loading from "../../components/LoadingComponent/Loading";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";


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

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div
        style={{
          padding: 8,
          backgroundColor: "#f9f9f9",
          borderRadius: 4,
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
          width: 220,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder="Tìm kiếm"
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
            borderRadius: 4,
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 70 }}
          >
            Tìm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 70 }}
          >
            Đặt lại
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => clearFilters && confirm()}
            style={{ padding: 0 }}
          >
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });
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

  const location = useLocation();

  const statusFilters = React.useMemo(() => {
    const statuses = new Set();
    data?.forEach((item) => {
      if (item.status) statuses.add(item.status);
    });
    return Array.from(statuses).map(status => ({
      text: status,
      value: status
    }));
  }, [data]);


  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const statusFromURL = queryParams.get("status");

    if (statusFromURL) {
      setFilters((prev) => ({
        ...prev,
        status: statusFromURL,
      }));
    }
  }, [location.search]);

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
      ...getColumnSearchProps("_id"),
    },
    {
      title: "Tên quy trình",
      dataIndex: "production_name",
      key: "production_name",
      ...getColumnSearchProps("production_name"),
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
      filters: statusFilters,
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        let color = "default";
        if (status === "Chờ duyệt") color = "gold";
        else if (status === "Đang xử lý") color = "cyan";
        else if (status === "Từ chối") color = "red";
        else if (status === "Đã huỷ") color = "volcano";
        else if (status === "Đang sản xuất") color = "blue";
        else if (status === "Hoàn thành") color = "green";

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
      <h5 className="text-2xl font-bold text-gray-800">Danh sách kế hoạch sản xuất</h5>

      <Loading isPending={isLoading}>
        <Table
          columns={columns}
          dataSource={data?.map((item) => ({ ...item, key: item._id })) || []}
          pagination={{ pageSize: 6 }}
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
