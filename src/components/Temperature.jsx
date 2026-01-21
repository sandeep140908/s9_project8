import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Temperature = () => {
    const [city, setCity] = useState("");
    const [temp, setTemp] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const getTemperature = async () => {
        if (!city) {
            setError("Please enter a city name");
            return;
        }

        setError("");
        setTemp(null);
        setLoading(true);

        try {
            // Step 1: City → Lat/Lon
            const geoRes = await axios.get(
                "https://geocoding-api.open-meteo.com/v1/search",
                { params: { name: city, count: 1 } }
            );

            if (!geoRes.data.results || geoRes.data.results.length === 0) {
                throw new Error("City not found");
            }

            const { latitude, longitude, name, country } = geoRes.data.results[0];

            // Step 2: Weather API call
            const weatherRes = await axios.get(
                "https://api.open-meteo.com/v1/forecast",
                {
                    params: {
                        latitude,
                        longitude,
                        current_weather: true
                    }
                }
            );

            setTemp(weatherRes.data.current_weather.temperature);
            setCity(`${name}, ${country || ""}`); // Update city to formal name
        } catch (err) {
            setError("Unable to fetch temperature. Please check the city name.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-container">
            <Link to="/">Back to Home</Link>
            <h1>Weather Checker</h1>
            <p>Check the current temperature in any city instantly.</p>

            <input
                type="text"
                placeholder="Enter City Name (e.g., London)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && getTemperature()}
            />

            <button onClick={getTemperature} disabled={loading}>
                {loading ? "Searching..." : "Get Temperature"}
            </button>

            {loading && <div className="loader"></div>}

            {error && <div className="error-message">{error}</div>}

            {temp !== null && !loading && (
                <div style={{ marginTop: "2rem" }}>
                    <h2>{temp} °C</h2>
                    <p>Current Temperature in {city}</p>
                </div>
            )}
        </div>
    );
};

export default Temperature;
