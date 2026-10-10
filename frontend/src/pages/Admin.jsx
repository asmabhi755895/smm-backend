import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Settings,
  ArrowLeft,
  DollarSign,
  ArrowRight
} from "lucide-react";
import "./Admin.css";

function Admin() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Keep your existing useEffect below this



useEffect(() => {
  const loadAdminData = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No login token found.");
      setStatsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://socialboost-api-5ma2.onrender.com/api/admin/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load statistics");
      }

      setStats(data);
    } catch (error) {
      console.error("Stats error:", error.message);
    } finally {
      setStatsLoading(false);
    }

    try {
      const response = await fetch(
        "https://socialboost-api-5ma2.onrender.com/api/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load orders");
      }

const ordersList = Array.isArray(data)
  ? data
  : Array.isArray(data.orders)
    ? data.orders
    : [];

console.log("Orders API response:", data);
setRecentOrders(ordersList.slice(0, 5));
    } catch (error) {
      console.error("Recent orders error:", error.message);
    }
  };

  loadAdminData();
}, []);


  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <h2>SocialBoost</h2>
        <p className="admin-label">ADMIN PANEL</p>

        <button className="admin-nav active">
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        <button
          className="admin-nav"
          onClick={() => navigate("/admin/users")}
        >
          <Users size={18} />
          Users
        </button>

        <button
          className="admin-nav"
          onClick={() => navigate("/admin/orders")}
        >
          <ShoppingCart size={18} />
          Orders
        </button>

        <button className="admin-nav">
          <Settings size={18} />
          Settings
        </button>

        <button
          className="admin-nav"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />
          Back to Panel
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p>ADMINISTRATION</p>
            <h1>Dashboard</h1>
          </div>
          <span className="admin-status">Admin Preview</span>
        </header>

        <section className="admin-welcome">
          <h2>Welcome to SocialBoost</h2>
          <p>
            Manage your users, orders and services from one place.
          </p>
        </section>

        <section className="admin-stats">
          <article className="admin-stat-card">
            <Users size={22} />
            <p>Total Users</p>
            <h3>{stats.totalUsers}</h3>
          </article>

          <article className="admin-stat-card">
            <ShoppingCart size={22} />
            <p>Total Orders</p>
           <h3>{stats.totalOrders}</h3>
          </article>

<article className="admin-stat-card">
  <DollarSign size={22} />
  <p>Total Order Value</p>
  <h3>
    {statsLoading
      ? "Loading..."
      : `₹${Number(stats.totalRevenue || 0).toFixed(2)}`}
  </h3>
</article>
        </section>


<section className="admin-recent-orders">
  <div className="admin-recent-header">
    <div>
      <h2>Recent Orders</h2>
      <p>Latest customer activity</p>
    </div>

    <button onClick={() => navigate("/admin/orders")}>
      View All <ArrowRight size={16} />
    </button>
  </div>

  {recentOrders.length === 0 ? (
    <p className="admin-empty">No orders found.</p>
  ) : (
    recentOrders.map((order) => (
      <article className="admin-order-row" key={order._id}>
        <div>
          <strong>{order.serviceName || "Social Media Service"}</strong>
          <p>
            Quantity: {Number(order.quantity || 0).toLocaleString()}
          </p>
        </div>

        <div className="admin-order-meta">
          <strong>₹{Number(order.price || 0).toFixed(2)}</strong>
          <span
            className={`admin-order-status ${
              String(order.status || "Pending").toLowerCase()
            }`}
          >
            {order.status || "Pending"}
          </span>
        </div>
      </article>
    ))
  )}
</section>

      </main>
    </div>
  );
}

export default Admin;
