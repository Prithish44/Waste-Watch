import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const RecenterMap = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (location?.lat && location?.lon) {
      map.setView([location.lat, location.lon], 13);
    }
  }, [location, map]);

  return location ? <Marker position={[location.lat, location.lon]} /> : null;
};

const MapSearch = ({ setLocation, location }) => {
  return (
    <div style={{ height: "400px", width: "100%", marginTop: "20px" }}>
      <MapContainer
        center={[22.5726, 88.3639]}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {}
        <RecenterMap location={location} />

        {}
        <MapClickHandler setLocation={setLocation} />
      </MapContainer>
    </div>
  );
};

const MapClickHandler = ({ setLocation }) => {
  const map = useMap();
  useEffect(() => {
    const handleClick = (e) => {
      setLocation({ lat: e.latlng.lat, lon: e.latlng.lng });
    };
    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, setLocation]);
  return null;
};

export default MapSearch;
