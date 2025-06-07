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
import Highlighter from "react-highlight-words";
import { message } from "antd";
import {
  handleAcceptOrders,
  handleCancelOrders,
  handleCompleteOrders,
} from "../../../../services/OrderServices";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
  const tableData =
    orders?.data?.length &&
    orders?.data.map((order) => {
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
      title: t("fuel_request.table.customer"),
      dataIndex: "customerName",
      key: "customerName",
      className: "text-center",
      ...getColumnSearchProps("customerName"),
    },
    {
      title: t("fuel_request.table.fuel_type"),
      dataIndex: "fuel_name",
      key: "fuel_name",
      ...getColumnSearchProps("fuel_name"),
    },
    {
      title: t("fuel_request.table.price"),
      dataIndex: "price",
      key: "price",
      className: "text-center",
      ...getColumnSearchProps("price"),
    },
    {
      title: t("fuel_request.table.status"),
      dataIndex: "status",
      key: "status",
      className: "text-center",
      filters: [
        { text: t("status.pending"), value: "Chờ duyệt" },
        { text: t("status.approve"), value: "Đã duyệt" },
        { text: t("status.cancelled"), value: "Đã Hủy" },
        { text: t("status.completed"), value: "Hoàn thành" },
      ],

      onFilter: (value, record) => record.status.includes(value),
      filteredValue: defaultStatusFilter ? [defaultStatusFilter] : null,
      render: (status) => {
        let color = "";
        switch (status) {
          case "Chờ duyệt":
            color = "orange";
            break;
          case "Đã duyệt":
            color = "green";
            break;
          case "Đã Hủy":
            color = "red";
            break;
          case "Hoàn Thành":
            color = "green"; // Thêm màu cho trạng thái "Đã hoàn thành"
            break;
          case "Đang xử lý":
            color = "blue";
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
      title: t('fuel_request.table.actions'),
      className: "text-center",
      dataIndex: "action",
      render: renderAction,
    },
  ];
  return (
    <div className="Wrapper-Admin-User">
      <div className="Main-Content">
        <div
          style={{
            marginBottom: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Nút quay lại */}
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
            {t("fuel_request.back")}
          </Button>

          {/* Placeholder để giữ cân layout bên phải */}
          <div style={{ width: 100 }}></div>
        </div>
        {/* <div className="content-addUser">
          <Button onClick={showModal}>
            <BsPersonAdd></BsPersonAdd>
          </Button>
        </div> */}
        <h5 className="text-center font-bold text-2xl mb-0">
          {t("fuel_request.title")}
        </h5>
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
          ></TableUser>
        </div>
      </div>

      {/* DRAWER - Update Product */}
      <DrawerComponent
        title={t("fuel_request.drawer.title")}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        placement="right"
        width="35%"
        forceRender
      >
        {/* truyền 2 isPending : 1 là load lại khi getDetailsProduct / 2 là load khi update product xong */}
        <Loading isPending={isLoadDetails}>
          <Descriptions bordered column={1} layout="horizontal">
            <Descriptions.Item
              label={t("fuel_request.table.customer")}
              labelStyle={{ width: "40%" }}
              contentStyle={{ width: "60%" }}
            >
              {stateDetailsUser?.supplier_id?.full_name || t("common.no_data")}
            </Descriptions.Item>

            <Descriptions.Item
              label={t("fuel_request.table.fuel_type")}
              labelStyle={{ width: "40%" }}
              contentStyle={{ width: "60%" }}
            >
              {stateDetailsUser?.fuel_name || t("common.no_data")}
            </Descriptions.Item>

            <Descriptions.Item
              label={t("fuel_request.table.price")}
              labelStyle={{ width: "35%" }}
              contentStyle={{ width: "65%" }}
            >
              {stateDetailsUser?.price || t("common.no_data")}
            </Descriptions.Item>

            <Descriptions.Item
              label={t("fuel_request.drawer.priority")}
              labelStyle={{ width: "40%" }}
              contentStyle={{ width: "60%" }}
            >
              {stateDetailsUser?.priority || t("common.no_data")}
            </Descriptions.Item>

            <Descriptions.Item
              label={t("fuel_request.drawer.quantity")}
              labelStyle={{ width: "40%" }}
              contentStyle={{ width: "60%" }}
            >
              {stateDetailsUser?.quantity || t("common.no_data")}
            </Descriptions.Item>

            <Descriptions.Item
              label={t("fuel_request.drawer.total_price")}
              labelStyle={{ width: "40%" }}
              contentStyle={{ width: "60%" }}
            >
              {stateDetailsUser?.total_price || t("common.no_data")}
            </Descriptions.Item>

            <Descriptions.Item
              label={t("fuel_request.drawer.address")}
              labelStyle={{ width: "40%" }}
              contentStyle={{ width: "60%" }}
            >
              {stateDetailsUser?.address || t("common.no_data")}
            </Descriptions.Item>

            <Descriptions.Item
              label={t("fuel_request.drawer.status")}
              labelStyle={{ width: "40%" }}
              contentStyle={{ width: "60%" }}
            >
              {t(`status.${statusMap[orderStatus]}`) || t("common.no_data")}
            </Descriptions.Item>

            <Descriptions.Item
              label={t("fuel_request.drawer.note")}
              labelStyle={{ width: "40%" }}
              contentStyle={{ width: "60%" }}
            >
              {stateDetailsUser?.note || t("common.no_data")}
            </Descriptions.Item>

            <Descriptions.Item
              label={t("fuel_request.drawer.created_at")}
              labelStyle={{ width: "40%" }}
              contentStyle={{ width: "60%" }}
            >
              {stateDetailsUser?.createdAt || t("common.no_data")}
            </Descriptions.Item>

            <Descriptions.Item
              label={t("fuel_request.drawer.updated_at")}
              labelStyle={{ width: "40%" }}
              contentStyle={{ width: "60%" }}
            >
              {stateDetailsUser?.updatedAt || t("common.no_data")}
            </Descriptions.Item>
          </Descriptions>

          {orderStatus === "Chờ duyệt" && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                marginTop: 24,
              }}
            >
              <Button type="primary" onClick={handleApproveOrder}>
                {t("fuel_request.actions.approve")}
              </Button>
              <Button danger onClick={handleCancelOrder}>
                {t("fuel_request.actions.cancel")}
              </Button>
            </div>
          )}
        </Loading>
      </DrawerComponent>
    </div>
  );
};

export default FuelRequestsManagement;
