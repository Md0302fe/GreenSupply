import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Input,
  Space,
  Tag,
  Button,
  Form,
  Descriptions,
  InputNumber,
  message,
  Select,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import Highlighter from "react-highlight-words";
import * as RawMaterialBatchServices from "../../../../services/RawMaterialBatch";
import Loading from "../../../LoadingComponent/Loading";
import DrawerComponent from "../../../DrawerComponent/DrawerComponent";
import { useLocation } from "react-router-dom";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { VscRequestChanges } from "react-icons/vsc";

const statusColors = {
  "Đang chuẩn bị": "gold",
  "Chờ xuất kho": "blue",
  "Đã xuất kho": "green",
  "Hủy bỏ": "red",
};

const RawMaterialBatchList = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [fuel_managements, set_fuel_managements] = useState([]);
  const [requiredMaterial, setRequiredMaterial] = useState(0);
  const [isFuelSelected, setIsFuelSelected] = useState(false);
  const [storageId, setStorageId] = useState(null);

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

  const location = useLocation();

  const handleCreateExportOrder = (batchId) => {
    navigate(`/system/admin/material-storage-export?id=${batchId}`);
  };

  // Fetch danh sách lô nguyên liệu
  const fetchData = async () => {
    setLoading(true);
    try {
      const response =
        await RawMaterialBatchServices.getAllRawMaterialBatches();
      const getAllManagements =
        await RawMaterialBatchServices.getAllFuelManagements();
      if (response) {
        setFuelBatchs(response);
      }
      if (getAllManagements) {
        set_fuel_managements(getAllManagements.requests);
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách lô nguyên liệu!");
    } finally {
      setLoading(false);
    }
  };

  const fetchStorages = async () => {
    try {
      const response = await RawMaterialBatchServices.getAllStorages();
      if (
        response.success &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        setStorages(response.data); // Cập nhật state storages với dữ liệu trả về từ API
      } else {
        setStorages([]); // Nếu không có dữ liệu, gán storages là mảng trống
      }
    } catch (error) {
      message.error("Lỗi khi tải danh sách kho lưu trữ!");
      setStorages([]); // Nếu có lỗi, gán mảng trống
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

  useEffect(() => {
    if (location.state?.createdSuccess) {
      message.success("Tạo lô nguyên liệu thành công!");

      // 👉 Xoá flag để tránh message lặp nếu user refresh lại trang
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
      title: <div style={{ textAlign: "center" }}>Mã lô</div>,
      dataIndex: "batch_id",
      key: "batch_id",
      align: "center",
      ...getColumnSearchProps("batch_id"),
    },
    {
      title: <div style={{ textAlign: "center" }}>Tên lô</div>,
      dataIndex: "batch_name",
      key: "batch_name",
      align: "center",
      ...getColumnSearchProps("batch_name"),
      sorter: (a, b) => a.batch_name.localeCompare(b.batch_name),
    },
    {
      title: <div style={{ textAlign: "center" }}>Loại nguyên liệu</div>,
      dataIndex: "fuel_name",
      key: "fuel_name",
      align: "center",
      render: (text) => <div style={{}}>{text}</div>,
    },
    {
      title: <div style={{ textAlign: "center" }}>Số lượng (Kg)</div>,
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      sorter: (a, b) => a.quantity - b.quantity,
      render: (val) => <div style={{ textAlign: "center" }}>{val} Kg</div>,
    },
    {
      title: <div style={{ textAlign: "center" }}>Kho lưu trữ</div>,
      dataIndex: "name_storage",
      key: "name_storage",
      align: "center",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          {record?.fuel_type_id?.storage_id?.name_storage || "Không có"}
        </div>
      ),
    },
    {
      title: <div style={{ textAlign: "center" }}>Trạng thái</div>,
      dataIndex: "status",
      key: "status",
      align: "center",
      filters: Object.keys(statusColors).map((status) => ({
        text: status,
        value: status,
      })),
      onFilter: (value, record) => record.status === value,
      render: (stt) => (
        <div style={{ textAlign: "center" }}>
          <Tag color={statusColors[stt] || "default"}>{stt}</Tag>
        </div>
      ),
    },
    {
      title: <div style={{ textAlign: "center" }}>Hành động</div>,
      key: "action",
      align: "center",
      render: (record) => (
        <div style={{ textAlign: "center" }}>
          {record.status === "Đang chuẩn bị" ? (
            <Button
              type="link"
              icon={<VscRequestChanges style={{ fontSize: 20 }} />}
              onClick={() => handleCreateExportOrder(record._id)}
            />
          ) : null}
          <Button
            type="link"
            icon={<HiOutlineDocumentSearch style={{ fontSize: 20 }} />}
            onClick={() => handleViewDetail(record)}
          />
        </div>
      ),
    },
  ];

  const handleViewDetail = (record) => {
    setSelectedBatch(record);
    setIsEditMode(false); // Đảm bảo chế độ xem chi tiết không phải chỉnh sửa
    setIsDrawerOpen(true); // Mở Drawer
    form.resetFields(); // Reset form khi mở Drawer
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false); // Đóng Drawer
    setIsEditMode(false); // Reset chế độ chỉnh sửa
    setSelectedBatch(null); // Reset selectedBatch khi đóng Drawer
  };

  const handleEdit = (record) => {
    if (record.status !== "Đang chuẩn bị") {
      message.error("Chỉ được chỉnh sửa lô ở trạng thái 'Đang chuẩn bị'");
      return;
    }

    setSelectedBatch(record);
    setIsEditMode(true); // Chuyển sang chế độ chỉnh sửa
    setIsDrawerOpen(true); // Mở Drawer

    form.setFieldsValue({
      batch_id: record.batch_id,
      batch_name: record.batch_name,
      fuel_type_id: record.fuel_type_id?.fuel_type_id?.type_name,
      quantity: record.quantity,
      storage_id: record.fuel_type_id?.storage_id?._id || storages[0]?._id,
      status: record.status,
      note: record.note,
    });

    // Nếu không có storage_id trong record, bạn cần xác nhận là có ít nhất 1 kho lưu trữ trong `storages`
    if (!record.fuel_type_id?.storage_id && storages.length > 0) {
      setStorageId(storages[0]._id); // Gán storageId mặc định
    }
  };

  const handleSaveUpdate = () => {
    form
      .validateFields()
      .then((values) => {
        if (!values.fuel_type_id || !values.storage_id) {
          message.error(
            "Vui lòng chọn đầy đủ thông tin loại nguyên liệu và kho lưu trữ!"
          );
          return;
        }

        const dataUpdate = {
          ...selectedBatch,
          ...values,
          storage_id: storageId || storages[0]?._id,
        };

        console.log("Dữ liệu gửi đi:", dataUpdate);

        const { access_token } = user;
        if (!access_token) {
          message.error("Token không hợp lệ.");
          return;
        }

        // Gọi API cập nhật
        RawMaterialBatchServices.updateRawMaterialBatch(selectedBatch._id, {
          formData: dataUpdate,
          access_token,
        })
          .then((res) => {
            message.success("Cập nhật thành công!");
            fetchData(); // Reload lại danh sách
            form.resetFields(); // Reset form sau khi cập nhật
            setSelectedBatch(null); // Reset selectedBatch
            setIsDrawerOpen(false);
            setIsEditMode(false); // Tắt chế độ chỉnh sửa
          })
          .catch((error) => {
            console.error("Lỗi khi cập nhật:", error);
            message.error("Cập nhật thất bại!");
          });
      })
      .catch((err) => {
        message.error("Vui lòng điền đầy đủ thông tin!");
      });
  };

  const handleFuelTypeChange = (batch_id) => {
    setSelectedBatch((prev) => ({
      ...prev,
      fuel_type_id: batch_id?.fuel_type_id,
    }));
    setIsFuelSelected(true);
  };

  const handleChangeStorage = (value) => {
    setStorageId(value);
  };

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
      message.error("Sản lượng không hợp lệ! Vui lòng nhập một số hợp lệ.");
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
          message.warning(
            `Sản lượng mong muốn vượt quá số lượng Nguyên liệu hiện có...`
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

  return (
    <div className="raw-material-batch-list">
      <div className="flex items-center justify-between mb-4 relative">
        {/* Nút Quay lại */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-0 flex items-center bg-blue-500 text-white font-semibold py-1 px-3 rounded-md shadow-sm hover:bg-blue-600 transition duration-300"
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
        </button>

        {/* Tiêu đề căn giữa */}
        <h5 className="text-4xl font-bold text-gray-800 text-center flex-1">
          Quản lý Lô Nguyên Liệu
        </h5>
        {/* Nút tạo ở bên phải */}
        <div
          className="absolute right-0 flex gap-2 mt-2"
          style={{ top: "65%", transform: "translateY(20%)" }}
        >
          {/* <Button
            type="primary"
            className="bg-blue-600 font-semibold text-white hover:bg-blue-700 py-2 rounded-md px-4"
            onClick={() => navigate("/system/admin/raw-material-batch")}
          >
            Tạo lô bổ sung
          </Button> */}
          <Button
            type="primary"
            className="bg-blue-600 font-semibold text-white hover:bg-blue-700 py-2 rounded-md px-4"
            onClick={() => navigate("/system/admin/material-storage-export")}
          >
            Tạo đơn xuất kho
          </Button>
        </div>
      </div>
      <Loading isPending={loading}>
        <div className="mt-10">
          {" "}
          {/* 👈 thêm margin top ở đây */}
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={{ pageSize: 6 }}
          />
        </div>
      </Loading>
      <DrawerComponent
        title={
          isEditMode ? "Cập nhật Lô Nguyên Liệu" : "Chi tiết Lô Nguyên Liệu"
        }
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        placement="right"
        width="40%"
      >
        {selectedBatch && (
          <>
            {isEditMode ? (
              <>
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    batch_id: selectedBatch?.batch_id,
                    batch_name: selectedBatch?.batch_name,
                    fuel_type_id: selectedBatch?.fuel_type_id,
                    quantity: selectedBatch?.quantity,
                    storage_id: selectedBatch?.fuel_type_id?.storage_id,
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
                    rules={[
                      { required: true, message: "Vui lòng nhập tên lô" },
                    ]}
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
                    <Select
                      placeholder="Chọn loại Nguyên liệu"
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
                    {/* <Select placeholder="Chọn loại nguyên liệu" onChange={handleFuelTypeChange}>
                      {fuelBatchs?.map((fuel) => (
                        // <Select.Option key={fuel._id} value={fuel?.fuel_type_id?._id}>
                        //   {fuel?.fuel_type_id?.fuel_type_id?.type_name} (
                        //   {fuel.quantity} Kg)
                        // </Select.Option>
                        
                      ))}
                    </Select> */}
                    {console.log("Fuel Batchs: ", fuelBatchs)}
                  </Form.Item>

                  {/* Nhập số lượng */}
                  <Form.Item
                    label="Sản lượng mong muốn (Kg)"
                    name="quantity"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập sản lượng mong muốn!",
                      },
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

                  {/* Kho Lưu Trữ */}
                  <Form.Item
                    label="Kho Lưu Trữ"
                    name="storage_id"
                    rules={[
                      { required: true, message: "Vui lòng chọn kho lưu trữ" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn kho lưu trữ"
                      onChange={handleChangeStorage}
                      value={storageId || storages[0]?._id}
                    >
                      {storages.map((storage) => (
                        <Select.Option key={storage._id} value={storage._id}>
                          {storage?.name_storage}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  {/* Trạng Thái */}
                  <Form.Item label="Trạng Thái" name="status">
                    <Input value={selectedBatch?.status} disabled />
                  </Form.Item>

                  {/* Ghi chú */}
                  <Form.Item label="Ghi chú" name="note">
                    <Input.TextArea rows={4} />
                  </Form.Item>

                  {/* Các nút thao tác */}
                  <div className="flex justify-center gap-4 mt-4">
                    <Button
                      onClick={() => {
                        setIsEditMode(false); // Chuyển về chế độ xem chi tiết
                      }}
                      type="default"
                    >
                      Quay lại chi tiết
                    </Button>
                    <Button
                      onClick={handleSaveUpdate} // Gọi hàm lưu dữ liệu khi bấm Lưu
                      type="primary"
                    >
                      Lưu
                    </Button>
                    <Button onClick={handleCloseDrawer}>Đóng</Button>
                  </div>
                </Form>
              </>
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
              {!isEditMode && selectedBatch?.status === "Đang chuẩn bị" && (
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

      {/* messageContainer */}
      <messageContainer
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

export default RawMaterialBatchList;
