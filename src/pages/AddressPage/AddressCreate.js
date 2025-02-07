import React from "react";
import AddressComponent  from "../../components/AddressComponent/AddressCreate.js";
import Footer from "../../components/FooterComponent/Footer.js";
import Header from "../../components/HeaderComponent/Header.js";
const AddressCreate = () => {
  return (
    <div>
    <Header/>
     <AddressComponent ></AddressComponent>
     <Footer/>
    </div>
  );
};

export default AddressCreate;
