import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEnvelope,
  faEnvelopeCircleCheck,
  faEnvelopeOpenText,
  faTrash,
  faShopLock,
} from "@fortawesome/free-solid-svg-icons";

function SideBar({ onComposeClick, onLogoutClick }) {
  return (
    <div className="w-64 bg-primary-100 text-white">
      <div className="w-full flex items-center justify-center">
        <button
          className="bg-primary-200 text-white p-4 mx-4 my-2 rounded-lg"
          onClick={onComposeClick}
        >
          <div className="flex items-center justify-center space-x-4">
            <p className="font-bold">Compose</p>
            <FontAwesomeIcon icon={faPlus} />
          </div>
        </button>
      </div>
      <ul className="mt-5 flex flex-col gap-2 pr-10">
        <li>
          <NavLink
            to="/home/inbox"
            className={({ isActive }) =>
              `block text-white hover:bg-secondary-200 cursor-pointer rounded-br-3xl py-2 px-4 transition-colors duration-150 ${
                isActive
                  ? "bg-secondary-200 px-4 py-2 rounded-br-3xl font-bold"
                  : "font-normal"
              }`
            }
          >
            <div className="flex items-center space-x-4">
              <FontAwesomeIcon icon={faEnvelope} />
              <p>Inbox</p>
            </div>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/home/sent"
            className={({ isActive }) =>
              `block text-white hover:bg-secondary-200 rounded-br-3xl py-2 px-4 transition-colors duration-150 ${
                isActive
                  ? "bg-secondary-200 px-4 py-2 rounded-br-3xl font-bold"
                  : "font-normal"
              }`
            }
          >
            <div className="flex items-center space-x-4">
              <FontAwesomeIcon icon={faEnvelopeCircleCheck} />
              <p>Sent</p>
            </div>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/home/trash"
            className={({ isActive }) =>
              `block text-white hover:bg-secondary-200 rounded-br-3xl py-2 px-4 transition-colors duration-150 ${
                isActive
                  ? "bg-secondary-200 px-4 py-2 rounded-br-3xl font-bold"
                  : "font-normal"
              }`
            }
          >
            <div className="flex items-center space-x-4">
              <FontAwesomeIcon icon={faTrash} />
              <p>Trash</p>
            </div>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/home/draft"
            className={({ isActive }) =>
              `block text-white hover:bg-secondary-200 rounded-br-3xl py-2 px-4 transition-colors duration-150 ${
                isActive
                  ? "bg-secondary-200 px-4 py-2 rounded-br-3xl font-bold"
                  : "font-normal"
              }`
            }
          >
            <div className="flex items-center space-x-4">
              <FontAwesomeIcon icon={faEnvelopeOpenText} />
              <p>Draft</p>
            </div>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/home/quarantined"
            className={({ isActive }) =>
              `block text-white hover:bg-secondary-200 rounded-br-3xl py-2 px-4 transition-colors duration-150 ${
                isActive
                  ? "bg-secondary-200 px-4 py-2 rounded-br-3xl font-bold"
                  : "font-normal"
              }`
            }
          >
            <div className="flex items-center space-x-4">
              <FontAwesomeIcon icon={faShopLock} />
              <p>Quarantined Messages</p>
            </div>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/home/spam"
            className={({ isActive }) =>
              `block text-white hover:bg-secondary-200 rounded-br-3xl py-2 px-4 transition-colors duration-150 ${
                isActive
                  ? "bg-secondary-200 px-4 py-2 rounded-br-3xl font-bold"
                  : "font-normal"
              }`
            }
          >
            <div className="flex items-center space-x-4">
              <FontAwesomeIcon icon={faShopLock} />
              <p>Spam Messages</p>
            </div>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/home/fetchmails"
            className={({ isActive }) =>
              `block text-white hover:bg-secondary-200 rounded-br-3xl py-2 px-4 transition-colors duration-150 ${
                isActive
                  ? "bg-secondary-200 px-4 py-2 rounded-br-3xl font-bold"
                  : "font-normal"
              }`
            }
          >
            <div className="flex items-center space-x-4">
              <FontAwesomeIcon icon={faShopLock} />
              <p>Fetch Mails</p>
            </div>
          </NavLink>
        </li>
        <li>
          <div
            className="block text-white hover:bg-secondary-200 rounded-br-3xl py-2 px-4 transition-colors duration-150 cursor-pointer"
            onClick={onLogoutClick}
          >
            <div className="flex items-center space-x-4">
              <FontAwesomeIcon icon={faShopLock} />
              <p>Log Out</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
}

export default SideBar;
