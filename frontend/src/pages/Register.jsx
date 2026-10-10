import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("https://socialboost-api-5ma2.onrender.com/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("loggedIn", "true");
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
          <h1>Create account</h1>
          <p>Start using SocialBoost today.</p>
        </div>

        <form onSubmit={handleRegister}>

          <label>Name</label>

          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            placeholder="Create a password"
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <p className="auth-switch">
          Already have an account?

          <button
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </p>

      </div>

    </div>
  );
}

export default Register;