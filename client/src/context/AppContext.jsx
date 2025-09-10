import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState({});
  const [draftOrder, setDraftOrder] = useState(null); // holds current cart + slot info
  const [selectedSlot, setSelectedSlot] = useState(null); // confirmed slot

  //#region Fetch Admin
  const fetchAdmin = async () => {
    try {
      const { data } = await axios.get("/api/v1/admin/admin-authenticated");
      if (data.success) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      toast.error(error.message);
      setIsAdmin(false);
    }
  };
  //#endregion

  //#region Fetch User
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/v1/user/user-authenticated");
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems);
      }
    } catch (error) {
      toast.error(error.message);
      setUser(null);
    }
  };
  //#endregion

  //#region Fetch All Products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/v1/product/products");
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  //#endregion

  //#region Add product to cart
  // const addToCart = (itemId) => {
  //   let cartData = structuredClone(cartItems);
  //
  //   if (cartData[itemId]) {
  //     cartData[itemId] += 1;
  //   } else {
  //     cartData[itemId] = 1;
  //   }
  //
  //   setCartItems(cartData);
  //   toast.success("Product added to cart");
  // };

  //#region Add Product To Cart
  const addProductToCart = async (productId) => {
    try {
      const { data } = await axios.post("/api/v1/cart/add-to-cart", {
        productId,
      });
      if (data.success) {
        toast.success(data.message);
        await getCartItems();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  //#endregion

  //#region Remove Product From Cart
  const removeProductFromCart = async (productId) => {
    try {
      const { data } = await axios.patch(`/api/v1/cart/remove-from-cart`, {
        productId,
      });
      if (data.success) {
        toast.success(data.message);
        // getUserCart();

        await getCartItems();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  //#endregion

  //#region Remove From Cart
  const removeFromCart = async (productId) => {
    try {
      const { data } = await axios.patch(`/api/v1/cart/remove`, {
        productId,
      });
      if (data.success) {
        toast.success(data.message);
        // getUserCart();

        await getCartItems();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  //#endregion

  //#region Get Items In Cart
  const getCartItems = async () => {
    try {
      const { data } = await axios.get("/api/v1/cart/get-cart");
      if (data.success) {
        setCartItems(data.user.cartItems);
        console.log(draftOrder);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  //#endregion

  //#region Update cart item quantity
  const updateCartItem = (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData);
    toast.success("Cart Updated");
  };
  //#endregion

  //#region Remove Product from cart
  // const removeFromCart = (itemId) => {
  //   let cartData = structuredClone(cartItems);
  //
  //   if (cartData[itemId]) {
  //     cartData[itemId] -= 1;
  //     if (cartData[itemId] === 0) {
  //       delete cartData[itemId];
  //     }
  //   }
  //   toast.success("Removed from cart");
  //   setCartItems(cartData);
  // };
  //#endregion

  //#region Total Cart Items Count
  const getCartCount = () => {
    // Just returns the amount of products we have in the cart not quantity included
    return cartItems?.length;
  };
  //#endregion

  //#region Get Cart Total Amount
  const getCartAmount = () => {
    let totalAmount = 0;

    for (const cartItem of cartItems) {
      const product = cartItem.product; // The actual product
      const quantity = cartItem.quantity;

      if (product && quantity > 0) {
        totalAmount += quantity * product.offerPrice;
      }
    }

    return Math.floor(totalAmount * 100) / 100; // rounds to 2 decimals
  };
  //#endregion

  useEffect(() => {
    fetchUser();
    fetchAdmin();
    fetchProducts();
    getCartItems();
  }, []);

  useEffect(() => {
    // const updateUserCart = async () => {
    //   try {
    //     const { data } = await axios.put("/api/v1/cart/update-cart", {
    //       cartItems,
    //     });
    //     if (!data.success) {
    //       toast.error(data.message);
    //     }
    //   } catch (error) {
    //     toast.error(error.message);
    //   }
    // };
    //
    // if (user) {
    //   updateUserCart();
    // }
  }, [cartItems]);

  const value = {
    navigate,
    user,
    setUser,
    isAdmin,
    setIsAdmin,
    showUserLogin,
    setShowUserLogin,
    products,
    currency,
    addProductToCart,
    updateCartItem,
    removeFromCart,
    cartItems,
    setSearchQuery,
    searchQuery,
    getCartCount,
    getCartAmount,
    axios,
    fetchProducts,
    fetchUser,
    getCartItems,
    removeProductFromCart,
    draftOrder,
    setDraftOrder,
    selectedSlot,
    setSelectedSlot,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
