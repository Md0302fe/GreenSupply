import React from "react";
import ProductComponent from "../../components/ProductComponent/Product";
import Footer from "../../components/FooterComponent/Footer.js";
import Header from "../../components/HeaderComponent/Header.js";
const ProductPage = () => {
  return (
    <div>
      <Header/>
      <ProductComponent />
      <Footer/>
    </div>
  );
};

export default ProductPage;
