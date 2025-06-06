import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
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
      className="px-2 py-1 rounded text-sm bg-gray-200 hover:bg-gray-300 flex items-center gap-2"
      title="Change language"
    >
      <img src={flagSrc} alt={currentLang} className="w-5 h-5" />
      <span>{currentLang}</span>
    </button>
  );
};

export default LanguageSwitcher;
