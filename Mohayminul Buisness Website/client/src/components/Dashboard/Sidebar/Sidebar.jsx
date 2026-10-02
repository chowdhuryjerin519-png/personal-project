import { useState } from "react";
import { GrLogout } from "react-icons/gr";
import { FcSettings } from "react-icons/fc";
import { AiOutlineBars, AiOutlineClose } from "react-icons/ai";
import MenuItem from "./Menu/MenuItem";

import useAuth from "../../../hooks/useAuth";

import AdminMenu from "./Menu/AdminMenu";
import { Link } from "react-router-dom";
import CustomerMenu from "./Menu/CustomerMenu";
import logo from "../../../assets/images/easy-buy-1.png";

const Sidebar = () => {
  const { logOut } = useAuth();

  // mobile e sidebar open/close track kore (default: closed)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Small Screen Top Navbar */}
      <div className="bg-gray-100 text-gray-800 flex justify-between items-center md:hidden sticky top-0 z-[9997]">
        <div>
          <div className="block cursor-pointer p-4 font-bold">
            <Link to="/">
              <img src={logo} alt="logo" width="100" height="100" />
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          className="mobile-menu-button p-4 focus:outline-none focus:bg-gray-200"
        >
          <AiOutlineBars className="h-5 w-5" />
        </button>
      </div>

      {/* =====================================================
          OVERLAY (mobile e sidebar open thakle backdrop dekhabe,
          click korle sidebar close hoye jabe)
      ===================================================== */}

      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/50 z-[9998] md:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed
          z-[9999] md:z-10
          flex flex-col justify-between
          h-screen
          overflow-x-hidden overflow-y-auto
          bg-gray-100
          w-64 max-w-[80%]
          space-y-6 px-2 py-4
          inset-y-0 left-0
          transform
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          transition duration-200 ease-in-out
        `}
      >
        <div>
          {/* MOBILE: Close button + Logo (top of drawer) */}

          <div className="flex items-center justify-between px-2 mb-2 md:hidden">
            <Link to="/" onClick={closeSidebar}>
              <img className="w-28 rounded-lg" src={logo} alt="logo" />
            </Link>

            <button
              type="button"
              onClick={closeSidebar}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <AiOutlineClose size={22} />
            </button>
          </div>

          <div>
            <div className="w-full hidden md:flex px-4 py-2 shadow-lg rounded-lg justify-center items-center  mx-auto">
              <Link to="/">
                <img className="w-40 h-20 rounded-lg" src={logo} alt="logo" />
              </Link>
            </div>
          </div>

          {/* Nav Items */}
          <div className="flex flex-col justify-between flex-1 mt-6">
            <nav onClick={closeSidebar}>
              {/*  Menu Items */}
              <CustomerMenu />

              <AdminMenu />
            </nav>
          </div>
        </div>

        <div>
          <hr />

          <div onClick={closeSidebar}>
            <MenuItem
              icon={FcSettings}
              label="Profile"
              address="/dashboard/profile"
            />
          </div>

          <button
            onClick={logOut}
            className="flex w-full items-center px-4 py-2 mt-5 text-gray-600 hover:bg-gray-300   hover:text-gray-700 transition-colors duration-300 transform"
          >
            <GrLogout className="w-5 h-5" />

            <span className="mx-4 font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
