import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

let orbitingPlanets = [];
const baseOrbitSpeed = 0.02;
const fixedPlanetScale = 1; // Fixed scale for all planets in orbit mode

// Define fixed orbit radii for each planet
const orbitRadii = {
  mercury: 5,
  venus: 10,
  earth: 15,
  mars: 20,
  jupiter: 30,
  saturn: 40,
  uranus: 50,
  neptune: 60,
};

/**
 * Prepares the loaded planets for orbit mode.
 * Each planet's model is set to a fixed scale, and its orbit is calculated
 * relative to the Sun's position.
 *
 * @param {THREE.Scene} scene - The scene containing the Sun and planets.
 */
export function loadOrbitPlanets(scene) {
  const sun = scene.getObjectByName("sun");
  if (!sun) {
    console.error("Sun not found!");
    return;
  }

  // Clear previous orbit data
  orbitingPlanets = [];
  const planetNames = Object.keys(orbitRadii);

  planetNames.forEach((name) => {
    const planetObj = scene.getObjectByName(name);
    if (planetObj) {
      // Override planet size
      planetObj.scale.set(fixedPlanetScale, fixedPlanetScale, fixedPlanetScale);

      // Use fixed orbit radius from dictionary
      const orbitRadius = orbitRadii[name];

      // Random initial angle to spread them around
      const initialAngle = Math.random() * Math.PI * 2;

      // Assign a constant orbit speed
      const orbitSpeed = baseOrbitSpeed / Math.sqrt(orbitRadius); // Larger orbits move slower

      // Position planet at its orbit radius
      const offsetX = orbitRadius * Math.cos(initialAngle);
      const offsetZ = orbitRadius * Math.sin(initialAngle);
      planetObj.position.set(sun.position.x + offsetX, planetObj.position.y, sun.position.z + offsetZ);

      // Save orbit data for animation updates
      orbitingPlanets.push({
        object: planetObj,
        sun, // Reference to Sun
        radius: orbitRadius,
        angle: initialAngle,
        speed: orbitSpeed,
      });

      console.log(`${name}: Orbit radius = ${orbitRadius}, Initial angle = ${initialAngle.toFixed(2)}`);
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
