import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const UserDashboard = () => {
  const { axios, user, navigate, currency } = useAppContext();

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [stats, setStats] = useState({
    points: 0,
    totalOrders: 0,
    discounts: 0,
  });

  useEffect(() => {
    const fetchUserPoints = async () => {
      try {
        const { data } = await axios.get("/api/v1/user/points");
        if (data.success) {
          setUserPoints(data?.points || 0);
        }
      } catch (error) {
        toast.error(error.message || "Failed to fetch user points");
      }
    };
    fetchUserPoints();
  }, [axios]);

  // Fetch user details
  useEffect(() => {
    // if (!user) return navigate("/login");

    const fetchDashboardData = async () => {
      try {
        // Recent orders
        const { data: orderData } = await axios.get("/api/v1/order/orders");
        if (orderData.success) {
          setOrders(orderData.orders.slice(0, 5));
          setStats((prev) => ({
            ...prev,
            totalOrders: orderData.orders.length,
          }));
        }

        // Addresses
        const { data: addressData } = await axios.get(
          "/api/v1/address/get-addresses",
        );
        if (addressData.success) setAddresses(addressData.addresses);
      } catch (err) {
        toast.error(err.message);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <div className="p-6 mt-20">
      {/* Header */}
      <h1 className="text-2xl font-semibold mb-6">
        Welcome back, <span className="text-primary">{user?.name}</span> 👋
      </h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white shadow-md p-5 rounded-xl">
          <h2 className="text-gray-500 text-sm">Points</h2>
          <p className="text-2xl font-bold">{userPoints}</p>
        </div>
        <div className="bg-white shadow-md p-5 rounded-xl">
          <h2 className="text-gray-500 text-sm">Orders</h2>
          <p className="text-2xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="bg-white shadow-md p-5 rounded-xl">
          <h2 className="text-gray-500 text-sm">Discounts</h2>
          <p className="text-2xl font-bold">{stats.discounts}</p>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-xl p-5 mb-10">
        <h2 className="text-lg font-semibold mb-3">Recent Orders</h2>

        {/* Desktop / Tablet View */}
        <div className="hidden md:block">
          {orders.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Order ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b hover:bg-gray-50 hover:cursor-pointer"
                    onClick={() => navigate(`/order/${order._id}`)}
                  >
                    <td className="py-2 font-bold">#{order._id}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{order.status}</td>
                    <td>
                      {order.total} {currency}
                    </td>
                    <td>{order.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No recent orders.</p>
          )}
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="border rounded-lg p-3 shadow-sm hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/order/${order._id}`)}
                >
                  <p className="font-bold text-primary">Order #{order._id}</p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Date:</span>{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Status:</span>{" "}
                    {order.status}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Total:</span> {order.total}{" "}
                    {currency}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Points:</span>{" "}
                    {order.points}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No recent orders.</p>
          )}
        </div>
      </div>

      {/* Saved Addresses */}
      <div className="bg-white shadow-md rounded-xl p-5 mb-10">
        <h2 className="text-lg font-semibold mb-3">Saved Addresses</h2>
        {addresses.length > 0 ? (
          <ul className="space-y-3">
            {addresses.map((addr) => (
              <li
                key={addr._id}
                className="flex justify-between items-center border p-3 rounded-md"
              >
                <span>
                  {addr.street}, {addr.city}, {addr.state}, {addr.country}
                </span>
                <button
                  onClick={() => navigate("/add-address")}
                  className="text-primary hover:underline text-sm"
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No saved addresses.</p>
        )}
      </div>

      {/* User Info */}
      <div className="bg-white shadow-md rounded-xl p-5">
        <h2 className="text-lg font-semibold mb-3">Your Details</h2>
        <p>
          <span className="font-medium">Name:</span> {user?.name}
        </p>
        <p>
          <span className="font-medium">Email:</span> {user?.email}
        </p>
        <p>
          <span className="font-medium">Phone:</span> {user?.phone || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default UserDashboard;
