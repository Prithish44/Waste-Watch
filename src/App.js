import React from "react";
import { Routes, Route } from "react-router-dom";
import "leaflet/dist/leaflet.css";

import HomePage from "./components/HomePage";
import Waste from "./components/Waste";
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/waste" element={<Waste />} />
    </Routes>
  );
}

export default App;
