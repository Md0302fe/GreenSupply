import React, { useEffect, useRef, useState } from "react";
import "./Order.scss";

import { Button, Form, Input, Space } from "antd";
import * as UserServices from "../../../../services/UserServices";
import * as OrderServices from "../../../../services/OrderServices";

import { SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useMutationHooks } from "../../../../hooks/useMutationHook";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { getBase64 } from "../../../../ultils";

import TableUser from "./TableUser";
import Loading from "../../../LoadingComponent/Loading";
import DrawerComponent from "../../../DrawerComponent/DrawerComponent";
import Highlighter from "react-highlight-words";
import { Tag } from "antd";


import { message } from "antd";
import {
  handleAcceptProvideOrders,
  handleCancelProvideOrders,
  handleCompleteProvideOrders,
} from "../../../../services/OrderServices";
import { FaEye } from "react-icons/fa";
import { useLocation } from "react-router-dom";

const FuelProvideManagement = () => {
  // gọi vào store redux get ra user
  const [rowSelected, setRowSelected] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoadDetails, setIsLoadDetails] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);

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
        setOrderStatus('Đã duyệt'); // Cập nhật trạng thái đơn hàng
        message.success("Đơn hàng đã được duyệt thành công!");
        queryOrder.refetch();
      } else {
        message.error("Duyệt đơn thất bại!");
      }
    } catch (error) {
      message.error(`Có lỗi xảy ra khi duyệt đơn: ${error.message}`);
    }
  };

  const handleCancelProvideOrder = async () => {
    try {
      const response = await handleCancelProvideOrders(stateDetailsUser._id);
      if (response) {
        setOrderStatus('Đã Hủy'); // Cập nhật trạng thái đơn hàng
        message.success("Đơn hàng đã bị hủy thành công!");
        queryOrder.refetch();
      } else {
        message.error("Hủy đơn thất bại!");
      }
    } catch (error) {
      message.error(`Có lỗi xảy ra khi hủy đơn: ${error.message}`);
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
        toast.success(dataRes?.message);
        handleCancelUpdate();
      } else {
        toast.error(dataRes?.message);
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
  const tableData =
    orders?.data?.length &&
    orders?.data.map((order) => {
      return {
        ...order,
        key: order._id,
        customerName: order?.supplier_id?.full_name,
        createdAt: order?.createdAt,
      };
    })
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Actions
  const renderAction = () => {
    return (
      <div
        className="flex-center-center"
        style={{ justifyContent: "space-around", cursor: "pointer" }}
        onClick={handleDetailsProduct}
      >
        <button
          className="flex items-center gap-2 px-3 py-1.5 text-white font-bold text-sm bg-[#FF5733] rounded-md hover:bg-[#E04D2B] transition duration-300 shadow-sm hover:shadow-md"
        >
          <FaEye size={16} />Chi Tiết
        </button>
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
      ...getColumnSearchProps("price"),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
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
          text: "Đã hủy",
          value: "Đã hủy",
        },
      ],
      onFilter: (value, record) => record.status.includes(value),
      filteredValue: defaultStatusFilter ? [defaultStatusFilter] : null,
      render: (status) => {

        let color = "";
        switch (status) {
          case "Chờ duyệt":
            color = "orange"; // Màu cam cho đơn hàng đang xử lý
            break;
          case "Đã duyệt":
            color = "green"; // Màu xanh lá cho đơn hàng đã duyệt
            break;
          case "Đã hủy":
            color = "red"; // Màu đỏ cho đơn hàng đã hủy
            break;
          case "Hoàn thành":
            color = "blue"; // Thêm màu cho trạng thái "Đã hoàn thành"
            break;
          default:
            color = "default"; // Mặc định nếu trạng thái không khớp
        }

        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Ngày Tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (createdAt) => {
        if (!createdAt) return <span>Không có dữ liệu</span>; // Tránh lỗi khi createdAt là null hoặc undefined
        
        const date = new Date(createdAt);
        if (isNaN(date.getTime())) return <span>Không hợp lệ</span>; // Kiểm tra xem date có hợp lệ không
        
        const vietnamTime = new Intl.DateTimeFormat("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Ho_Chi_Minh",
        }).format(date);
        
        return <span>{vietnamTime}</span>;
      },
    },    
    {
      title: "Chức năng",
      dataIndex: "action",
      render: renderAction,
    },
  ];
  return (
    <div className="Wrapper-Admin-User">
      <div className="Main-Content">
        <h5 className="content-title">quản lý đơn cung cấp nguyên liệu</h5>
        {/* <div className="content-addUser">
          <Button onClick={showModal}>
            <BsPersonAdd></BsPersonAdd>
          </Button>
        </div> */}
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
        forceRender
      >
        {/* truyền 2 isPending : 1 là load lại khi getDetailsProduct / 2 là load khi update product xong */}
        <Loading isPending={isLoadDetails || isPendingUpDate}>
          <Form
            name="update-form"
            labelCol={{
              span: 8,
            }}
            wrapperCol={{
              span: 16,
            }}
            style={{
              maxWidth: 600,
            }}
            initialValues={{
              remember: true,
            }}
            autoComplete="on"
            form={formUpdate}
          >
            <Form.Item label="Khách Hàng" name="customerName">
              <span>{stateDetailsUser?.supplier_id?.full_name || ""}</span>
            </Form.Item>

            <Form.Item label="Loại Nguyên Liệu" name="fuel_name">
              <span>{stateDetailsUser?.fuel_name || ""}</span>
            </Form.Item>

            <Form.Item label="Giá Tiền" name="price">
              <span>{stateDetailsUser?.price || ""}</span>
            </Form.Item>

            <Form.Item label="Chất Lượng" name="quality">
              <span>{stateDetailsUser?.quality || ""}</span>
            </Form.Item>
            <Form.Item label="Số Lượng" name="quantity">
              <span>{stateDetailsUser?.quantity || ""}</span>
            </Form.Item>
            <Form.Item label="Địa chỉ" name="address">
              <span>{stateDetailsUser?.address || ""}</span>
            </Form.Item>
            <Form.Item label="Ghi chú" name="note">
              <span>{stateDetailsUser?.note || ""}</span>
            </Form.Item>

            <Form.Item label="Trạng Thái" name="status">
              <span>{orderStatus}</span> {/* Hiển thị trạng thái đơn hàng */}
            </Form.Item>
            <Form.Item label="Tổng Giá" name="total_price">
              <span>{stateDetailsUser?.total_price || ""}</span>
            </Form.Item>

            <Form.Item
              wrapperCol={{
                offset: 4, // Giảm offset để đẩy UI qua trái
                span: 16,
              }}
            >
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-start" }}>

                {orderStatus === 'Chờ duyệt' && (
                  <>
                    <Button type="primary" onClick={handleAcceptProvideOrder}>
                      Duyệt đơn
                    </Button>

                    <Button type="default" danger onClick={handleCancelProvideOrder}>
                      Hủy đơn
                    </Button>
                  </>
                )}   
              </div>
            </Form.Item>
          </Form>
        </Loading>
      </DrawerComponent>
    </div>
  );
};

export default FuelProvideManagement;
