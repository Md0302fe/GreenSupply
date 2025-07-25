import { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import LanguageSwitcher from "../../components/TranslateComponent/LanguageSwitcher";
import MangovateLogo from "../../assets/Logo_Mangovate/Logo_Rmb.png";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { t } = useTranslation();

  const navigationItems = [
    { href: "/", label: t("navbar.home") },
    { href: "/about", label: t("navbar.about") },
    { href: "/services", label: t("navbar.services") },
    { href: "/blogs", label: "Blogs" },
    { href: "/contact", label: t("navbar.contact") },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 my-2">
            <div className="max-sm:hidden flex flex-col items-center">
              <img
                src={MangovateLogo}
                className="h-[100px] md:h-[120px] w-auto object-contain cursor-pointer"
                alt="Mangovate logo"
              />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              {!isSearchOpen ? (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2.5 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-md transition-colors border border-gray-300 hover:border-orange-500"
                  title={t("navbar.search_placeholder")}
                >
                  <Search className="w-5 h-5" />
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder={t("navbar.search_placeholder")}
                      className="w-64 pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      autoFocus
                      onBlur={() => setIsSearchOpen(false)}
                    />
                  </div>
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
                    title={t("navbar.search_close") || "Đóng tìm kiếm"}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            <a
              href="/login"
              className="px-4 py-2 text-orange-500 border border-orange-500 rounded-md hover:bg-orange-50 transition-colors font-medium"
            >
              {t("navbar.login")}
            </a>
            <a
              href="/register"
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium"
            >
              {t("navbar.register")}
            </a>

            <LanguageSwitcher />
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 rounded-md transition-colors ${
                isSearchOpen
                  ? "text-orange-500 bg-orange-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden px-4 pb-4 border-t border-gray-100">
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t("navbar.search_placeholder")}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Desktop Navigation */}
        <nav className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="hidden md:flex items-center justify-center space-x-8 py-3">
            {navigationItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="px-3 py-2 text-sm font-medium hover:bg-white/10 rounded-md transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-4">
              <div className="space-y-2">
                {navigationItems.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium"
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              {/* Mobile Auth */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="flex space-x-3">
                  <a
                    href="/login"
                    className="flex-1 text-center px-4 py-2 text-orange-500 border border-orange-500 rounded-md hover:bg-orange-50 transition-colors font-medium"
                  >
                    {t("navbar.login")}
                  </a>
                  <a
                    href="/register"
                    className="flex-1 text-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium"
                  >
                    {t("navbar.register")}
                  </a>
                </div>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
