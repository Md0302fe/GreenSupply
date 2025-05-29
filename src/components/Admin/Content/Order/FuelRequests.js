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

const FuelRequestsManagement = () => {
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
        message.success("Đơn hàng đã được duyệt thành công!");
        queryOrder.refetch();
      } else {
        message.error("Duyệt đơn thất bại!");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi duyệt đơn!");
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
      title: "Khách Hàng",
      dataIndex: "customerName",
      key: "customerName",
      className: "text-center",
      ...getColumnSearchProps("customerName"),
    },
    {
      title: "Loại Nguyên Liệu",
      dataIndex: "fuel_name",
      key: "fuel_name",
      ...getColumnSearchProps("fuel_name"),
    },

    {
      title: "Giá Tiền",
      dataIndex: "price",
      key: "price",
      className: "text-center",
      ...getColumnSearchProps("price"),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      className: "text-center",
      key: "status",
      filters: [
        {
          text: "Chờ duyệt",
          value: "Chờ duyệt",
        },
        {
          text: "Đã duyệt",
          value: "Đã duyệt",
        },
        {
          text: "Đã Hủy",
          value: "Đã Hủy",
        },
        {
          text: "Hoàn thành",
          value: "Hoàn thành",
        },
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
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Chức năng",
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
            Quay lại
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
          Quản lý đơn yêu cầu thu nguyên liệu
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
        title="Chi Tiết Đơn Hàng"
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
              label="Khách Hàng"
              labelStyle={{ width: "40%" }}
              contentStyle={{ width: "60%" }}
            >
              {stateDetailsUser?.supplier_id?.full_name || "Không có"}
            </Descriptions.Item>

            <Descriptions.Item
              label="Loại Nhiên Liệu"
              labelStyle={{ width: "40%" }}
              contentStyle={{ width: "60%" }}
            >
              {stateDetailsUser?.fuel_name || "Không có"}
            </Descriptions.Item>

            <Descriptions.Item
              label="Giá Tiền"
              labelStyle={{ width: "35%" }}
              contentStyle={{ width: "65%" }}
            >
              {stateDetailsUser?.price || "Không có"}
            </Descriptions.Item>

            <Descriptions.Item
              label="Priority"
              labelStyle={{ width: "40%" }}
              contentStyle={{ width: "60%" }}
            >
              {stateDetailsUser?.priority || "Không có"}
            </Descriptions.Item>

            <Descriptions.Item
              label="Số Lượng"
              labelStyle={{ width: "40%" }}
              contentStyle={{ width: "60%" }}
            >
              {stateDetailsUser?.quantity || "Không có"}
            </Descriptions.Item>

            <Descriptions.Item
              label="Tổng Giá"
              labelStyle={{ width: "40%" }}
              contentStyle={{ width: "60%" }}
            >
              {stateDetailsUser?.total_price || "Không có"}
            </Descriptions.Item>

            <Descriptions.Item
              label="Địa chỉ"
              labelStyle={{ width: "40%" }}
              contentStyle={{ width: "60%" }}
            >
              {stateDetailsUser?.address || "Không có"}
            </Descriptions.Item>

            <Descriptions.Item
              label="Trạng Thái"
              labelStyle={{ width: "40%" }}
              contentStyle={{ width: "60%" }}
            >
              {orderStatus || "Không có"}
            </Descriptions.Item>

            <Descriptions.Item
              label="Ghi chú"
              labelStyle={{ width: "40%" }}
              contentStyle={{ width: "60%" }}
            >
              {stateDetailsUser?.note || "Không có"}
            </Descriptions.Item>

            <Descriptions.Item
              label="Ngày tạo"
              labelStyle={{ width: "40%" }}
              contentStyle={{ width: "60%" }}
            >
              {stateDetailsUser?.createdAt || "Không có"}
            </Descriptions.Item>

            <Descriptions.Item
              label="Cập nhật gần nhất"
              labelStyle={{ width: "40%" }}
              contentStyle={{ width: "60%" }}
            >
              {stateDetailsUser?.updatedAt || "Không có"}
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
                Duyệt đơn
              </Button>
              <Button danger onClick={handleCancelOrder}>
                Hủy đơn
              </Button>
            </div>
          )}
        </Loading>
      </DrawerComponent>
    </div>
  );
};

export default FuelRequestsManagement;
