import React, { useEffect, useRef, useState } from "react";
import "./Order.scss";

import * as UserServices from "../../../../services/UserServices";
import * as OrderServices from "../../../../services/OrderServices";

import { message } from "antd";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { convertPrice } from "../../../../ultils";
import { SearchOutlined } from "@ant-design/icons";
import { useMutationHooks } from "../../../../hooks/useMutationHook";

import TableUser from "./TableUser";
import Loading from "../../../LoadingComponent/Loading";
import DrawerComponent from "../../../DrawerComponent/DrawerComponent";
import Highlighter from "react-highlight-words";
import { Descriptions, Tag } from "antd";
import { FaClipboardList } from "react-icons/fa";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import ButtonComponent from "../../../ButtonComponent/ButtonComponent";

import { Space, Input, Form, Button } from "antd";

import {
  handleAcceptProvideOrders,
  handleCancelProvideOrders,
  handleCompleteProvideOrders,
} from "../../../../services/OrderServices";

import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const FuelProvideManagement = () => {
  const { t } = useTranslation();
  // gọi vào store redux get ra user
  const [rowSelected, setRowSelected] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoadDetails, setIsLoadDetails] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const navigate = useNavigate();
  const statusMap = {
    "Chờ duyệt": "pending",
    "Đã duyệt": "approve",
    "Đã hủy": "cancelled",
    "Hoàn Thành": "completed",
    "Đang xử lý": "processing",
    "thất bại": "failed",
    "Vô hiệu hóa": "disable",
  };

  const user = useSelector((state) => state.user);

  //  Search Props
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [formUpdate] = Form.useForm();
  const searchInput = useRef(null);

  // State để lưu trạng thái đơn hàng
  const [orderStatus, setOrderStatus] = useState("");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultStatusFilter = queryParams.get("status") || "";

  //  State Details quản lý products khi có req edit
  const [stateDetailsUser, setStateDetailsUser] = useState({
    _id: "",
    fuel_name: "",
    is_deleted: "",
    note: "",
    price: "",
    quality: "",
    quantity: "",
    status: "",
    request_id: "",
    address: "",
    supplier_id: "",
    total_price: "",
    createdAt: "",
    updatedAt: "",
    address: "",
  });

  // Fetch : Get User Details
  const fetchGetUserDetails = async ({ id, access_token }) => {
    const res = await OrderServices.getDetailProvideOrders(id, access_token);
    // Get respone từ api và gán vào state update details
    if (res?.data) {
      setStateDetailsUser({
        _id: res?.data._id,
        fuel_name: res?.data.fuel_name,
        is_deleted: res?.data.is_deleted,
        note: res?.data.note,
        price: res?.data.price,
        quality: res?.data.quality,
        quantity: res?.data.quantity,
        status: res?.data.status,
        address: res?.data.address,
        request_id: res?.data.request_id,
        supplier_id: res?.data.supplier_id,
        total_price: res?.data.total_price,
        createdAt: res?.data.createdAt,
        updatedAt: res?.data.updatedAt,
        address: res?.data.address || "",
      });
      setOrderStatus(res?.data.status); // Cập nhật trạng thái đơn hàng từ dữ liệu
    }
    setIsLoadDetails(false);
    return res;
  };

  const handleAcceptProvideOrder = async () => {
    try {
      const response = await handleAcceptProvideOrders(stateDetailsUser._id);
      if (response) {
        setOrderStatus("Đã duyệt"); // Cập nhật trạng thái đơn hàng
        message.success(t("fuelProvide.orderApproved"));
        queryOrder.refetch();
      } else {
        message.error(t("fuelProvide.approveFailed"));
      }
    } catch (error) {
      message.error(`${t("fuelProvide.errorApproving")} ${error.message}`);
    }
  };

  const handleCancelProvideOrder = async () => {
    try {
      const response = await handleCancelProvideOrders(stateDetailsUser._id);
      if (response) {
        setOrderStatus("Đã Hủy"); // Cập nhật trạng thái đơn hàng
        message.success(t("fuelProvide.orderCanceled"));
        queryOrder.refetch();
      } else {
        message.error(t("fuelProvide.cancelFailed"));
      }
    } catch (error) {
      message.error(`${t("fuelProvide.errorCanceling")} ${error.message}`);
    }
  };

  //hoan thanh don
  const handleCompleteProvideOrder = async () => {
    try {
      const response = await handleCompleteProvideOrders(stateDetailsUser._id);
      if (response) {
        setOrderStatus("Đã hoàn thành"); // Cập nhật trạng thái đơn hàng
        message.success(t("fuelProvide.orderCompleted"));
      } else {
        message.error(t("fuelProvide.completeFailed"));
      }
    } catch (error) {
      message.error(t("fuelProvide.errorCompleting"));
    }
  };

  // Handle Click Btn Edit Detail Product : Update product
  const handleDetailsProduct = () => {
    setIsDrawerOpen(true);
  };

  // Mutation - Update Product
  const mutationUpdate = useMutationHooks((data) => {
    const { id, token, dataUpdate } = data;
    // convert data tại đây tránh lỗi vặt
    const updatedData = {
      ...dataUpdate,
      isAdmin: dataUpdate?.isAdmin === "admin",
    };

    // remember return . tránh việc mutationUpdate không trả về data
    return UserServices.updateUser({
      id,
      access_token: token,
      data: updatedData,
    });
  });

  const {
    data: dataRes,
    isError: isErrorUpdate,
    isPending: isPendingUpDate,
    isSuccess: isSuccessUpdate,
  } = mutationUpdate;

  // Handle each time rowSelected was call
  useEffect(() => {
    if (rowSelected) {
      if (isDrawerOpen) {
        setIsLoadDetails(true);
        fetchGetUserDetails({
          id: rowSelected,
          access_token: user?.access_token,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelected, isDrawerOpen, isOpenDelete]);

  // Update stateDetails for form
  useEffect(() => {
    formUpdate.setFieldsValue(stateDetailsUser);
  }, [formUpdate, setStateDetailsUser, stateDetailsUser]);
  // handle Notification update product

  // -------------------------------------------------\\

  // GET ALL PRODUCT FROM DB
  const fetchGetAllProvideOrder = async () => {
    const access_token = user?.access_token;
    const res = await OrderServices.getAllProvideOrders(access_token);
    return res;
  };

  // Usequery TỰ GET DỮ LIỆU TỪ PHÍA BE NGAY LẦN ĐẦU RENDER COMPONENT Này (Hiển thị list sản phẩm).
  // Tự động lấy dữ liệu: Ngay khi component chứa useQuery được render, useQuery sẽ tự động gọi hàm fetchGetAllProduct để lấy danh sách sản phẩm từ API.
  const queryOrder = useQuery({
    queryKey: ["order"],
    queryFn: fetchGetAllProvideOrder,
  });
  const { isLoading, data: orders } = queryOrder;

  // UseEffect - HANDLE Notification success/error UPDATE PRODUCT
  useEffect(() => {
    if (isSuccessUpdate) {
      if (dataRes?.status === "OK") {
        message.success(dataRes?.message);
        handleCancelUpdate();
      } else {
        message.error(dataRes?.message);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessUpdate, isErrorUpdate]);

  // CANCEL MODAL - Close Modal - CLOSE FORM UPDATE
  const handleCancelUpdate = () => {
    setStateDetailsUser({
      name: "",
      email: "",
      phone: "",
      isAdmin: "",
      avatar: "",
      address: "",
    });
    formUpdate.resetFields();
    setIsDrawerOpen(false);
  };

  // DATA FROM USERS LIST
const filteredOrders =
  orders?.data?.filter((order) => {
    return defaultStatusFilter
      ? order.status?.trim() === defaultStatusFilter.trim()
      : true;
  }) || [];

const tableData =
  filteredOrders.length &&
  filteredOrders
    .map((order) => {
      return {
        ...order,
        key: order._id,
        customerName: order?.supplier_id?.full_name,
        createdAt: order?.createdAt,
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Actions
  const renderAction = () => {
    return (
      <div
        className="flex-center-center"
        style={{ justifyContent: "center", cursor: "pointer" }}
        onClick={handleDetailsProduct}
      >
        <Button
          type="link"
          icon={<HiOutlineDocumentSearch style={{ fontSize: "24px" }} />}
        />
      </div>
    );
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

  // Customize Filter Search Props
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  // COLUMNS DATA TABLE
  const columns = [
    {
      title: <div className="text-left">{t("fuelProvide.customer")}</div>,
      dataIndex: "customerName",
      key: "customerName",
      ...getColumnSearchProps("customerName"),
    },
    {
      title: <div className="text-left">{t("fuelProvide.request_name")}</div>,
      dataIndex: "fuel_name",
      key: "fuel_name",
      ...getColumnSearchProps("fuel_name"),
    },
    {
      title: t("fuelProvide.price"),
      dataIndex: "price",
      key: "price",
      align: "center",
      className: "text-center",
      ...getColumnSearchProps("price"),
      render: (price) => `${convertPrice(price)}`,
    },
    {
      title: t("fuelProvide.status"),
      dataIndex: "status",
      key: "status",
      align: "center",
      className: "text-center",
      filters: [
        { text: t("status.pending"), value: "Chờ duyệt" },
        { text: t("status.approve"), value: "Đã duyệt" },
        { text: t("status.cancelled"), value: "Đã hủy" },
        { text: t("status.completed"), value: "Hoàn Thành" },
        { text: t("status.processing"), value: "Đang xử lý" },
        // { text: t("status.failed"), value: "thất bại" },
        // { text: t("status.disable"), value: "Vô hiệu hóa" },
      ],
      onFilter: (value, record) => record.status?.trim() === value.trim(),
      render: (status) => {
        let color = "";
        switch (status) {
          case "Chờ duyệt":
            color = "orange";
            break;
          case "Đã duyệt":
            color = "green";
            break;
          case "Đã huỷ":
          case "Đã hủy": // đề phòng cả 2 cách viết
            color = "red";
            break;
          case "Hoàn Thành":
            color = "blue";
            break;
          case "Đang xử lý":
            color = "volcano";
            break;
          case "thất bại":
            color = "volcano"; // hoặc crimson/firebrick tùy bạn
            break;
          case "Vô hiệu hóa":
            color = "grey"; // hoặc "default"
            break;
          default:
            color = "default";
        }
        return (
          <Tag color={color}>{t(`status.${statusMap[status]}`) || status}</Tag>
        );
      },
    },
    // {
    //   title: t("fuelProvide.createdAt"),
    //   dataIndex: "createdAt",
    //   align: "center",
    //   className: "text-center",
    //   key: "createdAt",
    //   sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    //   render: (createdAt) => {
    //     if (!createdAt) return <span>{t("fuelProvide.noData")}</span>; // Tránh lỗi khi createdAt là null hoặc undefined

    //     const date = new Date(createdAt);
    //     if (isNaN(date.getTime()))
    //       return <span>{t("fuelProvide.invalid")}</span>; // Kiểm tra xem date có hợp lệ không

    //     const vietnamTime = new Intl.DateTimeFormat("vi-VN", {
    //       year: "numeric",
    //       month: "2-digit",
    //       day: "2-digit",
    //       hour: "2-digit",
    //       minute: "2-digit",
    //       second: "2-digit",
    //       timeZone: "Asia/Ho_Chi_Minh",
    //     }).format(date);

    //     return <span>{vietnamTime}</span>;
    //   },
    // },
    {
      title: t("fuelProvide.action"),
      align: "center",
      className: "text-center",
      dataIndex: "action",
      render: renderAction,
    },
  ];
  return (
    <div className="Wrapper-Admin-User">
      <div className="Main-Content md:px-8">
        <div
          style={{ marginBottom: 24, marginTop: 24 }}
          className="flex items-center justify-between"
        >
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
            <span className="hidden md:inline">{t("fuelProvide.back")}</span>
          </Button>

          {/* Title căn giữa */}
          <h5 className="text-center flex items-baseline gap-2 justify-center font-bold text-2xl md:text-2xl flex-grow mx-4 text-gray-800">
            <FaClipboardList></FaClipboardList> {t("fuelProvide.title")}
          </h5>

          {/* Phần tử trống bên phải để cân bằng nút quay lại */}
          <div className="min-w-[20px] md:min-w-[100px]"></div>
        </div>
        <div className="content-main-table-user">
          <TableUser
            // Props List
            columns={columns}
            isLoading={isLoading}
            data={tableData}
            setRowSelected={setRowSelected}
            onRow={(record, rowIndex) => {
              return {
                onClick: (event) => {
                  setRowSelected(record._id);
                },
              };
            }}
            scroll={{ x: "max-content" }}
          ></TableUser>
        </div>
      </div>

      {/* DRAWER - Chi Tiết Đơn Hàng */}
      <DrawerComponent
        title={
          <div className="text-[14px] lg:text-lg font-semibold" style={{ textAlign: "center" }}>
            {t("fuelProvide.orderDetail")}
          </div>
        }
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        placement="right"
        width={drawerWidth}
        forceRender
      >
        <Loading isPending={isLoadDetails || isPendingUpDate}>
          <div className="w-full p-6 bg-white rounded-md shadow">
            <div className="grid grid-cols-1 gap-2 mb-4">
              {/* Tên khách hàng */}
              <div>
                <label className="block mb-1 font-semibold">
                  {t("fuelProvide.customer")}
                </label>
                <input
                  type="text"
                  value={stateDetailsUser?.supplier_id?.full_name || ""}
                  readOnly
                  className="border p-2 rounded w-full mb-1 bg-gray-100"
                />
              </div>

              {/* Tên yêu cầu */}
              <div>
                <label className="block mb-1 font-semibold">
                  {t("fuelProvide.request_name")}
                </label>
                <input
                  type="text"
                  value={stateDetailsUser?.fuel_name || ""}
                  readOnly
                  className="border p-2 rounded w-full mb-1 bg-gray-100"
                />
              </div>

              {/* Đơn giá + Chất lượng */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">
                    {t("fuelProvide.price")}
                  </label>
                  <input
                    type="text"
                    value={stateDetailsUser?.price || ""}
                    readOnly
                    className="border p-2 rounded w-full mb-1 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">
                    {t("fuelProvide.quality")}
                  </label>
                  <input
                    type="text"
                    value={stateDetailsUser?.quality || ""}
                    readOnly
                    className="border p-2 rounded w-full mb-1 bg-gray-100"
                  />
                </div>
              </div>

              {/* Số lượng + Tổng giá */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">
                    {t("fuelProvide.quantity")}
                  </label>
                  <input
                    type="text"
                    value={stateDetailsUser?.quantity || ""}
                    readOnly
                    className="border p-2 rounded w-full mb-1 bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold">
                    {t("fuelProvide.totalPrice")}
                  </label>
                  <input
                    type="text"
                    value={stateDetailsUser?.total_price || ""}
                    readOnly
                    className="border p-2 rounded w-full mb-1 bg-gray-100"
                  />
                </div>
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="block mb-1 font-semibold">
                  {t("fuelProvide.address")}
                </label>
                <input
                  type="text"
                  value={stateDetailsUser?.address || ""}
                  readOnly
                  className="border p-2 rounded w-full mb-1 bg-gray-100"
                />
              </div>

              {/* Trạng thái */}
              <div>
                <label className="block mb-1 font-semibold">
                  {t("fuelProvide.status")}
                </label>
                <input
                  type="text"
                  value={t(`status.${statusMap[orderStatus]}`) || orderStatus}
                  readOnly
                  className="border p-2 rounded w-full mb-1 bg-gray-100"
                />
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block mb-1 font-semibold">
                  {t("fuelProvide.note")}
                </label>
                <textarea
                  value={stateDetailsUser?.note || t("fuelProvide.noNote")}
                  readOnly
                  className="w-full h-auto border p-2 rounded bg-gray-100"
                />
              </div>

              {/* Created at */}
              <div>
                <label className="block mb-1 font-semibold">
                  {t("fuelProvide.createdAt")}
                </label>
                <input
                  type="text"
                  value={
                    stateDetailsUser?.createdAt
                      ? new Date(stateDetailsUser.createdAt).toLocaleString()
                      : ""
                  }
                  readOnly
                  className="border p-2 rounded w-full mb-1 bg-gray-100"
                />
              </div>

              {/* Updated at */}
              <div>
                <label className="block mb-1 font-semibold">
                  {t("fuelProvide.updatedAt")}
                </label>
                <input
                  type="text"
                  value={
                    stateDetailsUser?.updatedAt
                      ? new Date(stateDetailsUser.updatedAt).toLocaleString()
                      : ""
                  }
                  readOnly
                  className="border p-2 rounded w-full mb-1 bg-gray-100"
                />
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex flex-col md:flex-row justify-end gap-4 mt-6">
              {orderStatus === "Chờ duyệt" && (
                <>
                  <ButtonComponent
                    type="approve-order"
                    onClick={handleAcceptProvideOrder}
                  />
                  <ButtonComponent
                    type="cancel-order"
                    onClick={handleCancelProvideOrder}
                  />
                </>
              )}
              <ButtonComponent
                type="close"
                onClick={() => setIsDrawerOpen(false)}
              />
            </div>
          </div>
        </Loading>
      </DrawerComponent>
    </div>
  );
};

export default FuelProvideManagement;
