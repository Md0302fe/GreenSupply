import React, { useEffect, useRef, useState } from "react";
import "./User.scss";

import { Button, Form, Input, Modal, Select, Space, Upload } from "antd";

import * as UserServices from "../../../../services/UserServices";

import { BiBlock, BiImageAdd } from "react-icons/bi";
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
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BlockedUserComponent = () => {
  const { t } = useTranslation();
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

  const navigate = useNavigate();

  //  State Details quản lý products khi có req edit
  const [stateDetailsUser, setStateDetailsUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    avatar: "",
    address: "",
    is_blocked: "",
    is_deleted: "",
  });

  // Fetch : Get User Details
  const fetchGetUserDetails = async ({ id, access_token }) => {
    const res = await UserServices.getDetailsUser(id, access_token);
    // Get respone từ api và gán vào state update details
    if (res?.data) {
      setStateDetailsUser({
        name: res?.data?.full_name,
        email: res?.data?.email,
        phone: res?.data?.phone,
        role: res?.data?.role_id?.role_name,
        avatar: res?.data?.avatar,
        address: res?.data?.is_blocked,
        is_blocked: res?.data?.is_blocked ? "Bị chặn" : "Hoạt động",
        is_deleted: res?.data?.is_deleted ? "Đã xóa" : "Hoạt động",
      });
    }

    setIsLoadDetails(false);
    return res;
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
    console.log("selectedRow => ", rowSelected);
    console.log("id => ", id);
    return UserServices.blockUser(id, token);
  });

  const {
    data: deleteRespone,
    isPending: isPendingDelete,
    isSuccess: isSuccessDelete,
  } = mutationDelete;

  // Mutation - Delete Productd
  const mutationUnBlock = useMutationHooks((data) => {
    const { id, token } = data;
    return UserServices.unBlockUser(id, token);
  });

  const {
    data: unblockRespone,
    isPending: isPendingUnblock,
    isSuccess: isSuccessUnblock,
  } = mutationUnBlock;

  // Handle Notification and set loading for delete function
  useEffect(() => {
    if (isSuccessDelete || isSuccessUnblock) {
      if (deleteRespone?.status === "OK" || unblockRespone?.status === "OK") {
        setIsOpenDelete(false);
        toast.success(deleteRespone?.message);
        toast.success(unblockRespone?.message);
      } else {
        toast.error(deleteRespone?.message);
        toast.error(unblockRespone?.message);
        setIsOpenDelete(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessDelete, isSuccessUnblock]);

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
    queryKey: ["blocked-user"],
    queryFn: fetchGetAllUsers,
  });
  const { isLoading, data: users } = queryUser;

  // Handle Confirm Delete Product
  const handleConfirmBlock = (accountId) => {
    mutationDelete.mutate(
      { id: accountId, token: user?.access_token },
      {
        onSettled: () => {
          queryUser.refetch();
        },
      }
    );
  };
  const handleConfirmUnBlock = (accountId) => {
    console.log("Unblocking user with ID:", accountId);
    mutationUnBlock.mutate(
      { id: accountId, token: user?.access_token },
      {
        onSettled: () => {
          console.log("User unblocked, refetching...");
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

  // CANCEL MODAL - Close Modal - CLOSE FORM UPDATE
  const handleCancelUpdate = () => {
    setStateDetailsUser({
      name: "",
      email: "",
      phone: "",
      role: "",
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
        is_blocked: user?.is_blocked,
      };
    });

  // Actions
  const renderAction = (role, record) => {
    return (
      <Loading isPending={isPendingDelete || isPendingUnblock}>
        <div
          className="flex-center-center"
          style={{ justifyContent: "space-around" }}
        >
          <Button
            type="default"
            onClick={() =>
              record?.is_blocked
                ? handleUnBlockAccount(record?._id)
                : handleBlockAccount(record?._id)
            }
            style={{
              borderRadius: "5px",
              fontSize: "14px",
              transition: "all 0.3s ease",
              backgroundColor: record?.is_blocked ? "#52c41a" : "#ffa940", // Xanh lá khi bỏ chặn, vàng khi chặn
              borderColor: record?.is_blocked ? "#52c41a" : "#ffa940",
              color: "white",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = record?.is_blocked
                ? "#73d13d" // Màu sáng hơn khi hover (bỏ chặn)
                : "#ffc53e"; // Màu sáng hơn khi hover (chặn)
              e.currentTarget.style.color = "black";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = record?.is_blocked
                ? "#52c41a"
                : "#ffa940";
              e.currentTarget.style.color = "white";
            }}
          >
            <BiBlock style={{ marginRight: "5px" }} />
            <span>
              {record?.is_blocked
                ? t("blocked_user.unblock")
                : t("blocked_user.block")}
            </span>
          </Button>
        </div>
      </Loading>
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

  const handleBlockAccount = (accountId) => {
    Modal.confirm({
      title: t("blocked_user.confirm_block_title"),
      content: t("blocked_user.confirm_block_text"),
      okText: t("common.confirm"),
      cancelText: t("common.cancel"),
      width: 600,
      onOk() {
        handleConfirmBlock(accountId); // Truyền đúng accountId
      },
    });
  };

  const handleUnBlockAccount = (accountId) => {
    Modal.confirm({
      title: "Xác nhận gỡ chặn tài khoản",
      content: "Bạn có chắc chắn muốn gỡ chặn tài khoản này không?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      width: 600,
      onOk() {
        handleConfirmUnBlock(accountId); // Truyền đúng accountId
      },
    });
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
      title: t("blocked_user.name"),
      dataIndex: "full_name",
      key: "full_name",
      ...getColumnSearchProps("full_name"),
      sorter: (a, b) => a?.full_name.length - b?.full_name.length,
    },
    {
      title: <div style={{ textAlign: "center", width: "100%" }}>Email</div>,
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps("email"),
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          {t("blocked_user.role")}
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
          {t("blocked_user.status")}
        </div>
      ),
      dataIndex: "is_blocked",
      key: "is_blocked",
      filters: [
        {
          text: t("blocked_user.active"),
          value: false,
        },
        {
          text: t("blocked_user.blocked"),
          value: true,
        },
      ],
      onFilter: (value, record) => {
        return record.is_blocked === value;
      },
      render: (isBlocked) => {
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {isBlocked ? (
              <span
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "red",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  minWidth: "80px",
                }}
              >
                {t("blocked_user.blocked")}
              </span>
            ) : (
              <span
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(0, 255, 0, 0.2)",
                  color: "green",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  gap: "6px",
                  minWidth: "80px",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: "green",
                    borderRadius: "50%",
                    display: "inline-block",
                  }}
                ></span>
                {t("blocked_user.active")}
              </span>
            )}
          </div>
        );
      },
      align: "center",
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          {t("blocked_user.action")}
        </div>
      ),
      dataIndex: "action",
      render: (role, record) => renderAction(role, record),
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
          {t("blocked_user.back")}
        </button>
        <h5 className="content-title">{t("blocked_user.title")}</h5>
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
        title={t("blocked_user.drawer_title")}
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
              label={t("blocked_user.name")}
              name="name"
              rules={[
                { required: true, message: t("blocked_user.required_name") },
              ]}
            >
              <Input
                value={stateDetailsUser.name}
                onChange={(event) =>
                  handleOnChangeDetails(event.target.value, "name")
                }
                placeholder={t("blocked_user.name")}
                style={{ borderRadius: "5px" }} // Thêm bo góc
              />
            </Form.Item>

            <Form.Item
              label={t("blocked_user.email")}
              name="email"
              rules={[
                { required: true, message: t("blocked_user.required_email") },
              ]}
            >
              <Input
                value={stateDetailsUser.email}
                onChange={(event) =>
                  handleOnChangeDetails(event.target.value, "email")
                }
                placeholder={t("blocked_user.email")}
                style={{ borderRadius: "5px" }}
              />
            </Form.Item>

            <Form.Item
              label={t("blocked_user.phone")}
              name="phone"
              rules={[
                { required: true, message: t("blocked_user.required_phone") },
              ]}
            >
              <Input
                value={stateDetailsUser.phone}
                onChange={(event) =>
                  handleOnChangeDetails(event.target.value, "phone")
                }
                placeholder={t("blocked_user.phone")}
                style={{ borderRadius: "5px" }}
              />
            </Form.Item>

            <Form.Item
              label={t("blocked_user.role")}
              name="role"
              rules={[
                { required: true, message: t("blocked_user.required_role") },
              ]}
            >
              <Select
                value={"keke"}
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

            <Form.Item label={t("blocked_user.image")}>
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
                  {t("blocked_user.upload_image")}
                  <BiImageAdd
                    style={{ marginLeft: "10px", fontSize: "20px" }}
                  />
                </div>
              </Upload.Dragger>
            </Form.Item>

            <Form.Item label={t("blocked_user.review_avatar")} name="avatar">
              <img
                src={stateDetailsUser?.avatar}
                alt="Avatar User"
                style={{
                  width: "50%",
                  objectFit: "cover",
                  borderRadius: "5px",
                }} // Thêm bo góc
              />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                style={{ display: "block", borderRadius: "5px" }} // Thêm bo góc
              >
                {t("blocked_user.update")}
              </Button>
            </Form.Item>
          </Form>
        </Loading>
      </DrawerComponent>
    </div>
  );
};

export default BlockedUserComponent;
