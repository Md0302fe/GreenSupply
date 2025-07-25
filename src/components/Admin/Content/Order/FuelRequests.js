import React, { useEffect, useRef, useState } from "react";
import "./Order.scss";

import { Button, Form, Input, Space } from "antd";
import * as OrderServices from "../../../../services/OrderServices";
import { Descriptions } from "antd";

import { SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { Tag } from "antd";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

import TableUser from "./TableUser";
import Loading from "../../../LoadingComponent/Loading";

import DrawerComponent from "../../../DrawerComponent/DrawerComponent";
import { FaClipboardList } from "react-icons/fa";

import Highlighter from "react-highlight-words";
import { message } from "antd";
import {
  handleAcceptOrders,
  handleCancelOrders,
  handleCompleteOrders,
} from "../../../../services/OrderServices";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ButtonComponent from "../../../ButtonComponent/ButtonComponent";
const FuelRequestsManagement = () => {
  const { t } = useTranslation();

  const [rowSelected, setRowSelected] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoadDetails, setIsLoadDetails] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [orderStatus, setOrderStatus] = useState(""); // State để lưu trạng thái đơn hàng
  const [reload, setReload] = useState(false);
  const user = useSelector((state) => state.user);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [formUpdate] = Form.useForm();
  const searchInput = useRef(null);
  const navigate = useNavigate();
  const statusMap = {
    "Chờ duyệt": "pending",
    "Đã duyệt": "approve",
    "Đã Hủy": "cancelled",
    "Đã huỷ": "cancelled",
    "Hoàn Thành": "completed",
    "Đang xử lý": "processing",
  };
  const [stateDetailsUser, setStateDetailsUser] = useState({
    _id: "",
    address: "",
    createdAt: "",
    updatedAt: "",
    fuel_name: "",
    is_deleted: "",
    note: "",
    price: "",
    priority: "",
    quantity: "",
    status: "",
    supplier_id: {},
    total_price: "",
  });

  const fetchGetUserDetails = async ({ id, access_token }) => {
    const res = await OrderServices.getDetailOrders(id, access_token);
    if (res?.data) {
      setStateDetailsUser({
        _id: res?.data._id,
        address: res?.data.address,
        createdAt: res?.data.createdAt,
        updatedAt: res?.data.updatedAt,
        fuel_name: res?.data.fuel_name,
        is_deleted: res?.data.is_deleted,
        note: res?.data.note,
        price: res?.data.price,
        priority: res?.data.priority,
        quantity: res?.data.quantity,
        status: res?.data.status,
        supplier_id: res?.data.supplier_id,
        total_price: res?.data.total_price,
      });
      setOrderStatus(res?.data.status); // Cập nhật trạng thái đơn hàng từ dữ liệu
    }
    setIsLoadDetails(false);
    return res;
  };

  useEffect(() => {
    fetchGetAllOrder();
  }, [reload]);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultStatusFilter = queryParams.get("status") || "";

  const handleApproveOrder = async () => {
    try {
      const response = await handleAcceptOrders(stateDetailsUser._id);
      if (response) {
        setOrderStatus("Đã duyệt"); // Cập nhật trạng thái đơn hàng
        message.success(t("fuel_request.toast.approve_success"));
        queryOrder.refetch();
      } else {
        message.error(t("fuel_request.toast.approve_failed"));
      }
    } catch (error) {
      message.error(t("fuel_request.toast.approve_error"));
    }
  };

  const handleCancelOrder = async () => {
    try {
      const response = await handleCancelOrders(stateDetailsUser._id);
      if (response) {
        setOrderStatus("Đã Hủy"); // Cập nhật trạng thái đơn hàng
        message.success("Đơn hàng đã bị hủy thành công!");
        queryOrder.refetch();
      } else {
        message.error("Hủy đơn thất bại!");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi hủy đơn!");
    }
  };

  const handleCompleteOrder = async () => {
    try {
      const response = await handleCompleteOrders(stateDetailsUser._id);
      if (response) {
        setOrderStatus("Đã hoàn thành"); // Cập nhật trạng thái đơn hàng
        message.success("Đơn hàng đã được hoàn thành thành công!");
        setReload(!reload);
      } else {
        message.error("Hoàn thành đơn thất bại!");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi hoàn thành đơn!");
    }
  };

  // Handle Click Btn Edit Detail Product : Update product
  const handleDetailsProduct = () => {
    setIsDrawerOpen(true);
  };

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
  const fetchGetAllOrder = async () => {
    const access_token = user?.access_token;
    const res = await OrderServices.getAllOrders(access_token);
    console.log(res)
    return res;
  };

  // Usequery TỰ GET DỮ LIỆU TỪ PHÍA BE NGAY LẦN ĐẦU RENDER COMPONENT Này (Hiển thị list sản phẩm).
  // Tự động lấy dữ liệu: Ngay khi component chứa useQuery được render, useQuery sẽ tự động gọi hàm fetchGetAllProduct để lấy danh sách sản phẩm từ API.
  const queryOrder = useQuery({
    queryKey: ["order"],
    queryFn: fetchGetAllOrder,
  });
  const { isLoading, data: orders } = queryOrder;

  // DATA FROM USERS LIST
  const filteredOrders =
  orders?.data?.length &&
  orders.data.filter((order) => {
    return defaultStatusFilter
      ? order.status?.trim() === defaultStatusFilter.trim()
      : true;
  });

const tableData =
  filteredOrders?.length &&
  filteredOrders.map((order) => {
    return {
      ...order,
      key: order._id,
      customerName: order?.supplier_id?.full_name,
    };
  });


  // Actions
  const renderAction = () => {
    return (
      <div
        className="flex-center-center"
        style={{ justifyContent: "space-around", cursor: "pointer" }}
        onClick={handleDetailsProduct}
      >
        <Button
          type="link"
          icon={<HiOutlineDocumentSearch style={{ fontSize: "24px" }} />}
          onClick={handleDetailsProduct}
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
      title: (
        <div className="text-left">{t("fuel_request.table.customer")}</div>
      ),
      dataIndex: "customerName",
      key: "customerName",
      ...getColumnSearchProps("customerName"),
    },
    {
      title: (
        <div className="text-left">{t("fuel_request.table.request_name")}</div>
      ),
      dataIndex: "fuel_name",
      key: "fuel_name",
      ...getColumnSearchProps("fuel_name"),
    },
    {
      title: t("fuel_request.table.price"),
      dataIndex: "price",
      key: "price",
      className: "text-center",
      sorter: (a, b) => a.price - b.price,
      render: (price) => `${price.toLocaleString()} đ`,
    },
    {
      title: t("fuel_request.table.status"),
      dataIndex: "status",
      key: "status",
      className: "text-center",
      filters: [
        { text: t("status.pending"), value: "Chờ duyệt" },
        { text: t("status.processing"), value: "Đang xử lý" },
        { text: t("status.approve"), value: "Đã duyệt" },
        { text: t("status.cancelled"), value: "Đã Hủy" },
        { text: t("status.completed"), value: "Hoàn Thành" },
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
          case "Đã Hủy": // đề phòng cả 2 cách viết
            color = "red";
            break;
          case "Hoàn Thành":
            color = "blue";
            break;
          case "Đang xử lý":
            color = "volcano";
            break;
          default:
            color = "default";
        }
        return (
          <Tag color={color}>{t(`status.${statusMap[status]}`) || status}</Tag>
        );
      },
    },
    {
      title: t("fuel_request.table.actions"),
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
            <span className="hidden md:inline">{t("fuel_request.back")}</span>
          </Button>

          {/* Title căn giữa */}
          <h2 className="text-center flex items-baseline gap-2 justify-center font-bold text-[20px] md:text-2xl flex-grow mx-4 text-gray-800">
            <FaClipboardList></FaClipboardList>
            {t("fuel_request.title")}
          </h2>

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

      {/* DRAWER - Update Product */}
      <DrawerComponent
        title={t("fuel_request.drawer.title")}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        placement="right"
        width={drawerWidth}
        forceRender
      >
        {/* truyền 2 isPending : 1 là load lại khi getDetailsProduct / 2 là load khi update product xong */}
        <Loading isPending={isLoadDetails}>
          <div className="overflow-x-auto">
            <div className="w-full p-2 bg-white rounded-md shadow">
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="block mb-1 font-semibold">
                    {t("fuel_request.table.customer")}
                  </label>
                  <input
                    type="text"
                    value={stateDetailsUser?.supplier_id?.full_name || t("common.no_data")}
                    readOnly
                    className="border p-2 rounded w-full mb-1 bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold">
                    {t("fuel_request.table.request_name")}
                  </label>
                  <input
                    type="text"
                    value={stateDetailsUser?.fuel_name || t("common.no_data")}
                    readOnly
                    className="border p-2 rounded w-full mb-1 bg-gray-100"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-semibold">
                      {t("fuel_request.drawer.quantity")}
                    </label>
                    <input
                      type="text"
                      value={stateDetailsUser?.quantity || t("common.no_data")}
                      readOnly
                      className="border p-2 rounded w-full mb-1 bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold">
                      {t("fuel_request.table.price")}
                    </label>
                    <input
                      type="text"
                      value={stateDetailsUser?.price || t("common.no_data")}
                      readOnly
                      className="border p-2 rounded w-full mb-1 bg-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-semibold">
                    {t("fuel_request.drawer.total_price")}
                  </label>
                  <input
                    type="text"
                    value={stateDetailsUser?.total_price || t("common.no_data")}
                    readOnly
                    className="border p-2 rounded w-full mb-1 bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold">
                    {t("fuel_request.drawer.address")}
                  </label>
                  <input
                    type="text"
                    value={stateDetailsUser?.address || t("common.no_data")}
                    readOnly
                    className="border p-2 rounded w-full mb-1 bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold">
                    {t("fuel_request.drawer.priority")}
                  </label>
                  <input
                    type="text"
                    value={stateDetailsUser?.priority || t("common.no_data")}
                    readOnly
                    className="border p-2 rounded w-full mb-1 bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold">
                    {t("fuel_request.drawer.note")}
                  </label>
                  <textarea
                    value={stateDetailsUser?.note || t("common.no_data")}
                    readOnly
                    className="w-full h-auto border p-2 rounded bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold">
                    {t("fuel_request.drawer.status")}
                  </label>
                  <input
                    type="text"
                    value={t(`status.${statusMap[orderStatus]}`)}
                    readOnly
                    className="border p-2 rounded w-full mb-1 bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold">
                    {t("fuel_request.drawer.created_at")}
                  </label>
                  <input
                    type="text"
                    value={stateDetailsUser?.createdAt || t("common.no_data")}
                    readOnly
                    className="border p-2 rounded w-full mb-1 bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold">
                    {t("fuel_request.drawer.updated_at")}
                  </label>
                  <input
                    type="text"
                    value={stateDetailsUser?.updatedAt || t("common.no_data")}
                    readOnly
                    className="border p-2 rounded w-full mb-1 bg-gray-100"
                  />
                </div>
              </div>
            </div>

          </div>

          {orderStatus === "Chờ duyệt" && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                marginTop: 24,
              }}
            ></div>
          )}
        </Loading>
        <div className="flex justify-end gap-3">
          <ButtonComponent type="approve-order" onClick={handleApproveOrder} />
          <ButtonComponent type="cancel-order" onClick={handleCancelOrder} />
          <ButtonComponent type="close" onClick={() => setIsDrawerOpen(false)} />
        </div>
      </DrawerComponent>
    </div>
  );
};

export default FuelRequestsManagement;
