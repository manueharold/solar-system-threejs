// Store planet data
const planetData = {
    sun: {
        name: "Sun",
        diameter: "1,391,000 km",
        distance: "0 km (center of solar system)",
        orbitalPeriod: "N/A",
        moons: "0"
    },
    mercury: {
        name: "Mercury",
        diameter: "4,880 km",
        distance: "57.9 million km",
        orbitalPeriod: "88 days",
        moons: "0"
    },
    venus: {
        name: "Venus",
        diameter: "12,104 km",
        distance: "108.2 million km",
        orbitalPeriod: "225 days",
        moons: "0"
    },
    earth: {
        name: "Earth",
        diameter: "12,742 km",
        distance: "149.6 million km",
        orbitalPeriod: "365.25 days",
        moons: "1 (The Moon)"
    },
    mars: {
        name: "Mars",
        diameter: "6,779 km",
        distance: "227.9 million km",
        orbitalPeriod: "687 days",
        moons: "2 (Phobos and Deimos)"
    },
    jupiter: {
        name: "Jupiter",
        diameter: "139,820 km",
        distance: "778.5 million km",
        orbitalPeriod: "11.86 years",
        moons: "79"
    },
    saturn: {
        name: "Saturn",
        diameter: "116,460 km",
        distance: "1.43 billion km",
        orbitalPeriod: "29.46 years",
        moons: "82"
    },
    uranus: {
        name: "Uranus",
        diameter: "50,724 km",
        distance: "2.87 billion km",
        orbitalPeriod: "84 years",
        moons: "27"
    },
    neptune: {
        name: "Neptune",
        diameter: "49,244 km",
        distance: "4.5 billion km",
        orbitalPeriod: "164.8 years",
        moons: "14"
    },
    moon: {
        name: "The Moon",
        diameter: "3,474.8 km",
        distance: "384,400 km (from Earth)",
        orbitalPeriod: "27.3 days",
        moons: "N/A"
    }
};

// Show planet stats in the UI
export function showPlanetInfo(planetName) {
    const infoPanel = document.getElementById("planetInfoPanel");
    const planet = planetData[planetName.toLowerCase()];

    if (planet) {
        document.getElementById("planetName").textContent = planet.name;
        document.getElementById("planetDiameter").textContent = planet.diameter;
        document.getElementById("planetDistance").textContent = planet.distance;
        document.getElementById("planetOrbitalPeriod").textContent = planet.orbitalPeriod;
        document.getElementById("planetMoons").textContent = planet.moons;

        infoPanel.style.display = "block"; // Show the panel
    }
}

// Hide the planet info panel
export function hidePlanetInfo() {
    const infoPanel = document.getElementById("planetInfoPanel");
    infoPanel.style.display = "none"; // Hide the panel
}
