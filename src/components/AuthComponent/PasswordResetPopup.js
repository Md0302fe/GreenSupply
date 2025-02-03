import { useState } from "react";

const PasswordResetPopup = ({ onClose, onSubmit }) => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = () => {
        if (newPassword.length < 6) {
            setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMessage("Mật khẩu nhập lại không khớp.");
            return;
        }

        // Gửi mật khẩu mới về API xử lý
        onSubmit(newPassword);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Đặt lại mật khẩu</h2>

                {/* Input: Mật khẩu mới */}
                <label className="block text-gray-600 text-sm mb-1">Mật khẩu mới</label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-300"
                    placeholder="Nhập mật khẩu mới"
                />

                {/* Input: Xác nhận mật khẩu */}
                <label className="block text-gray-600 text-sm mt-3 mb-1">Xác nhận mật khẩu</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-300"
                    placeholder="Nhập lại mật khẩu"
                />

                {/* Hiển thị lỗi nếu có */}
                {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}

                {/* Buttons */}
                <div className="mt-4 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PasswordResetPopup;
