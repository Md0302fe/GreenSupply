import React, { useState } from "react";
import { Button, Form, Input, Modal, Table, Tag, Space, message } from "antd";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as FuelSupplyRequestService from "../../../services/FuelSupplyRequestService";
import * as FuelEntryServices from "../../../services/FuelEntryServices";
import { converDateString } from "../../../ultils";
import Loading from "../../../components/LoadingComponent/Loading";
import DrawerComponent from "../../../components/DrawerComponent/DrawerComponent";
import { IoDocumentText } from "react-icons/io5";
import { SearchOutlined } from "@ant-design/icons";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import Highlighter from "react-highlight-words";
import { useRef } from "react";
import { AiFillEdit } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import Shop from "../../../assets/NewProject/Icon-GreenSupply/shop-illustration.webp";
import { convertPrice } from "../../../ultils";

const ProvideRequestManagement = () => {
  const user = useSelector((state) => state.user);
  const [rowSelected, setRowSelected] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [quantityRemain, setQuantityRemain] = useState(null);
  const [formUpdate] = Form.useForm();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const fetchGetAllRequests = async () => {
    const access_token = user?.access_token;
    const user_id = user?.id;

    const res = await FuelSupplyRequestService.getAllFuelSupplyRequest(
      access_token,
      user_id
    );
    return res;
  };

  const { data: fuelRequests, isLoading } = useQuery({
    queryKey: ["fuelRequests"],
    queryFn: () => fetchGetAllRequests(),
  });

  const selectedRequest = fuelRequests?.find(
    (request) => request._id === rowSelected
  ) || {
    fuel_name: "",
    quantity: 0,
    note: "",
    status: "",
    supplier_id: "",
    updatedAt: "",
  };

  const mutationUpdate = useMutation({
    mutationFn: ({ id, data }) =>
      FuelSupplyRequestService.updateFuelSupplyRequest(id, data),
    onSuccess: () => {
      message.success("Cập nhật thành công!");
      queryClient.invalidateQueries("fuelRequests");
      handleCancelUpdate();
    },
    onError: () => {
      message.error("Cập nhật thất bại!");
    },
  });

  // Mutation for Deleting Fuel Request
  const mutationDelete = useMutation({
    mutationFn: (id) => FuelSupplyRequestService.deleteFuelRequest(id),
    onSuccess: () => {
      message.success("Yêu cầu đã bị xóa!");
      queryClient.invalidateQueries("fuelRequests");
      setIsOpenDelete(false);
    },
    onError: () => {
      message.error("Xóa thất bại!");
    },
  });

  // Handle Confirm Delete Request
  const handleConfirmDelete = () => {
    mutationDelete.mutate(rowSelected);
  };

  const onFinishUpdate = (values) => {
    mutationUpdate.mutate({ id: rowSelected, data: values });
  };

  // Handle Cancel Edit Drawer
  const handleCancelUpdate = () => {
    formUpdate.resetFields();
    setIsDrawerOpen(false);
  };

  // Open Drawer and Set Selected Request
  const handleEdit = async (record) => {
    setRowSelected(record._id);
    try {
      const res = await FuelEntryServices.getFuelEntryDetail(record.request_id);
      if (res) {
        setIsDrawerOpen(true);
        formUpdate.setFieldsValue({
          fuel_name: record.fuel_name,
          quantity: record.quantity,
          note: record.note || "",
          price: record.price,
        });
        console.log(res);
        // Save `quantity_remain` in state for validation later
        setQuantityRemain(res.res.quantity_remain);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleViewDetail = async (record) => {
    try {
      console.log("Calling API to get details for request ID:", record._id);
      const res = await FuelSupplyRequestService.getFuelSupplyRequestById(
        user?.access_token,
        record._id
      );
      console.log("Response from API:", res);
      if (res) {
        setDetailData({
          ...res,
          total_price: res.price * res.quantity,
        });
        setIsDetailDrawerOpen(true);
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    }
  };

  const getStatusClasses = (status) => {
    if (status === "Chờ duyệt") return "bg-yellow-100 text-yellow-800";
    if (status === "Đã duyệt") return "bg-green-100 text-green-800";
    if (status === "Đã hủy") return "bg-red-100 text-red-800";
    if (status === "Đang xử lý") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  // Hàm cập nhật tổng giá
  const updateTotalPrice = (quantity, price) => {
    // Kiểm tra nếu số lượng và giá hợp lệ
    if (!isNaN(quantity) && !isNaN(price) && quantity > 0 && price > 0) {
      const totalPrice = quantity * price;
      formUpdate.setFieldsValue({ total_price: totalPrice });
    } else {
      formUpdate.setFieldsValue({ total_price: "" });
      // message.error("Giá và số lượng phải là số hợp lệ và lớn hơn 0!");
    }
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

  // Search and filter
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Tìm kiếm ${dataIndex}`}
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
            Tìm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Đặt lại
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
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

  // Table Columns
  const columns = [
    {
      title: "Yêu cầu",
      dataIndex: "fuel_name",
      key: "fuel_name",
      ...getColumnSearchProps("fuel_name"),
      sorter: (a, b) => a.fuel_name.localeCompare(b.fuel_name),
    },
    {
      title: <div style={{ textAlign: "center" }}>Số lượng (Kg)</div>,
      dataIndex: "quantity",
      key: "quantity",
      className: "text-center",
      sorter: (a, b) => a.quantity - b.quantity,
       render: (quantity) => convertPrice(quantity),
    },
    {
      title: <div style={{ textAlign: "center" }}>Giá mỗi đơn vị (VNĐ/Kg)</div>,
      dataIndex: "price",
      key: "price",
      className: "text-center",
      sorter: (a, b) => a.price - b.price,
      render: (price) => convertPrice(price) || "Không có giá mỗi kg",
    },
    {
      title: <div style={{ textAlign: "center" }}>Tổng giá (VNĐ)</div>,
      dataIndex: "total_price",
      key: "total_price",
      className: "text-center",
      sorter: (a, b) => a.total_price - b.total_price, // Enable sorting
      render: (total_price) => convertPrice(total_price),
    },
    {
      title: <div style={{ textAlign: "center" }}>Trạng thái</div>,
      dataIndex: "status",
      key: "status",
      className: "text-center",
      filters: [
        { text: "Đã duyệt", value: "Đã duyệt" },
        { text: "Chờ duyệt", value: "Chờ duyệt" },
        { text: "Đã hủy", value: "Đã hủy" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        let displayStatus = status;
        let color = "orange"; // Default for "Chờ duyệt"

        if (status === "Đã duyệt") {
          color = "green";
        } else if (status === "Đã hủy") {
          color = "red";
        } else if (status === "Đang xử lý") {
          displayStatus = "Hoàn thành";
        }

        return <Tag color={color}>{displayStatus}</Tag>;
      },
    },
    // {
    //   title: "Ghi Chú",
    //   dataIndex: "note",
    //   key: "note",
    //   render: (note) => note || "Không có ghi chú",
    // },
    // {
    //   title: "Cập Nhật",
    //   dataIndex: "updatedAt",
    //   key: "updatedAt",
    //   sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt), // 🔽 Sorting by date
    //   render: (updatedAt) => converDateString(updatedAt),
    // },
    {
      title: <div style={{ textAlign: "center" }}>Hành động</div>,
      key: "actions",
      className: "text-center",
      render: (_, record) => {
        const isPending = record.status === "Chờ duyệt";
        return (
          <Space size={8}>
            {/* Sửa */}
            <Button
              icon={<AiFillEdit />}
              onClick={() => handleEdit(record)}
              disabled={!isPending}
              size="middle"
            />
            {/* Xóa */}
            <Button
              icon={<MdDelete style={{ color: "red" }} />}
              onClick={() => {
                setRowSelected(record._id);
                setIsOpenDelete(true);
              }}
              disabled={!isPending}
              size="middle"
            />
            {/* Xem Chi Tiết */}
            <Button
              icon={<HiOutlineDocumentSearch style={{ color: "dodgerblue" }} />}
              type="default"
              onClick={() => handleViewDetail(record)}
              size="middle"
            />
          </Space>
        );
      },
    },
  ];

  return (
    <div className="Wrapper-Admin-FuelRequest">
      {/* <div className="w-full border border-gray-200 flex items-center gap-20 mb-4 justify-between rounded-md p-6 bg-white shadow">
        <div className="info">
          <h1 className="text-3xl font-bold mb-3 text-black">
            Quản Lý Đơn Cung Cấp Nguyên Liệu
          </h1>
          <div className="max-w-[44rem]">
            <p className="w-full text-[16px] text-gray-700">
              Đây là trang quản lý các đơn cung cấp nguyên liệu mà{" "}
              <span className="font-semibold text-[#006838]">
                {userRedux?.full_name || "nhà cung cấp"}
              </span>{" "}
              đã tạo và gửi đến hệ thống. Bạn có thể theo dõi trạng thái, xem
              chi tiết hoặc thực hiện các thao tác cần thiết với các đơn hàng
              này.
            </p>
          </div>
        </div>
        <img src={Shop} className="w-[250px]" alt="Shop Illustration" />
      </div> */}

      <div className="text-center font-bold text-2xl mb-5">
        ĐƠN CUNG CẤP NGUYÊN LIỆU
      </div>

      <hr />

      <div className="Main-Content">
        <h5 className="content-title"> </h5>
        <Table
          columns={columns}
          dataSource={fuelRequests}
          loading={isLoading}
          rowKey={(record) => record._id}
          pagination={{ pageSize: 6 }}
        />
      </div>

      {/* Drawer for Editing */}
      {/* <DrawerComponent
        title="Chi Tiết Yêu Cầu"
        isOpen={isDrawerOpen}
        onClose={handleCancelUpdate}
        placement="right"
        width="30%"
      >
        <Loading isPending={mutationUpdate.isPending}>
          <Form
            name="update-form"
            form={formUpdate}
            onFinish={onFinishUpdate}
            layout="vertical" // 🔹 Ensures proper alignment
          >
            <Form.Item label="Tên Nhiên Liệu" name="fuel_name">
              <Input value={selectedRequest.fuel_name} disabled />
            </Form.Item>

            <Form.Item label="Số Lượng">
              {quantityRemain !== null && (
                <div
                  style={{ marginBottom: 5, fontSize: "14px", color: "gray" }}
                >
                  Số lượng còn lại: <strong>{quantityRemain}</strong>
                </div>
              )}
              <Form.Item
                name="quantity"
                rules={[
                  { required: true, message: "Vui lòng nhập số lượng!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value) {
                        return Promise.resolve();
                      }
                      if (value > quantityRemain) {
                        return Promise.reject(
                          new Error(
                            `Số lượng không được vượt quá ${quantityRemain}!`
                          )
                        );
                      }
                      if (value % 10 !== 0) {
                        return Promise.reject(
                          new Error("Số lượng phải chia hết cho 10!")
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input
                  type="number"
                  onKeyDown={(e) => {
                    if (["-", "e", "E", "+", ".", ","].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>
            </Form.Item>
            <Form.Item label="Ghi Chú" name="note">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={mutationUpdate.isPending}
                style={{ width: "100%" }}
              >
                {mutationUpdate.isPending ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </Form.Item>
          </Form>
        </Loading>
      </DrawerComponent> */}

      <DrawerComponent
        title={<div style={{ textAlign: "center" }}>Cập Nhật Đơn Cung Cấp</div>}
        isOpen={isDrawerOpen}
        placement="right"
        width="40%"
        onClose={handleCancelUpdate}
      >
        <Loading isPending={mutationUpdate.isPending}>
          <Form
            name="update-form"
            form={formUpdate}
            onFinish={onFinishUpdate}
            layout="vertical"
          >
            <Form.Item label="Tên yêu cầu" name="fuel_name">
              <Input value={selectedRequest.fuel_name} disabled />
            </Form.Item>

            <Form.Item>
              {quantityRemain !== null && (
                <div style={{ fontSize: "14px", color: "gray" }}>
                  <strong>Số lượng còn lại: {quantityRemain} KG</strong>
                </div>
              )}
            </Form.Item>

            <Form.Item
              name="quantity"
              label="Số lượng muốn cung cấp"
              rules={[
                { required: true, message: "Vui lòng nhập số lượng!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value) {
                      return Promise.resolve();
                    }
                    if (value > quantityRemain) {
                      return Promise.reject(
                        new Error(
                          `Số lượng không được vượt quá ${quantityRemain}!`
                        )
                      );
                    }
                    if (value % 10 !== 0) {
                      return Promise.reject(
                        new Error("Số lượng phải chia hết cho 10!")
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input
                type="number"
                min={10}
                onKeyDown={(e) => {
                  if (["-", "e", "E", "+", ".", ","].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const quantity = e.target.value;
                  formUpdate.setFieldsValue({ quantity });
                  updateTotalPrice(quantity, formUpdate.getFieldValue("price"));
                }}
              />
            </Form.Item>

            {/* <Form.Item
              label="Giá mỗi đơn vị (VNĐ/Kg)"
              name="price"
              rules={[
                { required: true, message: "Vui lòng nhập giá mỗi đơn vị!" },
              ]}
            >
              <Input
                type="number"
                defaultValue={selectedRequest.price || 0}
                min="0"
                required
                onChange={(e) => {
                  const price = e.target.value;
                  formUpdate.setFieldsValue({ price });
                  updateTotalPrice(formUpdate.getFieldValue("quantity"), price);
                }}
              />
            </Form.Item> */}

            <Form.Item label="Giá mỗi đơn vị (VNĐ/Kg)" name="price">
              <Input disabled />
            </Form.Item>

            <Form.Item label="Ghi Chú" name="note">
              <Input.TextArea rows={3} placeholder="Ghi chú thêm nếu có" />
            </Form.Item>

            <div
              style={{ marginBottom: 10, fontSize: "16px", fontWeight: "bold" }}
            >
              <span>Tổng Giá: </span>
              {
                // Kiểm tra và tính toán tổng giá khi cả quantity và price đều có giá trị hợp lệ
                formUpdate.getFieldValue("quantity") &&
                formUpdate.getFieldValue("price")
                  ? // Chuyển đổi giá trị quantity và price thành số và tính tổng
                    (
                      Number(formUpdate.getFieldValue("quantity")) *
                      Number(formUpdate.getFieldValue("price"))
                    ).toLocaleString("vi-VN")
                  : "Chưa tính" // Hiển thị nếu chưa tính được tổng giá
              }
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={mutationUpdate.isPending}
                style={{ width: "100%" }}
              >
                {mutationUpdate.isPending ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </Form.Item>
          </Form>
        </Loading>
      </DrawerComponent>

      <DrawerComponent
        title={<div style={{ textAlign: "center" }}>Cập Nhật Đơn Cung Cấp</div>}
        isOpen={isDrawerOpen}
        placement="right"
        width="40%"
        onClose={handleCancelUpdate}
      >
        <Loading isPending={mutationUpdate.isPending}>
          <Form
            name="update-form"
            form={formUpdate}
            onFinish={onFinishUpdate}
            layout="vertical"
          >
            <Form.Item label="Tên yêu cầu" name="fuel_name">
              <Input value={selectedRequest.fuel_name} disabled />
            </Form.Item>

            <Form.Item>
              {quantityRemain !== null && (
                <div style={{ fontSize: "14px", color: "gray" }}>
                  <strong>Số lượng còn lại: {quantityRemain} KG</strong>
                </div>
              )}
            </Form.Item>

            <Form.Item
              name="quantity"
              label="Số lượng muốn cung cấp"
              rules={[
                { required: true, message: "Vui lòng nhập số lượng!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value) {
                      return Promise.resolve();
                    }
                    if (value > quantityRemain) {
                      return Promise.reject(
                        new Error(
                          `Số lượng không được vượt quá ${quantityRemain}!`
                        )
                      );
                    }
                    if (value % 10 !== 0) {
                      return Promise.reject(
                        new Error("Số lượng phải chia hết cho 10!")
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input
                type="number"
                onChange={(e) => {
                  const quantity = e.target.value;
                  formUpdate.setFieldsValue({ quantity });
                  updateTotalPrice(quantity, formUpdate.getFieldValue("price"));
                }}
              />
            </Form.Item>

            <Form.Item
              label="Giá mỗi đơn vị (VNĐ/Kg)"
              name="price"
              rules={[
                { required: true, message: "Vui lòng nhập giá mỗi đơn vị!" },
              ]}
            >
              <Input
                type="number"
                defaultValue={selectedRequest.price || 0}
                min="0"
                required
                onChange={(e) => {
                  const price = e.target.value;
                  formUpdate.setFieldsValue({ price });
                  updateTotalPrice(formUpdate.getFieldValue("quantity"), price);
                }}
              />
            </Form.Item>

            <Form.Item label="Ghi Chú" name="note">
              <Input.TextArea rows={3} placeholder="Ghi chú thêm nếu có" />
            </Form.Item>

            <div
              style={{ marginBottom: 10, fontSize: "16px", fontWeight: "bold" }}
            >
              <span>Tổng Giá: </span>
              {
                // Kiểm tra và tính toán tổng giá khi cả quantity và price đều có giá trị hợp lệ
                formUpdate.getFieldValue("quantity") &&
                formUpdate.getFieldValue("price")
                  ? // Chuyển đổi giá trị quantity và price thành số và tính tổng
                    (
                      Number(formUpdate.getFieldValue("quantity")) *
                      Number(formUpdate.getFieldValue("price"))
                    ).toLocaleString("vi-VN")
                  : "Chưa tính" // Hiển thị nếu chưa tính được tổng giá
              }
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={mutationUpdate.isPending}
                style={{ width: "100%" }}
              >
                {mutationUpdate.isPending ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </Form.Item>
          </Form>
        </Loading>
      </DrawerComponent>

      {/* Modal Confirm Delete */}
      <Modal
        title="Xóa Yêu Cầu"
        open={isOpenDelete}
        onCancel={() => setIsOpenDelete(false)}
        onOk={handleConfirmDelete}
        confirmLoading={mutationDelete.isPending}
      >
        <p>Bạn có chắc muốn xóa yêu cầu này?</p>
      </Modal>

      <DrawerComponent
        title="Chi Tiết Đơn Cung Cấp"
        isOpen={isDetailDrawerOpen}
        placement="right"
        width="30%" // Điều chỉnh chiều rộng Drawer nếu cần
        onClose={() => setIsDetailDrawerOpen(false)}
      >
        {detailData ? (
          <div className="w-full p-6 bg-white rounded-md shadow">
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block mb-1 font-semibold">
                  Tên yêu cầu
                </label>
                <input
                  type="text"
                  value={detailData.fuel_name}
                  readOnly
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">
                  Giá mỗi đơn vị (VNĐ/Kg)
                </label>
                <input
                  type="text"
                  value={detailData.price.toLocaleString("vi-VN")}
                  readOnly
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">
                  Số Lượng (Kg)
                </label>
                <input
                  type="text"
                  value={detailData.quantity}
                  readOnly
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Tổng Giá</label>
                <input
                  type="text"
                  value={detailData.total_price.toLocaleString("vi-VN")}
                  readOnly
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">
                  Ngày Cập Nhật
                </label>
                <input
                  type="text"
                  value={converDateString(detailData.updatedAt)}
                  readOnly
                  className="border p-2 rounded w-full"
                />
              </div>

              <div className="">
                <label className="block mb-1 font-semibold">Ghi Chú</label>
                <textarea
                  value={detailData.note || "Không có ghi chú"}
                  readOnly
                  className="w-full h-auto border p-2 rounded"
                />
              </div>

              {/* Trạng thái */}
              <div className="flex items-center gap-2">
                <label className="block font-semibold">Trạng Thái: </label>
                <span
                  className={`ml-2 px-4 py-2 rounded text-sm font-medium inline-block w-30 text-center whitespace-nowrap ${getStatusClasses(
                    detailData.status
                  )}`}
                >
                  {detailData.status}
                </span>
              </div>
            </div>

            {/* Nút đóng */}
            <div className="flex justify-start">
              <Button
                onClick={() => setIsDetailDrawerOpen(false)}
                className="bg-gray-500 text-white font-bold px-4 py-2 rounded hover:bg-gray-600"
              >
                Đóng
              </Button>
            </div>
          </div>
        ) : (
          <p>Không có dữ liệu.</p>
        )}
      </DrawerComponent>
    </div>
  );
};

export default ProvideRequestManagement;
