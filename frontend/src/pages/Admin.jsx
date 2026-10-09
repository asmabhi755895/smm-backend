import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Settings,
  ArrowLeft
} from "lucide-react";
import "./Admin.css";

function Admin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0
  });

  useEffect(() => {
    fetch("https://socialboost-api-5ma2.onrender.com/api/admin/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((error) => console.error("Stats error:", error));
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
           <h3>{stats.totalUsers}</h3>
          </article>

          <article className="admin-stat-card">
            <LayoutDashboard size={22} />
            <p>Revenue</p>
            <h3>{stats.totalRevenue}</h3>
          </article>
        </section>

        <p className="admin-note">
          Statistics will appear here after connecting the admin API.
        </p>
      </main>
    </div>
  );
}

export default Admin;
