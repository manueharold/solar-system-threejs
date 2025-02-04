// 🌍 Planet Data
const planetData = {
    sun: { 
        name: "Sun",
        fact: "The Sun generates so much energy that, in just one second, it could power the entire Earth for 500,000 years!",
        diameter: "1,391,000 km",
        distance: "0 km (center of solar system)",
        orbitalPeriod: "N/A",
        moons: "0"
    },
    mercury: { 
        name: "Mercury",
        fact: "A day on Mercury lasts longer than a year—one full day-night cycle takes 176 Earth days!",
        diameter: "4,880 km",
        distance: "57.9 million km",
        orbitalPeriod: "88 days",
        moons: "0"
    },
    venus: { 
        name: "Venus",
        fact: "Venus spins in the opposite direction of most planets, meaning the Sun rises in the west and sets in the east!",
        diameter: "12,104 km",
        distance: "108.2 million km",
        orbitalPeriod: "225 days",
        moons: "0"
    },
    earth: { 
        name: "Earth",
        fact: "Earth is the only planet where water can exist in liquid form on the surface, which is essential for life as we know it!",
        diameter: "12,742 km",
        distance: "149.6 million km",
        orbitalPeriod: "365.25 days",
        moons: "1 (The Moon)"
    },
    mars: { 
        name: "Mars",
        fact: "Mars has the tallest volcano in the solar system, Olympus Mons, which is nearly three times the height of Mount Everest!",
        diameter: "6,779 km",
        distance: "227.9 million km",
        orbitalPeriod: "687 days",
        moons: "2 (Phobos and Deimos)"
    },
    jupiter: { 
        name: "Jupiter",
        fact: "Jupiter’s Great Red Spot is a massive storm that has been raging for over 350 years—longer than any hurricane on Earth!",
        diameter: "139,820 km",
        distance: "778.5 million km",
        orbitalPeriod: "11.86 years",
        moons: "79"
    },
    saturn: { 
        name: "Saturn",
        fact: "Saturn’s rings are so wide that they could fit nearly 6 Earths side by side, yet they are only about 30 feet thick!",
        diameter: "116,460 km",
        distance: "1.43 billion km",
        orbitalPeriod: "29.46 years",
        moons: "82"
    },
    uranus: { 
        name: "Uranus",
        fact: "Uranus is the only planet that rotates on its side, possibly due to a massive collision in the past!",
        diameter: "50,724 km",
        distance: "2.87 billion km",
        orbitalPeriod: "84 years",
        moons: "27"
    },
    neptune: { 
        name: "Neptune",
        fact: "Neptune’s winds can reach speeds of over 1,500 mph (2,400 km/h), making them the fastest in the solar system!",
        diameter: "49,244 km",
        distance: "4.5 billion km",
        orbitalPeriod: "164.8 years",
        moons: "14"
    },
    moon: { 
        name: "The Moon",
        fact: "The Moon is slowly drifting away from Earth—about 3.8 cm per year! In 600 million years, a total solar eclipse will no longer be possible!",
        diameter: "3,474.8 km",
        distance: "384,400 km",
        orbitalPeriod: "27.3 days",
        moons: "0"
    }
};

// 🌍 Show Planet Info
export function showPlanetInfo(planetName) {
    const infoDiv = document.getElementById('planet-info');
    infoDiv.style.display = 'block';
    infoDiv.innerHTML = `Information about ${planetName}`;
}

// 🌍 Hide Planet Info
export function hidePlanetInfo() {
    const infoDiv = document.getElementById('planet-info');
    infoDiv.style.display = 'none';
}

