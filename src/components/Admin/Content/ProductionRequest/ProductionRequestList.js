import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Input,
  Space,
  Tag,
  Button,
  Form,
  InputNumber,
  DatePicker,
  Select,
  message,
  Modal, // Thêm import Modal
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useQuery, useMutation } from "@tanstack/react-query";
import Highlighter from "react-highlight-words";
import moment from "moment";
import axios from "axios";
import dayjs from "dayjs";
import { convertDateStringV1 } from "../../../../ultils";
import Loading from "../../../LoadingComponent/Loading";
import DrawerComponent from "../../../DrawerComponent/DrawerComponent";
import * as ProductionRequestServices from "../../../../services/ProductionRequestServices";
import { useNavigate } from "react-router-dom";

import { HiOutlineDocumentSearch } from "react-icons/hi";
import { MdDelete } from "react-icons/md";

// Hàm lấy danh sách nhiên liệu
export const getAllFuelType = async () => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/fuel-management/getAll`
  );
  return res?.data; // Giả sử { success, requests: [...] }
};

const statusColors = {
  "Chờ duyệt": "gold",
  "Đang sản xuất": "blue",
  "Đã Hoàn Thành": "purple",
  "Đã duyệt": "green",
  "Vô hiệu hóa": "gray",
};

const ProductionRequestList = () => {
  const user = useSelector((state) => state.user);

  // State quản lý Drawer & chế độ Edit
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form để bind data khi chỉnh sửa
  const [form] = Form.useForm();

  const navigate = useNavigate();

  // Search
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  // Danh sách nhiên liệu
  const [fuelLoading, setFuelLoading] = useState(false);
  const [fuelTypes, setFuelTypes] = useState([]);

  // Lấy danh sách nhiên liệu 1 lần
  useEffect(() => {
    const fetchFuelTypes = async () => {
      setFuelLoading(true);
      try {
        const data = await getAllFuelType();
        setFuelTypes(data.requests || []);
      } catch (error) {
        message.error("Có lỗi xảy ra khi tải danh sách nhiên liệu.");
      } finally {
        setFuelLoading(false);
      }
    };
    fetchFuelTypes();
  }, []);

  // 1. FETCH danh sách đơn (GET)
  const fetchProductionRequests = async () => {
    const access_token = user?.access_token;
    const dataRequest = {};
    const res = await ProductionRequestServices.getAll({
      access_token,
      dataRequest,
    });
    // Giả sử BE trả về { success, status, requests }
    return res.requests; // Mảng requests
  };

  const {
    isLoading,
    data,
    error,
    isError,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ["production_requests"],
    queryFn: fetchProductionRequests,
    retry: false,
  });

  if (isError) {
    console.log("Lỗi:", error);
  }

  const tableData = Array.isArray(data)
    ? data.map((req) => ({ ...req, key: req._id }))
    : [];

  // 2. MUTATION cập nhật (PATCH)
  const mutationUpdate = useMutation({
    mutationFn: ProductionRequestServices.updateProductionRequest,
    onSuccess: (dataResponse) => {
      if (dataResponse?.success) {
        message.success("Cập nhật đơn thành công!");
        refetchRequests();
        setIsEditMode(false);
        setIsDrawerOpen(false);
      } else {
        message.error("Cập nhật đơn thất bại!");
      }
    },
    onError: (err) => {
      console.log("Update error:", err);
      message.error("Có lỗi xảy ra khi cập nhật!");
    },
  });

  // 3. Mutation xóa
  const mutationDelete = useMutation({
    mutationFn: ProductionRequestServices.deleteProductionRequest,
    onSuccess: (dataResponse) => {
      if (dataResponse?.success) {
        message.success("Xóa đơn thành công!");
        refetchRequests(); // gọi lại để cập nhật danh sách
      } else {
        message.error("Xóa đơn thất bại!");
      }
    },
    onError: (err) => {
      console.log("Delete error:", err);
      message.error("Có lỗi xảy ra khi xóa!");
    },
  });

  //  “duyệt” (chỉ đổi trạng thái)

  const handleApprove = (record) => {
    ProductionRequestServices.changeStatus({
      access_token: user?.access_token,
      id: record._id,
    })
      .then((res) => {
        if (res?.success) {
          message.success("Đã duyệt thành công!");
          refetchRequests();
          setIsDrawerOpen(false);
        } else {
          message.error("Duyệt thất bại!");
        }
      })
      .catch((err) => {
        console.log(err);
        message.error("Có lỗi xảy ra!");
      });
  };

  // Hàm gọi API xóa
  const handleDelete = (record) => {
    mutationDelete.mutate({
      id: record._id,
      token: user?.access_token,
    });
  };

  // Hàm hiển thị popup confirm
  const confirmDelete = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa đơn sản xuất này?",
      okText: "Đồng ý",
      cancelText: "Hủy",
      onOk: () => handleDelete(record),
    });
  };

  // Tìm tồn kho nhiên liệu hiện tại
  const getAvailableFuel = () => {
    const materialId = form.getFieldValue("material");
    if (!materialId) return 0;
    const found = fuelTypes.find((ft) => ft._id === materialId);
    return found ? found.quantity : 0;
  };

  // Tính toán nguyên liệu khi thay đổi số lượng thành phẩm
  const handleProductQuantityChange = (value) => {
    if (!value || value < 1) {
      form.setFieldsValue({ material_quantity: 0 });
      return;
    }
    // ví dụ: needed = product / 0.9
    const needed = Math.ceil(value / 0.9);

    const available = getAvailableFuel();
    if (available > 0 && needed > available) {
      // Vượt quá
      const maxProduction = Math.floor(available * 0.9);
      message.warning(
        `Sản lượng mong muốn vượt quá số nhiên liệu. Sản lượng tối đa là ${maxProduction} Kg.`
      );
      form.setFieldsValue({
        product_quantity: maxProduction,
        material_quantity: Math.ceil(maxProduction / 0.9),
      });
      return;
    }
    // set needed
    form.setFieldsValue({ material_quantity: needed });
  };

  // Khi đổi loại nhiên liệu -> tính lại
  const handleFuelChange = () => {
    const productQty = form.getFieldValue("product_quantity");
    if (productQty) {
      handleProductQuantityChange(productQty);
    }
  };

  // Không cho chọn ngày sản xuất ở quá khứ
  const disabledProductionDate = (current) => {
    return current && current < moment().startOf("day");
  };

  // Không cho chọn ngày kết thúc trước ngày sản xuất
  const disabledEndDate = (current) => {
    const productionDate = form.getFieldValue("production_date");
    if (!productionDate) {
      return current && current < moment().startOf("day");
    }
    return current && current.isBefore(productionDate, "day");
  };

  // Khi bấm Lưu
  const handleSaveUpdate = () => {
    form
      .validateFields()
      .then((values) => {
        // Chuyển DatePicker -> ISO
        if (values.production_date) {
          values.production_date = values.production_date.toISOString();
        }
        if (values.end_date) {
          values.end_date = values.end_date.toISOString();
        }

        // Gọi API update
        mutationUpdate.mutate({
          id: selectedRequest._id,
          token: user?.access_token,
          dataUpdate: values,
        });
      })
      .catch((err) => {
        console.log("Validate Failed:", err);
      });
  };

  // Search
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

  // Cấu hình cột
  const columns = [
    {
      title: "Tên đơn",
      dataIndex: "request_name",
      key: "request_name",
      ...getColumnSearchProps("request_name"),
      sorter: (a, b) => a.request_name.localeCompare(b.request_name),
    },
    {
      title: <div className="text-center">K.l Thành phẩm (Kg)</div>,
      dataIndex: "product_quantity",
      key: "product_quantity",
      align: "center",
      className: "text-center",
      sorter: (a, b) => a.product_quantity - b.product_quantity,
      render: (val) => `${val}`,
    },
    {
      title: <div className="text-center">K.l Nguyên liệu (Kg)</div>,
      dataIndex: "material_quantity",
      key: "material_quantity",
      align: "center",
      className: "text-center",
      sorter: (a, b) => a.material_quantity - b.material_quantity,
      render: (val) => `${val} `,
    },
    {
      title: <div className="text-center">Ngày bắt đầu</div>,
      dataIndex: "production_date",
      key: "production_date",
      align: "center",
      className: "text-center",
      sorter: (a, b) =>
        new Date(a.production_date) - new Date(b.production_date),
      render: (date) => convertDateStringV1(date),
    },
    {
      title: <div className="text-center">Ngày kết thúc</div>,
      dataIndex: "end_date",
      key: "end_date",
      align: "center",
      className: "text-center",
      sorter: (a, b) => new Date(a.end_date) - new Date(b.end_date),
      render: (date) => convertDateStringV1(date),
    },
    {
      title: <div className="text-center">Trạng thái</div>,
      dataIndex: "status",
      align: "center",
      className: "text-center",
      key: "status",
      filters: [
        { text: "Chờ duyệt", value: "Chờ duyệt" },
        { text: "Đã duyệt", value: "Đã duyệt" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (stt) => <Tag color={statusColors[stt] || "default"}>{stt}</Tag>,
    },
    {
      title: <div className="text-center">Hành động</div>,
      key: "action",
      render: (record) => (
        <div className="flex justify-center items-center gap-2">
          <div
            className=" text-black gap-2 cursor-pointer hover:bg-gray-200  rounded-lg transition-all duration-200 "
            onClick={() => handleViewDetail(record)}
          >
            <Button
              icon={<HiOutlineDocumentSearch style={{ color: "dodgerblue" }} />}
              size="middle"
            />
          </div>
          {record.status === "Chờ duyệt" && (
            <Button
              icon={<MdDelete style={{ color: "red" }} />}
              onClick={() => confirmDelete(record)}
              disabled={record.status !== "Chờ duyệt"}
              loading={mutationDelete.isLoading}
              size="middle"
            />
          )}
        </div>
      ),
    },
  ];

  // Mở Drawer (Xem / Chỉnh sửa)
  const handleViewDetail = (record) => {
    setSelectedRequest(record);
    setIsDrawerOpen(true);
    setIsEditMode(false);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedRequest(null);
    setIsEditMode(false);
  };

  // Bấm “Chỉnh sửa”
  const handleEdit = () => {
    setIsEditMode(true);

    form.setFieldsValue({
      request_name: selectedRequest?.request_name,
      request_type: selectedRequest?.request_type,
      product_quantity: selectedRequest?.product_quantity,
      material_quantity: selectedRequest?.material_quantity,
      production_date: selectedRequest?.production_date
        ? dayjs(selectedRequest.production_date).startOf("day")
        : null,
      end_date: selectedRequest?.end_date
        ? dayjs(selectedRequest.end_date).startOf("day")
        : null,
      status: selectedRequest?.status,
      note: selectedRequest?.note,
      material: selectedRequest?.material,
    });
  };

  // Bấm “Hủy”
  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  return (
    <div className="production-request-list">
      <div className="mb-4">
        <div className="absolute">
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
        </div>
        <h5 className="content-title font-bold text-2xl text-center">
          Danh sách yêu cầu sản xuất
        </h5>
      </div>

      <Loading isPending={isLoading || fuelLoading}>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={{ pageSize: 6 }}
        />
      </Loading>

      <DrawerComponent
        title="Chi tiết đơn sản xuất"
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        placement="right"
        width="40%"
      >
        {/* Chế độ XEM CHI TIẾT */}
        {selectedRequest && !isEditMode && (
          <div className="">
            {/* <h2 className="text-xl font-bold uppercase text-gray-800 text-center mb-4">
      Thông tin chi tiết
    </h2> */}

            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="grid grid-cols-2 gap-0">
                <div className="bg-gray-100 font-semibold p-3 border border-gray-300 text-left">
                  Tên đơn
                </div>
                <div className="p-3 border border-gray-300">
                  {selectedRequest.request_name}
                </div>

                <div className="bg-gray-100 font-semibold p-3 border border-gray-300 text-left">
                  Loại đơn
                </div>
                <div className="p-3 border border-gray-300">
                  {selectedRequest.request_type}
                </div>

                <div className="bg-gray-100 font-semibold p-3 border border-gray-300 text-left">
                  Nhiên liệu (ID)
                </div>
                <div className="p-3 border border-gray-300">
                  {selectedRequest.material}
                </div>

                <div className="bg-gray-100 font-semibold p-3 border border-gray-300 text-left">
                  Thành phẩm (Kg)
                </div>
                <div className="p-3 border border-gray-300">
                  {selectedRequest.product_quantity} Kg
                </div>

                <div className="bg-gray-100 font-semibold p-3 border border-gray-300 text-left">
                  Nguyên liệu (Kg)
                </div>
                <div className="p-3 border border-gray-300">
                  {selectedRequest.material_quantity} Kg
                </div>

                <div className="bg-gray-100 font-semibold p-3 border border-gray-300 text-left">
                  Ngày sản xuất
                </div>
                <div className="p-3 border border-gray-300">
                  {convertDateStringV1(selectedRequest.production_date)}
                </div>

                <div className="bg-gray-100 font-semibold p-3 border border-gray-300 text-left">
                  Ngày kết thúc
                </div>
                <div className="p-3 border border-gray-300">
                  {convertDateStringV1(selectedRequest.end_date)}
                </div>

                <div className="bg-gray-100 font-semibold p-3 border border-gray-300 text-left">
                  Trạng thái
                </div>
                <div className="p-3 border border-gray-300">
                  <Tag
                    color={statusColors[selectedRequest.status] || "default"}
                  >
                    {selectedRequest.status}
                  </Tag>
                </div>

                {selectedRequest.note && (
                  <>
                    <div className="bg-gray-100 font-semibold p-3 border border-gray-300 text-left">
                      Ghi chú
                    </div>
                    <div className="p-3 border border-gray-300 whitespace-pre-wrap">
                      {selectedRequest.note}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Nút Chỉnh Sửa / Duyệt */}
            <div className="flex justify-center gap-4 mt-6">
              <Button
                type="primary"
                className="px-6 py-2 text-lg"
                onClick={handleEdit}
              >
                Chỉnh sửa
              </Button>
              {selectedRequest.status === "Chờ duyệt" && (
                <Button
                  type="default"
                  className="px-6 py-2 text-lg"
                  onClick={() => handleApprove(selectedRequest)}
                >
                  Duyệt
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Chế độ CHỈNH SỬA */}
        {selectedRequest && isEditMode && (
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              padding: "16px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2
              style={{
                marginBottom: "16px",
                fontSize: "18px",
                fontWeight: "bold",
                textTransform: "uppercase",
                color: "#333",
              }}
            >
              Cập nhật đơn
            </h2>

            <Form form={form} layout="vertical">
              {/* Tên đơn (bắt buộc) */}
              <Form.Item
                label="Tên đơn"
                name="request_name"
                rules={[{ required: true, message: "Vui lòng nhập tên đơn" }]}
              >
                <Input />
              </Form.Item>

              {/* Loại đơn: có thể cho sửa nếu muốn */}
              <Form.Item label="Loại đơn" name="request_type">
                <Input />
              </Form.Item>

              {/* Chọn Nhiên liệu */}
              <Form.Item
                label="Nhiên liệu"
                name="material"
                rules={[
                  { required: true, message: "Vui lòng chọn nhiên liệu" },
                ]}
              >
                <Select
                  placeholder="Chọn loại nhiên liệu"
                  onChange={handleFuelChange}
                >
                  {fuelTypes.map((fuel) => (
                    <Select.Option key={fuel._id} value={fuel._id}>
                      {fuel.fuel_type_id?.type_name} (Tồn: {fuel.quantity} Kg)
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Thành phẩm -> Tự tính nguyên liệu */}
              <Form.Item
                label="Kl Thành phẩm (Kg)"
                name="product_quantity"
                rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
              >
                <InputNumber
                  className="w-full"
                  min={1}
                  onChange={handleProductQuantityChange}
                />
              </Form.Item>

              {/* Nguyên liệu (Kg) -> disabled */}
              <Form.Item label="Nguyên liệu (Kg)" name="material_quantity">
                <InputNumber className="w-full" disabled />
              </Form.Item>

              {/* Ngày sản xuất -> DatePicker */}
              <Form.Item
                label="Ngày sản xuất"
                name="production_date"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày sản xuất" },
                ]}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  className="w-full"
                  disabledDate={disabledProductionDate}
                />
              </Form.Item>

              {/* Ngày kết thúc -> DatePicker */}
              <Form.Item
                label="Ngày kết thúc"
                name="end_date"
                dependencies={["production_date"]}
                rules={[
                  { required: true, message: "Vui lòng chọn ngày kết thúc" },
                ]}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  className="w-full"
                  disabledDate={disabledEndDate}
                />
              </Form.Item>

              {/* Trạng thái -> disable */}
              <Form.Item label="Trạng thái" name="status">
                <Select disabled>
                  <Select.Option value="Chờ duyệt">Chờ duyệt</Select.Option>
                  <Select.Option value="Đang xử lý">Đang xử lý</Select.Option>
                  <Select.Option value="Từ chối">Từ chối</Select.Option>
                  <Select.Option value="Đã huỷ">Đã huỷ</Select.Option>
                  <Select.Option value="Đã Hoàn Thành">
                    Đã Hoàn Thành
                  </Select.Option>
                </Select>
              </Form.Item>

              {/* Ghi chú */}
              <Form.Item label="Ghi chú" name="note">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Form>

            <Space style={{ marginTop: 16 }}>
              <Button
                type="primary"
                onClick={handleSaveUpdate}
                loading={mutationUpdate.isLoading}
              >
                Lưu
              </Button>
              <Button
                onClick={handleCancelEdit}
                disabled={mutationUpdate.isLoading}
              >
                Hủy
              </Button>
            </Space>
          </div>
        )}
      </DrawerComponent>
    </div>
  );
};

export default ProductionRequestList;
