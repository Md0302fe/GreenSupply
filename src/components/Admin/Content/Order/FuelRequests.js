import React, { useEffect, useRef, useState } from "react";
import "./Order.scss";

import { Button, Form, Input, Select, Space, Upload } from "antd";

import * as UserServices from "../../../../services/UserServices";
import * as OrderServices from "../../../../services/OrderServices";

import { SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useMutationHooks } from "../../../../hooks/useMutationHook";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";


import TableUser from "./TableUser";
import Loading from "../../../LoadingComponent/Loading";

import DrawerComponent from "../../../DrawerComponent/DrawerComponent";
import Highlighter from "react-highlight-words";
import { message } from "antd";
import { handleAcceptOrders, handleCancelOrders } from "../../../../services/OrderServices"; 

const FuelRequestsManagement = () => {
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

  //  State Details quản lý products khi có req edit
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
  console.log("statedetails",stateDetailsUser)

  // Fetch : Get User Details
  const fetchGetUserDetails = async ({ id, access_token }) => {
    const res = await OrderServices.getDetailOrders(id, access_token);
    // Get respone từ api và gán vào state update details

    if (res?.data) {
      setStateDetailsUser({   
    _id: res?.data._id,
    address: res?.data.address, 
    createdAt: res?.data.createdAt,
    updatedAt: res?.data.updatedAt,
    fuel_name: res?.data.fuel_name,
    is_deleted:res?.data.is_deleted,
    note: res?.data.note,
    price: res?.data.price,
    priority: res?.data.priority,
    quantity: res?.data.quantity,
    status: res?.data.status,
    supplier_id: res?.data.supplier_id,
    total_price: res?.data.total_price,
      });
    }

    setIsLoadDetails(false);
    return res;
  };


//accept order 
  const handleApproveOrder = async () => {
    try {
      const response = await handleAcceptOrders(stateDetailsUser._id,);
      if (response) {
        message.success("Đơn hàng đã được duyệt thành công!");
      } else {
        message.error("Duyệt đơn thất bại!");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi duyệt đơn!");
    }
  };
// cancel orders
  const handleCancelOrder = async () => {
    try {
      const response = await handleCancelOrders(stateDetailsUser._id, );
      if (response) {
        message.success("Đơn hàng đã bị hủy thành công!");
      } else {
        message.error("Hủy đơn thất bại!");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi hủy đơn!");
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


  // Submit Form Update Product
  const onFinishUpdate = () => {
    mutationUpdate.mutate(
      // params 1: Object {chứa thông tin của }
      {
        id: rowSelected,
        token: user?.access_token,
        dataUpdate: stateDetailsUser,
      },
      // callback onSettled : đây là 1 chức năng của useQuery giúp tự động gọi hàm get lại danh sách sản phẩm (cập nhật list mới nhất)
      {
        onSettled: () => {
          queryOrder.refetch();
        },
      }
    );
  };

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

  // CANCEL MODAL - DELETE PRODUCT
  const handleCancelDelete = () => {
    setIsOpenDelete(false);
  };

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

  // ONCHANGE FIELDS - UPDATE
  const handleOnChangeDetails = (value, name) => {
    setStateDetailsUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // DATA FROM USERS LIST
  const tableData =
    orders?.data?.length &&
    orders?.data.map((order) => {

      return {
        ...order,
        key: order._id,
        customerName: order?.supplier_id?.full_name
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
        <span style={{ 
            color: "#FF5733", // Màu sắc chữ
            fontWeight: "bold", // Đậm
            textDecoration: "underline", // Gạch chân
            fontSize: "16px", // Kích thước chữ
            transition: "color 0.3s", // Hiệu ứng chuyển màu
        }}>
          Xem Chi Tiết Đơn
        </span>
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
          text: "Đang chờ",
          value: "Đang chờ",
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
      onFilter: (value, record) => {
      return record.status.includes(value);
        
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
        <h5 className="content-title">quản lý đơn yêu cầu thu nguyên liệu</h5>
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
        width="50%"
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
            onFinish={onFinishUpdate}
            autoComplete="on"
            form={formUpdate}
          >
            <Form.Item label="Khách Hàng" name="customerName">
            <span>{stateDetailsUser?.supplier_id?.full_name || ""}</span>
            </Form.Item>

            <Form.Item label="Loại Nhiên Liệu" name="fuel_name">
            <span>{stateDetailsUser?.fuel_name || ""}</span>
            </Form.Item>

            <Form.Item label="Giá Tiền" name="price">
            <span>{stateDetailsUser?.price|| ""}</span>
            </Form.Item>

            <Form.Item label="Priority" name="priority">
            <span>{stateDetailsUser?.priority || ""}</span>

            </Form.Item><Form.Item label="Số Lượng" name="quantity">
            <span>{stateDetailsUser?.quantity || ""}</span>
            </Form.Item>

            <Form.Item label="Trạng Thái" name="status">
            <span>{stateDetailsUser?.status || ""}</span>

            </Form.Item>
            
            <Form.Item label="Tổng Giá" name="total_price">
            <span>{stateDetailsUser?.total_price || ""}</span>
            </Form.Item>

            <Form.Item label="Ghi chú" name="note">
            <span>{stateDetailsUser?.note || ""}</span>
            </Form.Item>

            

            <Form.Item label="Created At" name="createdAt">
            <span>{stateDetailsUser?.createdAt || ""}</span>

            </Form.Item><Form.Item label="Updated At" name="updatedAt">
            <span>{stateDetailsUser?.updatedAt || ""}</span>
            </Form.Item>

            <Form.Item
                          wrapperCol={{
                            offset: 8,
                            span: 16,
                          }}
                        >
                          <div style={{ display: "flex", gap: "10px" }}>
                          <Button 
                            type="primary" 
                               onClick={handleApproveOrder}  // Gọi API duyệt đơn
                                >
                            Duyệt đơn
                              </Button>
            
            
                              <Button 
      type="default" 
      danger
      onClick={handleCancelOrder}  // Gọi API Hủy đơn
    >
      Hủy đơn
    </Button>
            </div>
            
                        </Form.Item>
            

          </Form>
        </Loading>
      </DrawerComponent>


    </div>
  );
};

export default FuelRequestsManagement;
