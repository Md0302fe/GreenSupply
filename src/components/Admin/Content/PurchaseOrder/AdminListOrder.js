import React, { useEffect, useRef, useState } from "react";
import "./Order.scss";

import { Button, Descriptions, Form, Input, Select, Space, Upload } from "antd";

import * as UserServices from "../../../../services/UserServices";
import * as PurchaseOrderServices from "../../../../services/PurchaseOrderServices";

import { BiBlock, BiImageAdd, BiTrash } from "react-icons/bi";
import { SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useMutationHooks } from "../../../../hooks/useMutationHook";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { getBase64 } from "../../../../ultils";
import { converDateString } from "../../../../ultils";

import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";

import TableOrder from "./TableOrder";
import Loading from "../../../LoadingComponent/Loading";
import ModalComponent from "../../../ModalComponent/ModalComponent";
import DrawerComponent from "../../../DrawerComponent/DrawerComponent";
import Highlighter from "react-highlight-words";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const UserComponent = () => {
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
  const [purchaseDetails, setPurchaseDetails] = useState({
    request_name: "",
    quantity: 0,
    quantity_remain: 0,
    status: "",
    estimate_price: 0,
    fuel_type: "",
    note: "",
    updatedAt: "",
    fuel_image: "",
  });

  // Fetch : Get User Details
  const fetchGetPurchaseDetail = async ({ id, access_token }) => {
    try {
      setIsLoadDetails(true);
      const res = await PurchaseOrderServices.getDetailPurchaseOrder(
        id,
        access_token
      );

      console.log("Fetched Purchase Order Details:", res);
      if (res?.PurchaseOrderDetail) {
        setPurchaseDetails({
          request_name: res.PurchaseOrderDetail.request_name,
          start_received: res.PurchaseOrderDetail.start_received,
          end_received: res.PurchaseOrderDetail.end_received,
          due_date: res.PurchaseOrderDetail.due_date,
          quantity: res.PurchaseOrderDetail.quantity,
          quantity_remain: res.PurchaseOrderDetail.quantity_remain,
          status: res.PurchaseOrderDetail.status,
          price: res.PurchaseOrderDetail.price,
          fuel_type: res.PurchaseOrderDetail.fuel_type,
          updatedAt: res.PurchaseOrderDetail.updatedAt,
          fuel_image: res.PurchaseOrderDetail.fuel_image,
          total_price: res.PurchaseOrderDetail.total_price,
          note: res.PurchaseOrderDetail.note,
        });
      }
    } catch (error) {
      console.error("Error fetching purchase details:", error);
    } finally {
      setIsLoadDetails(false);
    }
  };

  // Handle Click Btn Edit Detail Product : Update product
  const handleDetailsProduct = () => {
    setIsDrawerOpen(true);
    fetchGetPurchaseDetail({
      id: rowSelected,
      access_token: user?.access_token,
    });
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
        fetchGetPurchaseDetail({
          id: rowSelected,
          access_token: user?.access_token,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelected, isDrawerOpen, isOpenDelete]);

  // Update stateDetails for form
  useEffect(() => {
    formUpdate.setFieldsValue(purchaseDetails);
  }, [formUpdate, setPurchaseDetails, purchaseDetails]);
  // handle Notification update product

  // -------------------------------------------------\\

  // GET ALL PRODUCT FROM DB
  const fetchGetAllPurchaseOrder = async () => {
    const access_token = user?.access_token;
    const res = await PurchaseOrderServices.getAllPurchaseOrder(access_token);
    return res.data;
  };

  // Usequery TỰ GET DỮ LIỆU TỪ PHÍA BE NGAY LẦN ĐẦU RENDER COMPONENT Này (Hiển thị list sản phẩm).
  // Tự động lấy dữ liệu: Ngay khi component chứa useQuery được render, useQuery sẽ tự động gọi hàm fetchGetAllProduct để lấy danh sách sản phẩm từ API.
  const queryUser = useQuery({
    queryKey: ["purchase_order"],
    queryFn: fetchGetAllPurchaseOrder,
  });
  const { isLoading, data: data_purchase } = queryUser;

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
        dataUpdate: purchaseDetails,
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
    setPurchaseDetails({
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
    setPurchaseDetails((prev) => ({
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
      setPurchaseDetails((prev) => ({
        ...prev,
        avatar: file.preview,
      }));
    } catch (error) {
      console.log("Error", error);
    }
  };
  console.log("checl => ", purchaseDetails);
  // Xử lý input
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Kiểm tra tên mặt hàng (Không chứa ký tự đặc biệt)
    if (name === "request_name") {
      if (!/^[a-zA-Z0-9\s\u00C0-\u1EF9]+$/.test(value)) {
        toast.warning("Tên mặt hàng chỉ chứa chữ, số và khoảng trắng!");
        return;
      }
      setPurchaseDetails((prev) => ({ ...prev, [name]: value }));

      return;
    }
    if ((name === "quantity" || name === "price") && value === "0") {
      return;
    }
    setPurchaseDetails((prev) => ({ ...prev, [name]: value }));
  };

  // DATA FROM USERS LIST
  const tableData =
    data_purchase?.data?.length &&
    data_purchase?.data.map((purchaseOrder) => {
      return {
        ...purchaseOrder,
        key: purchaseOrder._id,
        quantity_remain: purchaseOrder?.quantity_remain || 0,
        quantity: purchaseOrder?.quantity || 0,
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
          Chi tiết
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
    // {
    //   title: "Hình ảnh",
    //   dataIndex: "fuel_image",
    // },
    {
      title: "Tên đơn hàng",
      dataIndex: "request_name",
      key: "request_name",
      ...getColumnSearchProps("request_name"),
      sorter: (a, b) => a?.request_name.length - b?.request_name.length,
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>SL Cần thu</div>
      ),
      dataIndex: "quantity_remain",
      key: "quantity_remain",
      render: (text, record) => {
        if (
          record?.quantity_remain !== undefined &&
          record?.quantity !== undefined
        ) {
          return (
            <div style={{ textAlign: "center" }}>
              <b>
                {record.quantity_remain} / {record.quantity}
              </b>
            </div>
          );
        }
        return <div style={{ textAlign: "center", color: "red" }}>N/A</div>;
      },
      sorter: (a, b) => (a.quantity_remain || 0) - (b.quantity_remain || 0),
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>Trạng thái</div>
      ),
      dataIndex: "status",
      key: "status",
      ...getColumnSearchProps("status"),
      render: (status) => <div style={{ textAlign: "center" }}>{status}</div>,
    },

    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>Chức năng</div>
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
        <h5 className="content-title">quản lý đơn thu nhiên liệu</h5>
        {/* <div className="content-addUser">
          <Button onClick={showModal}>
            <BsPersonAdd></BsPersonAdd>
          </Button>
        </div> */}
        <div className="content-main-table-user">
          <TableOrder
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
          ></TableOrder>
        </div>
      </div>

      {/* DRAWER - Update Product */}
      <DrawerComponent
        title="Chi Tiết Đơn Thu Nhiên Liệu"
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        placement="right"
        width="50%"
        forceRender
      >
        <Loading isPending={isLoadDetails}>
          {/* Form cập nhật đơn thu nhiên liệu */}
          <div className="w-full bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                🚀 Cập Nhật Đơn Thu Nhiên Liệu
              </h2>
              <div className="space-y-4">
                {/* Tên đơn */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    Tên Đơn
                  </label>
                  <input
                    type="text"
                    name="request_name"
                    maxLength="50"
                    placeholder="Tên đơn thu nhiên liệu..."
                    value={purchaseDetails.request_name}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  />
                </div>

                {/* Loại nhiên liệu */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    Loại nhiên liệu cần thu
                  </label>
                  <select
                    name="fuel_type"
                    value={purchaseDetails.fuel_type}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  >
                    <option value="" disabled>
                      Chọn loại nhiên liệu
                    </option>
                    <option value="67950da386a0a462d408c7b9">Xăng</option>
                    <option value="67950fec8465df03b29bf753">Dầu Diesel</option>
                    <option value="67950f9f8465df03b29bf752">
                      Khí hóa lỏng
                    </option>
                  </select>
                </div>

                {/* Ảnh nhiên liệu */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 min-h-[20vh]">
                  {/* Tiêu đề */}
                  <div className="w-full md:w-1/4 text-gray-800 font-semibold">
                    Hình ảnh
                  </div>

                  {/* Upload Button */}
                  <div className="w-full md:w-1/4">
                    <Upload.Dragger
                      listType="picture"
                      showUploadList={{ showRemoveIcon: true }}
                      accept=".png, .jpg, .jpeg, .gif, .webp, .avif, .eps"
                      maxCount={1}
                      beforeUpload={() => false}
                      onChange={() => {}}
                      className="!w-full"
                    >
                      <button className="bg-gray-200 p-2 rounded hover:bg-gray-300">
                        Tải ảnh lên
                      </button>
                    </Upload.Dragger>
                  </div>

                  {/* Hiển thị hình ảnh */}
                  {purchaseDetails?.fuel_image && (
                    <div className="w-full md:w-1/2">
                      <img
                        src={purchaseDetails.fuel_image}
                        alt="Hình ảnh nhiên liệu"
                        className="w-full h-auto max-h-[300px] object-contain rounded-lg shadow-md border border-gray-300"
                      />
                    </div>
                  )}
                </div>

                {/* Số lượng cần thu */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    Tổng số lượng cần thu (Kg)
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    placeholder="Nhập số lượng..."
                    value={purchaseDetails.quantity}
                    onChange={() => {}}
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  />
                </div>

                {/* Giá trên mỗi kg */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    Giá trên mỗi Kg / Đơn vị (VND)
                  </label>
                  <input
                    type="number"
                    name="price"
                    min="1"
                    placeholder="Nhập giá..."
                    value={purchaseDetails.price}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  />
                </div>

                {/* Ngày nhận đơn */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-800 font-semibold mb-2">
                      Ngày bắt đầu nhận đơn
                    </label>
                    <DatePicker
                      selected={purchaseDetails.start_received}
                      onChange={(date) =>
                        handleChange({
                          target: { name: "start_received", value: date },
                        })
                      }
                      dateFormat="dd/MM/yyyy"
                      className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                      placeholderText="Chọn ngày"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-800 font-semibold mb-2">
                      Ngày kết thúc nhận đơn
                    </label>
                    <DatePicker
                      selected={purchaseDetails.end_received}
                      onChange={(date) =>
                        handleChange({
                          target: { name: "end_received", value: date },
                        })
                      }
                      dateFormat="dd/MM/yyyy"
                      className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                      placeholderText="Chọn ngày"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-800 font-semibold mb-2">
                      Hạn chót hoàn thành đơn
                    </label>
                    <DatePicker
                      selected={purchaseDetails.due_date}
                      onChange={(date) =>
                        handleChange({
                          target: { name: "due_date", value: date },
                        })
                      }
                      dateFormat="dd/MM/yyyy"
                      className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                      placeholderText="Chọn ngày"
                    />
                  </div>
                </div>

                {/* Mức độ ưu tiên */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    Mức độ ưu tiên
                  </label>
                  <select
                    name="priority"
                    value={purchaseDetails.priority}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  >
                    <option value="" disabled>
                      Chọn mức độ ưu tiên
                    </option>
                    <option value="Cao">Cao</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Thấp">Thấp</option>
                  </select>
                </div>

                {/* Ghi chú */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    name="note"
                    placeholder="Nhập ghi chú..."
                    rows="3"
                    value={purchaseDetails.note}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  />
                </div>

                {/* Tổng giá */}
                <div className="font-semibold text-lg text-gray-800">
                  Tổng giá:{" "}
                  <span className="text-red-500 font-bold">
                    {(
                      purchaseDetails.quantity * purchaseDetails.price
                    ).toLocaleString("vi-VN")}{" "}
                    VNĐ
                  </span>
                </div>

                {/* Nút bấm */}
                {/* <div className="flex flex-col md:flex-row md:justify-between gap-4">
            <button
              onClick={() => handleSubmit()}
              className="bg-yellow-400 text-gray-800 font-bold px-4 py-2 rounded hover:bg-yellow-500 w-full md:w-auto"
            >
              📨 Gửi Yêu Cầu
            </button>
            <button
              type="button"
              onClick={() => setFormData({})}
              className="bg-green-600 text-white font-bold px-4 py-2 rounded hover:bg-green-700 w-full md:w-auto"
            >
              🔄 Làm mới
            </button>
          </div> */}
              </div>
            </div>
          </div>
        </Loading>
      </DrawerComponent>

      {/* Modal Confirm Delete Product */}
      <ModalComponent
        title="Xóa Tài Khoản"
        open={isOpenDelete}
        onCancel={handleCancelDelete}
        onOk={handleConfirmDelete}
      >
        <Loading isPending={isPendingDelete}>
          <div>Bạn có chắc muốn xóa sản phẩm không ?</div>
        </Loading>
      </ModalComponent>
    </div>
  );
};

export default UserComponent;
