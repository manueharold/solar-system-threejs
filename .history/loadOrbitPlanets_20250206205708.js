import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";

// Array to hold orbiting planet data
let orbitingPlanets = [];

/**
 * Tweak these as needed for your visual preference:
 * - baseOrbitSpeed: how quickly planets move around the Sun
 * - distanceScale: scales down massive distances to a manageable size
 */
const baseOrbitSpeed = 0.02;
const distanceScale = 1e-6; // e.g. 1e-6 scales 10,000,000 down to 10

/**
 * Prepares the loaded planets for orbit mode.
 * It uses the planet's current position to compute a smaller orbit radius
 * and initial angle around the Sun, then repositions the planet accordingly.
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
  const planetNames = [
    "mercury", 
    "venus", 
    "earth", 
    "mars", 
    "jupiter", 
    "saturn", 
    "uranus", 
    "neptune"
  ];

  planetNames.forEach((name) => {
    const planetObj = scene.getObjectByName(name);
    if (planetObj) {
      // 1) Compute the original distance from Sun
      const originalRadius = planetObj.position.distanceTo(sun.position);

      // 2) Scale the distance down to keep orbits visible
      const orbitRadius = originalRadius * distanceScale;

      // 3) Compute initial angle from the planet's current position
      const initialAngle = Math.atan2(
        planetObj.position.z,
        planetObj.position.x
      );

      // 4) Orbit speed can be a constant or scaled by orbit radius
      //    e.g. const orbitSpeed = baseOrbitSpeed / orbitRadius;
      const orbitSpeed = baseOrbitSpeed;

      // 5) Reposition planet to the new scaled orbit radius
      planetObj.position.set(
        orbitRadius * Math.cos(initialAngle),
        planetObj.position.y, // keep the same Y if needed
        orbitRadius * Math.sin(initialAngle)
      );

      orbitingPlanets.push({
        object: planetObj,
        radius: orbitRadius,
        angle: initialAngle,
        speed: orbitSpeed,
      });

      console.log(
        `✅ ${name} added for orbiting. ` +
        `Original radius: ${originalRadius.toFixed(2)}, ` +
        `scaled radius: ${orbitRadius.toFixed(2)}, ` +
        `speed: ${orbitSpeed}`
      );
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
  orbitingPlanets.forEach((planet) => {
    // Update the orbital angle based on speed and deltaTime
    planet.angle += planet.speed * deltaTime;

    // Create a circular orbit around the (assumed) origin
    planet.object.position.x = planet.radius * Math.cos(planet.angle);
    planet.object.position.z = planet.radius * Math.sin(planet.angle);
  });
}
