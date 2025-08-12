import { useState } from "react";
import { useTranslation } from "react-i18next";
const PasswordResetPopup = ({ onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = () => {
    if (newPassword.length < 6) {
      setErrorMessage(t("error_min_length"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage(t("error_not_match"));
      return;
    }
    onSubmit(newPassword);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {t("reset_password")}
        </h2>

        <label className="block text-gray-600 text-sm mb-1">
          {t("new_password")}
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-300"
          placeholder={t("enter_new_password")}
        />

        <label className="block text-gray-600 text-sm mt-3 mb-1">
          {t("confirm_password")}
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-300"
          placeholder={t("reenter_password")}
        />

        {errorMessage && (
          <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
        )}

        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};
export default PasswordResetPopup;
