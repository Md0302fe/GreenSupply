import React from "react";
import ProfileComponent from "../../components/ProfileComponent/Profile"; 
import Header from "../../components/HeaderComponent/Header";
import Footer from "../../components/FooterComponent/Footer";

const ProfilePage = () => {
  return (
    <div>
      <Header />
      <ProfileComponent /> {/* Gọi ProfileComponent */}
      <Footer />
    </div>
  );
};

export default ProfilePage;
