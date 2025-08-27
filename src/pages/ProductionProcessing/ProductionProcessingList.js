import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Input,
  Button,
  Space,
  DatePicker,
  Drawer,
  Descriptions,
  Modal,
  message,
  Form,
  Tag,
} from "antd";
import "./Order.scss";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { CheckCircleOutlined, EditOutlined } from "@ant-design/icons";
import { BsBuildingFillGear } from "react-icons/bs";


import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";

import { FaGear } from "react-icons/fa6";
import { FaGears } from "react-icons/fa6";

import {
  getAllProductionProcessing,
  approveProductionProcessing,
  approveConsolidateProcessing,
  updateProductionRequest,
  getAllConsolidateProcess,
} from "../../services/ProductionProcessingServices";
import Loading from "../../components/LoadingComponent/Loading";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import TableProcess from "../../components/Admin/Content/Order/TableUser";
import { useTranslation } from "react-i18next";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";

const { TextArea } = Input;

const ProductionProcessingList = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
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
  const [consolidateProcessData, setConsolidateProcessData] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [type_process, set_type_process] = useState("single");
  const searchInput = useRef(null);
  const statusMap = {
    "Chờ duyệt": "pending",
    "Đã duyệt": "approve",
    "Đã huỷ": "cancelled",
    "Đã hủy": "cancelled",
    "Hoàn thành": "completed",
    "Đang xử lý": "processing",
    "thất bại": "failed",
    "Vô hiệu hóa": "disable",
    "Nhập kho thành công": "imported",
    "Đang sản xuất": "in_production",
  };
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
          width: 260,
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
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="link"
              size="small"
              onClick={() => clearFilters && confirm()}
              style={{ padding: 0 }}
            >
              Đóng
            </Button>
          </div>
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

  const statusFilters = useMemo(() => {
    const statuses = new Set();
    data?.forEach((item) => {
      if (item.status) statuses.add(item.status);
    });
    return Array.from(statuses).map((status) => ({
      text: t(`status.${statusMap[status]}`) || status,
      value: status,
    }));
  }, [data, t]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const statusFromURL = queryParams.get("status");
    const typeFromURL = queryParams.get("type");

    if (statusFromURL) {
      setFilters((prev) => ({
        ...prev,
        status: statusFromURL,
      }));
    }

    if (typeFromURL === "consolidate") {
      handleLoadConsolidate();
    } else {
      set_type_process("single");
    }
  }, [location.search]);



  const dataForExport = useMemo(() => {
    return (data || []).map((item) => ({
      _id: item._id,
      production_name: item.production_name,
      start_time: item.start_time
        ? moment(item.start_time).format("DD/MM/YYYY HH:mm")
        : "",
      end_time: item.end_time
        ? moment(item.end_time).format("DD/MM/YYYY HH:mm")
        : "",
      status: item.status,
      processed_quantity: item.processed_quantity ?? "",
      waste_quantity: item.waste_quantity ?? "",
      note: item.note ?? "",
      production_request:
        item.production_request_id?.request_name ?? "Không rõ",
    }));
  }, [data]);

  const columnsExport = [
    { title: "Mã quy trình", dataIndex: "_id" },
    { title: "Tên quy trình", dataIndex: "production_name" },
    { title: "Bắt đầu", dataIndex: "start_time" },
    { title: "Kết thúc", dataIndex: "end_time" },
    { title: "Trạng thái", dataIndex: "status" },
    { title: "Đã xử lý", dataIndex: "processed_quantity" },
    { title: "Hao hụt", dataIndex: "waste_quantity" },
    { title: "Ghi chú", dataIndex: "note" },
    { title: "Yêu cầu sản xuất", dataIndex: "production_request" },
  ];

  // Mở Modal cập nhật
  const handleOpenEditDrawer = () => {
    if (!selectedProcess) return;

    if (selectedProcess.status !== "Chờ duyệt") {
      message.warning("Chỉ có thể cập nhật đơn ở trạng thái 'Chờ duyệt'!");
      return;
    }

    // Đảm bảo giá trị hợp lệ khi mở drawer
    setStartDate(
      selectedProcess.start_time ? dayjs(selectedProcess.start_time) : null
    );
    setEndDate(
      selectedProcess.end_time ? dayjs(selectedProcess.end_time) : null
    );

    form.setFieldsValue({
      production_name: selectedProcess.production_name,
      note: selectedProcess.note,
      start_time: selectedProcess.start_time
        ? dayjs(selectedProcess.start_time)
        : null,
      end_time: selectedProcess.end_time
        ? dayjs(selectedProcess.end_time)
        : null,
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
        process_type: type_process,
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

  const handleLoadConsolidate = async () => {
    set_type_process("consolidate");
    const access_token = user?.access_token;
    const response = await getAllConsolidateProcess(access_token);

    if (response?.success) {
      setConsolidateProcessData(response?.data);
    } else {
      message.error("Có lỗi trong quá trình tải dữ liệu quy trình");
    }
  };

  // Xử lý duyệt đơn
  const handleApprove = async () => {
    Modal.confirm({
      title: t("productionProcess.confirm.approveTitle"),
      content: t("productionProcess.confirm.approveContent"),
      onOk: async () => {
        try {
          // approve single process
          if (type_process === "single") {
            const access_token = user?.access_token;
            await approveProductionProcessing({
              id: selectedProcess._id,
              token: access_token,
            });
            message.success(t("productionProcess.message.approveSuccess"));
            setIsDrawerOpen(false);
            refetch();
          }
          // approve consolidate process
          if (type_process === "consolidate") {
            const access_token = user?.access_token;
            await approveConsolidateProcessing({
              id: selectedProcess._id,
              token: access_token,
            });
            message.success("Duyệt quy trình thành công!");
            setIsDrawerOpen(false);
            refetch();
          }
        } catch (error) {
          message.error(t("productionProcess.message.approveFail"));
        }
      },
    });
  };

  const columns = [
    {
      title: <div className="left">{t("productionProcess.field._id")}</div>,
      dataIndex: "_id",
      key: "_id",
      ...getColumnSearchProps("_id"),
    },
    {
      title: (
        <div className="text-left">
          {t("productionProcess.field.production_name")}
        </div>
      ),
      dataIndex: "production_name",
      key: "production_name",
      ...getColumnSearchProps("production_name"),
    },
    {
      title: t("productionProcess.field.start_time"),
      dataIndex: "start_time",
      key: "start_time",
      className: "text-center",
      sorter: true,
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: t("productionProcess.field.end_time"),
      dataIndex: "end_time",
      key: "end_time",
      className: "text-center",
      sorter: true,
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: t("productionProcess.field.status"),
      dataIndex: "status",
      key: "status",
      className: "text-center",
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

        return (
          <Tag color={color} style={{ fontWeight: 600 }}>
            {t(`status.${statusMap[status]}`) || status}
          </Tag>
        );
      },
    },
    {
      title: t("common.action"),
      key: "action",
      className: "text-center",
      render: (_, record) => (
        <Space>
          {/* Nút xem chi tiết */}
          <Button
            icon={<HiOutlineDocumentSearch style={{ fontSize: "24px" }} />}
            type="link"
            onClick={() => handleViewDetail(record)}
          />

          {/* Nút cập nhật nếu đang "Chờ duyệt" */}
          {record.status === "Chờ duyệt" && (
            <Button
              icon={<EditOutlined style={{ color: "#0e79c7" }} />}
              type="link"
              className="hover:bg-gray-200"
              onClick={() => {
                setSelectedProcess(record);
                handleOpenEditDrawer(true);
              }}
            />
          )}
        </Space>
      ),
    }

  ];

  return (
    <div className="production-processing-list">
      <div className="Main-Content px-8">
        {/* button back & title of page */}
        <div className="my-6">
          <div className="flex items-center justify-between">
            {/* Nút quay lại responsive */}
            <button
              onClick={() => navigate(-1)}
              type="button"
              className="flex items-center justify-center md:justify-start text-white font-semibold transition duration-300 shadow-sm px-2 md:px-3 py-1 bg-black hover:opacity-70 rounded-md min-w-[32px] md:min-w-[100px]"
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
              <span className="hidden md:inline">
                {t("productionProcess.button.back")}
              </span>
            </button>

            {/* Tiêu đề căn giữa */}
            <h5 className="flex justify-center items-center gap-2 text-center font-bold text-xl md:text-2xl flex-grow mx-2 text-gray-800">
              <BsBuildingFillGear></BsBuildingFillGear>
              {t("production.createdProcesses.title")}
            </h5>

            {/* Phần tử trống để cân layout */}
            <div className="min-w-[32px] md:min-w-[100px]"></div>
          </div>
        </div>

        <div className="content-main-table-user">
          <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm space-y-2 mb-2 w-full md:w-fit">
            <div>
              <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">
                <button
                  className={`
              inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
              text-sm font-medium transition-all duration-300
              ${type_process === "single"
                      ? "bg-white text-green-600 shadow-sm transform scale-105"
                      : "text-gray-600 hover:text-green-600 hover:bg-white/50"
                    }
            `}
                  onClick={() => set_type_process("single")}
                >
                  <FaGear
                    className={`text-base ${type_process === "single" ? "text-green-500" : ""
                      }`}
                  />
                  <span>{t("productionProcess.button.single")}</span>
                </button>

                <button
                  className={`
              inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
              text-sm font-medium transition-all duration-300
              ${type_process === "consolidate"
                      ? "bg-white text-green-600 shadow-sm transform scale-105"
                      : "text-gray-600 hover:text-green-600 hover:bg-white/50"
                    }
            `}
                  onClick={() => handleLoadConsolidate()}
                >
                  <FaGears
                    className={`text-base ${type_process === "consolidate" ? "text-green-500" : ""
                      }`}
                  />
                  <span>{t("productionProcess.button.consolidated")}</span>
                </button>
              </div>
            </div>
          </div>

          <Loading isPending={isLoading}>
            <TableProcess
              columns={columns}
              isLoading={isLoading}
              data={type_process === "single" ? data : consolidateProcessData}
              columnsExport={columnsExport}
              scroll={{ x: "max-content" }}
            />
          </Loading>
        </div>
      </div>

      {/* Drawer Chi Tiết */}
      <Drawer
        title={t("productionProcess.drawer.detailTitle")}
        width={600}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
      >
        {selectedProcess && (
          <Form layout="vertical" disabled>
            <div className="grid grid-cols-1 gap-2">
              <Form.Item label={t("productionProcess.field._id")} className="!mb-0">
                <Input value={selectedProcess._id} />
              </Form.Item>

              <Form.Item
                label={t("productionProcess.field.production_name")}
                className="!mb-0"
              >
                <Input
                  value={
                    selectedProcess.production_name ||
                    selectedProcess.production_request_id?.request_name
                  }
                />
              </Form.Item>

              <Form.Item label={t("form.status")} className="!mb-0">
                <div className="border border-gray-300 rounded px-2 py-1 h-[40px] flex items-center font-semibold">
                  {(() => {
                    const status = selectedProcess.status;
                    let color = "default";

                    if (status === "Chờ duyệt") color = "gold";
                    else if (status === "Đang xử lý") color = "cyan";
                    else if (status === "Từ chối") color = "red";
                    else if (status === "Đã huỷ") color = "volcano";
                    else if (status === "Đang sản xuất") color = "blue";
                    else if (status === "Hoàn thành") color = "green";

                    return (
                      <Tag color={color} style={{ fontWeight: 600 }}>
                        {t(`status.${statusMap[status]}`) || status}
                      </Tag>
                    );
                  })()}
                </div>
              </Form.Item>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Thời gian bắt đầu */}
                <Form.Item label={t("productionProcess.field.start_time")} className="!mb-0">
                  <Input
                    value={
                      selectedProcess.start_time
                        ? moment(selectedProcess.start_time).format("DD/MM/YYYY HH:mm")
                        : t("common.unknown")
                    }
                  />
                </Form.Item>

                {/* Thời gian kết thúc */}
                <Form.Item label={t("productionProcess.field.end_time")} className="!mb-0">
                  <Input
                    value={
                      selectedProcess.end_time
                        ? moment(selectedProcess.end_time).format("DD/MM/YYYY HH:mm")
                        : t("common.unknown")
                    }
                  />
                </Form.Item>
              </div>

              <Form.Item label={t("productionProcess.field.note")} className="!mb-0">
                <Input.TextArea value={selectedProcess.note || "Không có"} rows={3} />
              </Form.Item>

              {/* Các giai đoạn nếu có */}
              {[1, 2, 3, 4, 5, 6].map((stage) => {
                const startKey = `process_stage${stage}_start`;
                const endKey = `process_stage${stage}_end`;
                if (selectedProcess[startKey]) {
                  return (
                    <Form.Item
                      key={stage}
                      label={t(`productionProcess.field.stage${stage}`)}
                      className="!mb-0"
                    >
                      <Input
                        value={`${moment(selectedProcess[startKey]).format(
                          "DD/MM/YYYY HH:mm"
                        )} - ${selectedProcess[endKey]
                          ? moment(selectedProcess[endKey]).format("DD/MM/YYYY HH:mm")
                          : t("common.notEnded")
                          }`}
                      />
                    </Form.Item>
                  );
                }
                return null;
              })}
            </div>
          </Form>
        )}

        {/* Nút hành động */}
        <div className="flex justify-end items-center gap-4 mt-2">
          {selectedProcess?.status === "Chờ duyệt" && (
            <ButtonComponent
              type="approve"
              onClick={handleApprove}
            />
          )}
          <ButtonComponent
            type="close"
            onClick={() => setIsDrawerOpen(false)}
          />
        </div>
      </Drawer>

      {/* Drawer Cập Nhật */}
      <Drawer
        title={t("productionProcess.drawer.editTitle")}
        width={500}
        onClose={() => setIsEditModalOpen(false)}
        open={isEditModalOpen}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={t("productionProcess.field.production_name")}
            name="production_name"
            rules={[
              { required: true, message: "Vui lòng nhập tên quy trình!" },
            ]}
          >
            <Input />
          </Form.Item>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Form.Item
              label={t("productionProcess.field.start_time")}
              name="start_time"
              rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}
              className="!mb-0"
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                value={startDate}
                onChange={(date) => setStartDate(date)}
                disabledDate={(current) =>
                  current && current < moment().startOf("day")
                }
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              label={t("productionProcess.field.end_time")}
              name="end_time"
              dependencies={["start_time"]}
              rules={[
                { required: true, message: "Vui lòng chọn ngày kết thúc!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (
                      !value ||
                      !getFieldValue("start_time") ||
                      value.isAfter(getFieldValue("start_time"))
                    ) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Ngày kết thúc phải sau ngày bắt đầu!")
                    );
                  },
                }),
              ]}
              className="!mb-0"
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                value={endDate}
                onChange={(date) => setEndDate(date)}
                disabledDate={(current) =>
                  current && startDate && current.isBefore(startDate)
                }
                className="w-full"
              />
            </Form.Item>
          </div>

          <Form.Item label={t("productionProcess.field.note")} name="note">
            <TextArea rows={3} />
          </Form.Item>
          <div className="flex justify-end gap-3 mt-4">
            <ButtonComponent
              type="update"
              onClick={handleUpdate}
            />
            <ButtonComponent
              type="close"
              onClick={() => setIsEditModalOpen(false)}
            />
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default ProductionProcessingList;
