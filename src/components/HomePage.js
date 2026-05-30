import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import DragDrop from "./DragDrop";
import LocationDisplay from "./LocationDisplay";
import background from "../assets/bg.png";
import { ReactComponent as Logo } from "../assets/logo.svg";
import MapSearch from "./MapSearch";

const HomePage = () => {
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const proceedToWastePage = async () => {
    if (!image || !location) {
      alert("Please upload an image and allow location access.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("latitude", location.lat);
    formData.append("longitude", location.lon);
    formData.append("address", address);
    try {
      const response = await fetch("http://localhost:5001/predict", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json(); // <- parse the JSON response

        alert("Image and location saved successfully!");
        navigate("/waste", {
          state: {
            resultImageUrl: data.result_image_path,
            severity: data.severity,
            cropped_images: data.cropped_images,
            address,
            location,
          },
        });
      } else {
        alert("Failed to save data.");
      }
    } catch (error) {
      console.error("Error while saving:", error);
      alert("An error occurred while saving.");
    }
  };

  const handleImageUpload = (file) => {
    if (!file) {
      setImage(null);
      return;
    }
    setImage(file);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          };
          setLocation(coords);
        },
        (error) => {
          console.warn("Geolocation failed:", error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
        }
      );
    }
  }, []);

  useEffect(() => {
    if (location) {
      fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lon}&format=json`
      )
        .then((res) => res.json())
        .then((data) => {
          setAddress(data.display_name || "Address not found");
        })
        .catch(() => {
          setAddress("Error fetching address");
        });
    }
  }, [location]);

  useEffect(() => {
    document.body.style.backgroundImage = `url(${background})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.minHeight = "100vh";
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    return () => {
      document.body.style.backgroundImage = "";
    };
  }, []);

  return (
    <>
      {/* Animation styles */}
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
              box-shadow: 0 0 10px rgba(40, 167, 69, 0.4);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 0 20px rgba(40, 167, 69, 0.7);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 0 10px rgba(40, 167, 69, 0.4);
            }
          }

          .animated-button {
            animation: pulse 2s infinite;
            transition: all 0.3s ease;
          }

          .animated-button:hover {
            transform: scale(1.05);
            box-shadow: 0 0 25px rgba(40, 167, 69, 0.8);
          }

          .animated-button:active {
            transform: scale(0.97);
          }
        `}
      </style>

      <div style={styles.wrapper}>
        <div style={styles.contentContainer}>
          <Logo style={styles.logo} />
          <DragDrop onUpload={handleImageUpload} />
          <LocationDisplay location={location} setLocation={setLocation} />
          <MapSearch setLocation={setLocation} location={location} />
          {address && <p style={styles.address}>{address}</p>}
          <button
            onClick={proceedToWastePage}
            style={styles.button}
            className="animated-button"
          >
            Proceed with Location
          </button>
        </div>
      </div>
    </>
  );
};

const styles = {
  wrapper: {
    minHeight: "100vh",
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    textAlign: "center",
    boxSizing: "border-box",
    color: "white",
  },
  logo: {
    width: "80%",
    maxWidth: "300px",
    height: "auto",
    marginBottom: "20px",
  },
  contentContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: "20px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "700px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  address: {
    marginTop: "10px",
    fontSize: "14px",
    color: "white",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: "10px",
    borderRadius: "8px",
  },
  button: {
    marginTop: "20px",
    padding: "12px 24px",
    fontSize: "18px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    width: "100%",
    maxWidth: "300px",
    fontWeight: "600",
  },
};

export default HomePage;
