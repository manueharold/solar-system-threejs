import { planetData } from './loadPlanets.js';

/**
 * Prepares planets for orbit mode by setting an initial orbit angle.
 * Assumes the Sun is at (0, 0, 0).
 */
export function loadOrbitPlanets(scene, camera, controls) {
  // For each planet except the Sun, initialize its orbit angle based on its current position.
  Object.keys(planetData).forEach(name => {
    if (name === "sun") return; // Skip the Sun
    const planet = scene.getObjectByName(name);
    if (planet) {
      // Calculate initial angle from current position (assumes sun is at origin)
      planet.userData.orbitAngle = Math.atan2(planet.position.z, planet.position.x);
    }
  });
  console.log("✅ Orbit Mode: Planets are ready to orbit the Sun.");
}

/**
 * Updates each planet’s position so that it orbits the Sun.
 * The Moon is handled separately (orbiting Earth).
 *
 * @param {number} deltaTime - The time elapsed since the last frame.
 * @param {THREE.Scene} scene - The scene containing the planets.
 */
export function updateOrbitModeAnimation(deltaTime, scene) {
  // Define orbital speeds (these values are arbitrary and can be tweaked)
  const orbitalSpeeds = {
    mercury: 0.05,
    venus:   0.04,
    earth:   0.03,
    mars:    0.025,
    jupiter: 0.015,
    saturn:  0.01,
    uranus:  0.008,
    neptune: 0.007
    // Moon is handled separately
  };

  Object.keys(planetData).forEach(name => {
    if (name === "sun") return; // The Sun remains stationary
    const planet = scene.getObjectByName(name);
    if (planet) {
      // Ensure an orbitAngle exists
      if (planet.userData.orbitAngle === undefined) {
        planet.userData.orbitAngle = 0;
      }

      if (name === "moon") {
        // The Moon should orbit Earth
        const earth = scene.getObjectByName("earth");
        if (earth) {
          // Update moon's orbit angle (adjust speed as needed)
          planet.userData.orbitAngle += 0.1 * deltaTime;
          const distance = planetData.moon.distance;
          planet.position.x = earth.position.x + Math.cos(planet.userData.orbitAngle) * distance;
          planet.position.z = earth.position.z + Math.sin(planet.userData.orbitAngle) * distance;
        }
      } else {
        // For other planets, update orbit angle using the defined speed.
        const speed = orbitalSpeeds[name] || 0.03;
        planet.userData.orbitAngle += speed * deltaTime;
        const distance = planetData[name].distance;
        planet.position.x = Math.cos(planet.userData.orbitAngle) * distance;
        planet.position.z = Math.sin(planet.userData.orbitAngle) * distance;
      }
    }
  });
}
