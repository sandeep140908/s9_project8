import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Education = () => {
    const [city, setCity] = useState("");
    const [institutions, setInstitutions] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchInstitutions = async () => {
        if (!city) {
            setError("Please enter a city name");
            return;
        }

        setError("");
        setInstitutions([]);
        setLoading(true);

        // More robust timeout and query
        const query = `
        [out:json][timeout:25];
        area[name="${city}"]->.searchArea;
        (
          node["amenity"="school"](area.searchArea);
          node["amenity"="college"](area.searchArea);
          node["amenity"="university"](area.searchArea);
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
                setError("No educational institutions found in this city.");
            } else {
                setInstitutions(res.data.elements);
            }
        } catch {
            setError("Unable to fetch data. The API might be busy or the city not found.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-container">
            <Link to="/">Back to Home</Link>
            <h1>Education Finder</h1>
            <p>Locate schools, colleges, and universities in your city.</p>

            <input
                placeholder="Enter City Name"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchInstitutions()}
            />
            <button onClick={fetchInstitutions} disabled={loading}>
                {loading ? "Scanning..." : "Search"}
            </button>

            {loading && <div className="loader"></div>}

            {error && <div className="error-message">{error}</div>}

            <ul>
                {institutions.map((item, index) => (
                    <li key={index}>
                        <div>
                            <strong>{item.tags?.name || "Unnamed Institution"}</strong>
                            <p className="info-text" style={{ fontSize: "0.8rem", margin: "5px 0 0" }}>
                                {item.tags?.amenity?.toUpperCase()}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Education;
