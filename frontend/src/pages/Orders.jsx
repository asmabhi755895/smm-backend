
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import "./Orders.css";

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("https://socialboost-api-5ma2.onrender.com/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();const text = await response.text();

let data;
try {
  data = JSON.parse(text);
} catch {
  data = { message: text || "Invalid response from backend" };
}
        if (!response.ok) {
          throw new Error(data.message || "Unable to load orders");
        }

        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message || "Unable to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  return (
 <div className="orders-page">
<button
  className="orders-back-button"
  onClick={() => navigate("/dashboard")}
>
  <ArrowLeft size={16} />
  Back to Dashboard
</button>

   
<h1 className="orders-heading">My Orders</h1>

<p className="orders-subtitle">
  View your recent orders and their status.
</p>


      {loading && <p>Loading orders...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="orders-empty">
          <ShoppingCart size={36} />
          <h3>No orders yet</h3>
          <p>Your orders will appear here after you place one.</p>
<button
  className="orders-primary-button"
  onClick={() => navigate("/services")}
>
  Browse Services
</button>
        </div>
      )}

      {!loading && orders.map((order) => (
        <article key={order._id} style={{
          background: "#12141e",
          border: "1px solid #292d3d",
          borderRadius: "12px",
          padding: "16px",
          marginTop: "12px"
        }}>
          <h3>{order.serviceName}</h3>
          <p>Quantity: {Number(order.quantity).toLocaleString()}</p>
          <p>Price: ₹{Number(order.price || 0).toFixed(2)}</p>
         <p className="orders-status-row">
  <span>Status</span>
  <strong
    className={`orders-status-badge ${
      String(order.status || "Pending").toLowerCase().replace(/\s+/g, "-")
    }`}
  >
    <span className="status-dot" />
    {order.status || "Pending"}
  </strong>
</p>
          <p style={{ overflowWrap: "anywhere" }}>
            Link: {order.link}
          </p>
          <small>
            {order.createdAt
              ? new Date(order.createdAt).toLocaleString()
              : ""}
          </small>
        </article>
      ))}
    </div>
  );
}

export default Orders;
