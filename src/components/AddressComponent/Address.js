import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { message, Modal } from "antd";
import { useTranslation } from "react-i18next";
import {
  MDBBreadcrumb,
  MDBBreadcrumbItem,
  MDBContainer,
  MDBRow,
  MDBCol,
} from "mdb-react-ui-kit";
import Loading from "../../components/LoadingComponent/Loading";

const fetchAddresses = async (setAddresses, setError, setLoading, t) => {
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
    setError(t("address.loadError"));
  } finally {
    setLoading(false);
  }
};

const Address = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetchAddresses(setAddresses, setError, setLoading, t);
  }, [t]);

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setIsOpenDelete(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem("access_token"));
      await axios.delete(
        `http://localhost:3001/api/user/address/delete/${selectedId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAddresses((prev) => prev.filter((addr) => addr._id !== selectedId));
      message.success(t("address.deleteSuccess"));
    } catch (error) {
      message.error(t("address.deleteFail"));
    } finally {
      setConfirmLoading(false);
      setIsOpenDelete(false);
    }
  };

  return (
    <div className="User-Address Container flex-center-center mb-4 mt-4">
      <div className="Wrapper Width">
        <Loading isPending={loading}>
          <div className="bg-white shadow-lg rounded-lg p-6 border">
            <MDBContainer>
              <MDBRow>
                <MDBCol>
                  <MDBBreadcrumb className="bg-light rounded-3 p-3 mb-4 border">
                    <MDBBreadcrumbItem>
                      <span
                        onClick={() => navigate("/home")}
                        className="cursor-pointer hover:border-b hover:border-black transition-all duration-200"
                      >
                        {t("breadcrumb.home")}
                      </span>
                    </MDBBreadcrumbItem>
                    <MDBBreadcrumbItem>
                      <span
                        onClick={() => navigate("/profile")}
                        className="cursor-pointer hover:border-b hover:border-black transition-all duration-200"
                      >
                        {t("breadcrumb.profile")}
                      </span>
                    </MDBBreadcrumbItem>
                    <MDBBreadcrumbItem active>
                      {t("breadcrumb.viewAddress")}
                    </MDBBreadcrumbItem>
                  </MDBBreadcrumb>
                </MDBCol>
              </MDBRow>

              <div className="p-6 bg-white shadow-md rounded-lg border mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  {t("address.myAddress")}
                </h2>
                <button
                  onClick={() => navigate("/Address-Create")}
                  className="bg-red-500 text-white px-4 py-2 rounded-md mb-4"
                >
                  + {t("address.addNew")}
                </button>

                {error ? (
                  <p className="text-red-500">{error}</p>
                ) : addresses.length === 0 ? (
                  <p>{t("address.noData")}</p>
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

                        {address.is_default && (
                          <div className="flex gap-2 mt-2">
                            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                              {t("address.default")}
                            </span>
                          </div>
                        )}

                        <div className="mt-2 flex gap-4">
                          <button
                            onClick={() =>
                              navigate(`/Address-Update/${address._id}`)
                            }
                            className="text-blue-500"
                          >
                            {t("actions.update")}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(address._id)}
                            className="text-red-500"
                          >
                            {t("actions.delete")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </MDBContainer>

            {/* Modal Confirm Delete */}
            <Modal
              title={t("address.confirmDeleteTitle")}
              open={isOpenDelete}
              onCancel={() => setIsOpenDelete(false)}
              onOk={handleConfirmDelete}
              confirmLoading={confirmLoading}
              okButtonProps={{ danger: true }}
              okText={t("harvestRequest.confirm")}
              cancelText={t("harvestRequest.close")}
            >
              <p>{t("address.confirmDelete")}</p>
            </Modal>
          </div>
        </Loading>
      </div>
    </div>
  );
};

export default Address;
