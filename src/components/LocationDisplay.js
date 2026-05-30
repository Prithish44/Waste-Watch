import React, { useState, useEffect } from "react";

const LocationDisplay = ({ location, setLocation }) => {
  const [address, setAddress] = useState("");
  const [manualLat, setManualLat] = useState("");
  const [manualLon, setManualLon] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");

  useEffect(() => {
    if (location?.lat && location?.lon) {
      const fetchAddress = async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.lat}&lon=${location.lon}`
          );
          const data = await response.json();
          setAddress(data.display_name || "Address not found");
        } catch (error) {
          setAddress("Error fetching address");
        }
      };
      fetchAddress();
    }
  }, [location]);

  const handleManualSubmit = () => {
    if (manualLat && manualLon) {
      setLocation({ lat: parseFloat(manualLat), lon: parseFloat(manualLon) });
    }
  };

  const handleGoogleMapsUrl = () => {
    const regex = /@?(-?\d+\.\d+),\s*(-?\d+\.\d+)/;
    const match = mapsUrl.match(regex);
    if (match) {
      const lat = parseFloat(match[1]);
      const lon = parseFloat(match[2]);
      setLocation({ lat, lon });
    } else {
      alert("Could not extract location from URL. Make sure it's valid.");
    }
  };

  const openGoogleMaps = () => {
    window.open("https://www.google.com/maps", "_blank");
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h4>Detected Location:</h4>
      {location ? (
        <>
          <p>Latitude: {location.lat}, Longitude: {location.lon}</p>
          <p><strong>Address:</strong> {address}</p>
        </>
      ) : (
        <p>Location not available</p>
      )}

      <button
  onClick={openGoogleMaps}
  style={{
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
  }}
  onMouseOver={(e) => (e.target.style.backgroundColor = "#45a049")}
  onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
>
  📍 Open in Google Maps
</button>

      <div style={{ marginTop: "15px" }}>
        <p><strong>Paste Google Maps URL:</strong></p>
        <input
          type="text"
          placeholder="https://www.google.com/maps/..."
          value={mapsUrl}
          onChange={(e) => setMapsUrl(e.target.value)}
          style={{ padding: "5px", width: "60%" }}
        />
        <button
          onClick={handleGoogleMapsUrl}
          style={{
            marginLeft: "10px",
            padding: "5px 10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          Use Location
        </button>
      </div>

      <div style={{ marginTop: "10px" }}>
        <p><strong>Or manually enter coordinates:</strong></p>
        <input
          type="text"
          placeholder="Latitude"
          value={manualLat}
          onChange={(e) => setManualLat(e.target.value)}
          style={{ marginRight: "5px", padding: "5px" }}
        />
        <input
          type="text"
          placeholder="Longitude"
          value={manualLon}
          onChange={(e) => setManualLon(e.target.value)}
          style={{ marginRight: "5px", padding: "5px" }}
        />
        <button
          onClick={handleManualSubmit}
          style={{
            padding: "5px 10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          Set Location
        </button>
      </div>
    </div>
  );
};

export default LocationDisplay;
