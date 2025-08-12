import React, { useEffect, useRef, useState } from "react";
import {
  Table,
  Button,
  message,
  Space,
  Tag,
  Input,
  Drawer,
  Form,
  Upload,
} from "antd";
import axios from "axios";
import {
  DownloadOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import Highlighter from "react-highlight-words";
import { Excel } from "antd-table-saveas-excel";
import { EditOutlined } from "@ant-design/icons";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import DrawerComponent from "../../../DrawerComponent/DrawerComponent";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ButtonComponent from "../../../ButtonComponent/ButtonComponent";

const FuelList = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [fuels, setFuels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFuel, setSelectedFuel] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [isDeletedFilter, setIsDeletedFilter] = useState(null); // Filter by is_deleted
  const searchInput = useRef(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingFuel, setEditingFuel] = useState(null);
  const [updateData, setUpdateData] = useState({
    type_name: "",
    description: "",
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUpdateDrawerOpen, setIsUpdateDrawerOpen] = useState(false);

  const userRedux = useSelector((state) => state.user);
  const token = userRedux?.access_token || localStorage.getItem("access_token");

  // Fetch fuel data
  const fetchFuels = async () => {
    setLoading(true);
    try {
      if (!token) {
        message.error("Bạn chưa đăng nhập! Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/fuel/getAll`
      );
      if (response.data.success) {
        const transformedFuels = response.data.requests.map((item) => ({
          _id: item._id,
          fuel_type_id: item.fuel_type_id,
          type_name:
            item.fuel_type_id?.type_name || t("fuelList.no_data_to_export"),
          description:
            item.fuel_type_id?.description ||
            t("fuelList.drawer.no_description"),
          is_deleted: item.is_deleted,
          quantity: item.quantity,
          storage_id: item.storage_id?._id || "",
          storage_name:
            item.storage_id?.name_storage || t("fuelList.no_data_to_export"),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }));
        console.log("Danh sách Nguyên liệu:", transformedFuels);
        setFuels(transformedFuels);
      } else {
        message.error(t("fuelList.fetch_fail"));
      }
    } catch (error) {
      message.error(t("fuelList.update_error"));
      console.log(error);
    }
    setLoading(false);
  };
  const openUpdateModal = (fuel) => {
    setEditingFuel(fuel);
    setUpdateData({ type_name: fuel.type_name, description: fuel.description });
    setIsUpdateModalOpen(true);
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

  const handleUpdate = async () => {
    try {
      if (updateData.type_name.trim() === "") {
        message.error(t("fuelList.form.empty_name"));
        return;
      }

      const payload = {
        type_name: updateData.type_name,
        description: updateData.description,
        quantity: updateData.quantity,
        image: updateData.newImage || editingFuel.fuel_type_id?.image, // có thể gửi base64 hoặc URL nếu BE cần
      };

      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/fuel/update/${editingFuel._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        message.success(t("fuelList.create_success"));
        fetchFuels(); // load lại danh sách
        setIsUpdateDrawerOpen(false);
      } else {
        message.error(t("fuelList.create_fail"));
      }
    } catch (error) {
      message.error(t("fuelList.update_error"));
    }
  };

  const handleCancelFuel = async (id) => {
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/fuel/cancel/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        message.success(t("fuelList.delete_success"));
        setFuels((prev) =>
          prev.map((fuel) =>
            fuel._id === id ? { ...fuel, is_deleted: true } : fuel
          )
        );
      } else {
        message.error(t("fuelList.delete_fail"));
      }
    } catch (error) {
      message.error(t("fuelList.update_error"));
    }
  };

  useEffect(() => {
    fetchFuels();
  }, []);

  // Handle Search
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await getBase64(file);
      setUpdateData((prev) => ({
        ...prev,
        newImage: base64, // lưu luôn base64
      }));
    }
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={t("fuelList.searchPlaceholder")}
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
            style={{ width: 90 }}
          >
            {t("fuelList.searchButton")}
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            {t("fuelList.resetButton")}
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => clearFilters && confirm()}
          >
            {t("fuelList.closeButton")}
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toLowerCase().includes(value.toLowerCase()),
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

  // Handle export to Excel
  const handleExportFileExcel = () => {
    if (!fuels.length) {
      message.warning(t("fuelList.no_data_to_export"));
      return;
    }

    const excel = new Excel();
    const exportColumns = [
      { title: t("fuelList.columns.type_name"), dataIndex: "type_name" },
      { title: t("fuelList.columns.description"), dataIndex: "description" },
      { title: t("fuelList.columns.quantity"), dataIndex: "is_deleted" },
      { title: t("fuelList.columns.status"), dataIndex: "quantity" },
    ];

    const exportData = fuels.map((fuel) => ({
      type_name: fuel.type_name,
      description: fuel.description,
      is_deleted: fuel.is_deleted
        ? t("fuelList.status.deleted")
        : t("fuelList.status.active"),
      quantity: fuel.quantity,
    }));

    excel
      .addSheet("Danh sách Loại Nguyên liệu")
      .addColumns(exportColumns)
      .addDataSource(exportData)
      .saveAs("DanhSachLoaiNhienLieu.xlsx");
  };

  const openUpdateDrawer = (fuel) => {
    setEditingFuel(fuel);
    setUpdateData({
      type_name: fuel.type_name,
      description: fuel.description,
      quantity: fuel.quantity,
    });
    setIsUpdateDrawerOpen(true); // Mở Drawer cập nhật
  };
  const showFuelDetails = (fuel) => {
    console.log("Dữ liệu Nguyên liệu:", fuel); // Debug dữ liệu
    setSelectedFuel(fuel);
    setIsDrawerOpen(true);
  };

  // Columns definition
  const columns = [
    {
      title: t("fuelList.columns.type_name"),
      dataIndex: "type_name",
      key: "type_name",
      width: 150,
      ...getColumnSearchProps("type_name"),
      sorter: (a, b) => a.type_name.localeCompare(b.type_name),
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          {t("fuelList.columns.image")}
        </div>
      ),
      dataIndex: "fuel_type_id",
      key: "image",
      width: 100,
      align: "center",
      render: (fuel_type_id) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {fuel_type_id?.image ? (
            <img
              src={fuel_type_id.image}
              alt="fuel"
              style={{
                width: "100%",
                height: "auto",
                objectFit: "cover",
                borderRadius: 6,
              }}
            />
          ) : (
            <i>{t("fuelList.drawer.no_image")}</i>
          )}
        </div>
      ),
    },
    {
      title: t("fuelList.columns.description"),
      dataIndex: "description",
      key: "description",
      width: 300,
      align: "left",
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          {t("fuelList.columns.quantity")}
        </div>
      ),
      dataIndex: "quantity",
      key: "quantity",
      className: "text-center",
      width: 100,
      sorter: (a, b) => a.quantity - b.quantity,
      align: "center",
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          {t("fuelList.columns.status")}
        </div>
      ),
      dataIndex: "is_deleted",
      key: "is_deleted",
      className: "text-center",
      width: 80,
      filters: [
        { text: t("fuelList.status.deleted"), value: true },
        { text: t("fuelList.status.active"), value: false },
      ],
      onFilter: (value, record) => record.is_deleted === value,
      align: "center",
      render: (is_deleted) => (
        <Tag color={is_deleted ? "red" : "green"}>
          {is_deleted
            ? t("fuelList.status.deleted")
            : t("fuelList.status.active")}
        </Tag>
      ),
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          {t("fuelList.columns.actions")}
        </div>
      ),
      key: "action",
      width: 100,
      align: "center",
      render: (_, record) => (
        <div className="text-center">
          <Space>
            <Button
              type="link"
              icon={<HiOutlineDocumentSearch style={{ fontSize: "20px" }} />}
              onClick={() => showFuelDetails(record)}
            />
            <Button
              type="link"
              icon={<EditOutlined style={{ fontSize: "18px" }} />}
              onClick={() => openUpdateDrawer(record)}
            />
          </Space>
        </div>
      ),
    },
  ];

  return (
    <div className="fuel-list px-8">
      <div className="flex items-center justify-between mt-6 mb-4">
        {/* Nút quay lại bên trái */}
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
          <span className="hidden md:inline">{t("fuelList.back")}</span>
        </Button>

        {/* Tiêu đề căn giữa */}
        <h2 className="text-center font-bold text-[20px] md:text-2xl flex-grow mx-4 mt-1 mb-1 text-gray-800">
          {t("fuelList.title")}
        </h2>

        {/* Phần tử trống bên phải để cân bằng nút quay lại */}
        <div className="min-w-[20px] md:min-w-[100px]"></div>
      </div>

      <div className="flex justify-end mb-2">
        <Button
          type="primary"
          className="mb-1"
          icon={<DownloadOutlined />}
          onClick={handleExportFileExcel}
          style={{ backgroundColor: "#1e90ff", borderColor: "#1e90ff" }}
        >
          {t("export_excel")}
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={fuels?.filter((fuel) =>
          isDeletedFilter !== null ? fuel.is_deleted === isDeletedFilter : true
        )}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
      />

      <DrawerComponent
        title={t("fuelList.drawer.details_title")}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedFuel(null);
        }}
        placement="right"
        width={drawerWidth}
      >
        {selectedFuel ? (
          <Form layout="vertical" disabled>
            <div className="grid grid-cols-1 gap-4">
              {/* Tên loại nguyên liệu */}
              <Form.Item
                label={t("fuelList.columns.type_name")}
                className="!mb-0"
              >
                <Input
                  value={
                    selectedFuel.type_name || t("fuelList.no_data_to_export")
                  }
                />
              </Form.Item>

              {/* Ảnh nguyên liệu */}
              <Form.Item label={t("fuelList.drawer.image")} className="!mb-0">
                {selectedFuel.fuel_type_id?.image ? (
                  <img
                    src={selectedFuel.fuel_type_id.image}
                    alt={selectedFuel.type_name}
                    style={{
                      width: "100%",
                      maxHeight: 200,
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <i>{t("fuelList.drawer.no_image")}</i>
                )}
              </Form.Item>

              {/* Mô tả */}
              <Form.Item
                label={t("fuelList.columns.description")}
                className="!mb-0"
              >
                <Input.TextArea
                  rows={3}
                  value={
                    selectedFuel.description ||
                    t("fuelList.drawer.no_description")
                  }
                />
              </Form.Item>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
                {/* Số lượng */}
                <Form.Item
                  label={t("fuelList.form.placeholder_quantity")}
                  className="!mb-0"
                >
                  <Input
                    value={
                      selectedFuel.quantity ?? t("fuelList.no_data_to_export")
                    }
                  />
                </Form.Item>

                {/* Trạng thái xóa */}
                <Form.Item
                  label={t("fuelList.drawer.delete_status")}
                  className="!mb-0"
                >
                  <div className="border border-gray-300 rounded px-2 py-1 h-[32px] flex items-center ">
                    <Tag color={selectedFuel.is_deleted ? "red" : "green"}>
                      {selectedFuel.is_deleted
                        ? t("fuelList.status.deleted")
                        : t("fuelList.status.active")}
                    </Tag>
                  </div>
                </Form.Item>
              </div>

              {/* Kho */}
              <Form.Item label={t("fuelList.drawer.storage")} className="!mb-0">
                <Input
                  value={
                    selectedFuel.storage_name ?? t("fuelList.no_data_to_export")
                  }
                />
              </Form.Item>

              {/* Ngày tạo & Ngày cập nhật */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Form.Item
                  label={t("fuelList.drawer.created_at")}
                  className="!mb-0"
                >
                  <Input
                    value={new Date(selectedFuel.createdAt).toLocaleString()}
                  />
                </Form.Item>

                <Form.Item
                  label={t("fuelList.drawer.updated_at")}
                  className="!mb-0"
                >
                  <Input
                    value={new Date(selectedFuel.updatedAt).toLocaleString()}
                  />
                </Form.Item>
              </div>
            </div>
          </Form>
        ) : (
          <p className="text-center text-gray-500">
            {t("fuelList.drawer.loading")}
          </p>
        )}

        {/* Nút đóng */}
        <div className="flex justify-end mt-6">
          <ButtonComponent
            type="close"
            onClick={() => setIsDrawerOpen(false)}
          />
        </div>
      </DrawerComponent>

      <Drawer
        title={
          <div style={{ textAlign: "center" }}>
            {t("fuelList.drawer.update_title")}
          </div>
        }
        open={isUpdateDrawerOpen}
        onClose={() => {
          setIsUpdateDrawerOpen(false);
          setEditingFuel(null);
        }}
        placement="right"
        width={drawerWidth}
      >
        {editingFuel ? (
          <Form layout="vertical">
            {/* Cập nhật hình ảnh */}
            <Form.Item label={t("fuelList.columns.image")}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                {updateData?.newImage ? (
                  <img
                    src={updateData.newImage}
                    alt="preview"
                    style={{
                      width: 200,
                      height: 200,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                ) : editingFuel.fuel_type_id?.image ? (
                  <img
                    src={editingFuel.fuel_type_id.image}
                    alt="fuel"
                    style={{
                      width: 200,
                      height: 200,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <i>{t("fuelList.drawer.no_image")}</i>
                )}

                <Upload
                  beforeUpload={async (file) => {
                    const base64 = await getBase64(file);
                    setUpdateData((prev) => ({ ...prev, newImage: base64 }));
                    return false;
                  }}
                  maxCount={1}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>
                    {t("fuelList.drawer.upload_image")}
                  </Button>
                </Upload>
              </div>
            </Form.Item>
            {/* Tên loại nguyên liệu */}
            <Form.Item label={t("fuelList.columns.type_name")}>
              <Input
                value={updateData.type_name}
                onChange={(e) =>
                  setUpdateData({ ...updateData, type_name: e.target.value })
                }
              />
            </Form.Item>

            {/* Mô tả */}
            <Form.Item label={t("fuelList.columns.description")}>
              <Input.TextArea
                value={updateData.description}
                rows={3}
                onChange={(e) =>
                  setUpdateData({ ...updateData, description: e.target.value })
                }
              />
            </Form.Item>

            {/* Số lượng */}
            <Form.Item label={t("fuelList.form.placeholder_quantity")}>
              <Input
                value={updateData.quantity}
                inputMode="numeric"
                min={1}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setUpdateData({ ...updateData, quantity: value });
                  }
                }}
              />
            </Form.Item>

            {/* Nút hành động */}
            <div className="flex justify-end mt-2">
              <Space>
                <ButtonComponent type="update" onClick={handleUpdate} />
                <ButtonComponent
                  type="close"
                  onClick={() => setIsUpdateDrawerOpen(false)}
                />
              </Space>
            </div>
          </Form>
        ) : (
          <p>{t("fuelList.drawer.loading")}</p>
        )}
      </Drawer>
    </div>
  );
};

export default FuelList;
