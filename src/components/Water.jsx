import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const WaterResources = () => {
    const [city, setCity] = useState("");
    const [resources, setResources] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchWaterResources = async () => {
        if (!city) {
            setError("Please enter a city name");
            return;
        }

        setError("");
        setResources([]);
        setLoading(true);

        const query = `
        [out:json][timeout:25];
        area[name="${city}"]->.searchArea;
        (
          way["waterway"="river"](area.searchArea);
          way["natural"="water"](area.searchArea);
          relation["waterway"="river"](area.searchArea);
          relation["natural"="water"](area.searchArea);
        );
        out tags;
        `;

        try {
            const res = await axios.post(
                "https://overpass-api.de/api/interpreter",
                query,
                { headers: { "Content-Type": "text/plain" } }
            );

            if (!res.data.elements || res.data.elements.length === 0) {
                setError("No major water resources found in this area.");
            } else {
                // Filter out unnamed resources to reduce noise
                const namedResources = res.data.elements.filter(item => item.tags && item.tags.name);

                if (namedResources.length === 0 && res.data.elements.length > 0) {
                    // If we have resources but no names, maybe show generic counts or just "Unnamed Water Body"
                    setError("Found unnamed water bodies, but no named rivers/lakes.");
                } else {
                    // remove duplicates based on name
                    const unique = [];
                    const names = new Set();
                    for (const item of namedResources) {
                        if (!names.has(item.tags.name)) {
                            names.add(item.tags.name);
                            unique.push(item);
                        }
                    }
                    setResources(unique);
                    if (unique.length === 0) setError("No named water resources found.");
                }
            }
        } catch {
            setError("Unable to fetch water resources. API might be busy.");
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
