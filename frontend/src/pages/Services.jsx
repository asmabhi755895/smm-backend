import { useNavigate } from "react-router-dom";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { ArrowRight } from "lucide-react";
import { services } from "../data/services";
import "./Services.css";

function Services() {
  const navigate = useNavigate();

  const instagramServices = services.filter(
    (service) => service.platform === "Instagram"
  );

  const youtubeServices = services.filter(
    (service) => service.platform === "YouTube"
  );

  const ServiceCard = ({ service }) => (
    <div className="service-item">

      <div className="service-item-info">

        <h3>{service.name}</h3>

        <p>
          {service.description}
        </p>

      </div>

      <div className="service-item-right">

        <div className="service-price">
          <strong>
            ₹{service.pricePer1000}
          </strong>

          <span>
            / 1000
          </span>
        </div>

        <button
          onClick={() =>
           navigate("/order")
          }
        >
          Order
          <ArrowRight size={15} />
        </button>

      </div>

    </div>
  );

  return (
    <div className="services-page">

      <div className="services-header">

        <span>OUR SERVICES</span>

        <h1>
          SMM
          <br />
          <strong>Services</strong>
        </h1>

        <p>
          Choose a service and place your order
          instantly.
        </p>

      </div>


      {/* INSTAGRAM */}

      <section className="platform-section">

        <div className="platform-title">

          <div className="platform-icon instagram-icon">
            <FaInstagram size={27} />
          </div>

          <div>
            <h2>Instagram</h2>
            <p>
              Instagram services
            </p>
          </div>

        </div>

        <div className="service-list">

          {instagramServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
            />
          ))}

        </div>

      </section>


      {/* YOUTUBE */}

      <section className="platform-section">

        <div className="platform-title">

          <div className="platform-icon youtube-icon">
            <FaYoutube size={27} />
          </div>

          <div>
            <h2>YouTube</h2>
            <p>
              YouTube services
            </p>
          </div>

        </div>

        <div className="service-list">

          {youtubeServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
            />
          ))}

        </div>

      </section>

    </div>
  );
}

export default Services;