import React, { useEffect, useRef, useState } from "react";
import "./User.scss";

import { Button, Form, Input, Select, Space, Upload } from "antd";
import { FaUser } from "react-icons/fa"; // Import biểu tượng từ react-icons

import * as UserServices from "../../../../services/UserServices";

import { BiImageAdd } from "react-icons/bi";
import { SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useMutationHooks } from "../../../../hooks/useMutationHook";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { getBase64 } from "../../../../ultils";
import { converDateString } from "../../../../ultils";

import { AiOutlineEdit } from "react-icons/ai";

import TableUser from "./TableUser";
import Loading from "../../../LoadingComponent/Loading";
import ModalComponent from "../../../ModalComponent/ModalComponent";
import DrawerComponent from "../../../DrawerComponent/DrawerComponent";
import Highlighter from "react-highlight-words";
import { useNavigate } from "react-router-dom";

import defaultBackground from "../../../../assets/def_avt.jpg";
import { useTranslation } from "react-i18next";
const UserComponent = () => {
  const { t } = useTranslation();

  // gọi vào store redux get ra user
  const [rowSelected, setRowSelected] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoadDetails, setIsLoadDetails] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);

  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  //  Search Props
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [formUpdate] = Form.useForm();
  const searchInput = useRef(null);

  //  State Details quản lý products khi có req edit
  const [stateDetailsUser, setStateDetailsUser] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "",
    avatar: "",
    address: "",
    birth_day: "",
    createdAt: "",
    gender: "",
    updatedAt: "",
  });

  // Fetch : Get User Details
  const fetchGetUserDetails = async ({ id, access_token }) => {
    const res = await UserServices.getDetailsUser(id, access_token);
    // Get respone từ api và gán vào state update details

    if (res?.data) {
      console.log("res?.data => ", res?.data);
      setStateDetailsUser({
        full_name: res?.data.full_name,
        email: res?.data.email,
        phone: res?.data.phone,
        role: res?.data?.role_id?.role_name,
        avatar: res?.data.avatar,
        address: res?.data.address,
        birth_day: res?.data.birth_day,
        createdAt: res?.data.createdAt,
        gender: res?.data.gender,
        updatedAt: res?.data?.updatedAt,
      });
    }

    setIsLoadDetails(false);
    return res;
  };

  // Handle Click Btn Edit Detail Product : Update product
  const handleDetailsProduct = () => {
    setIsDrawerOpen(true);
  };

  // Mutation - Update Product
  const mutationUpdate = useMutationHooks((data) => {
    const { id, token, dataUpdate } = data;
    // convert data tại đây tránh lỗi vặt
    if (dataUpdate?.role === "Admin") {
      dataUpdate.role = "67950da386a0a462d408c7b9";
    } else if (dataUpdate?.role === "User") {
      dataUpdate.role = "67950f9f8465df03b29bf752";
    } else if (dataUpdate?.role === "Supplier") {
      dataUpdate.role = "67950fec8465df03b29bf753";
    }
    const updatedData = {
      ...dataUpdate,
      role_id: dataUpdate?.role,
    };
    console.log("updatedData => ", updatedData);

    //remember return . tránh việc mutationUpdate không trả về data
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

  // Mutation - Delete Productd
  const mutationDelete = useMutationHooks((data) => {
    const { id, token } = data;
    return UserServices.blockUser(id, token);
  });

  const {
    data: deleteRespone,
    isPending: isPendingDelete,
    isSuccess: isSuccessDelete,
  } = mutationDelete;

  // Handle Notification and set loading for delete function
  useEffect(() => {
    if (isSuccessDelete) {
      if (deleteRespone?.status === "OK") {
        setIsOpenDelete(false);
        toast.success(deleteRespone?.message);
      } else {
        toast.success(deleteRespone?.message);
        setIsOpenDelete(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessDelete]);

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
  const fetchGetAllUsers = async () => {
    const access_token = user?.access_token;
    const res = await UserServices.getAllUser(access_token);
    return res;
  };

  // Usequery TỰ GET DỮ LIỆU TỪ PHÍA BE NGAY LẦN ĐẦU RENDER COMPONENT Này (Hiển thị list sản phẩm).
  // Tự động lấy dữ liệu: Ngay khi component chứa useQuery được render, useQuery sẽ tự động gọi hàm fetchGetAllProduct để lấy danh sách sản phẩm từ API.
  const queryUser = useQuery({
    queryKey: ["user"],
    queryFn: fetchGetAllUsers,
  });
  const { isLoading, data: users } = queryUser;

  // Handle Confirm Delete Product
  const handleConfirmDelete = () => {
    mutationDelete.mutate(
      { id: rowSelected, token: user?.access_token },
      {
        onSettled: () => {
          queryUser.refetch();
        },
      }
    );
  };

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
          queryUser.refetch();
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
      full_name: "",
      email: "",
      phone: "",
      role: "",
      avatar: "",
      address: "",
      birth_day: "",
      createdAt: "",
      gender: "",
      updatedAt: "",
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

  // CHANGE AVATAR - UPDATE
  const handleChangeAvatarDetails = async (info) => {
    // C2: getBase64
    try {
      const file = info?.fileList[0];
      if (!file?.url && !file?.preview) {
        file.preview = await getBase64(file?.originFileObj);
      }
      setStateDetailsUser((prev) => ({
        ...prev,
        avatar: file.preview,
      }));
    } catch (error) {
      console.log("Error", error);
    }
  };

  // DATA FROM USERS LIST
  const tableData =
    users?.data?.length &&
    users?.data.map((user) => {
      return {
        ...user,
        key: user._id,
        role: user?.role_id?.role_name,
      };
    });

  // Actions
  const renderAction = () => {
    return (
      <div
        className="flex justify-center items-center text-black gap-2 cursor-pointer hover:bg-gray-200 p-2 rounded-lg transition-all duration-200 w-[60%]"
        onClick={handleDetailsProduct}
      >
        <AiOutlineEdit className="text-xl" style={{ color: "blueviolet" }} />
        <span className="border-b-2 border-transparent hover:border-black transition-all duration-200">
          {t("user_list.detail")}
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
  const columns = [
    {
      title: t("user_list.name"),
      dataIndex: "full_name",
      key: "full_name",
      ...getColumnSearchProps("full_name"),
      sorter: (a, b) => a?.full_name.length - b?.full_name.length,
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          {t("user_list.email")}
        </div>
      ),
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps("email"),
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          {t("user_list.role")}
        </div>
      ),
      dataIndex: "role",
      key: "role",
      filters: [
        {
          text: "Admin",
          value: "Admin",
        },
        {
          text: "User",
          value: "User",
        },
        {
          text: "Supplier",
          value: "Supplier",
        },
      ],
      onFilter: (value, record) => {
        return record.role.includes(value);
      },
      render: (role) => <div style={{ textAlign: "center" }}>{role}</div>,
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          {t("user_list.phone")}
        </div>
      ),
      dataIndex: "phone",
      key: "phone",
      ...getColumnSearchProps("phone"),
      render: (phone) => <div style={{ textAlign: "center" }}>{phone}</div>,
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          {t("user_list.action")}
        </div>
      ),
      dataIndex: "action",
      render: (text, record) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {renderAction(text, record)}
        </div>
      ),
      align: "center",
    },
  ];
  return (
    <div className="Wrapper-Admin-User">
      <div className="Main-Content">
        <button
          onClick={() => navigate(-1)} // Quay lại trang trước đó
          className="flex mb-2 items-center bg-blue-500 text-white font-semibold py-1 px-3 rounded-md shadow-sm hover:bg-blue-600 transition duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1" // Kích thước biểu tượng nhỏ hơn
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
          {t("user_list.back")}
        </button>
        <div className="flex items-center text-xl font-semibold text-gray-800 mb-4">
          <FaUser className="text-2xl text-blue-500 mr-2" />{" "}
          {/* Biểu tượng người dùng */}
          <h5 className="relative">
            {t("user_list.title")}
            <span className="absolute left-0 right-0 bottom-0 h-1 bg-blue-500 transform scale-x-0 transition-transform duration-300 origin-left hover:scale-x-100"></span>{" "}
            {/* Hiệu ứng gạch dưới */}
          </h5>
        </div>
        {/* <div className="content-addUser">
          <Button onClick={showModal}>
            <BsPersonAdd></BsPersonAdd>
          </Button>
        </div> */}
        <div className="content-main-table-u  ser">
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
        title={t("user_list.update_title")}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        placement="right"
        width="40%"
        forceRender
        style={{ backgroundColor: "#f0f2f5" }} // Thay đổi màu nền
      >
        <Loading isPending={isLoadDetails || isPendingUpDate}>
          <Form
            name="update-form"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600, padding: "20px" }} // Thêm padding
            initialValues={{ remember: true }}
            onFinish={onFinishUpdate}
            autoComplete="on"
            form={formUpdate}
          >
            <Form.Item
              label={t("user_list.name")}
              name="full_name"
              rules={[
                { required: true, message: t("user_list.required_name") },
              ]}
            >
              <Input
                value={stateDetailsUser.full_name}
                onChange={(event) =>
                  handleOnChangeDetails(event.target.value, "full_name")
                }
                placeholder={t("user_list.name")}
                style={{ borderRadius: "5px" }} // Thêm bo góc
              />
            </Form.Item>

            <Form.Item
              label={t("user_list.email")}
              name="email"
              rules={[
                { required: true, message: t("user_list.required_email") },
              ]}
            >
              <Input
                value={stateDetailsUser.email}
                placeholder={t("user_list.email")}
                style={{ borderRadius: "5px" }}
                readOnly
              />
            </Form.Item>
            <Form.Item
              label={t("user_list.phone")}
              name="phone"
              rules={[
                { required: true, message: t("user_list.required_phone") },
              ]}
            >
              <Input
                value={stateDetailsUser.phone}
                placeholder={t("user_list.phone")}
                style={{ borderRadius: "5px" }}
                readOnly
              />
            </Form.Item>

            <Form.Item
              label={t("user_list.role")}
              name="role"
              rules={[{ required: true, message: t("user_list.select_role") }]}
            >
              <Select
                onChange={(value) => handleOnChangeDetails(value, "role")}
                style={{ borderRadius: "5px" }}
              >
                <Select.Option value="67950da386a0a462d408c7b9">
                  Admin
                </Select.Option>
                <Select.Option value="67950fec8465df03b29bf753">
                  Supplier
                </Select.Option>
                <Select.Option value="67950f9f8465df03b29bf752">
                  User{" "}
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label={t("user_list.upload_image")}>
              <Upload.Dragger
                listType="picture"
                showUploadList={{ showRemoveIcon: true }}
                accept=".png, .jpg, .jpeg, .gif, .webp, .avif, .esp"
                maxCount={1}
                beforeUpload={(file) => false}
                onChange={(event) => handleChangeAvatarDetails(event)}
                style={{ borderRadius: "5px", borderColor: "#1890ff" }} // Thay đổi màu viền
              >
                <div className="flex-center-center">
                  {t("user_list.upload_image")}
                  <BiImageAdd
                    style={{ marginLeft: "10px", fontSize: "20px" }}
                  />
                </div>
              </Upload.Dragger>
            </Form.Item>

            <Form.Item label={t("user_list.review_avatar")} name="avatar">
              <div style={{ display: "flex", justifyContent: "center" }}>
                <img
                  src={
                    stateDetailsUser?.avatar
                      ? stateDetailsUser?.avatar
                      : defaultBackground
                  }
                  alt="Avatar User"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "50%", // Bo tròn hình ảnh
                  }}
                />
              </div>
            </Form.Item>

            <Form.Item label={t("user_list.created_at")} name="created">
              <div className="flex justify-end">
                {converDateString(stateDetailsUser?.createdAt)}
              </div>
            </Form.Item>
            <Form.Item label={t("user_list.updated_at")} name="created">
              <div className="flex justify-end">
                {converDateString(stateDetailsUser?.updatedAt)}
              </div>
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                style={{ display: "block", borderRadius: "5px" }} // Thêm bo góc
              >
                {t("user_list.update")}
              </Button>
            </Form.Item>
          </Form>
        </Loading>
      </DrawerComponent>

      {/* Modal Confirm Delete Product */}
      <ModalComponent
        title={t("user_list.confirm_delete_title")}
        open={isOpenDelete}
        onCancel={handleCancelDelete}
        onOk={handleConfirmDelete}
      >
        <Loading isPending={isPendingDelete}>
          <div>{t("user_list.confirm_delete_text")}</div>
        </Loading>
      </ModalComponent>
    </div>
  );
};

export default UserComponent;
