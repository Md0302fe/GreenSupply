import React from "react";
import ProductDetail from "../../components/ProductComponent/ProductDetail.js";
import Header from "../../components/HeaderComponent/Header.js";
import Footer from "../../components/FooterComponent/Footer.js";

const ProductDetailPage = () => {
  return (
    <div>
      <Header/>
      <ProductDetail />
      <Footer/>
    </div>
  );
};

export default ProductDetailPage;
