import React from "react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Clock, DoorOpen, Home, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "/src/components/sidebar/ThemeContext"; // Import global theme context

function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  return (
    <div className="sidebar">
      <div className="logo-container">
        <div className="logo">Eureka</div>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
      <ul className="nav">
        <li className="nav-item active">
          <Home className="w-6 h-6 text-gray-500" />
          Dashboard
        </li>
        <li className="nav-item">
          <NavLink to="/real-time">
            <Clock className="w-6 h-6 text-gray-500" />
            Real Time Updates
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/door-status">
            <DoorOpen className="w-6 h-6 text-gray-500" />
            Door Status
          </NavLink>
        </li>
      </ul>
      <div className="logout">
        Hakim <LogOut className="w-6 h-6 text-gray-500" />
      </div>
    </div>
  );
}

export default Sidebar;
