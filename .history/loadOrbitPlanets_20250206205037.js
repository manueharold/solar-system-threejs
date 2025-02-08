import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";

// Array to hold orbiting planet data
let orbitingPlanets = [];
const baseOrbitSpeed = 0.05; // Adjust this value to set the overall orbit speed

/**
 * Prepares the loaded planets for orbit mode.
 * It finds the Sun and then, for each primary planet, calculates:
 *  - Orbit radius (distance from Sun)
 *  - Initial orbital angle (from current position)
 *  - Orbit speed (base speed divided by orbit radius)
 *
 * @param {THREE.Scene} scene - The scene containing the Sun and planets.
 */
export function loadOrbitPlanets(scene) {
  const sun = scene.getObjectByName("sun");
  if (!sun) {
    console.error("❌ Sun not found in the scene!");
    return;
  }

  // Clear any previous orbiting planets
  orbitingPlanets = [];

  // List of planet names to orbit (excluding the sun and moon)
  const planetNames = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

  planetNames.forEach(name => {
    const planetObj = scene.getObjectByName(name);
    if (planetObj) {
      // Compute the orbit radius from the Sun (assumes Sun is at (0,0,0))
      const orbitRadius = planetObj.position.distanceTo(sun.position);
      // Determine the initial angle (in radians) from the current position
      const initialAngle = Math.atan2(planetObj.position.z, planetObj.position.x);
      // Set orbit speed inversely proportional to the orbit radius so distant planets move slower
      const orbitSpeed = baseOrbitSpeed / orbitRadius;

      orbitingPlanets.push({
        object: planetObj,
        radius: orbitRadius,
        angle: initialAngle,
        speed: orbitSpeed
      });
      console.log(`✅ ${name} added for orbiting. Orbit radius: ${orbitRadius.toFixed(2)}, speed: ${orbitSpeed.toExponential(2)}`);
    } else {
      console.warn(`⚠️ ${name} not found in the scene.`);
    }
  });
}

/**
 * Updates the positions of orbiting planets.
 * This function should be called in your main animation loop when Orbit Mode is active.
 *
 * @param {number} deltaTime - The elapsed time since the last frame.
 */
export function updateOrbitModeAnimation(deltaTime) {
  orbitingPlanets.forEach(planet => {
    // Update the orbital angle based on speed and deltaTime
    planet.angle += planet.speed * deltaTime;
    // Update the planet's position to create a circular orbit around the Sun
    planet.object.position.x = planet.radius * Math.cos(planet.angle);
    planet.object.position.z = planet.radius * Math.sin(planet.angle);
  });
}
