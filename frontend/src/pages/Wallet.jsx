
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Wallet as WalletIcon,
  ShieldCheck,
  QrCode,
  CreditCard
} from "lucide-react";
import "./Wallet.css";

const RAZORPAY_PAYMENT_LINK = "https://rzp.io/rzp/Uo5KmSI";
const PRESET_AMOUNTS = [20, 50, 100, 200, 500];
const UPI_QR_IMAGE = "/upi-qr.png";

function Wallet() {
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI_QR");
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadBalance = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load wallet");
        }

        setBalance(Number(data.user.balance) || 0);
      } catch (err) {
        setError(err.message || "Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    loadBalance();
  }, [navigate]);

  const handleUPISubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const value = Number(amount);
    const reference = transactionId.trim();

    if (
      !Number.isFinite(value) ||
      value < 1 ||
      value > 10000 ||
      Math.round(value * 100) !== value * 100
    ) {
      setError("Enter an amount between ₹10 and ₹10,000.");
      return;
    }

    if (reference.length < 6 || reference.length > 100) {
      setError("Enter a valid transaction/reference ID.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/wallet/upi-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: value,
            transactionId: reference
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit payment");
      }

  setMessage(
  "⚠️ Notice: The minimum amount you can add is ₹20. Please enter ₹20 or a higher amount."
);
      setTransactionId("");
    } catch (err) {
      setError(err.message || "Unable to submit payment request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRazorpay = () => {
    setError("");
    setMessage("");

    const value = Number(amount);

    if (!PRESET_AMOUNTS.includes(value)) {
      setError("Please select one of the available amounts.");
      return;
    }

    window.open(
      RAZORPAY_PAYMENT_LINK,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="wallet-page">
      <div className="wallet-container">



<button
  type="button"
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 16px",
    background: "#15121f",
    color: "#c4a7ff",
    border: "1px solid #9257f5",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer"
  }}
  onClick={() => navigate("/dashboard")}
>
  <ArrowLeft size={16} />
  Back to Dashboard
</button>


        <header className="wallet-heading">
          <span>YOUR WALLET</span>
          <h1>Add Funds</h1>
          <p>Manage your SocialBoost wallet.</p>
        </header>

        <section className="wallet-balance-card">
          <div className="wallet-icon">
            <WalletIcon size={24} />
          </div>

          <span>Available Balance</span>

          <strong>
            {loading ? "Loading..." : `₹${balance.toFixed(2)}`}
          </strong>

          <div className="wallet-secure">
            <ShieldCheck size={16} />
            Balance retrieved from your account
          </div>
        </section>

        <section className="wallet-form">
          <h2>Add money to wallet</h2>
          <p>Select your payment method.</p>

          <div className="wallet-amount-options">
            <button
              type="button"
              className={paymentMethod === "UPI_QR" ? "selected" : ""}
              onClick={() => {
                setPaymentMethod("UPI_QR");
                setError("");
                setMessage("");
              }}
            >
              <QrCode size={17} /> UPI QR
            </button>

            <button
              type="button"
              className={paymentMethod === "RAZORPAY" ? "selected" : ""}
              onClick={() => {
                setPaymentMethod("RAZORPAY");
                setError("");
                setMessage("");
              }}
            >
              <CreditCard size={17} /> Razorpay
            </button>
          </div>

          {paymentMethod === "UPI_QR" && (
            <form onSubmit={handleUPISubmit}>
              <div className="upi-qr-section">
        
                <h3>Scan and Pay</h3>
                <p>
                  Pay the amount entered above, then enter your
                  UPI transaction reference ID below.
                </p>

                <img
                  src={UPI_QR_IMAGE}
                  alt="UPI payment QR code"
                  className="upi-qr-image"
                />
<label htmlFor="upi-amount">Amount (₹)</label>

<input
  id="upi-amount"
  type="number"
  min="1"
  max="10000"
  step="1"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  placeholder="Enter amount"
  required
/>
                <label htmlFor="transaction-id">
                  Transaction / Reference ID
                </label>

                <input
                  id="transaction-id"
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID"
                  minLength={6}
                  maxLength={100}
                  required
                />

                <button
                  type="submit"
                  className="wallet-submit"
                  disabled={loading || submitting}
                >
                  {submitting ? "Submitting..." : "Add Funds"}
                </button>
              </div>
            </form>
          )}

          {paymentMethod === "RAZORPAY" && (
            <div className="razorpay-section">
              <label>Select Amount (₹)</label>

              <div className="wallet-amount-options">
                {PRESET_AMOUNTS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={Number(amount) === value ? "selected" : ""}
                    onClick={() => setAmount(String(value))}
                  >
                    ₹{value}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="wallet-submit"
                onClick={handleRazorpay}
                disabled={loading}
              >
                Continue to Razorpay
              </button>

              <small>
                Check the amount shown on the Razorpay payment page.
                Your wallet is not credited automatically by this button.
              </small>
            </div>
          )}

          {error && (
            <p className="wallet-error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="wallet-message" role="status">
              {message}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export default Wallet;
