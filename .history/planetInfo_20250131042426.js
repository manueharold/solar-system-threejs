// 🌍 Planet Data
const planetData = {
    sun: { 
        fact: "The Sun generates so much energy that, in just one second, it could power the entire Earth for 500,000 years!"
    },
    mercury: { 
        fact: "A day on Mercury lasts longer than a year—one full day-night cycle takes 176 Earth days!"
    },
    venus: { 
        fact: "Venus spins in the opposite direction of most planets, meaning the Sun rises in the west and sets in the east!"
    },
    earth: { 
        fact: "Earth is the only planet where water can exist in liquid form on the surface, which is essential for life as we know it!"
    },
    mars: { 
        fact: "Mars has the tallest volcano in the solar system, Olympus Mons, which is nearly three times the height of Mount Everest!"
    },
    jupiter: { 
        fact: "Jupiter’s Great Red Spot is a massive storm that has been raging for over 350 years—longer than any hurricane on Earth!"
    },
    saturn: { 
        fact: "Saturn’s rings are so wide that they could fit nearly 6 Earths side by side, yet they are only about 30 feet thick!"
    },
    uranus: { 
        fact: "Uranus is the only planet that rotates on its side, possibly due to a massive collision in the past!"
    },
    neptune: { 
        fact: "Neptune’s winds can reach speeds of over 1,500 mph (2,400 km/h), making them the fastest in the solar system!"
    },
    moon: { 
        fact: "The Moon is slowly drifting away from Earth—about 3.8 cm per year! In 600 million years, a total solar eclipse will no longer be possible!"
    }
};

// 🌍 Show Planet Info
export function showPlanetInfo(planetName) {
    const planet = planetData[planetName.toLowerCase()];
    if (!planet) return;

    document.getElementById("planetName").textContent = planetName;
    document.getElementById("planetDescription").textContent = planet.fact;

    document.getElementById("planetInfoPanel").classList.add("active");
}

// 🌍 Hide Planet Info
export function hidePlanetInfo() {
    document.getElementById("planetInfoPanel").classList.remove("active"); 
}

// ❌ Close Popup
document.getElementById("closeInfoPanel").addEventListener("click", hidePlanetInfo);
