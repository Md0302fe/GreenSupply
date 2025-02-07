import React from "react";
import AddressComponent from "../../components/AddressComponent/Address.js";
import Footer from "../../components/FooterComponent/Footer.js";
import Header from "../../components/HeaderComponent/Header.js";
const AddressPage = () => {
  return (
    <div>
      <Header />
      <AddressComponent></AddressComponent>
      <Footer />
    </div>
  );
};

export default AddressPage;
