import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faGear, faBell } from "@fortawesome/free-solid-svg-icons";
import Notification from "./Notification"; // Import the Notification component

function Header() {
  const [showNotification, setShowNotification] = useState(false);

  const toggleNotification = () => {
    setShowNotification(!showNotification);
  };

  return (
    <div className="bg-primary-100 text-white p-4 flex flex-wrap items-center justify-between md:justify-between">
      <div className="flex items-center space-x-4">
        <FontAwesomeIcon icon={faBars} className="text-xl" />
        <img
          src="https://via.placeholder.com/150"
          alt="Logo"
          className="hidden md:block rounded-full h-10 w-10"
        />
        <h1 className="text-xl md:text-2xl font-bold flex-grow">Mail Armor</h1>
      </div>
      <input
        type="text"
        placeholder="Search"
        className="bg-white w-1/2 py-2 px-4 rounded-3xl hidden md:block"
      />
      <div className="flex items-center space-x-4 relative">
        {" "}
        {/* Make this div relative */}
        <div className="relative">
          {" "}
          {/* Container for bell icon and notification */}
          <FontAwesomeIcon
            icon={faBell}
            className="cursor-pointer"
            onClick={toggleNotification}
          />
          {showNotification && <Notification />}{" "}
          {/* Render Notification here */}
        </div>
        <FontAwesomeIcon icon={faGear} className="hidden md:block" />
        <img
          src="https://via.placeholder.com/150"
          alt="Avatar"
          className="rounded-full h-10 w-10"
        />
      </div>
    </div>
  );
}

export default Header;
