import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const WaterResources = () => {
    const [city, setCity] = useState("");
    const [resources, setResources] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

const fetchWaterResources = async () => {
  if (!city.trim()) {
    setError("Please enter a city name");
    return;
  }

  setLoading(true);
  setError("");
  setResources([]);

  const query = `
    [out:json][timeout:25];
    {{geocodeArea:${city}}}->.searchArea;
    (
      way["waterway"="river"](area.searchArea);
      way["natural"="water"](area.searchArea);
      relation["waterway"="river"](area.searchArea);
      relation["natural"="water"](area.searchArea);
    );
    out tags center;
  `;

  try {
    const response = await axios.get(
      "https://overpass-api.de/api/interpreter",
      { params: { data: query } }
    );

    const elements = response.data?.elements || [];

    if (elements.length === 0) {
      setError("No water resources found. Try a major city.");
      return;
    }

    // Keep only unique named resources
    const unique = [];
    const seen = new Set();

    for (const item of elements) {
      const name = item.tags?.name;
      if (name && !seen.has(name)) {
        seen.add(name);
        unique.push(item);
      }
    }

    if (unique.length === 0) {
      setError("Water bodies exist, but no named rivers/lakes found.");
    } else {
      setResources(unique);
    }
  } catch (err) {
    setError("Overpass API overloaded. Please try again later.");
  } finally {
    setLoading(false);
  }
};

    return (
        <div className="glass-container">
            <Link to="/">Back to Home</Link>
            <h1>Water Resources</h1>
            <p>Discover rivers, lakes, and water bodies near you.</p>

            <input
                placeholder="Enter City Name"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchWaterResources()}
            />
            <button onClick={fetchWaterResources} disabled={loading}>
                {loading ? "Scanning..." : "Search"}
            </button>

            {loading && <div className="loader"></div>}

            {error && <div className="error-message">{error}</div>}

            <ul>
                {resources.map((item, index) => (
                    <li key={index}>
                        <div>
                            <strong>{item.tags?.name}</strong>
                            <p className="info-text" style={{ fontSize: "0.8rem", margin: "5px 0 0" }}>
                                {item.tags?.waterway || item.tags?.natural || "Water Body"}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default WaterResources;
