import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  MDBBreadcrumb,
  MDBBreadcrumbItem,
  MDBContainer,
  MDBRow,
  MDBCol,
} from "mdb-react-ui-kit";

import Loading from "../../components/LoadingComponent/Loading";

const fetchAddresses = async (setAddresses, setError, setLoading) => {
  try {
    const token = JSON.parse(localStorage.getItem("access_token"));
    const response = await axios.get(
      "http://localhost:3001/api/user/address/getAll",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setAddresses(response.data.data);
  } catch (err) {
    setError("Không thể tải danh sách địa chỉ.");
  } finally {
    setLoading(false);
  }
};

const handleDelete = async (id, addresses, setAddresses) => {
  if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
    try {
      const token = JSON.parse(localStorage.getItem("access_token"));
      await axios.delete(
        `http://localhost:3001/api/user/address/delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAddresses(addresses.filter((addr) => addr._id !== id));

      // Thông báo xóa thành công
      toast.success("Xóa địa chỉ thành công!", {
        position: "top-right",
        autoClose: 3000, // Tự động ẩn sau 3s
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error("Xóa địa chỉ thất bại!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }
};

const Address = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAddresses(setAddresses, setError, setLoading);
  }, []);

  return (
    <div className="User-Address Container flex-center-center mb-4 mt-4">
      <div className="Wrapper Width">
        <Loading isPending={loading}>
          <div className="bg-white shadow-lg rounded-lg p-6 border">
            <MDBContainer>
              <MDBRow>
                <MDBCol>
                  <MDBBreadcrumb className="bg-light rounded-3 p-3 mb-4 border ">
                    <MDBBreadcrumbItem>
                      <span
                        onClick={() => navigate("/")}
                        className="cursor-pointer hover:border-b hover:border-black transition-all duration-200"
                      >
                        Home
                      </span>
                    </MDBBreadcrumbItem>
                    <MDBBreadcrumbItem>
                      <span
                        onClick={() => navigate("/profile")}
                        className="cursor-pointer hover:border-b hover:border-black transition-all duration-200"
                      >
                        User Profile
                      </span>
                    </MDBBreadcrumbItem>
                    <MDBBreadcrumbItem active>View Address</MDBBreadcrumbItem>
                  </MDBBreadcrumb>
                </MDBCol>
              </MDBRow>

              <div className="p-6 bg-white shadow-md rounded-lg border mb-6">
                <h2 className="text-xl font-semibold mb-4">Địa chỉ của tôi</h2>
                <button
                  onClick={() => navigate("/Address-Create")}
                  className="bg-red-500 text-white px-4 py-2 rounded-md mb-4"
                >
                  + Thêm địa chỉ mới
                </button>

                {error ? (
                  <p className="text-red-500">{error}</p>
                ) : addresses.length === 0 ? (
                  <p>Chưa có địa chỉ nào.</p>
                ) : (
                  <div>
                    {addresses.map((address) => (
                      <div key={address._id} className="p-4 border-b">
                        <p className="font-bold">
                          {address.full_name}{" "}
                          <span className="text-gray-400 mx-2">|</span>
                          <span className="text-gray-500">
                            (+84) {address.phone}
                          </span>
                        </p>

                        <p className="text-gray-700">{address.address}</p>

                        {/* Hiển thị thẻ "Mặc định" nếu đây là địa chỉ mặc định */}
                        <div className="flex gap-2 mt-2">
                          {address.is_default && (
                            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                              Mặc định
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex gap-4">
                          <button
                            onClick={() =>
                              navigate(`/Address-Update/${address._id}`)
                            }
                            className="text-blue-500"
                          >
                            Cập nhật
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(address._id, addresses, setAddresses)
                            }
                            className="text-red-500"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </MDBContainer>
          </div>
        </Loading>
      </div>
    </div>
  );
};

export default Address;
