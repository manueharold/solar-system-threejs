import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

let orbitingPlanets = [];
const baseOrbitSpeed = 0.02;

// Fixed orbit distances for each planet
const orbitRadii = {
  mercury: 6,
  venus: 12,
  earth: 18,
  mars: 24,
  jupiter: 35,
  saturn: 45,
  uranus: 55,
  neptune: 65,
};

// Fixed sizes for each celestial body in orbit mode
const planetScales = {
  sun: 10,       // Large Sun for visibility
  mercury: 0.5,
  venus: 0.8,
  earth: 1,
  mars: 0.7,
  jupiter: 3,
  saturn: 2.5,
  uranus: 2,
  neptune: 1.8,
};

/**
 * Prepares the loaded planets for orbit mode.
 * Each planet and the Sun are set to fixed sizes, and their orbits are calculated.
 *
 * @param {THREE.Scene} scene - The scene containing the Sun and planets.
 */
export function loadOrbitPlanets(scene) {
  const sun = scene.getObjectByName("sun");
  if (!sun) {
    console.error("Sun not found!");
    return;
  }

  // Set Sun size
  sun.scale.set(planetScales.sun, planetScales.sun, planetScales.sun);

  // Clear previous orbit data
  orbitingPlanets = [];
  const planetNames = Object.keys(orbitRadii);

  planetNames.forEach((name) => {
    const planetObj = scene.getObjectByName(name);
    if (planetObj) {
      // Set fixed scale for each planet
      const scale = planetScales[name];
      planetObj.scale.set(scale, scale, scale);

      // Use fixed orbit radius
      const orbitRadius = orbitRadii[name];

      // Random initial angle to spread planets around
      const initialAngle = Math.random() * Math.PI * 2;

      // Assign a constant orbit speed (slower for larger orbits)
      const orbitSpeed = baseOrbitSpeed / Math.sqrt(orbitRadius);

      // Position planet at its orbit radius
      const offsetX = orbitRadius * Math.cos(initialAngle);
      const offsetZ = orbitRadius * Math.sin(initialAngle);
      planetObj.position.set(sun.position.x + offsetX, sun.position.y, sun.position.z + offsetZ);

      // Save orbit data for animation updates
      orbitingPlanets.push({
        object: planetObj,
        sun, // Reference to Sun
        radius: orbitRadius,
        angle: initialAngle,
        speed: orbitSpeed,
      });

      console.log(`${name}: Orbit radius = ${orbitRadius}, Scale = ${scale}, Initial angle = ${initialAngle.toFixed(2)}`);
    }
  });
}

/**
 * Updates the positions of orbiting planets around the Sun.
 * Call this function in your main animation loop when Orbit Mode is active.
 *
 * @param {number} deltaTime - The elapsed time (in seconds) since the last frame.
 */
export function updateOrbitModeAnimation(deltaTime) {
  orbitingPlanets.forEach((planet) => {
    // Increment the orbit angle
    planet.angle += planet.speed * deltaTime;

    // Calculate new position
    const offsetX = planet.radius * Math.cos(planet.angle);
    const offsetZ = planet.radius * Math.sin(planet.angle);

    // Update planet's position relative to the Sun
    planet.object.position.x = planet.sun.position.x + offsetX;
    planet.object.position.z = planet.sun.position.z + offsetZ;
  });
}
