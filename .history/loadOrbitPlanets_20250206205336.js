import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";

// Array to hold orbiting planet data
let orbitingPlanets = [];
const baseOrbitSpeed = 0.05; // base speed factor
const speedFactor = 1e7;     // multiplier to make the orbit speeds visible

/**
 * Prepares the loaded planets for orbit mode.
 * It uses the planet's current position to compute the orbit radius and initial angle.
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
      // Compute the orbit radius from the Sun (assumes Sun is at (0, 0, 0))
      const orbitRadius = planetObj.position.distanceTo(sun.position);
      // Determine the initial angle (in radians) from the current position
      const initialAngle = Math.atan2(planetObj.position.z, planetObj.position.x);
      // Calculate the orbit speed, scaled to make the motion visible
      const orbitSpeed = (baseOrbitSpeed / orbitRadius) * speedFactor;

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
 * Call this function in your main animation loop when Orbit Mode is active.
 *
 * @param {number} deltaTime - The elapsed time (in seconds) since the last frame.
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
