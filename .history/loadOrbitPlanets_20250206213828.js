// loadOrbitPlanets.js
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// Import your realistic planet data (make sure the path is correct)
import { planetData } from "./loadPlanets.js"; // 

// -----------------------------------------------------------------
// 1. Orbit Radii (these are arbitrary distances for the orbit mode)
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

// -----------------------------------------------------------------
// 2. Orbit Mode Scales Based on Realistic Planet Data
// We want the Sun to be big in orbit mode; here we choose a fixed value:
const sunOrbitScale = 20;

// To compute each planet’s orbit–mode scale we use:
//    orbit scale = sunOrbitScale × (planetData[planet].size / planetData.sun.size) × adjustmentFactor
// The adjustmentFactor is chosen so that the final values are visually appealing.
const orbitPlanetScales = {
  sun: sunOrbitScale,
  // For inner planets we use an adjustment factor near 0.7–0.92:
  mercury: sunOrbitScale * (planetData.mercury.size / planetData.sun.size) * 1.0,  // ~0.16 (≈0.15 desired)
  venus:   sunOrbitScale * (planetData.venus.size   / planetData.sun.size) * 0.62, // ~0.25
  earth:   sunOrbitScale * (planetData.earth.size   / planetData.sun.size) * 0.7,  // ~0.30
  mars:    sunOrbitScale * (planetData.mars.size    / planetData.sun.size) * 0.92, // ~0.21 (close to 0.2)
  // For outer planets we want them visible but not too large – here a smaller factor:
  jupiter: sunOrbitScale * (planetData.jupiter.size / planetData.sun.size) * 0.17, // ~0.79 (≈0.8 desired)
  saturn:  sunOrbitScale * (planetData.saturn.size  / planetData.sun.size) * 0.18, // ~0.70
  uranus:  sunOrbitScale * (planetData.uranus.size  / planetData.sun.size) * 0.34, // ~0.58 (close to 0.6)
  neptune: sunOrbitScale * (planetData.neptune.size / planetData.sun.size) * 0.34, // ~0.56 (close to 0.55)
};

// -----------------------------------------------------------------
// 3. Orbit Animation Data & Flag
let orbitingPlanets = [];
let orbitModeEnabled = false;

// -----------------------------------------------------------------
/**
 * Repositions the Sun and planets for orbit mode.
 * - Moves the Sun to (0,0,0) and scales it based on our computed orbitPlanetScales.
 * - For each planet (mercury, venus, earth, mars, jupiter, saturn, uranus, neptune),
 *   it sets the scale (from our computed values) and places it along a circular orbit
 *   (using a fixed radius and a random starting angle).
 * - Adjusts the camera and OrbitControls target so that (0,0,0) is centered.
 *
 * @param {THREE.Scene} scene - The scene containing your Sun and planets.
 * @param {THREE.PerspectiveCamera} camera - Your main camera.
 * @param {OrbitControls} controls - Your OrbitControls instance.
 */
export function loadOrbitPlanets(scene, camera, controls) {
  orbitingPlanets = []; // Clear any previous orbit data

  // --- Place the Sun at the center ---
  const sun = scene.getObjectByName("sun");
  if (!sun) {
    console.error("Sun not found in scene!");
    return;
  }
  sun.position.set(0, 0, 0);
  sun.scale.set(orbitPlanetScales.sun, orbitPlanetScales.sun, orbitPlanetScales.sun);

  // --- Process each orbiting planet ---
  Object.keys(orbitRadii).forEach((planetName) => {
    const planetObj = scene.getObjectByName(planetName);
    if (!planetObj) {
      console.warn(`Planet "${planetName}" not found in scene.`);
      return;
    }

    // Set the planet’s scale based on our computed orbitPlanetScales.
    const scale = orbitPlanetScales[planetName];
    planetObj.scale.set(scale, scale, scale);

    // Use a fixed orbit radius for this planet.
    const orbitRadius = orbitRadii[planetName];

    // Choose a random starting angle (in radians) to spread the planets around the Sun.
    const initialAngle = Math.random() * Math.PI * 2;

    // Compute an orbit speed; here we use a base speed divided by the square root of the orbit radius.
    const orbitSpeed = 0.02 / Math.sqrt(orbitRadius);

    // Compute the planet’s initial position along the circular orbit.
    const offsetX = orbitRadius * Math.cos(initialAngle);
    const offsetZ = orbitRadius * Math.sin(initialAngle);
    planetObj.position.set(offsetX, 0, offsetZ);

    // Save the planet’s orbit data for animation.
    orbitingPlanets.push({
      object: planetObj,
      radius: orbitRadius,
      angle: initialAngle,
      speed: orbitSpeed,
    });
  });

  // --- Adjust the Camera & Controls ---
  camera.position.set(0, 50, 120);
  camera.lookAt(0, 0, 0);
  if (controls) {
    controls.target.set(0, 0, 0);
    controls.update();
  }

  orbitModeEnabled = true;
  console.log("Orbit mode enabled.");
}

// -----------------------------------------------------------------
/**
 * Call this function on every frame (with the elapsed time) to animate the orbiting planets.
 *
 * @param {number} deltaTime - Time elapsed since the last frame (in seconds).
 */
export function updateOrbitModeAnimation(deltaTime) {
  if (!orbitModeEnabled) return;

  orbitingPlanets.forEach((planet) => {
    // Increment the orbit angle based on its speed and the elapsed time.
    planet.angle += planet.speed * deltaTime;
    // Recompute the position along the circular orbit.
    const offsetX = planet.radius * Math.cos(planet.angle);
    const offsetZ = planet.radius * Math.sin(planet.angle);
    planet.object.position.set(offsetX, 0, offsetZ);
  });
}
