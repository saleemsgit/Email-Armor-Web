import React from 'react';
import HeroComponent from '../components/WebPage/HeroComponent';
import AboutUs from '../components/WebPage/AboutUs';
import ContactUs from '../components/WebPage/ContactUs';
import Footer from '../components/WebPage/Footer';

function WebPage() {
  return (
    <div>
      <HeroComponent />
      <AboutUs />
      <ContactUs />
      <Footer />
    </div>
  );
}

export default WebPage;
