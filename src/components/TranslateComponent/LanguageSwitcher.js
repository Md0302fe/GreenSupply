import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = ({ onlyIcon = false }) => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "vi" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("i18nextLng", newLang);
  };

  const currentLang = i18n.language === "en" ? "EN" : "VI";
  const flagSrc =
    i18n.language === "en" ? "/image/icon/en.png" : "/image/icon/vi.png";

  return (
    <button
      onClick={toggleLanguage}
      className={`rounded hover:bg-gray-300 flex items-center transition-all duration-200 ${onlyIcon ? "p-1" : "px-2 py-1 bg-gray-200 text-sm gap-2"
        }`}
      title="Change language"
    >
      <img src={flagSrc} alt={currentLang} className="w-5 h-5" />
      {!onlyIcon && <span>{currentLang}</span>}
    </button>
  );
};

export default LanguageSwitcher;
