// ================================
// PLANET INFO PANEL INTERACTIVITY
// ================================
export function setupPlanetInfoPanel() {
    document.addEventListener("click", (event) => {
        // 🌍 Open Planet Info Panel
        if (event.target.matches(".planet")) {
            const planetName = event.target.dataset.name;  // Ensure each planet has a `data-name` attribute
            const planetInfo = getPlanetInfo(planetName);  // Ensure `getPlanetInfo` is implemented

            // Populate Planet Info Panel
            document.getElementById("planetName").innerText = planetName;
            document.getElementById("planetDiameter").innerText = planetInfo.diameter;
            document.getElementById("planetDistance").innerText = planetInfo.distanceFromSun;
            document.getElementById("planetOrbitalPeriod").innerText = planetInfo.orbitalPeriod;
            document.getElementById("planetMoons").innerText = planetInfo.moons;

            // Show the panel
            document.getElementById("planetInfoPanel").classList.add("active");
        }

        // ❌ Close Info Panel
        if (event.target.id === "closeInfoPanel") {
            document.getElementById("planetInfoPanel").classList.remove("active");
        }
    });
}
