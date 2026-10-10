
import { useEffect, useState } from "react";
import "./Support.css";

const API = "https://socialboost-api-5ma2.onrender.com";
const WHATSAPP =
  "https://wa.me/918921879334?text=Hi%20SocialBoost%20Support%2C%20I%20need%20help%20with%20my%20account.";

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [activeTicket, setActiveTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const token = localStorage.getItem("token");

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong.");
    }

    return data;
  }

  async function loadTickets() {
    setLoading(true);
    setError("");

    try {
      const data = await request("/api/support/tickets");
      setTickets(data.tickets || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
    // Load tickets when the support page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createTicket(event) {
    event.preventDefault();
    setNotice("");
    setError("");
    setSending(true);

    try {
      const data = await request("/api/support/tickets", {
        method: "POST",
        body: JSON.stringify({ subject, message })
      });

      setTickets((previous) => [
        data.ticket,
        ...previous
      ]);
      setSubject("");
      setMessage("");
      setNotice("Your support ticket was created successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function openTicket(id) {
    setError("");
    setNotice("");

    try {
      const data = await request(`/api/support/tickets/${id}`);
      setActiveTicket(data.ticket);
    } catch (err) {
      setError(err.message);
    }
  }

  async function sendReply(event) {
    event.preventDefault();

    if (!activeTicket || !reply.trim()) return;

    setSending(true);
    setError("");
    setNotice("");

    try {
      const data = await request(
        `/api/support/tickets/${activeTicket._id}/replies`,
        {
          method: "POST",
          body: JSON.stringify({ message: reply })
        }
      );

      setActiveTicket(data.ticket);
      setReply("");
      setNotice("Your reply was sent.");
      await loadTickets();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  function statusClass(status) {
    return (status || "Open").toLowerCase().replace(/\s+/g, "-");
  }

  return (
    <main className="support-page">
      <div className="support-container">
        <header className="support-header">
          <div>
            <p className="support-eyebrow">SOCIALBOOST HELP CENTER</p>
            <h1>How can we help?</h1>
            <p className="support-subtitle">
              Contact us on WhatsApp or create a support ticket.
            </p>
          </div>
        </header>

        {notice && <div className="support-notice">{notice}</div>}
        {error && <div className="support-error">{error}</div>}

        <section className="support-contact-card">
          <div className="support-icon whatsapp-icon">W</div>
          <div className="support-contact-info">
            <h2>WhatsApp Support</h2>
            <p>Chat with our support team directly.</p>
            <a
              className="support-whatsapp-button"
              href={WHATSAPP}
              target="_blank"
              rel="noreferrer"
            >
              Chat on WhatsApp
            </a>
          </div>
        </section>

        <section className="support-section">
          <h2>Create a support ticket</h2>
          <p className="support-section-description">
            Describe your problem and check back for a reply.
          </p>

          <form className="support-form" onSubmit={createTicket}>
            <label htmlFor="ticket-subject">Subject</label>
            <input
              id="ticket-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Example: Order not completed"
              maxLength={100}
              required
            />

            <label htmlFor="ticket-message">Describe your issue</label>
            <textarea
              id="ticket-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Explain how we can help..."
              maxLength={2000}
              rows={5}
              required
            />

            <button
              type="submit"
              className="support-submit-button"
              disabled={sending}
            >
              {sending ? "Please wait..." : "Create Ticket"}
            </button>
          </form>
        </section>

        <section className="support-section">
          <div className="support-ticket-heading">
            <div>
              <h2>My tickets</h2>
              <p className="support-section-description">
                View your ticket status and replies.
              </p>
            </div>
            <button
              type="button"
              className="support-refresh-button"
              onClick={loadTickets}
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="support-empty">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="support-empty">
              You haven't created any tickets yet.
            </p>
          ) : (
            <div className="support-ticket-list">
              {tickets.map((ticket) => (
                <button
                  type="button"
                  className={`support-ticket-item ${
                    activeTicket?._id === ticket._id ? "selected" : ""
                  }`}
                  key={ticket._id}
                  onClick={() => openTicket(ticket._id)}
                >
                  <div className="support-ticket-item-top">
                    <strong>{ticket.subject}</strong>
                    <span
                      className={`support-status ${statusClass(ticket.status)}`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <p>
                    {ticket.message.length > 100
                      ? `${ticket.message.slice(0, 100)}...`
                      : ticket.message}
                  </p>
                  <small>
                    {ticket.replies?.length || 0} replies
                  </small>
                </button>
              ))}
            </div>
          )}
        </section>

        {activeTicket && (
          <section className="support-section support-conversation">
            <div className="support-ticket-heading">
              <div>
                <h2>{activeTicket.subject}</h2>
                <p className="support-section-description">
                  Ticket conversation
                </p>
              </div>
              <button
                type="button"
                className="support-refresh-button"
                onClick={() => setActiveTicket(null)}
              >
                Close
              </button>
            </div>

            <div className="support-message support-original-message">
              <strong>You · Original message</strong>
              <p>{activeTicket.message}</p>
              <small>
                {new Date(activeTicket.createdAt).toLocaleString()}
              </small>
            </div>

            {(activeTicket.replies || []).map((item, index) => (
              <div
                className={`support-message ${
                  item.senderRole === "admin"
                    ? "support-admin-message"
                    : "support-user-message"
                }`}
                key={item._id || `${item.createdAt}-${index}`}
              >
                <strong>
                  {item.senderRole === "admin" ? "Support team" : "You"}
                </strong>
                <p>{item.message}</p>
                <small>
                  {new Date(item.createdAt).toLocaleString()}
                </small>
              </div>
            ))}

            {activeTicket.status === "Resolved" ? (
              <p className="support-empty">
                This ticket is resolved. Create a new ticket if you need more
                help.
              </p>
            ) : (
              <form className="support-form" onSubmit={sendReply}>
                <label htmlFor="ticket-reply">Your reply</label>
                <textarea
                  id="ticket-reply"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="Write a reply..."
                  rows={3}
                  maxLength={2000}
                  required
                />
                <button
                  className="support-submit-button"
                  type="submit"
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Send Reply"}
                </button>
              </form>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
