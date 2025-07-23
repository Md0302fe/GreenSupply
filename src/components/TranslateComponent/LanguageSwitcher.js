"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Globe, ChevronDown, Check } from "lucide-react"

const LanguageSwitcher = ({ onlyIcon = false, variant = "default" }) => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    {
      code: "vi",
      name: "Tiếng Việt",
      shortName: "VI",
      flag: "/image/icon/vi.png",
      fallbackFlag: "🇻🇳",
    },
    {
      code: "en",
      name: "English",
      shortName: "EN",
      flag: "/image/icon/en.png",
      fallbackFlag: "🇺🇸",
    },
  ]

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0]

  const toggleLanguage = (langCode) => {
    i18n.changeLanguage(langCode)
    localStorage.setItem("i18nextLng", langCode)
    setIsOpen(false)
  }

  // Simple toggle for onlyIcon mode
  const handleSimpleToggle = () => {
    const newLang = i18n.language === "en" ? "vi" : "en"
    toggleLanguage(newLang)
  }

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case "minimal":
        return {
          button: "p-2 hover:bg-gray-100 rounded-full transition-colors",
          dropdown: "mt-2 py-1",
        }
      case "outlined":
        return {
          button: "border border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all",
          dropdown: "mt-2 py-2",
        }
      case "filled":
        return {
          button: "bg-orange-100 hover:bg-orange-200 text-orange-700 transition-colors",
          dropdown: "mt-2 py-2",
        }
      default:
        return {
          button: "border border-gray-300 hover:bg-gray-50 transition-colors",
          dropdown: "mt-2 py-2",
        }
    }
  }

  const styles = getVariantStyles()

  // Only Icon Mode - Simple Toggle
  if (onlyIcon) {
    return (
      <button
        onClick={handleSimpleToggle}
        className={`relative group ${styles.button} ${variant === "minimal" ? "p-2" : "p-2"}`}
        title={`Switch to ${currentLanguage.code === "vi" ? "English" : "Tiếng Việt"}`}
      >
        <div className="flex items-center justify-center">
          <img
            src={currentLanguage.flag || "/placeholder.svg"}
            alt={currentLanguage.shortName}
            className="w-5 h-5 rounded-sm object-cover"
            onError={(e) => {
              e.target.style.display = "none"
              e.target.nextSibling.style.display = "inline"
            }}
          />
          <span className="hidden text-sm">{currentLanguage.fallbackFlag}</span>
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {currentLanguage.code === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
        </div>
      </button>
    )
  }

  // Full Dropdown Mode
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md ${styles.button} ${
          isOpen ? "ring-2 ring-orange-500 ring-opacity-50" : ""
        }`}
        title="Change language"
      >
        <div className="flex items-center space-x-2">
          <img
            src={currentLanguage.flag || "/placeholder.svg"}
            alt={currentLanguage.shortName}
            className="w-4 h-4 rounded-sm object-cover"
            onError={(e) => {
              e.target.style.display = "none"
              e.target.nextSibling.style.display = "inline"
            }}
          />
          <span className="hidden text-sm">{currentLanguage.fallbackFlag}</span>
          <span className="text-sm font-medium text-gray-700">{currentLanguage.shortName}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div
            className={`absolute right-0 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 ${styles.dropdown}`}
          >
            <div className="py-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => toggleLanguage(language.code)}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    currentLanguage.code === language.code ? "bg-orange-50 text-orange-700" : "text-gray-700"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={language.flag || "/placeholder.svg"}
                      alt={language.shortName}
                      className="w-5 h-5 rounded-sm object-cover"
                      onError={(e) => {
                        e.target.style.display = "none"
                        e.target.nextSibling.style.display = "inline"
                      }}
                    />
                    <span className="hidden text-base">{language.fallbackFlag}</span>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{language.name}</span>
                      <span className="text-xs text-gray-500">{language.shortName}</span>
                    </div>
                  </div>
                  {currentLanguage.code === language.code && <Check className="w-4 h-4 text-orange-500" />}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-4 py-2">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Globe className="w-3 h-3" />
                <span>Language</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default LanguageSwitcher
