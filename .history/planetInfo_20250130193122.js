// 🌍 Planet Data
const planetData = {
    sun: {
        diameter: 1391016, distance: 0,
        fact: "The Sun accounts for 99.86% of the mass in the Solar System!",
        image: "./assets/images/sun.jpg"
    },
    mercury: {
        diameter: 4879, distance: 57910000,
        fact: "Mercury has no atmosphere, which means it has extreme temperatures.",
        image: "./assets/images/mercury.jpg"
    },
    venus: {
        diameter: 12104, distance: 108200000,
        fact: "Venus has a runaway greenhouse effect, making it the hottest planet!",
        image: "./assets/images/venus.jpg"
    },
    earth: {
        diameter: 12742, distance: 149600000,
        fact: "Earth is the only known planet to support life!",
        image: "./assets/images/earth.jpg"
    },
    mars: {
        diameter: 6779, distance: 227900000,
        fact: "Mars has the tallest volcano in the solar system, Olympus Mons.",
        image: "./assets/images/mars.jpg"
    },
    jupiter: {
        diameter: 139820, distance: 778500000,
        fact: "Jupiter has 79 known moons!",
        image: "./assets/images/jupiter.jpg"
    },
    saturn: {
        diameter: 116460, distance: 1433000000,
        fact: "Saturn's rings are made of ice and rock.",
        image: "./assets/images/saturn.jpg"
    },
    uranus: {
        diameter: 50724, distance: 2877000000,
        fact: "Uranus rotates on its side!",
        image: "./assets/images/uranus.jpg"
    },
    neptune: {
        diameter: 49244, distance: 4503000000,
        fact: "Neptune has the fastest winds in the solar system!",
        image: "./assets/images/neptune.jpg"
    }
};

// 🌍 Show Planet Info
export function showPlanetInfo(planetName) {
    const planet = planetData[planetName.toLowerCase()];
    if (!planet) return;

    // Update info panel
    document.getElementById("planetName").textContent = planetName;
    document.getElementById("planetDescription").textContent = planet.fact;
    document.getElementById("planetImage").src = planet.image;

    // Show panel with animation
    const infoPanel = document.getElementById("planetInfoPanel");
    infoPanel.classList.add("active");
}

// ❌ Close Popup
document.getElementById("closeInfoPanel").addEventListener("click", () => {
    document.getElementById("planetInfoPanel").classList.remove("active");
});
