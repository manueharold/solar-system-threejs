// 🌍 Planet Data
const planetData = {
    sun: {
        diameter: 1391016,
        distance: 0,
        fact: "The Sun generates so much energy that, in just one second, it could power the entire Earth for 500,000 years!"
    },
    mercury: {
        diameter: 4879,
        distance: 57910000,
        fact: "A day on Mercury lasts longer than a year—one full day-night cycle takes 176 Earth days!"
    },
    venus: {
        diameter: 12104,
        distance: 108200000,
        fact: "Venus spins in the opposite direction of most planets, meaning the Sun rises in the west and sets in the east!"
    },
    earth: {
        diameter: 12742,
        distance: 149600000,
        fact: "Earth is the only planet where water can exist in liquid form on the surface, which is essential for life as we know it!"
    },
    mars: {
        diameter: 6779,
        distance: 227900000,
        fact: "Mars has the tallest volcano in the solar system, Olympus Mons, which is nearly three times the height of Mount Everest!"
    },
    jupiter: {
        diameter: 139820,
        distance: 778500000,
        fact: "Jupiter’s Great Red Spot is a massive storm that has been raging for over 350 years—longer than any hurricane on Earth!"
    },
    saturn: {
        diameter: 116460,
        distance: 1433000000,
        fact: "Saturn’s rings are so wide that they could fit nearly 6 Earths side by side, yet they are only about 30 feet thick!"
    },
    uranus: {
        diameter: 50724,
        distance: 2877000000,
        fact: "Uranus is the only planet that rotates on its side, possibly due to a massive collision in the past!"
    },
    neptune: {
        diameter: 49244,
        distance: 4503000000,
        fact: "Neptune’s winds can reach speeds of over 1,500 mph (2,400 km/h), making them the fastest in the solar system!"
    }
};

// 🌍 Show Planet Info
export function showPlanetInfo(planetName) {
    const planet = planetData[planetName.toLowerCase()];
    if (!planet) return;

    document.getElementById("planetName").textContent = planetName;
    document.getElementById("planetDescription").textContent = planet.fact;

    const infoPanel = document.getElementById("planetInfoPanel");
    infoPanel.classList.add("active");
}

// 🌍 Hide Planet Info
export function hidePlanetInfo() {
    const infoPanel = document.getElementById("planetInfoPanel");
    infoPanel.classList.remove("active");
}

// ❌ Close Popup
document.getElementById("closeInfoPanel").addEventListener("click", () => {
    hidePlanetInfo();
});
