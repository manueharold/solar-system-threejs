import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

let orbitingPlanets = [];
const distanceScale = 1e-6; // Adjust as needed to scale down huge distances
const baseOrbitSpeed = 0.02;
const fixedPlanetScale = 1;  // Fixed scale for each planet in orbit mode

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

  // Clear any previous orbit data
  orbitingPlanets = [];
  const planetNames = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"];

  planetNames.forEach((name) => {
    const planetObj = scene.getObjectByName(name);
    if (planetObj) {
      // Override the planet's scale to a fixed value
      planetObj.scale.set(fixedPlanetScale, fixedPlanetScale, fixedPlanetScale);

      // Compute the original distance from the Sun
      const originalRadius = planetObj.position.distanceTo(sun.position);

      // Scale down the distance for visualization purposes
      const orbitRadius = originalRadius * distanceScale;

      // Calculate an initial orbit angle relative to the Sun,
      // with an added random offset so that not all planets start on the same side
      const randomOffset = Math.random() * Math.PI * 2;
      const initialAngle =
        Math.atan2(planetObj.position.z - sun.position.z, planetObj.position.x - sun.position.x) +
        randomOffset;

      // Use a constant orbit speed (adjust as needed)
      const orbitSpeed = baseOrbitSpeed;

      // Reposition the planet so it's at the scaled orbit radius around the Sun
      const offsetX = orbitRadius * Math.cos(initialAngle);
      const offsetZ = orbitRadius * Math.sin(initialAngle);
      planetObj.position.set(sun.position.x + offsetX, planetObj.position.y, sun.position.z + offsetZ);

      // Save orbiting data for animation updates
      orbitingPlanets.push({
        object: planetObj,
        sun, // reference to the Sun for calculating orbit center
        radius: orbitRadius,
        angle: initialAngle,
        speed: orbitSpeed,
      });

      console.log(
        `${name} -> Original dist: ${originalRadius.toFixed(2)}, ` +
          `scaled: ${orbitRadius.toFixed(2)}, angle: ${initialAngle.toFixed(2)}`
      );
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
    // Increment the planet's orbit angle
    planet.angle += planet.speed * deltaTime;

    // Calculate the new offset from the Sun's position
    const offsetX = planet.radius * Math.cos(planet.angle);
    const offsetZ = planet.radius * Math.sin(planet.angle);

    // Update the planet's position relative to the Sun
    planet.object.position.x = planet.sun.position.x + offsetX;
    planet.object.position.z = planet.sun.position.z + offsetZ;
  });
}
