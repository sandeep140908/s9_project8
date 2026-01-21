import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Recipe = () => {
    const [food, setFood] = useState("");
    const [recipe, setRecipe] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchRecipe = async () => {
        if (!food) {
            setError("Please enter a food item");
            return;
        }

        setError("");
        setRecipe(null);
        setLoading(true);

        try {
            const res = await axios.get(
                `https://www.themealdb.com/api/json/v1/1/search.php?s=${food}`
            );

            if (!res.data.meals) {
                throw new Error("No meals found");
            }

            setRecipe(res.data.meals[0]);
        } catch {
            setError("Recipe not found. Try a simpler name (e.g., Cake, Pasta).");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-container" style={{ maxWidth: "900px" }}>
            <Link to="/">Back to Home</Link>
            <h1>Culinary Master</h1>
            <p>Find delicious recipes and cooking instructions.</p>

            <input
                placeholder="Enter Food Name (e.g., Pasta)"
                value={food}
                onChange={(e) => setFood(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchRecipe()}
            />
            <button onClick={fetchRecipe} disabled={loading}>
                {loading ? "Cooking..." : "Find Recipe"}
            </button>

            {loading && <div className="loader"></div>}

            {error && <div className="error-message">{error}</div>}

            {recipe && (
                <div style={{ marginTop: "2rem", textAlign: "left" }}>
                    <div style={{
                        background: "rgba(0,0,0,0.2)",
                        borderRadius: "20px",
                        padding: "2rem",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    }}>
                        <h2>{recipe.strMeal}</h2>
                        <span style={{
                            background: "#fff",
                            color: "#333",
                            padding: "0.3rem 0.8rem",
                            borderRadius: "15px",
                            fontSize: "0.9rem",
                            marginBottom: "1rem",
                            fontWeight: "bold"
                        }}>
                            {recipe.strCategory} | {recipe.strArea}
                        </span>

                        <img
                            src={recipe.strMealThumb}
                            alt={recipe.strMeal}
                            style={{ maxWidth: "300px", borderRadius: "15px", boxShadow: "0 5px 15px rgba(0,0,0,0.3)" }}
                        />

                        <div style={{ marginTop: "1.5rem", width: "100%" }}>
                            <h3>Instructions</h3>
                            <p style={{ whiteSpace: "pre-wrap", fontSize: "1rem", lineHeight: "1.7" }}>
                                {recipe.strInstructions}
                            </p>
                        </div>

                        {recipe.strYoutube && (
                            <a
                                href={recipe.strYoutube}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    marginTop: "1rem",
                                    background: "#FF0000",
                                    color: "white",
                                    display: "inline-block"
                                }}
                            >
                                Watch on YouTube
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Recipe;
