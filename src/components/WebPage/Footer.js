/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebook,
  faTwitter,
  faInstagram,
} from '@fortawesome/free-brands-svg-icons';

function Footer() {
  return (
    <footer className="footer text-white">
      <div className="container mx-auto px-4 py-8 md:px-20 lg:px-20 bg-gray-800 ">
        <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 gap-4">
          <div className="col-span-1 md:col-span-3 mx-8">
            <h1 className="text-xl md:text-3xl font-bold">EMAIL ARMOR</h1>
            <p className="text-gray-200">
              Colombo,
              <br />
              Sri Lanka.
              <br />
              Phone: +94 11 123 4567
              <br />
            </p>
          </div>

          <div className="col-span-2 text-end">
            <h3 className="text-lg font-semibold mb-2 text-white">
              Quick Links
            </h3>
            <ul className="list-none space-y-2">
              <li>
                <a href="/#" className="text-gray-200 hover:text-white">
                  Home
                </a>
              </li>
              <li>
                <a href="/#about-us" className="text-gray-200 hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="/#services" className="text-gray-200 hover:text-white">
                  Our Services
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-200 hover:text-white">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-gray-800">
        <p className="text-center text-gray-200 py-4">
          &copy; 2024 Email Ermor. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
