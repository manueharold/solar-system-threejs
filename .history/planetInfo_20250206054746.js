// 🌍 Planet Data
const planetData = {
    sun: { 
        name: "Sun",
        fact: "The Sun generates so much energy that, in just one second, it could power the entire Earth for 500,000 years!",
        diameter: "1,391,000 km",
        distance: "0 km (center of solar system)",
        orbitalPeriod: "N/A",
        moons: "0",
        history: "The Sun has been the central figure in many mythologies. In ancient Egypt, it was worshiped as the god Ra. Scientific study began with early astronomers like Galileo in the 1600s, leading to modern solar physics.",
        atmosphere: "Hydrogen, Helium",
        gravity: "274 m/s²",
        temperature: "5,500°C (surface)"
    },
    mercury: { 
        name: "Mercury",
        fact: "A day on Mercury lasts longer than a year—one full day-night cycle takes 176 Earth days!",
        diameter: "4,880 km",
        distance: "57.9 million km",
        orbitalPeriod: "88 days",
        moons: "0",
        history: "Mercury, visible to the naked eye, was known to ancient civilizations including the Sumerians around 3,000 BC. Its name comes from the Roman messenger god due to its swift orbit.",
        atmosphere: "Thin exosphere (oxygen, sodium, hydrogen, helium, potassium)",
        gravity: "3.7 m/s²",
        temperature: "-173°C to 427°C"
    },
    venus: { 
        name: "Venus",
        fact: "Venus spins in the opposite direction of most planets, meaning the Sun rises in the west and sets in the east!",
        diameter: "12,104 km",
        distance: "108.2 million km",
        orbitalPeriod: "225 days",
        moons: "0",
        history: "Named after the Roman goddess of love and beauty, Venus has fascinated humans since ancient times. The planet’s thick clouds made it a mystery until space probes like Venera (Soviet) explored it in the 1960s.",
        atmosphere: "Carbon dioxide, nitrogen, sulfuric acid clouds",
        gravity: "8.87 m/s²",
        temperature: "462°C (average)"
    },
    earth: { 
        name: "Earth",
        fact: "Earth is the only planet where water can exist in liquid form on the surface, which is essential for life as we know it!",
        diameter: "12,742 km",
        distance: "149.6 million km",
        orbitalPeriod: "365.25 days",
        moons: "1 (The Moon)",
        history: "Earth has been humanity's home for over 200,000 years. Its shape, size, and place in the universe were studied by ancient Greek scholars like Eratosthenes, who calculated its circumference around 240 BC.",
        atmosphere: "Nitrogen, oxygen, argon, carbon dioxide",
        gravity: "9.8 m/s²",
        temperature: "-88°C to 58°C"
    },
    mars: { 
        name: "Mars",
        fact: "Mars has the tallest volcano in the solar system, Olympus Mons, which is nearly three times the height of Mount Everest!",
        diameter: "6,779 km",
        distance: "227.9 million km",
        orbitalPeriod: "687 days",
        moons: "2 (Phobos and Deimos)",
        history: "Mars, known as the Red Planet, was observed by ancient Egyptians around 2,000 BC. Its mysterious appearance inspired speculation about life, fueling 20th-century missions like Viking (NASA) in 1976.",
        atmosphere: "Carbon dioxide, argon, nitrogen, oxygen",
        gravity: "3.71 m/s²",
        temperature: "-125°C to 20°C"
    },
    jupiter: {
        name: "Jupiter",
        fact: "Jupiter’s Great Red Spot is a massive storm that has been raging for over 350 years—longer than any hurricane on Earth!",
        diameter: "139,820 km",
        distance: "778.5 million km",
        orbitalPeriod: "11.86 years",
        moons: "79",
        history: "Jupiter, the largest planet, has been observed since ancient times. Galileo’s discovery of its four largest moons in 1610 marked a key milestone in astronomy.",
        atmosphere: "Hydrogen, helium, ammonia, methane",
        gravity: "24.79 m/s²",
        temperature: "-145°C"
    },
    saturn: {
        name: "Saturn",
        fact: "Saturn’s rings are so wide that they could fit nearly 6 Earths side by side, yet they are only about 30 feet thick!",
        diameter: "116,460 km",
        distance: "1.43 billion km",
        orbitalPeriod: "29.46 years",
        moons: "82",
        history: "Saturn, known for its rings, was first observed with a telescope by Galileo in 1610. Cassini-Huygens mission (1997) provided detailed data about the planet and its moons.",
        atmosphere: "Hydrogen, helium, methane, ammonia",
        gravity: "10.44 m/s²",
        temperature: "-178°C"
    },
    uranus: {
        name: "Uranus",
        fact: "Uranus is the only planet that rotates on its side, possibly due to a massive collision in the past!",
        diameter: "50,724 km",
        distance: "2.87 billion km",
        orbitalPeriod: "84 years",
        moons: "27",
        history: "Discovered in 1781 by William Herschel, Uranus was the first planet found with a telescope. Its sideways rotation remains a mystery.",
        atmosphere: "Hydrogen, helium, methane",
        gravity: "8.69 m/s²",
        temperature: "-224°C"
    },
    neptune: {
        name: "Neptune",
        fact: "Neptune’s winds can reach speeds of over 1,500 mph (2,400 km/h), making them the fastest in the solar system!",
        diameter: "49,244 km",
        distance: "4.5 billion km",
        orbitalPeriod: "164.8 years",
        moons: "14",
        history: "Neptune was discovered in 1846 through mathematical predictions before being observed directly. Voyager 2 provided the first close-up images in 1989.",
        atmosphere: "Hydrogen, helium, methane",
        gravity: "11.15 m/s²",
        temperature: "-214°C"
    },
    moon: {
        name: "The Moon",
        fact: "The Moon is slowly drifting away from Earth—about 3.8 cm per year! In 600 million years, a total solar eclipse will no longer be possible!",
        diameter: "3,474.8 km",
        distance: "384,400 km",
        orbitalPeriod: "27.3 days",
        moons: "0",
        history: "The Moon has been a focal point of human culture and science. The Apollo 11 mission in 1969 marked humanity’s first steps on another celestial body.",
        atmosphere: "Exosphere (helium, neon, hydrogen)",
        gravity: "1.62 m/s²",
        temperature: "-173°C to 127°C"
    }
};

// 🌍 Show Planet Info
export function showPlanetInfo(planetName) {
    const planet = planetData[planetName.toLowerCase()];
    if (!planet) return;

    // Add guard checks to ensure all required elements exist
    const requiredIds = [
        "planetName",
        "planetDescription",
        "planetDiameter",
        "planetDistance",
        "planetOrbitalPeriod",
        "planetMoons",
        "planetHistory",
        "planetAtmosphere",
        "planetGravity",
        "planetTemperature",
        "planetInfoPanel"
    ];
    for (let id of requiredIds) {
        if (!document.getElementById(id)) {
            console.warn(`Element with id "${id}" not found. Skipping showPlanetInfo update.`);
            return;
        }
    }

    document.getElementById("planetName").textContent = planet.name;
    document.getElementById("planetDescription").textContent = planet.fact;
    document.getElementById("planetDiameter").textContent = planet.diameter;
    document.getElementById("planetDistance").textContent = planet.distance;
    document.getElementById("planetOrbitalPeriod").textContent = planet.orbitalPeriod;
    document.getElementById("planetMoons").textContent = planet.moons;
    document.getElementById("planetHistory").textContent = planet.history;
    document.getElementById("planetAtmosphere").textContent = planet.atmosphere;
    document.getElementById("planetGravity").textContent = planet.gravity;
    document.getElementById("planetTemperature").textContent = planet.temperature;

    document.getElementById("planetInfoPanel").classList.add("active");
}

// 🌍 Hide Planet Info
export function hidePlanetInfo() {
    document.getElementById("planetInfoPanel").classList.remove("active"); 
}

// ❌ Close Popup
document.getElementById("closeInfoPanel").addEventListener("click", hidePlanetInfo);
