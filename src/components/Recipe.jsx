import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Recipe = () => {
  const [search, setSearch] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecipes = async () => {
    if (!search.trim()) {
      setError("Please enter a food name");
      return;
    }

    setLoading(true);
    setError("");
    setRecipes([]);

    try {
      const res = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${search}`
      );

      if (!res.data.meals) {
        setError("No recipes found. Try a simpler or related name.");
      } else {
        setRecipes(res.data.meals);
      }
    } catch {
      setError("Unable to fetch recipes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getIngredients = (meal) => {
    const list = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const meas = meal[`strMeasure${i}`];
      if (ing && ing.trim()) {
        list.push(`${ing} - ${meas}`);
      }
    }
    return list;
  };

  return (
    <div className="glass-container" style={{ maxWidth: "1100px" }}>
      <Link to="/">⬅ Back to Home</Link>

      <h1>Recipe Search 🍽️</h1>
      <p>Search recipes by name (Indian & International)</p>

      <input
        placeholder="Enter food name (e.g. Biryani, Pasta, Cake)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && fetchRecipes()}
      />

      <button onClick={fetchRecipes} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>

      {loading && <div className="loader"></div>}
      {error && <p className="error-message">{error}</p>}

      {recipes.map((meal) => (
        <div
          key={meal.idMeal}
          style={{
            marginTop: "2rem",
            padding: "2rem",
            borderRadius: "20px",
            background: "rgba(0,0,0,0.2)"
          }}
        >
          <h2>{meal.strMeal}</h2>
          <p>
            <b>Category:</b> {meal.strCategory} |{" "}
            <b>Origin:</b> {meal.strArea}
          </p>

          <img
            src={meal.strMealThumb}
            alt={meal.strMeal}
            style={{ maxWidth: "300px", borderRadius: "15px" }}
          />

          <h3>Ingredients</h3>
          <ul>
            {getIngredients(meal).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          <h3>Instructions</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>
            {meal.strInstructions}
          </p>

          {meal.strYoutube && (
            <a
              href={meal.strYoutube}
              target="_blank"
              rel="noreferrer"
              style={{ color: "red", fontWeight: "bold" }}
            >
              ▶ Watch Video
            </a>
          )}
        </div>
      ))}
    </div>
  );
};

export default Recipe;
