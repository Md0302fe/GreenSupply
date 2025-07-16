import React, { useEffect, useRef, useState } from "react";
import "./User.scss";

import { Button, Form, Input, Select, Space, Upload } from "antd";
import dayjs from "dayjs";
import { FaUser } from "react-icons/fa"; // Import biểu tượng từ react-icons
import { AiFillEdit } from "react-icons/ai";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import ButtonComponent from "../../../ButtonComponent/ButtonComponent";
import * as UserServices from "../../../../services/UserServices";

import { BiImageAdd } from "react-icons/bi";
import { SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useMutationHooks } from "../../../../hooks/useMutationHook";
import { message } from "antd";
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
  const [drawerMode, setDrawerMode] = useState(null);

  const isDrawerOpen = drawerMode !== null;
  const isViewMode = drawerMode === "view";
  const isEditMode = drawerMode === "edit";

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
    return res;
  };

  // Handle Click Btn Edit Detail Product : Update product
  const handleDetailsProduct = () => {
    setDrawerMode("edit");
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
      dataUpdate.role = "686f3835d7eaed8a9fd5a8b8";
    } else if (dataUpdate?.role === "Material_Manager") {
      dataUpdate.role = "686f3835d7eaed8a9fd5a8b7";
    } else if (dataUpdate?.role === "Warehouse_Manager") {
      dataUpdate.role = "686f3835d7eaed8a9fd5a8b6";
    } else if (dataUpdate?.role === "Process_Manager") {

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
        message.success(deleteRespone?.message);
      } else {
        message.success(deleteRespone?.message);
        setIsOpenDelete(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessDelete]);

  // Handle each time rowSelected was call
  useEffect(() => {
    if (rowSelected && drawerMode !== null) {
      fetchGetUserDetails({
        id: rowSelected,
        access_token: user?.access_token,
      });
    }
  }, [rowSelected, drawerMode]);

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
        message.success(dataRes?.message);
        handleCancelUpdate();
      } else {
        message.error(dataRes?.message);
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
    setDrawerMode(null);
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
  const renderAction = (record) => {
    return (
      <div className="flex justify-center items-center gap-2">
        <div
          className="flex items-center gap-1 cursor-pointer text-black hover:bg-gray-200 px-2 py-1 rounded transition-all"
          onClick={() => {
            setRowSelected(record._id);
            setDrawerMode("view"); // Mở Drawer ở chế độ "chi tiết"
          }}
        >
          <AiOutlineEdit className="text-xl text-blue-500" />
          <span className="hover:underline">{t("user_list.detail")}</span>
        </div>
        <div
          className="flex items-center gap-1 cursor-pointer text-black hover:bg-gray-200 px-2 py-1 rounded transition-all"
          onClick={() => {
            setRowSelected(record._id);
            setDrawerMode("edit");;
          }}
        >
          <AiOutlineEdit className="text-xl text-green-600" />
          <span className="hover:underline">{t("user_list.update")}</span>
        </div>
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
  const columns = [
    {
      title: (
        <div style={{ textAlign: "left", width: "100%" }}>
          {t("user_list.name")}
        </div>
      ),
      dataIndex: "full_name",
      key: "full_name",
      ...getColumnSearchProps("full_name"),
      sorter: (a, b) => a?.full_name.length - b?.full_name.length,
    },
    {
      title: (
        <div style={{ textAlign: "left", width: "100%" }}>
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
      key: "action",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center items-center gap-2">
          {/* Nút Chi tiết */}
          <Button
            size="middle"
            icon={<HiOutlineDocumentSearch style={{ color: "dodgerblue" }} />}
            onClick={() => {
              setRowSelected(record._id);
              setDrawerMode("view"); // hoặc handleViewDetail nếu tên khác
            }}
          />

          {/* Nút Cập nhật */}
          <Button
            size="middle"
            icon={<AiFillEdit style={{ color: "black" }} />}
            className="bg-white hover:bg-gray-200 text-black"
            onClick={() => {
              setRowSelected(record._id);
              setDrawerMode("edit"); // mở Drawer update
            }}
          />
        </div>
      ),
    }
  ];
  return (
    <div className="Wrapper-Admin-User">
      <div className="Main-Content py-8 md:p-6 lg:p-6">
        {/* Header: Nút quay lại + Tiêu đề căn giữa */}
        <div className="flex items-center justify-between flex-wrap gap-2 md:mb-16 mt-4">
          {/* Nút quay lại */}
          <button
            onClick={() => navigate(-1)}
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
            <span className="hidden md:inline">{t("user_list.back")}</span>
          </button>

          {/* Tiêu đề trung tâm có icon */}
          <div className="flex items-center justify-center flex-grow text-gray-800">
            <FaUser className="text-2xl text-black mr-2" />
            <h5 className="relative text-2xl font-semibold">
              {t("user_list.title")}
              <span className="absolute left-0 right-0 bottom-0 h-1 bg-blue-500 transform scale-x-0 transition-transform duration-300 origin-left hover:scale-x-100"></span>
            </h5>
          </div>

          {/* Placeholder phải để cân đối (ẩn trên mobile) */}
          <div className="hidden md:block min-w-[100px]"></div>
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
            scroll={{ x: "max-content" }}
          ></TableUser>
        </div>
      </div>

      {/* DRAWER - Update Product */}
      <DrawerComponent
        title={
          isEditMode
            ? t("user_list.update_title")
            : t("user_list.detail_title")
        }
        isOpen={isDrawerOpen}
        onClose={() => setDrawerMode(null)}
        placement="right"
        width={drawerWidth}
      >
        <div className="w-full p-6 bg-white rounded-md shadow">
          <div className="grid grid-cols-1 gap-2 mb-2">
            {/* Họ tên */}
            <div>
              <label className="block mb-1 font-semibold">{t("user_list.name")}</label>
              <input
                type="text"
                value={stateDetailsUser.full_name}
                onChange={(e) => handleOnChangeDetails(e.target.value, "full_name")}
                placeholder={t("user_list.name")}
                className="border p-2 rounded w-full mb-2"
                disabled={isViewMode}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 font-semibold">{t("user_list.email")}</label>
              <input
                type="text"
                value={stateDetailsUser.email}
                readOnly
                className="border p-2 rounded w-full mb-0 bg-gray-100"
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block mb-2 font-semibold">{t("user_list.phone")}</label>
              <input
                type="text"
                value={stateDetailsUser.phone}
                readOnly
                className="border p-2 rounded w-full mb-2 bg-gray-100"
              />
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="block mb-1 font-semibold">{t("user_list.address")}</label>
              <input
                type="text"
                value={stateDetailsUser.address}
                readOnly
                className="border p-2 rounded w-full mb-2 bg-gray-100"
              />
            </div>

            {/* Giới tính */}
            <div>
              <label className="block mb-1 font-semibold">{t("user_list.gender")}</label>
              <select
                value={stateDetailsUser.gender}
                disabled
                className={`border p-2 rounded w-full mb-2 ${isViewMode ? "appearance-none bg-gray-100 cursor-default" : ""}`}
              >
                <option value="male">{t("user_list.male")}</option>
                <option value="female">{t("user_list.female")}</option>
                <option value="other">{t("user_list.other")}</option>
              </select>
            </div>

            {/* Ngày sinh */}
            <div>
              <label className="block mb-2 font-semibold">{t("user_list.birth_day")}</label>
              <input
                type="text"
                value={
                  stateDetailsUser.birth_day
                    ? dayjs(stateDetailsUser.birth_day).format("DD-MM-YYYY")
                    : ""
                }
                readOnly
                className="border p-2 rounded w-full mb-2 bg-gray-100"
              />
            </div>

            {/* Vai trò */}
            <div>
              <label className="block mb-2 font-semibold">{t("user_list.role")}</label>
              <select
                value={stateDetailsUser.role}
                onChange={(e) => handleOnChangeDetails(e.target.value, "role")}
                className={`border p-2 rounded w-full mb-2 ${isViewMode ? "appearance-none bg-gray-100 cursor-default" : ""}`}
                disabled={isViewMode}
              >
                {/* id Admin */}
                <option value="67950da386a0a462d408c7b9">Admin</option>
                {/* id Material Manager */}
                <option value="686f3835d7eaed8a9fd5a8b8">Material_Manager</option>
                {/* id Warehouse_Manager */}
                <option value="686f3835d7eaed8a9fd5a8b7">Warehouse_Manager</option>
                {/* id Production_Manager */}
                <option value="686f3835d7eaed8a9fd5a8b6">Process_Manager</option>
                {/* id Supplier*/}
                <option value="67950fec8465df03b29bf753">Supplier</option>
                {/* id  User */}
                <option value="67950f9f8465df03b29bf752">User</option>


              </select>
            </div>

            {/* Upload avatar */}
            {!isViewMode && (
              <div>
                <label className="block mb-2 font-semibold">{t("user_list.upload_image")}</label>
                <Upload.Dragger
                  listType="picture"
                  showUploadList={{ showRemoveIcon: true }}
                  accept=".png,.jpg,.jpeg,.webp"
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={handleChangeAvatarDetails}
                  style={{ borderRadius: "5px", borderColor: "#1890ff" }}
                >
                  <div className="flex justify-center items-center">
                    {t("user_list.upload_image")}
                    <BiImageAdd className="ml-2 text-lg" />
                  </div>
                </Upload.Dragger>
              </div>
            )}

            {/* Ảnh đại diện xem trước */}
            <div>
              <label className="block mt-4 font-semibold">{t("user_list.review_avatar")}</label>
              <div className="flex justify-center">
                <img
                  src={stateDetailsUser?.avatar || defaultBackground}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover"
                />
              </div>
            </div>

            {/* Created at */}
            <div>
              <label className="block mb-2 font-semibold">{t("user_list.created_at")}</label>
              <p className="text-left">
                {converDateString(stateDetailsUser?.createdAt)}
              </p>
            </div>

            {/* Updated at */}
            <div>
              <label className="block mb-2 font-semibold">{t("user_list.updated_at")}</label>
              <p className="text-left">
                {converDateString(stateDetailsUser?.updatedAt)}
              </p>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex justify-end gap-4 mt-2">
            {isEditMode && (
              <>
                <ButtonComponent type="update" onClick={onFinishUpdate} />
                <ButtonComponent type="close" onClick={() => setDrawerMode(null)} />
              </>
            )}
            {isViewMode && (
              <ButtonComponent type="close" onClick={() => setDrawerMode(null)} />
            )}
          </div>
        </div>
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
