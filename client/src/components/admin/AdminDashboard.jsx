import { useState } from "react";
import {
  Users,
  ShoppingCart,
  DollarSign,
  Calendar as CalendarIcon,
  Package,
  X,
  Menu,
  Settings,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css"; // for basic calendar styles
import { useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext"

// Mock data
const adminData = {
  name: "Admin User",
  email: "admin@grocerly.com",
  stats: {
    totalCustomers: 1240,
    totalOrders: 856,
    revenue: 45230,
    pendingOrders: 12,
  },
  recentOrders: [
    {
      id: 1,
      customer: "Alice",
      total: 45,
      status: "Delivered",
      date: "2025-09-15",
    },
    {
      id: 2,
      customer: "Bob",
      total: 30,
      status: "Processing",
      date: "2025-09-15",
    },
    {
      id: 3,
      customer: "Charlie",
      total: 78,
      status: "Delivered",
      date: "2025-09-14",
    },
  ],
};

const adminOrders = [
  {
    id: 1,
    customer: "Alice",
    total: 45,
    status: "Delivered",
    date: "2025-09-15",
  },
  {
    id: 2,
    customer: "Bob",
    total: 30,
    status: "Processing",
    date: "2025-09-15",
  },
  {
    id: 3,
    customer: "Charlie",
    total: 78,
    status: "Pending",
    date: "2025-09-14",
  },
];

function AdminDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState({})
  const { axios, currency } = useAppContext();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const { data } = await axios.get('/api/v1/admin/dashboard');
        console.log(data)
        if (data.success) {
          setData(data)
          toast.success(data.message || "Admin Data Fetched")
        }
      } catch (error) {
        console.log(error)
      }
    }
    fetchAdminData()
  }, [])


  // Reusable Tailwind-styled components
  const Card = ({ children }) => (
    <div className="bg-white border rounded-lg shadow p-4">{children}</div>
  );

  const Badge = ({ children, color }) => {
    const colors = {
      green: "bg-green-100 text-green-800",
      yellow: "bg-yellow-100 text-yellow-800",
      red: "bg-red-100 text-red-800",
      gray: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[color] || colors.gray}`}
      >
        {children}
      </span>
    );
  };

  const Button = ({ children, onClick, variant = "primary", className }) => {
    const base = "px-3 py-1 rounded font-medium";
    const styles = {
      primary: "bg-green-500 text-white hover:bg-green-600",
      outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
      ghost: "text-gray-700 hover:text-green-500",
    };
    return (
      <button
        onClick={onClick}
        className={`${base} ${styles[variant]} ${className || ""}`}
      >
        {children}
      </button>
    );
  };
  // in component
  const [orders, setOrders] = useState(adminOrders);

  // filter orders for selected date
  const ordersForDay = orders.filter(
    (order) => order.date === selectedDate.toISOString().split("T")[0],
  );


  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Navbar */}
      {/* <nav className="bg-white shadow-sm border-b sticky top-0 z-50"> */}
      {/*   <div className="w-full mx-auto px-6"> */}
      {/*     <div className="flex justify-between items-center h-16"> */}
      {/*       <Link to="/" className="text-2xl font-bold text-gray-900"> */}
      {/*         Grocerly <span className="text-green-500">Admin</span> */}
      {/*       </Link> */}
      {/**/}
      {/*       {/* Desktop nav */}
      {/*       <div className="hidden md:flex items-center space-x-4"> */}
      {/*         <Button variant="ghost"> */}
      {/*           <Settings className="inline mr-1 h-4 w-4" /> */}
      {/*           Settings */}
      {/*         </Button> */}
      {/*         <Button variant="ghost"> */}
      {/*           <LogOut className="inline mr-1 h-4 w-4" /> */}
      {/*           Logout */}
      {/*         </Button> */}
      {/*         <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold"> */}
      {/*           {adminData.name[0]} */}
      {/*         </div> */}
      {/*       </div> */}
      {/**/}
      {/*       {/* Mobile menu */}
      {/*       <div className="md:hidden"> */}
      {/*         <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}> */}
      {/*           {mobileMenuOpen ? ( */}
      {/*             <X className="h-6 w-6" /> */}
      {/*           ) : ( */}
      {/*             <Menu className="h-6 w-6" /> */}
      {/*           )} */}
      {/*         </button> */}
      {/*       </div> */}
      {/*     </div> */}
      {/**/}
      {/*     {mobileMenuOpen && ( */}
      {/*       <div className="md:hidden border-t bg-white p-2 space-y-1"> */}
      {/*         <Button variant="ghost" className="w-full"> */}
      {/*           Settings */}
      {/*         </Button> */}
      {/*         <Button variant="ghost" className="w-full"> */}
      {/*           Logout */}
      {/*         </Button> */}
      {/*       </div> */}
      {/*     )} */}
      {/*   </div> */}
      {/* </nav> */}
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-16 h-16 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold text-xl">
              {adminData.name[0]}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {adminData.name}!
              </h1>
              <p className="text-gray-600">{adminData.email}</p>
            </div>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Customers
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {data?.customers?.length}
                </p>
              </div>
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {data.orders?.length}
                </p>
              </div>
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  {data.formattedRevenue || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Orders
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {data?.pendingOrders?.length}
                </p>
              </div>
              <Package className="h-6 w-6 text-red-600" />
            </div>
          </Card>
        </div>
        {/* Tabs */}
        <div className="mb-6 flex space-x-4 border-b">
          {["overview", "orders", "calendar"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 font-medium ${activeTab === tab ? "border-b-2 border-green-500 text-green-600" : "text-gray-600"}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        {/* Tab Content */}
        {activeTab === "overview" && (
          <Card>
            <h2 className="font-bold text-lg mb-4">Recent Orders</h2>
            <div className="space-y-2">
              {data?.orders?.slice(0, 5).map((order) => (
                <div
                  key={order._id}
                  className="flex justify-between p-3 border rounded-lg bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{order.userId.name}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.total} {currency}</p>
                    <Badge
                      color={
                        order.status === "completed"
                          ? "green"
                          : order.status === "pending"
                            ? "yellow"
                            : "red"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
        {activeTab === "orders" && (
          <Card>
            <h2 className="font-bold text-lg mb-4">All Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Customer</th>
                    <th className="p-2 border">Total</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {adminOrders.map((order) => (
                    <tr key={order.id} className="text-center border-b">
                      <td className="p-2">{order.customer}</td>
                      <td className="p-2">${order.total}</td>
                      <td className="p-2">{order.status}</td>
                      <td className="p-2">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
        {activeTab === "calendar" && (
          <Card>
            <h2 className="font-bold text-lg mb-4 flex items-center">
              <CalendarIcon className="mr-2" /> Order Calendar
            </h2>

            <div className="md:flex gap-6">
              {/* Calendar */}
              <div className="md:w-1/2 mb-4 md:mb-0">
                <Calendar
                  value={selectedDate}
                  onChange={setSelectedDate}
                  tileClassName={({ date, view }) => {
                    const day = date.toISOString().split("T")[0];
                    return orders.some((o) => o.date === day)
                      ? "bg-green-100 rounded"
                      : "";
                  }}
                />
              </div>

              {/* Orders for selected day */}
              <div className="md:w-1/2">
                <h3 className="font-medium mb-2">
                  Orders for {selectedDate.toISOString().split("T")[0]}
                </h3>

                {ordersForDay.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {ordersForDay.map((order) => (
                      <div
                        key={order.id}
                        className="flex justify-between p-3 border rounded-lg bg-gray-50"
                      >
                        <div>
                          <p className="font-medium">{order.customer}</p>
                          <p className="text-sm text-gray-500">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.total}</p>
                          <Badge
                            color={
                              order.status === "Delivered"
                                ? "green"
                                : order.status === "Processing"
                                  ? "yellow"
                                  : "red"
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No orders for this day</p>
                )}
              </div>
            </div>
          </Card>
        )}{" "}
      </div>
    </div>
  );
}

export default AdminDashboard;
