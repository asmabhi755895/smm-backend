import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Services from "./pages/Services";
import Order from "./pages/Order";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import Admin from "./pages/Admin";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";

import { FaInstagram, FaYoutube } from "react-icons/fa";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Headphones,
  Menu,
  X,
} from "lucide-react";

import "./App.css";

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="app">

      {/* ================= NAVBAR ================= */}
     <nav className="navbar">

  <div className="logo">
    <span className="logo-dot"></span>
    SocialBoost
  </div>

  {/* Desktop navigation */}
  <div className="nav-links">
    <a href="#home">Home</a>
    <a href="#services">Services</a>
    <a href="#how">How It Works</a>
    <a href="#support">Support</a>
  </div>

  {/* Desktop buttons */}

<div className="nav-buttons">
  <button
    className="login-btn"
    onClick={() => window.location.href = "/login"}
  >
    Login
  </button>

  <button
    className="register-btn"
    onClick={() => window.location.href = "/register"}
  >
    Get Started
  </button>
</div>


  {/* Mobile menu button */}
  <button
    className="mobile-menu-btn"
    onClick={() => setMenuOpen(!menuOpen)}
    aria-label="Toggle menu"
  >
    {menuOpen ? <X size={23} /> : <Menu size={23} />}
  </button>

  {/* Mobile menu */}
  {menuOpen && (
    <div className="mobile-menu">

      <a
        href="#home"
        onClick={() => setMenuOpen(false)}
      >
        Home
      </a>

      <a
        href="#services"
        onClick={() => setMenuOpen(false)}
      >
        Services
      </a>

      <a
        href="#how"
        onClick={() => setMenuOpen(false)}
      >
        How It Works
      </a>

      <a
        href="#support"
        onClick={() => setMenuOpen(false)}
      >
        Support
      </a>

      <div className="mobile-menu-divider"></div>

      <button className="mobile-login">
        Login
      </button>

      <button className="mobile-register">
        Get Started
      </button>

    </div>
  )}

</nav>

      {/* ================= HERO ================= */}
      <section className="hero" id="home">

        <div className="hero-content">

          <div className="badge">
            <span>●</span>
            Social Media Marketing Platform
          </div>

          <h1>
            Grow Your Social
            <br />
            <span>Presence.</span>
          </h1>

          <p>
            Professional social media promotion campaigns
            designed to help creators, brands and businesses
            reach the right audience.
          </p>


<div className="hero-buttons">
  <button
    className="primary-btn"
    onClick={() => window.location.href = "/register"}
  >
    Create Account
    <ArrowRight size={18} />
  </button>

  <button
    className="secondary-btn"
    onClick={() => window.location.href = "/login"}
  >
    Login
  </button>
</div>



          <div className="trust-row">

            <div>
              <ShieldCheck size={18} />
              Secure Platform
            </div>

            <div>
              <Zap size={18} />
              Fast Campaign Setup
            </div>

            <div>
              <Headphones size={18} />
              Customer Support
            </div>

          </div>

        </div>


        {/* HERO DASHBOARD */}
        <div className="hero-card">

          <div className="card-glow"></div>


          {/* Instagram floating card */}
          <div className="floating-card instagram-card">

            <FaInstagram size={25} />

            <div>
              <strong>Instagram</strong>
              <span>Services</span>
            </div>

          </div>


          {/* YouTube floating card */}
          <div className="floating-card youtube-card">

            <FaYoutube size={25} />

            <div>
              <strong>YouTube</strong>
              <span>Servies</span>
            </div>

          </div>


          {/* Dashboard */}
          <div className="dashboard-preview">

            <div className="preview-header">

              <span>
                Campaign Overview
              </span>

              <span className="active">
                Active
              </span>

            </div>


            <div className="chart">
              <div className="chart-line"></div>
            </div>


            <div className="preview-stats">

              <div>
                <small>
                  Campaigns
                </small>

                <strong>
                  248
                </strong>
              </div>


              <div>
                <small>
                  Reach
                </small>

                <strong>
                  18.4M
                </strong>
              </div>


              <div>
                <small>
                  Growth
                </small>

                <strong>
                  +618%
                </strong>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= SERVICES ================= */}
      <section
        className="services"
        id="services"
      >

        <div className="section-heading">

          <span>
            OUR SERVICES
          </span>

          <h2>
            Everything you need to promote
          </h2>

          <p>
            Choose the platform and campaign type
            that matches your marketing goal.
          </p>

        </div>


        <div className="service-grid">


          {/* INSTAGRAM */}
          <div className="service-card instagram">

            <div className="service-icon">

              <FaInstagram size={28} />

            </div>


            <h3>
              Instagram
            </h3>


            <p>
              Promote your Instagram profile,
              posts and reels through targeted
              marketing campaigns.
            </p>


            <ul>

              <li>
                Profile Promotion
              </li>

              <li>
                Post Promotion
              </li>

              <li>
                Reel Promotion
              </li>

              <li>
                Creator Promotion
              </li>

              <li>
                Engagement Campaigns
              </li>

            </ul>


<button
  onClick={() => window.location.href = "/services"}
>
  View Instagram Services
  <ArrowRight size={17} />
</button>

          </div>



          {/* YOUTUBE */}
          <div className="service-card youtube">

            <div className="service-icon">

              <FaYoutube size={28} />

            </div>


            <h3>
              YouTube
            </h3>


            <p>
              Promote your videos, Shorts and
              channel to reach a wider relevant
              audience.
            </p>


            <ul>

              <li>
                Video Promotion
              </li>

              <li>
                Shorts Promotion
              </li>

              <li>
                Channel Promotion
              </li>

              <li>
                Creator Promotion
              </li>

              <li>
                Advertising Campaigns
              </li>

            </ul>


<button
  onClick={() => window.location.href = "/services"}
>
  View YouTube Services
  <ArrowRight size={17} />
</button>

          </div>

        </div>

      </section>



      {/* ================= HOW IT WORKS ================= */}
      <section
        className="how"
        id="how"
      >

        <div className="section-heading">

          <span>
            HOW IT WORKS
          </span>

          <h2>
            Start your campaign in 3 steps
          </h2>

        </div>


        <div className="steps">


          {/* STEP 1 */}
          <div className="step">

            <div>
              01
            </div>

            <h3>
              Create an account
            </h3>

            <p>
              Register and access your
              marketing dashboard.
            </p>

          </div>


          {/* STEP 2 */}
          <div className="step">

            <div>
              02
            </div>

            <h3>
              Choose a service
            </h3>

            <p>
              Select the campaign type and
              provide your content or social
              media link.
            </p>

          </div>


          {/* STEP 3 */}
          <div className="step">

            <div>
              03
            </div>

            <h3>
              Track your campaign
            </h3>

            <p>
              Monitor your campaign status
              and results from your dashboard.
            </p>

          </div>

        </div>

      </section>



      {/* ================= CTA ================= */}
      <section
        className="cta"
        id="support"
      >

        <h2>
          Ready to grow your social presence?
        </h2>

        <p>
          Create your account and start
          your first campaign.
        </p>


        <button className="primary-btn">

          Get Started

          <ArrowRight size={18} />

        </button>

      </section>



      {/* ================= FOOTER ================= */}
      <footer>

        <div className="logo">

          <span className="logo-dot"></span>

          SocialBoost

        </div>


        <p>
          © 2026 SocialBoost. All rights reserved.
        </p>

      </footer>

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
<Routes>

  <Route path="/" element={<Home />} />

  <Route path="/services" element={<Services />} />

  <Route path="/order" element={<Order />} />

  <Route path="/login" element={<Login />} />

  <Route path="/register" element={<Register />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/wallet" element={<Wallet />} />
  <Route path="/admin" element={<Admin />} />
  <Route path="/orders" element={<Orders />} />
  <Route path="/profile" element={<Profile />} />
</Routes>
    </BrowserRouter>
  );
}

export default App;