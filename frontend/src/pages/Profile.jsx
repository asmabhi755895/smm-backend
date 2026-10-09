
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserRound, Wallet, LogOut } from "lucide-react";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
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
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        setUser(data.user);
      } catch {
        setError("Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loggedIn");
    navigate("/login", { replace: true });
  };

  if (loading) {
    return <div className="profile-page">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <button
        className="profile-back-button"
        onClick={() => navigate("/dashboard")}
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      <header className="profile-heading">
        <div className="profile-avatar">
          <UserRound size={30} />
        </div>
        <h1>My Profile</h1>
        <p>Manage your account details.</p>
      </header>

      {error && <p role="alert">{error}</p>}

      {user && (
        <div className="profile-card">
          <div className="profile-row">
            <span>Name</span>
            <strong>{user.name || "—"}</strong>
          </div>

          <div className="profile-row">
            <span>Email</span>
            <strong>{user.email || "—"}</strong>
          </div>

          <div className="profile-row">
            <span>
              <Wallet size={16} /> Available Balance
            </span>
            <strong>
              ₹{Number(user.balance || 0).toFixed(2)}
            </strong>
          </div>

          <button
            className="profile-wallet-button"
            onClick={() => navigate("/wallet")}
          >
            Add Funds
          </button>

          <button
            className="profile-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

export default Profile;
