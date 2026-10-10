import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Wallet,
  Clock,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  LayoutDashboard,
  Headset,
  UserRound,
  LogOut,
  Settings,
} from "lucide-react";

import "./Dashboard.css";
function Dashboard() {
  const navigate = useNavigate();
const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("https://socialboost-api-5ma2.onrender.com/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("loggedIn");
          navigate("/login");
          return;
        }

        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch (err) {
        setError("Unable to load account. Check your backend connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

useEffect(() => {
  const fetchOrders = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setOrdersLoading(false);
      return;
    }

    try {
      const response = await fetch("https://socialboost-api-5ma2.onrender.com/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load orders");
      }

      setOrders(data.orders || []);
    } catch (err) {
      console.error("Orders error:", err.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  fetchOrders();
}, []);

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <header className="dashboard-header">

        <div className="dashboard-logo">
          <span></span>
          SocialBoost
        </div>


<div className="dashboard-menu-container">
  <button
    type="button"
    className="dashboard-menu-button"
    onClick={() => setMenuOpen(!menuOpen)}
    aria-label={menuOpen ? "Close menu" : "Open menu"}
    aria-expanded={menuOpen}
  >
    {menuOpen ? <X size={24} /> : <Menu size={24} />}
  </button>

  {menuOpen && (
    <>
      <button
        type="button"
        className="dashboard-menu-overlay"
        aria-label="Close menu"
        onClick={() => setMenuOpen(false)}
      />

      <div className="dashboard-dropdown">
        <button onClick={() => { setMenuOpen(false); navigate("/dashboard"); }}>
          <LayoutDashboard size={18} /> Dashboard
        </button>

        <button onClick={() => { setMenuOpen(false); navigate("/services"); }}>
          <Settings size={18} /> Services
        </button>

        <button onClick={() => { setMenuOpen(false); navigate("/order"); }}>
          <ShoppingCart size={18} /> New Order
        </button>

        <button onClick={() => { setMenuOpen(false); navigate("/orders"); }}>
          <Clock size={18} /> My Orders
        </button>

        <button onClick={() => { setMenuOpen(false); navigate("/wallet"); }}>
          <Wallet size={18} /> Wallet
        </button>

        <button onClick={() => { setMenuOpen(false); navigate("/profile"); }}>
          <UserRound size={18} /> Profile
        </button>

        <button onClick={() => { setMenuOpen(false); navigate("/support"); }}>
          <Headset size={18} /> Support
        </button>

        <div className="dashboard-dropdown-divider" />

        <button
          className="dashboard-logout-button"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("loggedIn");
            setMenuOpen(false);
            navigate("/login");
          }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </>
  )}
</div>


      </header>


      <main className="dashboard-content">

        {/* WELCOME */}

        <div className="welcome">

          <span>WELCOME BACK</span>
<h1>
  Hello{user?.name ? `, ${user.name}` : ""} 👋
</h1>

          <p>
            Manage your social media orders
            from one place.
          </p>

        </div>
{error && <p role="alert">{error}</p>}

        {/* BALANCE */}

        <div className="balance-card">

          <div>

            <span>
              Available Balance
            </span>

<strong>
  {loading
    ? "Loading..."
    : `₹${Number(user?.balance ?? 0).toFixed(2)}`}
</strong>

          </div>
<button onClick={() => navigate("/wallet")}>
  + Add Funds
</button>

        </div>


        {/* QUICK ORDER */}

        <button
          className="new-order-card"
          onClick={() => navigate("/order")}
        >

          <div className="new-order-icon">
            <ShoppingCart size={22} />
          </div>

          <div className="new-order-text">

            <strong>
              New Order
            </strong>

            <span>
              Choose a service and place an order
            </span>

          </div>

          <ArrowRight size={19} />

        </button>


        {/* STATISTICS */}

        <div className="dashboard-section-title">
          Overview
        </div>

        <div className="stats-grid">

          <div className="stat-card">

            <ShoppingCart size={19} />

            <span>
              Total Orders
            </span>

            <strong>
              {ordersLoading ? "..." : orders.length}
            </strong>

          </div>


          <div className="stat-card">

            <Clock size={19} />

            <span>
              Processing
            </span>

            <strong>
              {ordersLoading
  ? "..."
  : orders.filter(
      (order) => order.status === "Processing"
    ).length}
            </strong>

          </div>


          <div className="stat-card">

            <CheckCircle size={19} />

            <span>
              Completed
            </span>

            <strong>
              
{ordersLoading
  ? "..."
  : orders.filter(
      (order) => order.status === "Completed"
    ).length}

            </strong>

          </div>


          <div className="stat-card">

            <Wallet size={19} />

            <span>
              Spent
            </span>

            <strong>
              
{ordersLoading
  ? "..."
  : `₹${orders
      .reduce((total, order) => total + Number(order.price || 0), 0)
      .toFixed(2)}`}

            </strong>

          </div>

        </div>

{/* RECENT ORDERS */}

<div className="recent-orders-heading">
  <div>
    <div className="dashboard-section-title">Recent Orders</div>
    <p>Your latest activity</p>
  </div>

  {orders.length > 0 && (
    <button
      className="view-all-orders"
      onClick={() => navigate("/orders")}
    >
      View all <ArrowRight size={15} />
    </button>
  )}
</div>

<div className="recent-orders">
  {ordersLoading ? (
    <div className="orders-message">
      <span className="orders-loading-dot" />
      Loading your orders...
    </div>
  ) : orders.length === 0 ? (
    <div className="empty-orders">
      <div className="empty-orders-icon">
        <ShoppingCart size={26} />
      </div>

      <strong>No orders yet</strong>
      <p>Your placed orders will appear here.</p>

      <button onClick={() => navigate("/order")}>
        Place your first order <ArrowRight size={16} />
      </button>
    </div>
  ) : (
    <div className="recent-orders-list">
      {orders.slice(0, 5).map((order, index) => {
        const status = String(order.status || "Pending");
        const statusClass = status.toLowerCase().replace(/\s+/g, "-");

        return (
          <article
            className="recent-order-item"
            key={order._id}
            style={{ "--order-index": index }}
          >
            <div className="recent-order-main">
              <div className="recent-order-icon">
                <ShoppingCart size={19} />
              </div>

              <div className="recent-order-info">
                <strong>{order.serviceName || "Social Media Service"}</strong>
                <span>
                  Quantity: {Number(order.quantity || 0).toLocaleString()}
                </span>
                <small>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString([], {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Date unavailable"}
                </small>
              </div>
            </div>

            <div className="recent-order-meta">
              <strong className="recent-order-price">
                ₹{Number(order.price || 0).toFixed(2)}
              </strong>

              <span className={`order-status ${statusClass}`}>
                <span className="status-dot" />
                {status}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  )}
</div>

</main>
      {/* MOBILE BOTTOM NAV */}

      <nav className="bottom-nav">

        <button className="active">
          <Wallet size={20} />
          <span>Home</span>
        </button>

        <button
         onClick={() => navigate("/order")}
        >
          <ShoppingCart size={20} />
          <span>Order</span>
        </button>

 <button onClick={() => navigate("/orders")}>
  <Clock size={20} />
  <span>Orders</span>
</button>

<button onClick={() => navigate("/wallet")}>
  <Wallet size={20} />
  <span>Wallet</span>
</button>
      </nav>

    </div>
  );
}

export default Dashboard;