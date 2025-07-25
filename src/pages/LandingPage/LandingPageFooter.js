import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight,
  Factory,
  ShoppingCart,
  Warehouse,
  GitBranch,
  BarChart3,
} from "lucide-react";
import { Button } from "./button.js";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const services = [
    { name: t("landingPage.footer.services.0"), icon: Factory },
    { name: t("landingPage.footer.services.1"), icon: ShoppingCart },
    { name: t("landingPage.footer.services.2"), icon: Warehouse },
    { name: t("landingPage.footer.services.3"), icon: GitBranch },
    { name: t("landingPage.footer.services.4"), icon: BarChart3 },
  ];

  const quickLinks = [
    t("landingPage.footer.quickLinks.0"),
    t("landingPage.footer.quickLinks.1"),
    t("landingPage.footer.quickLinks.2"),
    t("landingPage.footer.quickLinks.3"),
    t("landingPage.footer.quickLinks.4"),
    t("landingPage.footer.quickLinks.5"),
  ];

  const legalLinks = [
    t("landingPage.footer.legalLinks.0"),
    t("landingPage.footer.legalLinks.1"),
    t("landingPage.footer.legalLinks.2"),
    t("landingPage.footer.legalLinks.3"),
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                {t("landingPage.footer.newsletter.title")}
              </h3>
              <p className="text-green-100">
                {t("landingPage.footer.newsletter.subtitle")}
              </p>
            </div>
            <div className="flex flex-col items-center sm:flex-row gap-4">
              <input
                type="email"
                placeholder={t("landingPage.footer.newsletter.placeholder")}
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Button className="bg-white text-green-600 hover:bg-gray-100 px-4 py-3 font-semibold h-full my-auto">
                {t("landingPage.footer.newsletter.button")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <h3 className="text-2xl font-bold">MangoVate</h3>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {t("landingPage.footer.description")}
            </p>

            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram, Linkedin, Youtube].map(
                (Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-10 h-10 bg-gray-800 hover:bg-opacity-70 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              )}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">
              {t("landingPage.footer.links.services")}
            </h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors group"
                  >
                    <service.icon className="w-4 h-4 group-hover:text-green-400" />
                    <span>{service.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">
              {t("landingPage.footer.links.quick")}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
            <h4 className="text-lg font-semibold mb-4 mt-8">
              {t("landingPage.footer.links.legal")}
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">
              {t("landingPage.footer.contact.title")}
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <p className="text-gray-400">
                  {t("landingPage.footer.contact.address")}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-green-400" />
                <a
                  href="tel:+84123456789"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  +84 333 090 091
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-green-400" />
                <a
                  href="mailto:info@mangovate.com"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  info@mangovate.com
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-green-400 mt-1" />
                <div className="text-gray-400">
                  {t("landingPage.footer.contact.hours")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} MangoVate. {t("landingPage.footer.copyright")}
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>{t("landingPage.footer.developed")}</span>
              <div className="flex items-center space-x-2">
                <span>{t("landingPage.footer.powered_by.label")}</span>
                <span className="text-green-400 font-semibold">
                  {t("landingPage.footer.powered_by.name")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
