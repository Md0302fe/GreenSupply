import { ChevronRight, Home } from "lucide-react"

const BreadcrumbNavbar = ({ items = [], showHome = true }) => {
  const defaultItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Sản xuất", path: "/production" },
    { label: "Lập kế hoạch", path: "/production/planning", active: true },
  ]

  const breadcrumbItems = items.length > 0 ? items : defaultItems

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-12">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm">
            {showHome && (
              <>
                <a href="/dashboard" className="flex items-center text-gray-500 hover:text-gray-700 transition-colors">
                  <Home className="w-4 h-4" />
                </a>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </>
            )}

            {breadcrumbItems.map((item, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />}

                {item.active ? (
                  <span className="font-medium text-gray-900">{item.label}</span>
                ) : (
                  <a href={item.path} className="text-gray-500 hover:text-gray-700 transition-colors">
                    {item.label}
                  </a>
                )}
              </div>
            ))}
          </nav>

          {/* Right side - Page actions */}
          <div className="ml-auto flex items-center space-x-3">
            <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-colors">
              Xuất Excel
            </button>
            <button className="px-3 py-1.5 text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 rounded-md transition-colors">
              Thêm mới
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BreadcrumbNavbar
