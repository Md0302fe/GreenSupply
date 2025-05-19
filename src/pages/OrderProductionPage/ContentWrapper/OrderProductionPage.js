import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAllProducts } from "../../../services/ProductServices";
import { createOrderProduction } from "../../../services/OrderProductionService";
import { getUserAddresses } from "../../../services/UserService"; // Import API lấy địa chỉ
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const OrderProductionPage = () => {
  const { id } = useParams();
  const userRedux = useSelector((state) => state.user);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState(null);
  const [addresses, setAddresses] = useState([]); // Danh sách địa chỉ
  const [formData, setFormData] = useState({
    quantity: "",
    note: "",
    shippingAddressId: "",
    paymentMethod: "COD",
  });

  useEffect(() => {
    fetchProducts();
    fetchUserAddresses();
  }, [id]);


   // Validate khi người dùng rời khỏi ô input hoặc nhấn gửi
   const validateQuantity = () => {
    if (!selectedProduct) return;
    const quantity = Number(formData.quantity);

    if (isNaN(quantity) || quantity <= 0) {
      setError("Số lượng không hợp lệ.");
      return false;
    }


    if (quantity > selectedProduct.quantity) {
      setError(`Số lượng không được vượt quá ${selectedProduct.quantity} kg.`);
      return false;
    }

    setError(""); // Xóa lỗi nếu hợp lệ
    return true;
  };

  const fetchProducts = async () => {
    try {
      const response = await getAllProducts();
      setProducts(response);

      if (id) {
        const foundProduct = response.find((product) => product._id === id);
        if (foundProduct) {
          setSelectedProduct(foundProduct);
          setFormData({ ...formData, quantity: "" });
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    }
  };

  const fetchUserAddresses = async () => {
    try {
      const response = await getUserAddresses(userRedux.id); // Gọi API lấy danh sách địa chỉ của user
      console.log("Dữ liệu địa chỉ API trả về:", response);

      if (response && Array.isArray(response.addresses)) {
        setAddresses(response.addresses);
      } else {
        setAddresses([]); // Đảm bảo addresses luôn là mảng
      }
    } catch (error) {
      console.error("Lỗi khi lấy địa chỉ:", error);
      setAddresses([]); // Xử lý lỗi API, tránh lỗi `map()`
    }
  };

  const handleSelectProduct = (productId) => {
    if (!productId) {
      setSelectedProduct(null);
      setFormData({ quantity: "", note: "", shippingAddressId: "", paymentMethod: "COD" });
      return;
    }

    const foundProduct = products.find((product) => product._id === productId);
    setSelectedProduct(foundProduct);
    setFormData({ quantity: "", note: "", shippingAddressId: "", paymentMethod: "COD" });
  };

  const handleSubmit = async () => {
    if (!selectedProduct || !formData.quantity || !formData.shippingAddressId) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (!validateQuantity()) {
          toast.error("Vui lòng kiểm tra lại số lượng!");
          return;
        }

    const orderData = {
      user_id: userRedux.id,
      shippingAddressId: formData.shippingAddressId,
      paymentMethod: formData.paymentMethod,
      items: [
        {
          productId: selectedProduct._id,
          name: selectedProduct.name,
          price: selectedProduct.price,
          quantity: Number(formData.quantity),
          totalPrice: (Number(formData.quantity) || 0) * selectedProduct.price,
        },
      ],
      note: formData.note,
      totalAmount: (Number(formData.quantity) || 0) * selectedProduct.price,
      status: "Chờ xác nhận",
    };

    try {
      await createOrderProduction(orderData);
      toast.success("Tạo đơn hàng thành công!");
      setSelectedProduct(null);
      fetchProducts();
      setFormData({ quantity: "", note: "", shippingAddressId: "", paymentMethod: "COD" });
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      toast.error("Tạo đơn hàng thất bại!");
    }
  };

  return (
    <div>
      <div className="p-6 bg-white shadow-md rounded">
        <h2 className="text-xl font-bold mb-4">Tạo Đơn Hàng</h2>

        <div className="mb-4">
          <label className="block mb-2 font-semibold">Chọn sản phẩm:</label>
          <select
            onChange={(e) => handleSelectProduct(e.target.value)}
            value={selectedProduct?._id || ""}
            className="border p-2 rounded w-full"
          >
            <option value="">-- Chọn sản phẩm --</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name} - {product.quantity} kg - {product.price.toLocaleString("vi-VN")} VNĐ
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <>
            <div className="mb-4">
              <label className="block font-semibold">Tên sản phẩm:</label>
              <p className="border p-2 rounded bg-gray-100">{selectedProduct.name}</p>
            </div>

            <div className="mb-4">
              <label className="block font-semibold">Số lượng yêu cầu:</label>
              <input
                type="number"
                placeholder="Nhập số lượng"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                onBlur={validateQuantity} 
                className="border p-2 rounded w-full"
                onKeyDown={(e) => {
                  if (["-", "e", "E", "+", ".", ","].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />{error && <p className="text-red-500 mt-1">{error}</p>}  {/* Hiển thị lỗi */}
            </div>


            <div className="mb-4">
              <label className="block font-semibold">Địa chỉ giao hàng:</label>
              <select
                value={formData.shippingAddressId}
                onChange={(e) => setFormData({ ...formData, shippingAddressId: e.target.value })}
                className="border p-2 rounded w-full"
              >
                <option value="">-- Chọn địa chỉ giao hàng --</option>
                {addresses.length > 0 ? (
                  addresses.map((address) => (
                    <option key={address._id} value={address._id}>
                      {`${address.full_name} - ${address.phone} - ${address.address}`}
                    </option>
                  ))
                ) : (
                  <option disabled>Không có địa chỉ</option>
                )}
              </select>
            </div>

            <div className="mb-4">
              <label className="block font-semibold">Ghi chú:</label>
              <textarea
                placeholder="Nhập ghi chú"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="border p-2 rounded w-full"
                rows="3"
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold">Phương thức thanh toán:</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="border p-2 rounded w-full"
              >
                <option value="COD">Thanh toán khi nhận hàng (COD)</option>
              </select>
            </div>

            <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Gửi Yêu Cầu
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderProductionPage;
