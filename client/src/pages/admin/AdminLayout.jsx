import React from "react";
import { useAppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import { NavLink, Link, Outlet } from "react-router-dom";

const AdminLayout = () => {
  const { isSeller, setIsSeller } = useAppContext();

  const sidebarLinks = [
    { name: "Add Product", path: "/admin", icon: assets.add_icon },
    {
      name: "Product List",
      path: "/admin/product-list",
      icon: assets.product_list_icon,
    },
    { name: "Orders", path: "/admin/orders", icon: assets.order_icon },
  ];

  const logout = async () => {
    setIsSeller(false);
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white transition-all duration-300">
        <Link to={"/"}>
          <img
            className=" cursor-pointer md:w-38"
            src={assets.grocerly_logo}
            alt="dummyLogoColored"
          />
        </Link>

        <div className="flex items-center gap-5 text-gray-500">
          <p>Hello Admin!</p>

          <button
            onClick={logout}
            className="border bg-primary text-white text-sm px-4 py-1 rounded-lg hover:-translate-y-0.5 transition duration-200 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex">
        <div className="md:w-64 w-16 border-r h-[95vh] text-base border-gray-300 pt-4 flex flex-col ">
          {sidebarLinks.map((item) => (
            <NavLink
              to={item.path}
              key={item.name}
              end={item.path === "/admin"}
              className={({ isActive }) => `flex items-center py-3 px-4 gap-3 

                            ${
                              isActive
                                ? "border-r-4 md:border-r-[6px] bg-primary/10 border-primary text-primary"
                                : "hover:bg-gray-100/90 border-white "
                            }`}
            >
              <img src={item.icon} className="w-7 h-7" alt="" />

              <p className="md:block hidden text-center">{item.name}</p>
            </NavLink>
          ))}
        </div>
        <Outlet />
      </div>
    </>
  );
};

export default AdminLayout;
