import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets, dummyAddress } from "../assets/assets";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { TrashIcon } from "lucide-react";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    getCartCount,
    navigate,
    getCartAmount,
    axios,
    addProductToCart,
    removeProductFromCart,
    removeFromCart,
    draftOrder,
    setDraftOrder,
    user,
    setCartItems,
  } = useAppContext();

  const location = useLocation();
  const [showAddress, setShowAddress] = useState(false);
  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState("Card");

  //NOTE: Only keeping this func call here as we are getting the card and specifically setting the cart array to our cartItems
  // const getUserCart = async () => {
  //   const { data } = await axios.get("/api/v1/cart/get-cart");
  //   if (data.success) {
  //     setCartArray(data.user.cartItems);
  //   }
  // };

  const getUserAddresses = async () => {
    try {
      const { data } = await axios.get("/api/v1/address/get-addresses");

      if (data.success) {
        toast.success(data.message);
        setAddresses(data.addresses);
        console.log(data.addresses);

        // Automatically select the newest address (first one returned by backend)
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getUserCart = async () => {
    const { data } = await axios.get("/api/v1/cart/get-cart");
    if (data.success) {
      console.log(data);
      setCartArray(data.user.cartItems);
    }
  };

  const placeOrder = async () => {
    try {
      if (!selectedAddress) return toast.error("Please select an address");
      const cartTotal = (getCartAmount() + getCartAmount() * 0.03).toFixed(2);

      // Place an order with Cash
      if (paymentOption === "COD") {
        const { data } = await axios.post("/api/v1/order/place-order", {
          address: selectedAddress._id,
          items: cartArray.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
          })),
          total: cartTotal,
        });

        if (data.success) {
          toast.success(data.message);
          setCartItems([]);
          setDraftOrder(null);
          navigate("/orders");
        } else {
          toast.error(data.message);
        }
      } else {
        // We will place the order with stripe
        const { data } = await axios.post("/api/v1/order/place-stripe", {
          address: selectedAddress._id,
          items: cartArray.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
          })),
          total: cartTotal,
        });

        if (data.success) {
          window.location.replace(data.url);
          // toast.success(data.message);
          // setCartItems([]);
          // setDraftOrder(null);
          // navigate("/orders");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const { data } = await axios.delete(`/api/v1/address/delete/${id}`);

      if (data.success) {
        toast.success(data.message);
        // Remove from local state
        setAddresses((prev) => prev.filter((addr) => addr._id !== id));

        // If deleted address was selected, reset selectedAddress
        if (selectedAddress && selectedAddress._id === id) {
          setSelectedAddress(addresses[0] || null);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const hasMinimumSpend = () => getCartAmount() < 75;

  useEffect(() => {
    if (products.length > 0 && cartItems) {
      getUserCart();
    }
  }, [products, cartItems]);

  useEffect(() => {
    if (location.state?.newAddress) {
      setSelectedAddress(location.state.newAddress);

      // Optionally also add it to the addresses list
      setAddresses((prev) => [location.state.newAddress, ...prev]);
    } else {
      if (user) getUserAddresses();
    }
  }, [location.state, user]);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (user) {
        try {
          const { data } = await axios.get("/api/v1/address/get-addresses");
          if (data.success) {
            let addressesFromBackend = [...data.addresses];

            if (location.state?.newAddress) {
              const newAddress = location.state.newAddress;

              // Filter out if already in the list
              addressesFromBackend = addressesFromBackend.filter(
                (addr) => addr._id !== newAddress._id,
              );

              // Put new address at the front
              addressesFromBackend = [newAddress, ...addressesFromBackend];

              setSelectedAddress(newAddress);
            } else if (addressesFromBackend.length > 0) {
              // Always select the first one
              setSelectedAddress(addressesFromBackend[0]);
            }

            setAddresses(addressesFromBackend);
          }
        } catch (err) {
          toast.error(err.message);
        }
      }
    };

    fetchAddresses();
  }, [user, location.state?.newAddress]);

  return products.length > 0 && cartItems ? (
    <div className="flex flex-col md:flex-row mt-32">
      <div className="flex-1 max-w-4xl">
        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart{" "}
          <span className="text-sm text-primary">{getCartCount()} Items</span>
        </h1>
        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
          <p className="text-left">Product Details</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>
        {cartArray
          ? cartArray.map((cartItem, index) => {
              const product = cartItem.product; // the actual product
              const quantity = cartItem.quantity;
              const offerPrice = product.offerPrice;
              return (
                <div
                  key={index}
                  className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3"
                >
                  <div className="flex items-center md:gap-6 gap-3">
                    <div
                      onClick={() => {
                        navigate(
                          `/products/${cartItem?.category?.tolowerCase()}/${product._id}`,
                        );
                        scrollTo(0, 0);
                      }}
                      className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded overflow-hidden"
                    >
                      <img
                        className="max-w-full h-full object-cover"
                        src={product.image[0]}
                        alt={product.name}
                      />
                    </div>

                    <div>
                      <p className="hidden md:block font-semibold">
                        {product.name}
                      </p>

                      <div className="font-normal text-gray-500/70">
                        <p>
                          Weight: <span>{product?.weight || "N/A"}</span>
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => removeProductFromCart(product._id)}
                            disabled={quantity <= 1}
                            className="cursor-pointer bg-gray-200 px-2 rounded disabled:opacity-50"
                          >
                            -
                          </button>

                          <span className="w-5 text-center">{quantity}</span>

                          <button
                            onClick={() => addProductToCart(product._id)}
                            className="cursor-pointer bg-gray-200 px-2 rounded"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-center">
                    {offerPrice * quantity} {currency}
                  </p>

                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="cursor-pointer mx-auto bg-primary text-white rounded-lg p-2 hover:-translate-y-0.5"
                  >
                    Remove from cart
                  </button>
                </div>
              );
            })
          : ""}
        <button
          onClick={() => {
            navigate("/products");
            scrollTo(0, 0);
          }}
          className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium"
        >
          <img
            className="group-hover:-translate-x-1 transition"
            src={assets.arrow_right_icon_colored}
            alt="arrow"
          />
          Continue Shopping
        </button>
      </div>

      <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70 ml-5">
        <h2 className="text-xl md:text-xl font-medium">Order Summary</h2>

        <hr className="border-gray-300 my-5" />

        <div className="mb-6">
          <p className="text-sm font-medium uppercase">Delivery Address</p>

          <div className="relative flex justify-between items-start mt-2">
            <p className="text-gray-500">
              {selectedAddress
                ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}`
                : "No Address Found"}
            </p>
            <button
              onClick={() => setShowAddress(!showAddress)}
              className="text-primary hover:underline cursor-pointer"
            >
              Change
            </button>

            {showAddress && (
              <div className="absolute top-10 left-0 w-full bg-white border border-gray-300 text-sm z-10 shadow-md">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className={`flex items-center justify-between p-2 ${
                      selectedAddress?._id === address._id
                        ? "bg-green-100 font-medium"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <p
                      onClick={() => {
                        setSelectedAddress(address);
                        setShowAddress(false);
                      }}
                      className="cursor-pointer flex-1"
                    >
                      {address.street}, {address.city}, {address.state},{" "}
                      {address.country}
                    </p>

                    {/* Trash button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent selecting address
                        handleDeleteAddress(address._id);
                      }}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}

                <p
                  onClick={() => navigate("/add-address")}
                  className="text-primary text-center cursor-pointer p-2 hover:bg-gray-100 font-medium"
                >
                  + Add New Address
                </p>
              </div>
            )}
          </div>

          <p className="text-sm font-medium uppercase mt-6">Delivery Slot</p>
          <div className="text-gray-500 mt-4 space-y-2">
            <p className="flex justify-between">
              <span>Delivery Date:</span>
              <span>
                {draftOrder
                  ? draftOrder?.deliverySlot?.date.split("T")[0]
                  : "No Slot Found"}
              </span>
            </p>
            <p className="flex justify-between">
              <span>Delivery Time:</span>
              <span>
                {draftOrder ? draftOrder?.deliverySlot?.time : "No Slot Found"}
              </span>
            </p>
          </div>

          <p className="text-sm font-medium uppercase mt-6">Payment Method</p>

          <select
            onChange={(e) => setPaymentOption(e.target.value)}
            className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none"
          >
            <option value="Online">Online Payment</option>
            <option value="COD">Cash On Delivery</option>
          </select>
        </div>

        <hr className="border-gray-300" />

        <div className="text-gray-500 mt-4 space-y-2">
          <p className="flex justify-between">
            <span>Price</span>
            <span>
              {getCartAmount().toFixed(2)} {currency}
            </span>
          </p>

          <p className="flex justify-between">
            <span>Shipping Fee</span>
            <span className="text-green-600">Free</span>
          </p>

          <p className="flex justify-between">
            <span>Tax (3%)</span>
            <span>
              {(getCartAmount() * 0.03).toFixed(2)} {currency}
            </span>
          </p>

          <p className="flex justify-between text-lg font-medium mt-3">
            <span>Total Amount:</span>
            <span>
              {(getCartAmount() + getCartAmount() * 0.03).toFixed(2)} {currency}
            </span>
          </p>
        </div>

        <button
          onClick={placeOrder}
          disabled={hasMinimumSpend()}
          className={`w-full py-3 mt-6 cursor-pointer bg-primary text-white font-medium hover:bg-primary-dull hover:-translate-y-0.5 transition rounded-lg ${hasMinimumSpend() ? "opacity-50 cursor-not-allowed text-red-500" : "cursor-pointer"}`}
        >
          {hasMinimumSpend()
            ? `Minimum Spend Of 75 ${currency}`
            : paymentOption === "COD"
              ? "Place Order"
              : "Proceed to checkout"}
        </button>
      </div>
    </div>
  ) : null;
};

export default Cart;
