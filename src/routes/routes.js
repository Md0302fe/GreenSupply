import React from "react";
import { Routes, Route } from "react-router-dom";

import App from "../App";

import HomePage from "../pages/HomePage/HomePage";
import LandingPage from "../pages/LandingPage/LandingPage";
import ManageUser from "../components/Admin/Content/User/AdminUser";

import ManageBlockedUser from "../components/Admin/Content/User/BlockedUser";

import Dashboard from "../components/Admin/Content/Dashboard/Dashboard";
import Dashboard1 from "../components/Admin/Content/Dashboard/Dashboard1";
// Toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Admin from "../components/Admin/Admin";
import PaymentPage from "../pages/PaymentPage/PaymentPage";
import IntroductionPage from "../pages/IntroductionPage/IntroductionPage";
import ContactPage from "../pages/ContactPage/ContactPage";
import ProfilePage from "../pages/Profile.js/ProfilePage";
import ProductPage from "../pages/ProductPage/ProductPage";
import ProductDetailPage from "../pages/ProductPage/ProductDetailPage";
import AddressPage from "../pages/AddressPage/AddressPage";
import AddressCreate from "../pages/AddressPage/AddressCreate";
import AddressUpdate from "../pages/AddressPage/AddressUpdate";
import SupplierDashboard from "../pages/SupplierPage/SupplierDashboard/SupplierDashboard";
import CustomerDashboard from "../pages/OrderProductionPage/OrderProductionDashboard.js/CustomerDashboard";

// Import các component OrderManagement và OrderDetails
import FuelRequestsManagement from "../components/Admin/Content/Order/FuelRequests";
import FuelProvideManagement from "../components/Admin/Content/Order/FuelProvideOrders";

import Login from "../components/AuthComponent/Login";
import Register from "../components/AuthComponent/Register";
import GoogleRegister from "../components/AuthComponent/GoogleRegister";
// import FuelRequestsComponent from "../components/Admin/Content/Order/FuelRequests";
import OrderPage from "../pages/OrderPage/OrderPage";
import OrderViewPage from "../pages/OrderPage/OrderViewPage";
import FuelList from "../components/Admin/Content/Fuel/FuelList";

import PurchaseOrder from "../components/Admin/Content/PurchaseOrder/PurchaseOrder"
import PurchaseOrders from "../components/Admin/Content/PurchaseOrder/AdminListOrder"
import ProductionRequest from "../components/Admin/Content/ProductionRequest/ProductionRequest";
import ProductionRequestList from "../components/Admin/Content/ProductionRequest/ProductionRequestList";
import RawmaterialBatchList from "../components/Admin/Content/RawMaterialBatch/RawmaterialBatchList";
import RawMaterialBatch from "../components/Admin/Content/RawMaterialBatch/RawMaterialBatch";
import MaterialStorageExport from "../components/Admin/Content/MaterialStorageExport/MaterialStorageExport";
import MaterialStorageExportList from "../components/Admin/Content/MaterialStorageExport/MaterialStorageExportlist";
import BatchHistory from "../components/Admin/Content/MaterialStorageExport/MaterialStorageExportHistory"
import OrdersComponent from "../components/Admin/Content/ProductOrder/OrderProductList";
// Import Page Feature 
import FeatureMaterial from "../components/FeatureComponent/FeatureMaterial";
import FeatureOrdersSuppier from "../components/FeatureComponent/FeatureOrdersSuppier";
import FeatureProductProcess from "../components/FeatureComponent/FeatureProductProcess";
import FeaturePurchaseOrder from "../components/FeatureComponent/FeaturePurchaseOrder";
import FeatureUser from "../components/FeatureComponent/FeatureUser";
import FeatureWarehouse from "../components/FeatureComponent/FeatureWarehouse";
import FeatureProductOrders from "../components/FeatureComponent/FeatureProductOrders";
import DashboardSupplierOrder from "../components/Admin/Content/Dashboard/DashboardSupplierOrder";
import ProductionProcessing from "../pages/ProductionProcessing/ProductionProcessing";
import ProductionRequestFinishList from "../pages/ProductionProcessing/ProductionRequestFinishList";
import ProductionProcessingList from "../pages/ProductionProcessing/ProductionProcessingList";
import ProductionHistories from "../pages/ProductionProcessing/HistoriesProcess";
import DashboardFuel from "../components/Admin/Content/Dashboard/DashboardFuel";
import CreateFuel from "../components/Admin/Content/Fuel/CreateFuel";

import CreatePackageCategory from "../components/Admin/Content/PackageMaterial/CreatePackageCategory";
import PackageCategoryList from "../components/Admin/Content/PackageMaterial/PackageCategoryList";
import BoxList from "../components/Admin/Content/PackageMaterial/BoxList";
import CreateBox from "../components/Admin/Content/PackageMaterial/CreateBox";

import ProcessingManagement from "../pages/ProductionProcessing/ProcessingManagement";
import ProcessingDetails from "../pages/ProductionProcessing/ProcessDetails";

import DashboardProductionProcess from "../components/Admin/Content/Dashboard/DashboardProductionProcess";
import DashboardSupplyRequest from "../components/Admin/Content/Dashboard/DashboardSupplierRequest";
const Router = () => {
  return (
    <>
      <Routes>
        {/* Sử dụng nested route bao bọc các outlet cần hiển thị : LayoutHeader*/}
        <Route path="/" element={<LandingPage />}></Route>
        <Route path="/home" element={<App />}>
          {/* Sử dụng index route chỉ dẫn trang mặc định cần hiển thị*/}
          <Route index element={<HomePage />} />
          {/* New route for ContactPage */}
          <Route path="contact" element={<ContactPage />} />
          <Route path="introduction" element={<IntroductionPage />} />
        </Route>

          {/* Authentications - OA Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/google-register" element={<GoogleRegister />} />

          {/* payment routes */}
          <Route path="/payment" element={<PaymentPage />} />

        {/* Admin-Page  : Admi-Layout*/}
        <Route path="/system/admin" element={<Admin />}>
          {/* DashBoard Admin  */}
          <Route index element={<Dashboard />} />

          {/* User Management  */}
          <Route path="feature_users" element={<FeatureUser />} />
          <Route path="manage-users" element={<ManageUser />} />
          <Route path="manage-blocked-users" element={<ManageBlockedUser />} />

          {/* WareHouse Management */}
          <Route path="feature_warehouse" element={<FeatureWarehouse />} />

          <Route path="manage-warehouse" element={<Dashboard1 />} />
          <Route path="warehouse-receipt" element={<OrderViewPage />} />
          {/* Raw Material Batch Management */}
          <Route path="raw-material-batch" element={<RawMaterialBatch/>}/>
          <Route path="raw-material-batch-list" element={<RawmaterialBatchList/>}/>
          {/* Material Storage Export Management */}
          <Route path="material-storage-export" element={<MaterialStorageExport/>} />
          <Route path="material-storage-export-list" element={<MaterialStorageExportList/>} />
          <Route path="batch-history" element={<BatchHistory/>} />

          <Route path="feature_request_suppplier" element={<FeatureOrdersSuppier />} />
          <Route path="manage-fuel-orders" element={<FuelRequestsManagement />} />
          <Route path="manage-provide-orders" element={<FuelProvideManagement />} />
          <Route path="View-Order-Success" element={<OrderPage />} />

           {/* Product Order Management */}
          <Route path="feature_product_orders" element={<FeatureProductOrders />} />
          <Route path="manage-product-orders" element={<OrdersComponent/>} />
          
          {/* Purchase Order Management */}
          <Route path="feature_purchase_orders" element={<FeaturePurchaseOrder />} />
          <Route path="C_purchase-order" element={<PurchaseOrder />} />
          <Route path="R_purchase-orders" element={<PurchaseOrders />} />
          <Route path="manage-Supplier-request" element={<DashboardSupplyRequest />} />
          <Route path="manage-Supplier-orders" element={<DashboardSupplierOrder />} />

          {/* Material type Management*/}
          <Route path="feature_material_category" element={<FeatureMaterial />} />
          <Route path="fuel-list" element={<FuelList />} />
          <Route path="manage-fuel" element={<DashboardFuel />} />
          <Route path="fuel-Create" element={<CreateFuel />} />

          <Route path="box-categories/create" element={<CreatePackageCategory />} />
          <Route path="box-categories/list" element={<PackageCategoryList />} />
          <Route path="box-list" element={<BoxList />} />
          <Route path="box-Create" element={<CreateBox />} />



          {/* Production Process Management */}
          <Route path="feature_production_process" element={<FeatureProductProcess />} />
          <Route path="production-request" element={<ProductionRequest />} />
          <Route path="production-request-list" element={<ProductionRequestList />} />
         

            {/* Danh sách quy trình sản xuất */}
          <Route path="production-processing-list" element={<ProductionProcessingList />} />
          <Route path="production-processing" element={<ProductionRequestFinishList />} />
          <Route path="production-processing/create/:id" element={<ProductionProcessing />} />
          <Route path="process-histories" element={<ProductionHistories />} />
          {/* ROUTES QUY TRÌNH ĐANG THỰC THI */}
          <Route path="processing-system" element={<ProcessingManagement />} />
          <Route path="process_details/:process_id" element={<ProcessingDetails />} />
          <Route path="dashboard-production-request" element={<DashboardProductionProcess />} />
        </Route>

          {/* Profile Management */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Product Management */}
          <Route path="/product" element={<ProductPage />} />
          <Route path="/product-detail/:id" element={<ProductDetailPage />} />

          {/* Address Management */}
          <Route path="/Address" element={<AddressPage />} />
          <Route path="/Address-Create" element={<AddressCreate />} />
          <Route path="/Address-Update/:id" element={<AddressUpdate />} />

          {/* Supplier Management */}
          <Route path="/supplier/*" element={<SupplierDashboard />} />

          {/* Customer Management */}
          <Route path="/customer/*" element={<CustomerDashboard />} />

      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default Router;