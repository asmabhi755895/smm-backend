import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("https://socialboost-api-5ma2.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }
localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");

    } catch (error) {
      setError("Cannot connect to server");
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          <span></span>
          SocialBoost
        </div>

        <div className="auth-header">
          <h1>Welcome back</h1>
          <p>Login to your SocialBoost account.</p>
        </div>

        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p style={{ color: "#ff5c5c", marginTop: "10px" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="auth-switch">
          Don't have an account?

          <button
            onClick={() => navigate("/register")}
          >
            Create Account
          </button>
        </p>

      </div>

    </div>
  );
}

export default Login;