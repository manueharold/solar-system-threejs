// Create an HTML popup container (Add this to your HTML file)
const planetInfoContainer = document.createElement("div");
planetInfoContainer.id = "planetInfo";
planetInfoContainer.style.position = "absolute";
planetInfoContainer.style.top = "20px";
planetInfoContainer.style.right = "20px";
planetInfoContainer.style.padding = "15px";
planetInfoContainer.style.background = "rgba(0, 0, 0, 0.8)";
planetInfoContainer.style.color = "white";
planetInfoContainer.style.borderRadius = "8px";
planetInfoContainer.style.display = "none";
planetInfoContainer.style.zIndex = "100";
planetInfoContainer.innerHTML = `
    <h2 id="planetName"></h2>
    <p><strong>Diameter:</strong> <span id="planetDiameter"></span> km</p>
    <p><strong>Distance from Sun:</strong> <span id="planetDistance"></span> km</p>
    <p id="planetFact"></p>
    <button id="closePopup">Close</button>
`;
document.body.appendChild(planetInfoContainer);

// Planet data (you can expand this)
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

// Function to show planet info
function showPlanetInfo(planetName) {
    const planet = planetData[planetName.toLowerCase()];
    if (!planet) return;

    document.getElementById("planetName").textContent = planetName;
    document.getElementById("planetDiameter").textContent = planet.diameter;
    document.getElementById("planetDistance").textContent = planet.distance;
    document.getElementById("planetFact").textContent = planet.fact;
    planetInfoContainer.style.display = "block";
}

// Close popup when clicking the close button
const closePopup = document.getElementById("closePopup");
closePopup.addEventListener("click", () => {
    planetInfoContainer.style.display = "none";
});

// Integrate with moveToPlanet function
export function moveToPlanet(planetName, camera, controls, scene) {
    const targetPlanet = scene.getObjectByName(planetName);
    if (!targetPlanet) {
        console.error(`❌ Planet "${planetName}" not found!`);
        return;
    }
    
    console.log(`🚀 Moving to: ${planetName}`);
    showPlanetInfo(planetName);  // Show planet details when moving to it
    
    // (Keep the existing animation logic here...)
}
