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
import { AiFillEdit } from "react-icons/ai";
import Highlighter from "react-highlight-words";
import * as RawMaterialBatchServices from "../../../../services/RawMaterialBatch";
import Loading from "../../../LoadingComponent/Loading";
import DrawerComponent from "../../../DrawerComponent/DrawerComponent";
import { useLocation } from "react-router-dom";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { VscRequestChanges } from "react-icons/vsc";
import { useTranslation } from "react-i18next";
import { converDateString } from "../../../../ultils";
import ButtonComponent from "../../../ButtonComponent/ButtonComponent";


const statusColors = {
  "Đang chuẩn bị": "gold",
  "Chờ xuất kho": "blue",
  "Đã xuất kho": "green",
  "Hủy bỏ": "red",
};

const RawMaterialBatchList = () => {
  const { t } = useTranslation();

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
  const statusMap = {
    "Đang chuẩn bị": "status.preparing",
    "Chờ xuất kho": "status.waitingExport",
    "Đã xuất kho": "status.exported",
    "Hủy bỏ": "status.cancelled",
  };
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
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 70 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => confirm()}
            style={{ padding: 0 }}
          >
            Close
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
      title: (
        <div style={{ textAlign: "left" }}>{t("materialBatch.batchId")}</div>
      ),
      dataIndex: "batch_id",
      key: "batch_id",
      align: "center",
      ...getColumnSearchProps("batch_id"),
    },
    // {
    //   title: (
    //     <div style={{ textAlign: "left" }}>
    //       {t("materialBatch.batchName")}
    //     </div>
    //   ),
    //   dataIndex: "batch_name",
    //   key: "batch_name",
    //   align: "center",
    //   ...getColumnSearchProps("batch_name"),
    //   sorter: (a, b) => a.batch_name.localeCompare(b.batch_name),
    // },
    {
      title: (
        <div style={{ textAlign: "left" }}>{t("materialBatch.fuelType")}</div>
      ),
      dataIndex: "fuel_name",
      key: "fuel_name",
      align: "center",
      render: (text) => <div style={{}}>{text}</div>,
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>{t("materialBatch.quantity")}</div>
      ),
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      sorter: (a, b) => a.quantity - b.quantity,
      render: (val) => <div style={{ textAlign: "center" }}>{val} Kg</div>,
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>{t("materialBatch.storage")}</div>
      ),
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
      title: (
        <div style={{ textAlign: "center" }}>{t("materialBatch.status")}</div>
      ),
      dataIndex: "status",
      key: "status",
      align: "center",
      filters: Object.keys(statusColors).map((status) => ({
        text: t(statusMap[status]),
        value: status,
      })),
      onFilter: (value, record) => record.status === value,
      render: (stt) => (
        <div style={{ textAlign: "center" }}>
          <Tag color={statusColors[stt] || "default"}>
            {t(statusMap[stt] || stt)}
          </Tag>
        </div>
      ),
    },
    {
      title: <div style={{ textAlign: "center" }}>{t("common.action")}</div>,
      key: "action",
      align: "center",
      render: (record) => (
        <div className="flex justify-center items-center gap-2">
          {/* Tạo phiếu xuất */}
          {record.status === "Đang chuẩn bị" && (
            <Button
              type="link"
              icon={<VscRequestChanges style={{ fontSize: 20 }} />}
              onClick={() => handleCreateExportOrder(record._id)}
            />
          )}

          {/* Xem chi tiết */}
          <Button
            type="link"
            icon={<HiOutlineDocumentSearch style={{ fontSize: 20 }} />}
            onClick={() => handleViewDetail(record)}
          />

          {/* Cập nhật */}
          {record.status === "Đang chuẩn bị" && (
            <Button
              type="link"
              icon={<AiFillEdit style={{ color: "#0e79c7" }} />}
              className="hover:bg-gray-200"
              onClick={() => {
                setSelectedBatch(record);
                setIsEditMode(true);
                setIsDrawerOpen(true);
              }}
            />
          )}
        </div>
      ),
    }
  ];

  const handleViewDetail = (record) => {
    setSelectedBatch(record);
    console.log(selectedBatch);
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
  console.log("Selected batch:", selectedBatch);
  return (
    <div className="md:px-8">
      <div className="raw-material-batch-list my-3">
        <div
          style={{ marginBottom: 24, marginTop: 24 }}
          className="flex items-center justify-between"
        >
          {/* Nút Quay lại */}
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
            <span className="hidden md:inline">{t("fuelStorage.back")}</span>
          </Button>

          {/* Title căn giữa */}
          <h5 className="text-center font-bold text-2xl md:text-2xl flex-grow mx-4 text-gray-800">
            {t("materialBatch.title")}
          </h5>

          {/* Phần tử trống bên phải để cân bằng */}
          <div className="min-w-[20px] md:min-w-[100px]"></div>
        </div>

        {/* Hàng 2: Nút Tạo */}
        <div className="flex justify-end my-2">
          <Button
            type="primary"
            className="bg-blue-600 font-semibold text-white hover:bg-blue-700 py-2 rounded-md px-2 md:px-4"
            onClick={() => navigate("/system/admin/material-storage-export")}
          >
            {t("materialBatch.createExportOrder")}
          </Button>
        </div>
      </div>
      <Loading isPending={loading}>
        <div className="">
          {" "}
          {/* 👈 thêm margin top ở đây */}
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={{ pageSize: 6 }}
            scroll={{ x: "max-content" }}
          />
        </div>
      </Loading>
      <DrawerComponent
  title={
    isEditMode
      ? t("materialBatch.updateTitle")
      : t("materialBatch.detailTitle")
  }
  isOpen={isDrawerOpen}
  onClose={handleCloseDrawer}
  placement="right"
  width={drawerWidth}
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
              createdAt: converDateString(selectedBatch?.createdAt),
              updatedAt: converDateString(selectedBatch?.updatedAt),
            }}
            onFinish={handleSaveUpdate}
          >
            <Form.Item label={t("materialBatch.batchId")} name="batch_id" rules={[{ required: true, message: t("validation.requiredBatchId") }]} className="!mb-1">
              <Input disabled />
            </Form.Item>

            <Form.Item label={t("materialBatch.batchName")} name="batch_name" rules={[{ required: true, message: t("validation.requiredBatchName") }]} className="!mb-1">
              <Input />
            </Form.Item>

            <Form.Item label={t("materialBatch.fuelType")} name="fuel_type_id" rules={[{ required: true, message: t("validation.requiredFuelType") }]} className="!mb-1">
              <Select
                placeholder={t("materialBatch.selectFuelType")}
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
            </Form.Item>

            <Form.Item label={t("materialBatch.estimatedProduction")} name="quantity" rules={[{ required: true, message: t("validation.requiredProductionOrder") }]} className="!mb-1">
              <InputNumber
                min={null}
                className="w-full rounded border-gray-300"
                placeholder={t("materialBatch.enterEstimatedProduction")}
                onChange={handleEstimatedProductionChange}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  const currentValue = form.getFieldValue("quantity");
                  if (!currentValue) {
                    form.setFieldsValue({ quantity: null });
                  }
                }}
                disabled={!isFuelSelected}
              />
            </Form.Item>

            <Form.Item label={t("materialBatch.requiredMaterialEstimate")} className="!mb-1">
              <InputNumber disabled className="w-full rounded border-gray-300 bg-gray-50" value={requiredMaterial} />
            </Form.Item>

            <Form.Item label={t("materialBatch.storage")} name="storage_id" rules={[{ required: true, message: t("validation.requiredStorage") }]} className="!mb-1">
              <Select
                placeholder={t("materialBatch.selectStorage")}
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

            <Form.Item label={t("materialBatch.status")} name="status" className="!mb-1">
              <Input value={selectedBatch?.status} disabled />
            </Form.Item>

            <Form.Item label={t("materialBatch.note")} name="note" className="!mb-1">
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item label={t("materialBatch.createdAt")} name="createdAt" className="!mb-1">
              <Input disabled />
            </Form.Item>

            <Form.Item label={t("materialBatch.updatedAt")} name="updatedAt" className="!mb-1">
              <Input disabled />
            </Form.Item>

            <div className="flex justify-end gap-3 mt-6">
              <ButtonComponent type="update" onClick={handleSaveUpdate} />
              <ButtonComponent type="close" onClick={handleCloseDrawer} />
            </div>
          </Form>
        </>
      ) : (
        <Form layout="vertical" disabled>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Form.Item label={t("materialBatch.batchId")} className="md:col-span-2 !mb-1">
              <Input value={selectedBatch.batch_id} />
            </Form.Item>

            <Form.Item label={t("materialBatch.batchName")} className="md:col-span-2 !mb-1">
              <Input value={selectedBatch.batch_name} />
            </Form.Item>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:col-span-2">
              <Form.Item label={t("materialBatch.fuelType")} className="!mb-1">
                <Input value={selectedBatch?.fuel_type_id?.fuel_type_id?.type_name || "N/A"} />
              </Form.Item>

              <Form.Item label={t("materialBatch.quantity")} className="!mb-1">
                <Input value={selectedBatch.quantity} />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:col-span-2">
              <Form.Item label={t("materialBatch.storage")} className="!mb-1">
                <Input value={selectedBatch.fuel_type_id?.storage_id?.name_storage || "N/A"} />
              </Form.Item>

              <Form.Item label={t("materialBatch.status")} className="!mb-1">
                <div className="border border-gray-300 rounded px-2 py-1 h-[32px] flex items-center">
                  <Tag color={statusColors[selectedBatch.status]}>
                    {t(statusMap[selectedBatch.status] || selectedBatch.status)}
                  </Tag>
                </div>
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:col-span-2">
              <Form.Item label={t("materialBatch.createdAt")} className="!mb-1">
                <Input value={converDateString(selectedBatch.createdAt)} />
              </Form.Item>

              <Form.Item label={t("materialBatch.updatedAt")} className="!mb-1">
                <Input value={converDateString(selectedBatch.updatedAt)} />
              </Form.Item>
            </div>

            <Form.Item label={t("materialBatch.note")} className="md:col-span-2 !mb-1">
              <Input.TextArea value={selectedBatch.note || "N/A"} rows={3} />
            </Form.Item>
          </div>
        </Form>
      )}

      {!isEditMode && (
        <div className="flex justify-end mt-2">
          <ButtonComponent type="close" onClick={handleCloseDrawer} />
        </div>
      )}
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
