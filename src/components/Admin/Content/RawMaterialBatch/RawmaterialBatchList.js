import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Input,
  Space,
  Tag,
  Button,
  Modal,
  message,
  Form,
  Descriptions,
  InputNumber,
  Select,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import Highlighter from "react-highlight-words";
import { toast } from "react-toastify";
import * as RawMaterialBatchServices from "../../../../services/RawMaterialBatch";
import Loading from "../../../LoadingComponent/Loading";
import DrawerComponent from "../../../DrawerComponent/DrawerComponent";

const statusColors = {
  "Đang chuẩn bị": "gold",
  "Đã duyệt": "green",
  "Đang xử lý": "blue",
  "Hoàn thành": "purple",
  "Đã xóa": "red",
};

const RawMaterialBatchList = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  // Drawer state
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form cho chỉnh sửa
  const [form] = Form.useForm();
  const [isEditMode, setIsEditMode] = useState(false);
  const [storages, setStorages] = useState([]);

  // Search state
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [fuelBatchs, setFuelBatchs] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchInput = useRef(null);

  // Fetch danh sách lô nguyên liệu
  const fetchData = async () => {
    setLoading(true);
    try {
      const response =
        await RawMaterialBatchServices.getAllRawMaterialBatches();
      console.log(response);
      if (response) {
        setFuelBatchs(response);
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách lô nguyên liệu!");
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  const fetchStorages = async () => {
    try {
      const response = await RawMaterialBatchServices.getAllStorages();
      if (response && Array.isArray(response)) {
        setStorages(response);
      } else {
        setStorages([]);
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách kho lưu trữ!");
      setStorages([]);
    }
  };

  useEffect(() => {
    fetchData(); // Để lấy lô nguyên liệu
    fetchStorages(); // Để lấy kho lưu trữ
  }, []);

  // Gọi API khi component mount hoặc khi có thay đổi
  useEffect(() => {
    fetchData();
  }, []);
  console.log("fuelBatchs => ", fuelBatchs);
  const tableData = Array.isArray(fuelBatchs)
    ? fuelBatchs.map((batch) => ({
        ...batch,
        key: batch._id,
        fuel_name: batch?.fuel_type_id?.fuel_type_id?.type_name,
      }))
    : [];

  // Search trong bảng
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
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Tìm kiếm`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
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
            onClick={() => confirm()}
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

  const columns = [
    {
      title: "Mã lô",
      dataIndex: "batch_id",
      key: "batch_id",
      ...getColumnSearchProps("batch_id"),
    },
    {
      title: "Tên lô",
      dataIndex: "batch_name",
      key: "batch_name",
      ...getColumnSearchProps("batch_name"),
      sorter: (a, b) => a.batch_name.localeCompare(b.batch_name),
    },
    {
      title: "Loại nguyên liệu",
      dataIndex: "fuel_name",
      key: "fuel_name",
    },
    {
      title: "Số lượng (Kg)",
      dataIndex: "quantity",
      key: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
      render: (val) => `${val} Kg`,
    },
    {
      title: "Kho lưu trữ",
      dataIndex: "name_storage",
      key: "name_storage",
      render: (_, record) =>
        record?.fuel_type_id?.storage_id?.name_storage || "Không có",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: Object.keys(statusColors).map((status) => ({
        text: status,
        value: status,
      })),
      onFilter: (value, record) => record.status === value,
      render: (stt) => <Tag color={statusColors[stt] || "default"}>{stt}</Tag>,
    },
    {
      title: "Hành động",
      key: "action",
      render: (record) => (
        <Space>
          <Button type="link" onClick={() => handleViewDetail(record)}>
            Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const handleViewDetail = (record) => {
    setSelectedBatch(record);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedBatch(null);
  };

  const handleEdit = (record) => {
    setSelectedBatch(record);
    setIsEditMode(true);
    setIsDrawerOpen(true);
    form.setFieldsValue({
      batch_id: record.batch_id,
      batch_name: record.batch_name,
      fuel_type_id: record.fuel_type_id?._id,
      quantity: record.quantity,
      storage_id: record.fuel_type_id?.storage_id?._id,
      status: record.status,
      note: record.note,
    });
  };

  const handleSaveUpdate = () => {
    form
      .validateFields()
      .then((values) => {
        const dataUpdate = { ...selectedBatch, ...values };
        // API gọi cập nhật lô nguyên liệu ở đây
        RawMaterialBatchServices.updateRawMaterialBatch(dataUpdate)
          .then((res) => {
            toast.success("Cập nhật thành công!");
            fetchData();
            setIsDrawerOpen(false);
            setIsEditMode(false); // Tắt chế độ chỉnh sửa
          })
          .catch((error) => {
            toast.error("Cập nhật thất bại!");
          });
      })
      .catch((err) => {
        toast.error("Vui lòng điền đầy đủ thông tin!");
      });
  };

  console.log(
    "Có dữ liệu: ",
    selectedBatch?.fuel_type_id?.fuel_type_id.type_name
  );

  return (
    <div className="raw-material-batch-list">
      <div className="flex justify-between items-center mb-4">
        <h5 className="text-2xl font-bold text-gray-800">
          Quản lý Lô Nguyên Liệu
        </h5>
        <div className="flex gap-4">
          <Button
            type="primary"
            className="bg-blue-600 font-semibold text-white hover:bg-blue-700 py-3 rounded-md flex items-center gap-2 px-6"
            onClick={() => navigate("/system/admin/raw-material-batch")}
          >
            Tạo lô bổ sung
          </Button>
          <Button
            type="primary"
            className="bg-blue-600 font-semibold text-white hover:bg-blue-700 py-3 rounded-md flex items-center gap-2 px-4"
            onClick={() => navigate("/system/admin/material-storage-export")}
          >
            Tạo đơn xuất kho
          </Button>
        </div>
      </div>

      <Loading isPending={loading}>
        <Table columns={columns} dataSource={tableData} />
      </Loading>

      {/* <DrawerComponent
        title="Chi tiết Lô Nguyên Liệu"
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        placement="right"
        width="30%"
      >
        {selectedBatch ? (
          <>
            <Descriptions bordered column={1}>
              <Descriptions.Item
                label={<span className="font-bold text-black">Mã Lô</span>}
              >
                {selectedBatch.batch_id || "Không có"}
              </Descriptions.Item>
              <Descriptions.Item
                label={<span className="font-bold text-black">Tên Lô</span>}
              >
                {selectedBatch.batch_name || "Không có"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="font-bold text-black">Loại Nguyên Liệu</span>
                }
              >
                {selectedBatch?.fuel_type_id?.fuel_type_id?.type_name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="font-bold text-black">Số Lượng (Kg)</span>
                }
              >
                {selectedBatch.quantity} Kg
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="font-bold text-black">Kho Lưu Trữ</span>
                }
              >
                {selectedBatch?.fuel_type_id?.storage_id?.name_storage ||
                  "Không có"}
              </Descriptions.Item>
              <Descriptions.Item
                label={<span className="font-bold text-black">Ghi chú</span>}
              >
                {selectedBatch.note || "Không có"}
              </Descriptions.Item>
              <Descriptions.Item
                label={<span className="font-bold">Trạng Thái</span>}
              >
                <Tag
                  color={statusColors[selectedBatch.status]}
                  className="text-orange-500 font-semibold"
                >
                  {selectedBatch.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <div className="flex justify-center mt-4">
              <Button
                type="primary"
                // onClick={() => handleEdit(selectedBatch)} // Gọi hàm chỉnh sửa
                className="bg-blue-600 text-white"
              >
                Chỉnh sửa
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        )}
      </DrawerComponent> */}

      <DrawerComponent
        title={
          isEditMode ? "Cập nhật Lô Nguyên Liệu" : "Chi tiết Lô Nguyên Liệu"
        }
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        placement="right"
        width="30%"
      >
        {selectedBatch && (
          <>
            {isEditMode ? (
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  batch_id: selectedBatch?.batch_id, // Giá trị mã lô được lấy từ selectedBatch
                  batch_name: selectedBatch?.batch_name,
                  fuel_type_id: selectedBatch?.fuel_type_id,
                  quantity: selectedBatch?.quantity,
                  storage_id: selectedBatch?.storage_id?._id,
                  status: selectedBatch?.status,
                  note: selectedBatch?.note,
                }}
                onFinish={handleSaveUpdate}
              >
                {/* Mã Lô - Disabled vì không cần chỉnh sửa */}
                <Form.Item
                  label="Mã Lô"
                  name="batch_id"
                  rules={[{ required: true, message: "Vui lòng nhập mã lô" }]}
                >
                  <Input disabled />
                </Form.Item>

                {/* Tên Lô */}
                <Form.Item
                  label="Tên Lô"
                  name="batch_name"
                  rules={[{ required: true, message: "Vui lòng nhập tên lô" }]}
                >
                  <Input />
                </Form.Item>

                {/* Loại Nguyên Liệu */}
                <Form.Item
                  label="Loại Nguyên Liệu"
                  name="fuel_type_id"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn loại nguyên liệu",
                    },
                  ]}
                >
                  <Select placeholder="Chọn loại nhiên liệu">
                    {fuelBatchs?.map((fuel) => (
                      <Select.Option key={fuel._id} value={fuel._id}>
                        {console.log("Có API hay không?: ", fuel.fuel_type_id?.type_name)}
                        {fuel?.fuel_type_id?.fuel_type_id?.type_name} ({fuel.quantity} Kg)
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Số lượng */}
                <Form.Item
                  label="Số lượng (Kg)"
                  name="quantity"
                  rules={[
                    { required: true, message: "Vui lòng nhập số lượng" },
                  ]}
                >
                  <InputNumber min={1} />
                </Form.Item>

                {/* Kho Lưu Trữ */}
                <Form.Item
                  label="Kho Lưu Trữ"
                  name="storage_id"
                  rules={[
                    { required: true, message: "Vui lòng chọn kho lưu trữ" },
                  ]}
                >
                  <Select placeholder="Chọn kho lưu trữ">
                    {Array.isArray(storages) &&
                      storages.map((storage) => (
                        <Select.Option key={storage._id} value={storage._id}>
                          {storage.name_storage}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>

                {/* Trạng Thái */}
                <Form.Item
                  label="Trạng Thái"
                  name="status"
                  rules={[
                    { required: true, message: "Vui lòng chọn trạng thái" },
                  ]}
                >
                  <Select placeholder="Chọn trạng thái">
                    <Select.Option value="Đang chuẩn bị">
                      Đang chuẩn bị
                    </Select.Option>
                    <Select.Option value="Đã duyệt">Đã duyệt</Select.Option>
                    <Select.Option value="Đang xử lý">Đang xử lý</Select.Option>
                    <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
                    <Select.Option value="Đã xóa">Đã xóa</Select.Option>
                  </Select>
                </Form.Item>

                {/* Ghi chú */}
                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea rows={4} />
                </Form.Item>

                {/* Các nút thao tác */}
                <div className="flex justify-center gap-4 mt-4">
                  <Button type="primary" htmlType="submit">
                    Lưu
                  </Button>
                  <Button onClick={handleCloseDrawer}>Hủy</Button>
                </div>
              </Form>
            ) : (
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Mã Lô">
                  {selectedBatch.batch_id}
                </Descriptions.Item>
                <Descriptions.Item label="Tên Lô">
                  {selectedBatch.batch_name}
                </Descriptions.Item>
                <Descriptions.Item label="Loại Nguyên Liệu">
                  {selectedBatch?.fuel_type_id?.fuel_type_id?.type_name ||
                    "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Số Lượng (Kg)">
                  {selectedBatch.quantity}
                </Descriptions.Item>
                <Descriptions.Item label="Kho Lưu Trữ">
                  {selectedBatch.fuel_type_id?.storage_id?.name_storage ||
                    "Không có"}
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú">
                  {selectedBatch.note || "Không có"}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng Thái">
                  <Tag color={statusColors[selectedBatch.status]}>
                    {selectedBatch.status}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            )}

            {/* Nút chỉnh sửa */}
            <div className="flex justify-center mt-4">
              {!isEditMode && (
                <Button
                  type="primary"
                  onClick={() => handleEdit(selectedBatch)}
                  className="bg-blue-600 text-white"
                >
                  Chỉnh sửa
                </Button>
              )}
            </div>
          </>
        )}
      </DrawerComponent>
    </div>
  );
};

export default RawMaterialBatchList;
