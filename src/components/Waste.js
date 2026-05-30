import React from "react";
import { useLocation } from "react-router-dom";
import background from "../assets/bg.png";

const WastePage = () => {
  const { state } = useLocation();
  if (!state) return <p>No data</p>;

  const { resultImageUrl, location, address, severity, cropped_images } = state;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "40px 20px",
        color: "#fff",
        textAlign: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          borderRadius: "16px",
          padding: "30px",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <h2>Detection Result</h2>
        <img
          src={`http://localhost:5001${resultImageUrl}`}
          alt="Detected"
          style={{
            maxWidth: "90%",
            borderRadius: "12px",
            marginBottom: "1rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          }}
        />
        <p>
          <strong>Severity:</strong> {severity}
        </p>
        <p>
          <strong>Location:</strong> {address}
        </p>
        <p>
          Lat: {location.lat}, Lon: {location.lon}
        </p>

        {cropped_images?.length > 0 && (
          <div>
            <h3 style={{ marginTop: "2rem" }}>Detected Garbage Patches</h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "12px",
                marginTop: "16px",
              }}
            >
              {cropped_images.map((imgPath, idx) => (
                <img
                  key={idx}
                  src={`http://localhost:5001${imgPath}`}
                  alt={`crop-${idx}`}
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WastePage;
