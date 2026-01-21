import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const GenderPopulation = () => {
    const [country, setCountry] = useState("");
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const countryMap = {
        INDIA: "IN",
        USA: "US",
        AMERICA: "US",
        UK: "GB",
        "UNITED KINGDOM": "GB",
        JAPAN: "JP",
        CHINA: "CN",
        RUSSIA: "RU",
        BRAZIL: "BR",
        AUSTRALIA: "AU",
        CANADA: "CA",
        GERMANY: "DE",
        FRANCE: "FR"
    };

    const getPopulation = async () => {
        if (!country) {
            setError("Please enter a country name or code");
            return;
        }

        const inputCountry = country.toUpperCase();
        const code = countryMap[inputCountry] || (inputCountry.length === 2 ? inputCountry : null);

        if (!code) { // Simple validation, though API handles most
            // Let it try passing as code if we can't map it, but ideally we'd want a better search
            // For this simple version, we'll try the input as is if 2 chars, else require map
            if (country.length !== 2) {
                // Try passing it anyway, WorldBank API is picky though.
            }
        }

        setError("");
        setData(null);
        setLoading(true);

        const apiCode = countryMap[inputCountry] || inputCountry;

        try {
            const [maleRes, femaleRes] = await Promise.all([
                axios.get(
                    `https://api.worldbank.org/v2/country/${apiCode}/indicator/SP.POP.TOTL.MA.IN`,
                    { params: { format: "json", per_page: 1 } }
                ),
                axios.get(
                    `https://api.worldbank.org/v2/country/${apiCode}/indicator/SP.POP.TOTL.FE.IN`,
                    { params: { format: "json", per_page: 1 } }
                )
            ]);

            const maleValue = maleRes.data?.[1]?.[0]?.value;
            const femaleValue = femaleRes.data?.[1]?.[0]?.value;

            if (!maleValue || !femaleValue) {
                throw new Error("Data not available");
            }

            setData({ male: maleValue, female: femaleValue });
        } catch (err) {
            setError("Invalid country name or code. Try standard codes (e.g., US, IN, JP).");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-container">
            <Link to="/">Back to Home</Link>
            <h1>Demographics</h1>
            <p>Compare male and female population statistics by country.</p>

            <input
                type="text"
                placeholder="Enter Code (e.g., IN, US, JP)"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && getPopulation()}
            />

            <button onClick={getPopulation} disabled={loading}>
                {loading ? "Loading..." : "Get Data"}
            </button>

            {loading && <div className="loader"></div>}

            {error && <div className="error-message">{error}</div>}

            {data && (
                <div style={{ marginTop: "2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "2rem" }}>
                        <div>
                            <h2 style={{ color: "#4facfe" }}>{data.male.toLocaleString()}</h2>
                            <p className="info-text">Male Population</p>
                        </div>
                        <div>
                            <h2 style={{ color: "#ff9a9e" }}>{data.female.toLocaleString()}</h2>
                            <p className="info-text">Female Population</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenderPopulation;
