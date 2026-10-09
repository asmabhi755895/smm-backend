import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Wallet,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import "./Dashboard.css";
function Dashboard() {
  const navigate = useNavigate();

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
        const response = await fetch("http://localhost:5000/api/auth/me", {
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
      const response = await fetch("http://localhost:5000/api/orders", {
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

        <button
          onClick={() => navigate("/profile")}
          className="profile-button"
        >
          👤
        </button>

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

<div className="dashboard-section-title">
  Recent Orders
</div>

<div className="recent-orders">
  {ordersLoading ? (
    <p>Loading orders...</p>
  ) : orders.length === 0 ? (
    <div className="empty-orders">
      <ShoppingCart size={30} />
      <strong>No orders yet</strong>
      <p>Your recent orders will appear here.</p>
      <button onClick={() => navigate("/order")}>
        Place Your First Order
      </button>
    </div>
  ) : (
    orders.slice(0, 5).map((order) => (
      <div className="recent-order-item" key={order._id}>
        <div>
          <strong>{order.serviceName}</strong>
          <p>Quantity: {Number(order.quantity).toLocaleString()}</p>
          <small>
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString()
              : ""}
          </small>
        </div>

        <div className="recent-order-right">
          <strong>₹{Number(order.price || 0).toFixed(2)}</strong>
          <span className={`order-status ${String(order.status || "Pending").toLowerCase()}`}>
            {order.status || "Pending"}
          </span>
        </div>
      </div>
    ))
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