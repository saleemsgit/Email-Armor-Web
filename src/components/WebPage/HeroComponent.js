import React from 'react';
import HeroImage from '../../assets/HeroImage.png';
import { Link } from 'react-router-dom';

function HeroComponent() {
  return (
    <div
      className="relative text-white min-h-screen flex items-center"
      style={{
        background: 'linear-gradient(#3b7197, #74bde0)',
      }}
    >
      <div className="container mx-auto px-4">
        <nav className="absolute top-0 left-0 right-0 py-4 px-6 flex justify-between items-center">
          <div className="text-2xl font-bold">EMAIL ARMOR</div>
          <ul className="flex space-x-4">
            <li>
              <a href="#home" className="hover:underline">
                Home
              </a>
            </li>
            <li>
              <a href="#about" className="hover:underline">
                About
              </a>
            </li>
            <Link to={'/signin'}>
            <li>
              <p  className="hover:underline">
                Login
              </p>
            </li>
            </Link>
            <li>
              <a
                href="#contact"
                className="bg-white text-blue-500 py-2 px-4 rounded-full font-semibold shadow-md hover:bg-gray-100 transition duration-300"
              >
                Contact Us
              </a>
            </li>
          </ul>
        </nav>
        <div className="flex flex-col md:flex-row items-center mt-24">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              AI-Driven Email Security System
            </h1>
            <p className="text-lg md:text-xl mb-6">
              Swiftly analyze email content, attachments, and URLs to detect
              phishing attempts and potential security threats, safeguarding
              your inbox from cyberattacks.
            </p>
            <a
              href="#learn-more"
              className="inline-block bg-white text-blue-500 py-3 px-6 rounded-full font-semibold shadow-md hover:bg-gray-100 transition duration-300"
            >
              Learn More
            </a>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0">
            <img
              src={HeroImage}
              alt="Email Security Illustration"
              className="max-w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroComponent;
