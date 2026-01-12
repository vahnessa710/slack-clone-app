import React from "react";
import {
  FaHome,
  FaEnvelope,
  FaCog,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import logo_only from "../assets/logo_only.png";
import "./NavBar.css";
import { useAuth } from "../context/AuthProvider";

function NavBar({ setPrimary}) {
  const { currentUser, loading, logout, isAuthenticated } = useAuth();
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
  };
  const handlePrimary = () => {
    setPrimary((prevPrimary) => !prevPrimary);
  };

  return (
    <>
      <header className="header">
        <img
          src={logo_only}
          alt="logo"
          className="logo-only"
          data-testid="logo"
        />

        <div className="icon-container">
          <FaHome className="icon" />
        </div>

        <div className="icon-container">
          <FaEnvelope className="icon" />
        </div>

        <div className="icon-container" onClick={toggleDarkMode}>
          <FaCog className="icon" />
        </div>

        <div className="icon-container" onClick={handlePrimary}>
          <FaUser className="icon" />
        </div>

        <div className="user-info">
          {loading ? (
            <span className="nav-loading">Loading...</span>
          ) : isAuthenticated ? (
            <>
              <span className="nav-user">
               {currentUser?.email}
              </span>
            </>
          ) : (
            <span className="nav-guest">Guest</span>
          )}
          <button className="logout-button" onClick={logout}>
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </header>
    </>
  );
};

export default NavBar;
