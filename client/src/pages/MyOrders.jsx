import React, { useEffect, useState } from "react";
import moment from "moment";
import { useAppContext } from "../context/AppContext";
import { dummyOrders } from "../assets/assets";
import toast from "react-hot-toast";

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const { currency, axios, user, navigate } = useAppContext();

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/v1/order/orders");
      if (data.success) {
        setMyOrders(data.orders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  return (
    <div className="mt-32 pb-16">
      <div className="flex flex-col items-end w-max mb-8">
        <p className="text-2xl font-medium uppercase">My Orders</p>
        <div className="w-23 h-0.5 bg-primary rounded-full"></div>
      </div>
      {myOrders.map((order, index) => (
        <div
          key={index}
          className="border border-gray-300 rounded-lg mb-10 p-4 py-5"
        >
          <p className="flex justify-between  text-gray-600 md:font-medium flex-col">
            <span>
              Order ID: <span className="text-gray-500">{order._id}</span>
            </span>
            <span>
              Order Created:{" "}
              <span className="text-gray-500">
                {moment(order.createdAt).fromNow()}
              </span>
            </span>
            <span>
              Payment:{" "}
              <span className="text-gray-500">{order.paymentType}</span>
            </span>
            <span>
              Delivery Slot:{" "}
              <span className="text-gray-500">{order.deliverySlot.time} </span>
            </span>
            <span>
              Delivery Date:{" "}
              <span className="text-gray-500">
                {new Date(order.deliverySlot.date).toLocaleDateString()}
              </span>
            </span>
            <span className="flex justify-end">
              <span className="text-primary">Total Amount:</span> {order.total}
              {"  "}
              {currency}
            </span>
            <span>
              Address: {order.address?.street}, {order.address?.city}{" "}
              {order.address?.state} {order.address?.country}{" "}
            </span>
            <span>Phone Number: {order.address?.phone}</span>
            <button
              className="text-primary cursor-pointer font-medium hover:-translate-y-0.5"
              onClick={() => navigate(`/order/${order._id}`)}
            >
              Show More
            </button>
          </p>
          {/* {order.items.map((item, index) => ( */}
          {/*   <div */}
          {/*     key={index} */}
          {/*     className={`relative bg-white text-gray-500/70 ${order.items.length !== index + 1 && "border-b"} border-gray-300 flex flex-col md:flex-row md:items-center justify-beteen p-4 py-5 md:gap-16 w-full max-w-4xl`} */}
          {/*   > */}
          {/*     <div className="flex items-center m-4 md:mb-0"> */}
          {/*       <div className="bg-primary/10 p-4 rounded-lg"> */}
          {/*         <img */}
          {/*           src={item.product.image[0]} */}
          {/*           alt={item.product.name} */}
          {/*           className="w-16 h-16" */}
          {/*         /> */}
          {/*       </div> */}
          {/*       <div className="ml-4"> */}
          {/*         <h2 className="text-xl font-medium text-gray-800"> */}
          {/*           {item.product.name} */}
          {/*         </h2> */}
          {/*         <p>Category: {item.product.category}</p> */}
          {/*       </div> */}
          {/*     </div> */}
          {/**/}
          {/*     <div className="flex flex-col justify-center md:ml-8 mb-4 md:mb-0"> */}
          {/*       <p>Quantity: {item.quantity || "1"}</p> */}
          {/*       <p>Status: {order.status}</p> */}
          {/*       <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p> */}
          {/*     </div> */}
          {/*     <p className="text-primary text-lg font-medium"> */}
          {/*       Amount: {item.product.offerPrice * item.quantity} {currency} */}
          {/*     </p> */}
          {/*   </div> */}
          {/* ))} */}
        </div>
      ))}
    </div>
  );
};

export default MyOrders;
