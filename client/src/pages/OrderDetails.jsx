import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const OrderDetails = () => {
  const { orderId } = useParams();
  const { axios, currency } = useAppContext();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`/api/v1/order/${orderId}`);
        if (data.success) {
          setOrder(data.order);
        } else {
          toast.error(data.message);
        }
      } catch (err) {
        toast.error(err.message);
      }
    };
    fetchOrder();
  }, [orderId, axios]);

  if (!order) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto mt-20">
      <h2 className="text-2xl font-bold mb-4">Order #{order._id}</h2>
      <p className="text-gray-600 mb-6">
        Ordered on: {new Date(order.createdAt).toLocaleDateString()}
      </p>

      <div className="flex flex-col gap-4">
        {order.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between border p-4 rounded-lg shadow-sm bg-white"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.product.image[0]}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-medium text-gray-800">
                  {item.product.name}
                </h3>
                <p className="text-gray-500 text-sm">{item.product.category}</p>
                <p className="text-gray-500 text-sm">
                  Quantity: {item.quantity}
                </p>
              </div>
            </div>
            <p className="font-medium text-primary">
              {item.product.offerPrice * item.quantity} {currency}
            </p>
            <p className="font-medium text-primary">
              Points: {item.product.points * item.quantity}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col md:flex-row md:justify-between items-start md:items-center">
        <p className="text-lg font-medium">
          Total: {order.total} {currency}
          {/* Total: {order.total} {currency} {"(3% Tax)"} */}
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 md:mt-0 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;
