
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Search,
  RefreshCw,
  Package,
} from "lucide-react";
import "./Orders.css";

const filters = [
  "All",
  "Pending",
  "Processing",
  "Completed",
  "Cancelled",
];

function normalizeStatus(status) {
  const value = String(status || "Pending")
    .trim()
    .toLowerCase();

  if (["completed", "complete", "success", "successful"].includes(value)) {
    return "completed";
  }

  if (
    ["cancelled", "canceled", "failed", "refunded"].includes(value)
  ) {
    return "cancelled";
  }

  if (
    ["processing", "in progress", "in-progress", "running"].includes(value)
  ) {
    return "processing";
  }

  return "pending";
}

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  async function fetchOrders(isRefresh = false) {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(
        "https://socialboost-api-5ma2.onrender.com/api/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = {
          message: text || "Invalid response from backend",
        };
      }

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to load orders");
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setError(err.message || "Unable to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const counts = useMemo(() => {
    const result = {
      All: orders.length,
      Pending: 0,
      Processing: 0,
      Completed: 0,
      Cancelled: 0,
    };

    orders.forEach((order) => {
      const status = normalizeStatus(order.status);

      if (status === "pending") result.Pending++;
      if (status === "processing") result.Processing++;
      if (status === "completed") result.Completed++;
      if (status === "cancelled") result.Cancelled++;
    });

    return result;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter =
        activeFilter === "All" ||
        normalizeStatus(order.status) === activeFilter.toLowerCase();

      const matchesSearch =
        !query ||
        [
          order.serviceName,
          order._id,
          order.link,
          order.status,
        ].some((value) =>
          String(value || "").toLowerCase().includes(query)
        );

      return matchesFilter && matchesSearch;
    });
  }, [orders, search, activeFilter]);

  return (
    <main className="orders-page">
      <button
        type="button"
        className="orders-back-button"
        onClick={() => navigate("/dashboard")}
      >
        <ArrowLeft size={17} />
        Dashboard
      </button>

      <header className="orders-header">
        <div>
          <span className="orders-eyebrow">YOUR ACTIVITY</span>
          <h1 className="orders-heading">My Orders</h1>
          <p className="orders-subtitle">
            Track your orders and check their latest status.
          </p>
        </div>

        <button
          type="button"
          className="orders-refresh-button"
          onClick={() => fetchOrders(true)}
          disabled={loading || refreshing}
          aria-label="Refresh orders"
        >
          <RefreshCw
            size={17}
            className={refreshing ? "orders-spinning" : ""}
          />
          Refresh
        </button>
      </header>

      {!loading && !error && (
        <section className="orders-summary">
          <div className="orders-summary-icon">
            <Package size={22} />
          </div>
          <div>
            <span>Total orders</span>
            <strong>{orders.length}</strong>
          </div>
        </section>
      )}

      <section className="orders-toolbar">
        <div className="orders-search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search service, order ID or link..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search orders"
          />
        </div>

        <div className="orders-filters" aria-label="Filter orders by status">
          {filters.map((filter) => (
            <button
              type="button"
              key={filter}
              className={
                activeFilter === filter ? "active" : ""
              }
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
            >
              {filter}
              {!loading && !error && (
                <span>{counts[filter]}</span>
              )}
            </button>
          ))}
        </div>
      </section>

      {loading && (
        <div className="orders-message">
          <RefreshCw size={24} className="orders-spinning" />
          <p>Loading your orders...</p>
        </div>
      )}

      {!loading && error && (
        <div className="orders-message orders-error" role="alert">
          <h3>Couldn't load orders</h3>
          <p>{error}</p>
          <button
            type="button"
            className="orders-primary-button"
            onClick={() => fetchOrders()}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="orders-empty">
          <div className="orders-empty-icon">
            <ShoppingCart size={30} />
          </div>
          <h3>No orders yet</h3>
          <p>
            Your orders will appear here after you place your first order.
          </p>
          <button
            type="button"
            className="orders-primary-button"
            onClick={() => navigate("/services")}
          >
            Browse Services
          </button>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <section className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="orders-empty orders-no-results">
              <Search size={28} />
              <h3>No matching orders</h3>
              <p>Try another search or status filter.</p>
              <button
                type="button"
                className="orders-secondary-button"
                onClick={() => {
                  setSearch("");
                  setActiveFilter("All");
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const status = normalizeStatus(order.status);

              return (
                <article className="order-card" key={order._id}>
                  <div className="order-card-top">
                    <div className="order-service-icon">
                      <ShoppingCart size={19} />
                    </div>

                    <div className="order-service-info">
                      <h3>{order.serviceName || "Social media service"}</h3>
                      <span className="order-id">
                        ID: {order._id}
                      </span>
                    </div>

                    <span className={`orders-status-badge ${status}`}>
                      <span className="status-dot" />
                      {order.status || "Pending"}
                    </span>
                  </div>

                  <div className="order-card-details">
                    <div>
                      <span>Quantity</span>
                      <strong>
                        {Number(order.quantity || 0).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div>
                      <span>Price</span>
                      <strong>
                        ₹{Number(order.price || 0).toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span>Order date</span>
                      <strong>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "—"}
                      </strong>
                    </div>
                  </div>

                  {order.link && (
                    <div className="order-link">
                      <span>Target link</span>
                      <a
                        href={order.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {order.link}
                      </a>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>
      )}
    </main>
  );
}

export default Orders;
