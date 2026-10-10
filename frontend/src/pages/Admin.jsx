import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Settings,
  ArrowLeft,
  DollarSign,
  ArrowRight,
  Ticket,
  RefreshCw,
  Send,
  MessageCircle
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
const [tickets, setTickets] = useState([]);
const [selectedTicket, setSelectedTicket] = useState(null);
const [ticketReply, setTicketReply] = useState("");
const [ticketLoading, setTicketLoading] = useState(false);
const [ticketMessage, setTicketMessage] = useState("");
const [ticketError, setTicketError] = useState("");
const [ticketSending, setTicketSending] = useState(false);
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
       "https://socialboost-api-5ma2.onrender.com/api/admin/orders",
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


  // Load all support tickets
  const loadTickets = async () => {
    const token = localStorage.getItem("token");

    setTicketLoading(true);
    setTicketError("");
    setTicketMessage("");

    try {
      const response = await fetch(
        "https://socialboost-api-5ma2.onrender.com/api/admin/support/tickets",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load tickets.");
      }

      setTickets(data.tickets || []);

      if (selectedTicket) {
        const updated = (data.tickets || []).find(
          (ticket) => ticket._id === selectedTicket._id
        );

        if (updated) setSelectedTicket(updated);
      }
    } catch (error) {
      setTicketError(error.message);
    } finally {
      setTicketLoading(false);
    }
  };

  // Load tickets when the admin page opens
  useEffect(() => {
    loadTickets();
  }, []);

  // Send an admin reply
  const sendTicketReply = async (event) => {
    event.preventDefault();

    if (!selectedTicket || !ticketReply.trim()) return;

    const token = localStorage.getItem("token");

    setTicketSending(true);
    setTicketError("");
    setTicketMessage("");

    try {
      const response = await fetch(
        `https://socialboost-api-5ma2.onrender.com/api/support/tickets/${selectedTicket._id}/replies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ message: ticketReply.trim() })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send reply.");
      }

      setSelectedTicket(data.ticket);
      setTicketReply("");
      setTicketMessage("Reply sent successfully.");
      await loadTickets();
    } catch (error) {
      setTicketError(error.message);
    } finally {
      setTicketSending(false);
    }
  };

  // Update ticket status
  const updateTicketStatus = async (status) => {
    if (!selectedTicket) return;

    const token = localStorage.getItem("token");

    setTicketError("");
    setTicketMessage("");

    try {
      const response = await fetch(
        `https://socialboost-api-5ma2.onrender.com/api/admin/support/tickets/${selectedTicket._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update status.");
      }

      setSelectedTicket(data.ticket);
      setTicketMessage("Ticket status updated.");
      await loadTickets();
    } catch (error) {
      setTicketError(error.message);
    }
  };

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

<section className="admin-support-section">
  <div className="admin-support-header">
    <div>
      <h2>
        <Ticket size={21} />
        Support Tickets
      </h2>
      <p>Manage customer questions and replies</p>
    </div>

    <button
      type="button"
      className="admin-support-refresh"
      onClick={loadTickets}
      disabled={ticketLoading}
    >
      <RefreshCw size={15} />
      Refresh
    </button>
  </div>

  {ticketMessage && (
    <p className="admin-support-success">{ticketMessage}</p>
  )}

  {ticketError && (
    <p className="admin-support-error">{ticketError}</p>
  )}

  <div className="admin-support-layout">
    <div className="admin-support-list">
      {ticketLoading && tickets.length === 0 ? (
        <p className="admin-support-empty">Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <p className="admin-support-empty">No support tickets found.</p>
      ) : (
        tickets.map((ticket) => (
          <button
            type="button"
            key={ticket._id}
            className={`admin-support-ticket ${
              selectedTicket?._id === ticket._id ? "selected" : ""
            }`}
            onClick={() => {
              setSelectedTicket(ticket);
              setTicketMessage("");
              setTicketError("");
            }}
          >
            <div className="admin-support-ticket-top">
              <strong>{ticket.subject}</strong>
              <span
                className={`admin-support-status ${
                  String(ticket.status || "Open")
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                }`}
              >
                {ticket.status || "Open"}
              </span>
            </div>

            <p>
              {ticket.user?.name || "Customer"}
              {ticket.user?.email ? ` · ${ticket.user.email}` : ""}
            </p>

            <small>
              {ticket.replies?.length || 0} replies
            </small>
          </button>
        ))
      )}
    </div>

    <div className="admin-support-conversation">
      {!selectedTicket ? (
        <div className="admin-support-empty">
          <MessageCircle size={28} />
          <p>Select a ticket to view its conversation.</p>
        </div>
      ) : (
        <>
          <div className="admin-support-conversation-header">
            <div>
              <h3>{selectedTicket.subject}</h3>
              <p>
                {selectedTicket.user?.name || "Customer"}
                {selectedTicket.user?.email
                  ? ` · ${selectedTicket.user.email}`
                  : ""}
              </p>
            </div>

            <select
              aria-label="Ticket status"
              value={selectedTicket.status || "Open"}
              onChange={(event) =>
                updateTicketStatus(event.target.value)
              }
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="admin-support-messages">
            <article className="admin-support-message customer">
              <strong>Original message</strong>
              <p>{selectedTicket.message}</p>
              <small>
                {new Date(selectedTicket.createdAt).toLocaleString()}
              </small>
            </article>

            {(selectedTicket.replies || []).map((item, index) => (
              <article
                key={item._id || `${item.createdAt}-${index}`}
                className={`admin-support-message ${
                  item.senderRole === "admin" ? "admin" : "customer"
                }`}
              >
                <strong>
                  {item.senderRole === "admin"
                    ? "Support team"
                    : "Customer"}
                </strong>
                <p>{item.message}</p>
                <small>
                  {new Date(item.createdAt).toLocaleString()}
                </small>
              </article>
            ))}
          </div>

          {selectedTicket.status === "Resolved" ? (
            <p className="admin-support-empty">
              This ticket is resolved. Change its status to reopen the
              conversation.
            </p>
          ) : (
            <form className="admin-support-reply" onSubmit={sendTicketReply}>
              <textarea
                value={ticketReply}
                onChange={(event) => setTicketReply(event.target.value)}
                placeholder="Write a reply to the customer..."
                rows={3}
                maxLength={2000}
                required
              />

              <button type="submit" disabled={ticketSending}>
                <Send size={15} />
                {ticketSending ? "Sending..." : "Send Reply"}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  </div>
</section>

      </main>
    </div>
  );
}

export default Admin;