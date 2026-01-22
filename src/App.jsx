import { BrowserRouter, Route, Routes } from "react-router-dom"
import Master from "./components/Master"
import Temperature from "./components/Temperature"
import GenderPopulation from "./components/Population"
import Education from "./components/Education"
import WaterResources from "./components/Water"
import Recipe from "./components/Recipe"
import "./leafletIconFix";



function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Master />} />
          <Route path="/temperature" element={<Temperature />} />
          <Route path="/population" element={<GenderPopulation />} />
          <Route path="/education" element={<Education />} />
          <Route path="/water" element={<WaterResources />} />
          <Route path="/recipe" element={<Recipe />} />
        </Routes>

        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} Made and Designed by Sandeep</p>
        </footer>
      </BrowserRouter>
    </>
  )
}
export default App