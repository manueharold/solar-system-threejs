// 🌎 Select the existing popup elements from index.html
const planetInfoContainer = document.getElementById("planetInfo");
const planetNameElement = document.getElementById("planetName");
const planetDiameterElement = document.getElementById("planetDiameter");
const planetDistanceElement = document.getElementById("planetDistance");
const planetFactElement = document.getElementById("planetFact");
const closePopup = document.getElementById("closePopup");

// 🌍 Planet data
const planetData = {
    sun: { diameter: 1391016, distance: 0, fact: "The Sun accounts for 99.86% of the mass in the Solar System!" },
    mercury: { diameter: 4879, distance: 57910000, fact: "Mercury has no atmosphere, which means it has extreme temperatures." },
    venus: { diameter: 12104, distance: 108200000, fact: "Venus has a runaway greenhouse effect, making it the hottest planet!" },
    earth: { diameter: 12742, distance: 149600000, fact: "Earth is the only known planet to support life!" },
    mars: { diameter: 6779, distance: 227900000, fact: "Mars has the tallest volcano in the solar system, Olympus Mons." },
    jupiter: { diameter: 139820, distance: 778500000, fact: "Jupiter has 79 known moons!" },
    saturn: { diameter: 116460, distance: 1433000000, fact: "Saturn's rings are made of ice and rock." },
    uranus: { diameter: 50724, distance: 2877000000, fact: "Uranus rotates on its side!" },
    neptune: { diameter: 49244, distance: 4503000000, fact: "Neptune has the fastest winds in the solar system!" }
};

// 🌠 Function to show planet info
export function showPlanetInfo(planetName) {
    const planet = planetData[planetName.toLowerCase()];
    if (!planet) return;

    planetNameElement.textContent = planetName;
    planetDiameterElement.textContent = planet.diameter;
    planetDistanceElement.textContent = planet.distance;
    planetFactElement.textContent = planet.fact;
    planetInfoContainer.style.display = "block";
}

// 🔴 Close popup when clicking the close button
closePopup.addEventListener("click", () => {
    planetInfoContainer.style.display = "none";
});
