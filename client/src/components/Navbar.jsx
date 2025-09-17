import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { googleLogout } from "@react-oauth/google";
import { Truck } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = React.useState(false);
  const {
    user,
    setUser,
    setShowUserLogin,
    navigate,
    setSearchQuery,
    searchQuery,
    setCartItems,
    getCartCount,
    axios,
    draftOrder,
    setDraftOrder,
  } = useAppContext();

  const logout = async () => {
    try {
      const { data } = await axios.get("/api/v1/user/logout");

      if (data.success) {
        if (user?.authProvider === "google") {
          // clears the Google OAuth session and above becuase if we have a success we clear the cookies aswell
          googleLogout();
        }

        setUser(null);
        setDraftOrder(null);
        setCartItems([]);
        navigate("/");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleNavigateToCart = () => {
    if (!user) {
      setShowUserLogin(true);
      return;
    }

    if (!draftOrder?.deliverySlot) {
      navigate("/delivery-slot");
      return;
    }

    navigate("/cart");
  };

  // const removeDraftOrder = async () => {
  //   try {
  //     const { data } = await axios.post("/api/v1/draft-order/remove");
  //     if (data.success) {
  //       setDraftOrder(null);
  //       setSelectedSlot(null);
  //     } else {
  //       toast.error(data.message);
  //     }
  //   } catch (error) {
  //     toast.error(error.message);
  //   }
  // };

  useEffect(() => {
    if (searchQuery.length > 0) {
      navigate("/products");
    }
  }, [searchQuery]);

  return (
    <div>
      <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 border-b border-gray-300 bg-white  transition-all fixed w-full z-50 top-0">
        <NavLink to="/" onClick={() => setOpen(false)}>
          <img className="h-17" src={assets.grocerly_logo} />
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-8">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/rewards">Rewards</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          {user && !draftOrder ? (
            <NavLink
              to="/delivery-slot"
              className="flex gap-2 rounded-md bg-gray-200/50 p-0.5 hover:bg-gray-200"
            >
              Delivery
              <div className="flex flex-row items-center gap-2 cursor-pointer">
                <div className="relative">
                  <Truck className="w-6 h-6 text-primary" />

                  {/* Red exclamation badge */}
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full">
                    !
                  </span>
                </div>
              </div>
            </NavLink>
          ) : null}

          <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-lg">
            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
              type="text"
              placeholder="Search for products"
            />

            <img src={assets.search_icon} alt="search" className="w-4 h-4" />
          </div>

          {user && (
            <div
              onClick={handleNavigateToCart}
              className="relative cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
            >
              <img
                src={assets.cart_icon}
                alt="cart icon"
                className="w-6 opacity-80 "
              />
              <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full ">
                {getCartCount()}
              </button>
            </div>
          )}

          {!user ? (
            <button
              onClick={() => setShowUserLogin(true)}
              className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-lg"
            >
              Login
            </button>
          ) : (
            <div className="relative group">
              <img
                src={assets.profile_icon}
                alt="user avatar"
                className="w-10"
              />
              <ul className="hidden group-hover:block absolute top-10 right-0 bg-white shadow border border-gray-200 py-2.5 w-30 rounded-md text-sm z-40">
                <li
                  onClick={() => navigate("/dashboard")}
                  className="p-1.5 pl-3 hover:bg-primary/10 cursor-pointer"
                >
                  Dashboard
                </li>
                {/* <li */}
                {/*   onClick={() => navigate("/orders")} */}
                {/*   className="p-1.5 pl-3 hover:bg-primary/10 cursor-pointer" */}
                {/* > */}
                {/*   My Orders */}
                {/* </li> */}
                <li
                  onClick={logout}
                  className="p-1.5 pl-3 hover:bg-primary/10 cursor-pointer"
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 sm:hidden">
          {user && !draftOrder ? (
            <div
              onClick={() => navigate("/delivery-slot")}
              className="flex flex-row items-center gap-2 cursor-pointer"
            >
              <div className="relative">
                <Truck className="w-6 h-6 text-primary" />

                {/* Red exclamation badge */}
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full">
                  !
                </span>
              </div>
            </div>
          ) : null}{" "}
          {user && (
            <div
              onClick={() => navigate("/cart")}
              className="relative cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
            >
              <img
                src={assets.cart_icon}
                alt="cart icon"
                className="w-6 opacity-80 "
              />
              <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full ">
                {getCartCount()}
              </button>
            </div>
          )}
          <button
            onClick={() => (open ? setOpen(false) : setOpen(true))}
            aria-label="Menu"
            // className="sm:hidden"
          >
            {/* Menu Icon SVG */}

            <img src={assets.menu_icon} alt="menu" />
          </button>
        </div>

        {/* Mobile Menu */}

        {open && (
          <div
            className={`${open ? "flex" : "hidden"} absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-4 px-5 text-md md:hidden rounded-lg`}
          >
            {/* ✅ Mobile Search Bar */}
            <div className="flex items-center text-md gap-4 border border-gray-300 px-3 rounded-lg w-full mb-4 p-2">
              <input
                onChange={(e) => setSearchQuery(e.target.value)}
                // value={searchQuery}
                className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
                type="text"
                placeholder="Search..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    navigate("/products"); // redirect to products page
                    setOpen(false); // close the mobile menu
                  }
                }}
              />{" "}
              <img src={assets.search_icon} alt="search" className="w-4 h-4" />
            </div>
            <NavLink to="/" onClick={() => setOpen(false)}>
              Home
            </NavLink>

            <NavLink to="/products" onClick={() => setOpen(false)}>
              Products
            </NavLink>

            {user && (
              <NavLink to="/dashboard" onClick={() => setOpen(false)}>
                Dashboard
              </NavLink>
            )}

            <NavLink to="/contact" onClick={() => setOpen(false)}>
              Contact
            </NavLink>

            {!user ? (
              <button
                onClick={() => {
                  setOpen(false);
                  setShowUserLogin(true);
                }}
                className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-lg text-sm"
              >
                Login
              </button>
            ) : (
              <button
                onClick={logout}
                className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-lg text-sm"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
