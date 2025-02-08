import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// ===== New Constants for Orbit Mode =====

// Fixed orbit radii for the planets
const orbitRadii = {
  mercury: 1000,
  venus: 1400,
  earth: 1800,
  mars: 2000,
  jupiter: 2400,
  saturn: 2800,
  uranus: 3200,
  neptune: 4000,
};

// Adjusted scales so that the Sun appears significantly larger than the orbiting planets.
// Feel free to tweak these values to best suit your scene.
const orbitPlanetScales = {
  sun: 20,      // Increased Sun size
  mercury: 0.15,
  venus: 0.25,
  earth: 0.3,
  mars: 0.2,
  jupiter: 0.8,
  saturn: 0.7,
  uranus: 0.6,
  neptune: 0.55,
};

const baseOrbitSpeed = 0.02; // Base speed for orbits

// An array to store orbit data for each planet
let orbitingPlanets = [];

// A flag to indicate if orbit mode is active
let orbitModeEnabled = false;

/**
 * Repositions the Sun and planets for orbit mode.
 * - Moves the Sun to (0,0,0) and applies a larger fixed scale.
 * - For each planet (mercury, venus, earth, mars, jupiter, saturn, uranus, neptune),
 *   it sets a fixed (reduced) scale and positions it on a circular orbit (with a random starting angle).
 * - Adjusts the camera and OrbitControls target so that (0,0,0) is centered.
 *
 * @param {THREE.Scene} scene - Your scene containing the planets.
 * @param {THREE.PerspectiveCamera} camera - Your main camera.
 * @param {OrbitControls} controls - Your OrbitControls instance.
 */
export function loadOrbitPlanets(scene, camera, controls) {
  orbitingPlanets = []; // Clear any previous orbit data

  // Move the Sun to (0,0,0) and update its scale
  const sun = scene.getObjectByName("sun");
  if (!sun) {
    console.error("Sun not found in scene!");
    return;
  }
  sun.position.set(0, 0, 0);
  sun.scale.set(orbitPlanetScales.sun, orbitPlanetScales.sun, orbitPlanetScales.sun);

  // For each planet with an orbit, reposition it and set up its orbit parameters.
  Object.keys(orbitRadii).forEach((planetName) => {
    const planetObj = scene.getObjectByName(planetName);
    if (!planetObj) {
      console.warn(`Planet "${planetName}" not found in scene.`);
      return;
    }

    // Set fixed (and reduced) scale for orbit mode
    const scale = orbitPlanetScales[planetName];
    planetObj.scale.set(scale, scale, scale);

    // Use a fixed orbit radius
    const orbitRadius = orbitRadii[planetName];

    // Choose a random starting angle to spread out the planets
    const initialAngle = Math.random() * Math.PI * 2;

    // Calculate an orbit speed that decreases with distance (feel free to adjust this)
    const orbitSpeed = baseOrbitSpeed / Math.sqrt(orbitRadius);

    // Compute initial position along the orbit
    const offsetX = orbitRadius * Math.cos(initialAngle);
    const offsetZ = orbitRadius * Math.sin(initialAngle);
    planetObj.position.set(offsetX, 0, offsetZ);

    // Save orbit information so we can update positions later in the animation loop
    orbitingPlanets.push({
      object: planetObj,
      radius: orbitRadius,
      angle: initialAngle,
      speed: orbitSpeed,
    });
  });

  // (Optional) Adjust the camera to a position that clearly shows the orbits.
  // Here we choose a position above and back so that the orbits are in view.
  camera.position.set(0, 50, 120);
  camera.lookAt(0, 0, 0);

  // If you're using OrbitControls, update its target to (0,0,0) and call update().
  if (controls) {
    controls.target.set(0, 0, 0);
    controls.update();
  }

  orbitModeEnabled = true;
  console.log("Orbit mode enabled.");
}

/**
 * Call this function in your main render loop if orbit mode is active.
 *
 * @param {number} deltaTime - Elapsed time since the last frame (in seconds).
 */
export function updateOrbitModeAnimation(deltaTime) {
  if (!orbitModeEnabled) return;

  orbitingPlanets.forEach((planet) => {
    // Increment the orbit angle based on its speed and deltaTime
    planet.angle += planet.speed * deltaTime;
    // Calculate the new position along the orbit
    const offsetX = planet.radius * Math.cos(planet.angle);
    const offsetZ = planet.radius * Math.sin(planet.angle);
    planet.object.position.set(offsetX, 0, offsetZ);
  });
}
