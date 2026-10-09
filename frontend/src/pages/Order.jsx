
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { services } from "../data/services";
import { packages } from "../data/packages";
import "./Order.css";

function Order() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialServiceId = Number(searchParams.get("service"));
  const initialService = services.find(
    (item) => item.id === initialServiceId
  );

  const [selectedServiceId, setSelectedServiceId] = useState(
    initialService?.id ?? services[0]?.id ?? ""
  );

  const selectedService = services.find(
    (item) => item.id === Number(selectedServiceId)
  );

  const servicePackages = useMemo(
    () =>
      packages.filter(
        (item) => item.serviceId === Number(selectedServiceId)
      ),
    [selectedServiceId]
  );

  const [selectedPackageId, setSelectedPackageId] = useState(
    searchParams.get("package") || ""
  );
  const [quantity, setQuantity] = useState(100);
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWalletButton, setShowWalletButton] = useState(false);

  const selectedPackage = servicePackages.find(
    (item) => String(item.id) === String(selectedPackageId)
  );

  const minimum = selectedPackage?.min ?? selectedService?.min ?? 100;
  const maximum = selectedPackage?.max ?? selectedService?.max ?? 100000;
  const rate =
    selectedPackage?.pricePer1000 ??
    selectedService?.pricePer1000 ??
    0;

  const quantityNumber = Number(quantity);
  const total =
    Number.isInteger(quantityNumber) && quantityNumber > 0
      ? Math.round((quantityNumber / 1000) * rate * 100) / 100
      : 0;

  useEffect(() => {
    const firstPackage = packages.find(
      (item) => item.serviceId === Number(selectedServiceId)
    );

    setSelectedPackageId(firstPackage ? String(firstPackage.id) : "");
    setQuantity(firstPackage?.min ?? selectedService?.min ?? 100);
    setError("");
    setSuccess("");
  }, [selectedServiceId]);

  const handleOrder = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setShowWalletButton(false);

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!selectedService) {
      setError("Please select a service.");
      return;
    }

    if (!selectedPackage) {
      setError("No package is available for this service yet.");
      return;
    }

    if (!link.trim()) {
      setError("Please enter a link.");
      return;
    }

    if (
      !Number.isInteger(quantityNumber) ||
      quantityNumber < minimum ||
      quantityNumber > maximum
    ) {
      setError(`Quantity must be between ${minimum} and ${maximum}.`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          packageId: String(selectedPackage.id),
          link: link.trim(),
          quantity: quantityNumber,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("loggedIn");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        setError(data.message || "Unable to place order.");

        if (
          data.message?.toLowerCase().includes("insufficient balance")
        ) {
          setShowWalletButton(true);
        }

        return;
      }

      setSuccess("Order placed successfully!");
      setLink("");

      const savedUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      localStorage.setItem(
        "user",
        JSON.stringify({ ...savedUser, balance: data.balance })
      );
    } catch {
      setError("Cannot connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-page">
      <div className="order-container">
  
<button
  type="button"
  className="back-button"
  onClick={() => navigate("/dashboard")}
>
  <ArrowLeft size={18} />
  Back to Dashboard
</button>

        <div className="order-header">
          <span>NEW ORDER</span>
          <h1>Place an Order</h1>
          <p>Select a service and package, then enter your link and quantity.</p>
        </div>

        <form className="order-card" onSubmit={handleOrder}>
          <label htmlFor="order-service">Service *</label>
          <select
            id="order-service"
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(Number(e.target.value))}
            required
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.platform} — {service.name}
              </option>
            ))}
          </select>


          <label htmlFor="order-package">Package *</label>
          <select
            id="order-package"
            value={selectedPackageId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedPackageId(id);
              const item = servicePackages.find(
                (pkg) => String(pkg.id) === id
              );
              setQuantity(item?.min ?? selectedService?.min ?? 100);
              setError("");
              setSuccess("");
            }}
            disabled={servicePackages.length === 0}
            required
          >
            {servicePackages.length === 0 ? (
              <option value="">
                No packages available for this service
              </option>
            ) : (
              servicePackages.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  ID: {item.id} | {item.name} | {item.refill} | ₹
                  {item.pricePer1000}/1000
                </option>
              ))
            )}
          </select>
          {selectedService && (
            <div className="selected-service">
              <div>
                <span>Selected service</span>
                <strong>{selectedService.name}</strong>
              </div>
              <div className="rate">
                <span>Base rate</span>
                <strong>₹{selectedService.pricePer1000}/1000</strong>
              </div>
            </div>
          )}

          {selectedPackage && (
            <div className="price-box">
              <div>
                <span>Package ID</span>
                <strong>{selectedPackage.id}</strong>
              </div>
              <div>
                <span>Quality</span>
                <strong>{selectedPackage.quality}</strong>
              </div>
              <div>
                <span>Delivery</span>
                <strong>{selectedPackage.delivery}</strong>
              </div>
              <div>
                <span>Refill policy</span>
                <strong>{selectedPackage.refill}</strong>
              </div>
              {selectedPackage.description && (
                <p>{selectedPackage.description}</p>
              )}
            </div>
          )}

          <label htmlFor="order-link">Link *</label>
          <input
            id="order-link"
            type="url"
            placeholder="https://..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
            required
          />
          <small>Enter the URL for your order.</small>

          <label htmlFor="order-quantity">Quantity *</label>
          <input
            id="order-quantity"
            type="number"
            min={minimum}
            max={maximum}
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />

          <div className="quantity-info">
            <span>Minimum: {minimum.toLocaleString()}</span>
            <span>Maximum: {maximum.toLocaleString()}</span>
          </div>

          <div className="price-box">
            <div>
              <span>Rate</span>
              <strong>₹{rate} / 1000</strong>
            </div>
            <div>
              <span>Quantity</span>
              <strong>{(quantityNumber || 0).toLocaleString()}</strong>
            </div>
            <div className="total-row">
              <span>Total Price</span>
              <strong>₹{total.toFixed(2)}</strong>
            </div>
          </div>

          {error && (
            <p role="alert" style={{ color: "#ff5c5c" }}>
              {error}
            </p>
          )}

          {showWalletButton && (
            <button
              type="button"
              className="order-add-funds-button"
              onClick={() => navigate("/wallet")}
            >
              Add Funds
            </button>
          )}

          {success && (
            <p role="status" style={{ color: "#22c55e" }}>
              {success}
            </p>
          )}

          <button
            className="start-button"
            type="submit"
            disabled={
              loading ||
              !selectedPackage ||
              !Number.isInteger(quantityNumber) ||
              quantityNumber < minimum ||
              quantityNumber > maximum
            }
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Order;
