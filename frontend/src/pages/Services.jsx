
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaInstagram,
  FaYoutube,
  FaFacebookF,
  FaTelegramPlane,
} from "react-icons/fa";
import { ArrowRight, Search } from "lucide-react";
import { services } from "../data/services";
import "./Services.css";

const platforms = [
  { name: "All", icon: null },
  { name: "Instagram", icon: FaInstagram },
  { name: "YouTube", icon: FaYoutube },
  { name: "Facebook", icon: FaFacebookF },
  { name: "Telegram", icon: FaTelegramPlane },
];

function Services() {
  const navigate = useNavigate();
  const [activePlatform, setActivePlatform] = useState("All");
  const [search, setSearch] = useState("");

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesPlatform =
        activePlatform === "All" ||
        service.platform?.toLowerCase() ===
          activePlatform.toLowerCase();

      const matchesSearch =
        !query ||
        [service.name, service.description, service.platform]
          .some((value) =>
            String(value || "").toLowerCase().includes(query)
          );

      return matchesPlatform && matchesSearch;
    });
  }, [activePlatform, search]);

  return (
    <div className="services-page">
      <header className="services-header">
        <span>OUR SERVICES</span>
        <h1>
          Find your
          <br />
          <strong>Services</strong>
        </h1>
        <p>
          Affordable social media services, all in one place.
        </p>
      </header>

      <div className="services-search">
        <Search size={19} />
        <input
          type="search"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search services"
        />
      </div>

      <div className="platform-filters" aria-label="Filter by platform">
        {platforms.map(({ name, icon: Icon }) => (
          <button
            key={name}
            type="button"
            className={
              activePlatform === name ? "active" : ""
            }
            onClick={() => setActivePlatform(name)}
            aria-pressed={activePlatform === name}
          >
            {Icon && <Icon size={16} />}
            {name}
          </button>
        ))}
      </div>

      <div className="services-results">
        <div className="services-results-heading">
          <h2>
            {activePlatform === "All"
              ? "Available Services"
              : `${activePlatform} Services`}
          </h2>
          <span>{filteredServices.length} services</span>
        </div>

        {filteredServices.length > 0 ? (
          <div className="service-list">
            {filteredServices.map((service) => {
              const platform = platforms.find(
                (item) =>
                  item.name.toLowerCase() ===
                  service.platform?.toLowerCase()
              );
              const PlatformIcon = platform?.icon;

              return (
                <article
                  className="service-item"
                  key={service.id}
                >
                  <div className="service-item-info">
                    <div className="service-platform-label">
                      {PlatformIcon && <PlatformIcon size={15} />}
                      <span>{service.platform}</span>
                    </div>

                    <h3>{service.name}</h3>
                    <p>{service.description}</p>
                  </div>

                  <div className="service-item-right">
                    <div className="service-price">
                      <strong>₹{service.pricePer1000}</strong>
                      <span>/ 1,000</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/order")}
                    >
                      Order
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="services-empty">
            <Search size={28} />
            <h3>No services found</h3>
            <p>Try another search or select a different platform.</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActivePlatform("All");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Services;
