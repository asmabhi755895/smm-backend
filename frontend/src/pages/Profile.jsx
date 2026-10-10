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
        setError("No login token found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "https://socialboost-api-5ma2.onrender.com/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const responseText = await response.text();
        console.log("Profile API status:", response.status);
        console.log("Profile API response:", responseText);

        let data;
        try {
          data = JSON.parse(responseText);
        } catch {
          data = { message: responseText };
        }

        if (!response.ok) {
          setError(
            `Backend error (${response.status}): ${
              data.message || "Unknown error"
            }`
          );
          setLoading(false);
          return;
        }

        // Supports either { user: {...} } or a direct user object.
        const profile = data.user || data;

        if (!profile || (!profile.name && !profile.email)) {
          setError("The backend responded, but no user profile was returned.");
          setLoading(false);
          return;
        }

        setUser(profile);
      } catch (err) {
        console.error("Profile fetch failed:", err);
        setError("Unable to contact the backend. Check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

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