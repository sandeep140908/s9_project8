import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

/* 🔹 This fixes zoom & center updates */
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
};

const Education = () => {
  const [city, setCity] = useState("");
  const [institutions, setInstitutions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [center, setCenter] = useState([20.5937, 78.9629]); // India
  const [zoom, setZoom] = useState(5);
  const [cityCoords, setCityCoords] = useState(null);

  const handleSearch = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError("");
    setInstitutions([]);

    try {
      /* 🔹 STEP 1: Locate city (always works) */
      const geoRes = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: city,
            format: "json",
            limit: 1,
          },
        }
      );

      if (geoRes.data.length === 0) {
        setError("City not found");
        return;
      }

      const { lat, lon } = geoRes.data[0];
      const coords = [parseFloat(lat), parseFloat(lon)];

      setCenter(coords);
      setZoom(12);
      setCityCoords(coords);

      /* 🔹 STEP 2: Try institutions (may fail) */
      try {
        const query = `
          [out:json][timeout:25];
          {{geocodeArea:${city}}}->.searchArea;
          (
            node["amenity"~"school|college|university"](area.searchArea);
            way["amenity"~"school|college|university"](area.searchArea);
          );
          out tags center;
        `;

        const instRes = await axios.get(
          "https://overpass-api.de/api/interpreter",
          { params: { data: query } }
        );

        const elements = instRes.data.elements || [];
        const named = elements.filter(e => e.tags?.name);

        setInstitutions(named);

        if (named.length === 0) {
          setError("City located, but no institutions found.");
        }
      } catch {
        setError(
          "City located successfully. Institution data unavailable (API issue)."
        );
      }
    } catch {
      setError("Failed to locate city.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-container">
      <Link to="/">⬅ Back to Home</Link>

      <h1>🎓 Education Finder</h1>

      <input
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />

      <button onClick={handleSearch} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>

      {error && <p className="error-message">{error}</p>}

      {/* ✅ MAP (NOW ZOOMS CORRECTLY) */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{
          height: "400px",
          marginTop: "20px",
          borderRadius: "10px",
        }}
      >
        <MapUpdater center={center} zoom={zoom} />

        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* CITY MARKER */}
        {cityCoords && (
          <Marker position={cityCoords}>
            <Popup>
              <strong>{city}</strong>
              <br />
              City Center
            </Popup>
          </Marker>
        )}

        {/* INSTITUTION MARKERS */}
        {institutions.map(item => {
          const lat = item.lat || item.center?.lat;
          const lon = item.lon || item.center?.lon;

          return (
            <Marker key={item.id} position={[lat, lon]}>
              <Popup>
                <strong>{item.tags.name}</strong>
                <br />
                {item.tags.amenity}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Education;
