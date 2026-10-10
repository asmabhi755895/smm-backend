
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Wallet,
  LogOut,
  ShoppingBag,
  ClipboardList,
  Headset,
  ShieldCheck,
  ChevronRight,
  LayoutDashboard,
  Mail,
} from "lucide-react";
import "./Profile.css";

const API_URL = "https://socialboost-api-5ma2.onrender.com";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const text = await response.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("loggedIn");
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Unable to load your profile");
        }

        const profile = data.user || data;

        if (!profile || (!profile.name && !profile.email)) {
          throw new Error("No profile information was returned.");
        }

        if (!cancelled) {
          setUser(profile);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to contact the server.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loggedIn");
    navigate("/login", { replace: true });
  };

  const options = [
    {
      title: "My Orders",
      description: "Track your service orders",
      icon: ClipboardList,
      action: () => navigate("/orders"),
    },
    {
      title: "Browse Services",
      description: "Explore available social media services",
      icon: ShoppingBag,
      action: () => navigate("/services"),
    },
    {
      title: "Wallet",
      description: "Check your balance and add funds",
      icon: Wallet,
      action: () => navigate("/wallet"),
    },
    {
      title: "Dashboard",
      description: "Return to your account overview",
      icon: LayoutDashboard,
      action: () => navigate("/dashboard"),
    },
  ];

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">Loading your profile...</div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <button
          type="button"
          className="profile-back-button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={17} />
          Dashboard
        </button>

        <header className="profile-heading">
          <div className="profile-avatar">
            <UserRound size={30} />
          </div>
          <span className="profile-eyebrow">ACCOUNT SETTINGS</span>
          <h1>My Profile</h1>
          <p>Manage your SocialBoost account in one place.</p>
        </header>

        {error && (
          <div className="profile-error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        )}

        {user && (
          <>
            <section className="profile-card">
              <div className="profile-user-header">
                <div className="profile-avatar profile-avatar-small">
                  <UserRound size={25} />
                </div>

                <div className="profile-user-info">
                  <h2>{user.name || "SocialBoost Customer"}</h2>
                  <p>
                    <ShieldCheck size={15} />
                    Customer account
                  </p>
                </div>
              </div>

              <div className="profile-divider" />

              <div className="profile-row">
                <span>
                  <UserRound size={16} />
                  Full Name
                </span>
                <strong>{user.name || "—"}</strong>
              </div>

              <div className="profile-row">
                <span>
                  <Mail size={16} />
                  Email Address
                </span>
                <strong>{user.email || "—"}</strong>
              </div>

              <div className="profile-row">
                <span>
                  <Wallet size={16} />
                  Available Balance
                </span>
                <strong>
                  ₹{Number(user.balance || 0).toFixed(2)}
                </strong>
              </div>

              <button
                type="button"
                className="profile-wallet-button"
                onClick={() => navigate("/wallet")}
              >
                Add Funds
                <ChevronRight size={17} />
              </button>
            </section>

            <section className="profile-options-section">
              <div className="profile-section-heading">
                <h2>Quick Access</h2>
                <p>Everything you need for your account.</p>
              </div>

              <div className="profile-options">
                {options.map((option) => {
                  const Icon = option.icon;

                  return (
                    <button
                      type="button"
                      className="profile-option"
                      key={option.title}
                      onClick={option.action}
                    >
                      <span className="profile-option-icon">
                        <Icon size={20} />
                      </span>

                      <span className="profile-option-text">
                        <strong>{option.title}</strong>
                        <small>{option.description}</small>
                      </span>

                      <ChevronRight
                        className="profile-option-arrow"
                        size={18}
                      />
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="profile-support-card">
              <span className="profile-support-icon">
                <Headset size={21} />
              </span>
              <div>
                <h3>Need help?</h3>
                <p>
                  Contact support if you need assistance with an
                  order or payment.
                </p>
              </div>
            </section>

            <button
              type="button"
              className="profile-logout-button"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Log Out
            </button>

            <p className="profile-footer">
              SocialBoost · Your social media services dashboard
            </p>
          </>
        )}
      </div>
    </main>
  );
}

export default Profile;
