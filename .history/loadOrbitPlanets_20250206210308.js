import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// Array to hold orbiting planet data
let orbitingPlanets = [];

/**
 * Tweak these as needed for your visual preference:
 * - baseOrbitSpeed: how quickly planets move around the Sun
 * - distanceScale: scales down massive distances so orbits are visible
 */
const distanceScale = 1e-6;
const baseOrbitSpeed = 0.02;

/**
 * Prepares the loaded planets for orbit mode.
 * It uses each planet's current distance from the Sun, scales it down,
 * calculates a random angle offset, and repositions them so they orbit
 * around the Sun's actual position.
 *
 * @param {THREE.Scene} scene - The scene containing the Sun and planets.
 */
export function loadOrbitPlanets(scene) {
  const sun = scene.getObjectByName("sun");
  if (!sun) {
    console.error("Sun not found!");
    return;
  }

  // Clear any previous orbiting data
  orbitingPlanets = [];

  // Only orbit these main planets (exclude sun/moon)
  const planetNames = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"];

  planetNames.forEach((name) => {
    const planetObj = scene.getObjectByName(name);
    if (planetObj) {
      // 1) Compute original distance from the Sun
      const originalRadius = planetObj.position.distanceTo(sun.position);

      // 2) Scale the distance down to keep orbits visible
      const orbitRadius = originalRadius * distanceScale;

      // 3) Compute an initial angle from the planet's position
      //    relative to the Sun, plus a random offset so they
      //    don't all start in the same direction
      const randomOffset = Math.random() * Math.PI * 2;
      const initialAngle = Math.atan2(
        planetObj.position.z - sun.position.z,
        planetObj.position.x - sun.position.x
      ) + randomOffset;

      // 4) Orbit speed can be constant or scaled by distance
      const orbitSpeed = baseOrbitSpeed;

      // 5) Reposition the planet so it is orbitRadius away
      //    from the Sun at that initial angle
      const offsetX = orbitRadius * Math.cos(initialAngle);
      const offsetZ = orbitRadius * Math.sin(initialAngle);
      planetObj.position.set(
        sun.position.x + offsetX,
        planetObj.position.y, // keep original Y
        sun.position.z + offsetZ
      );

      // Store data so we can animate
      orbitingPlanets.push({
        object: planetObj,
        sun,            // reference to the sun object
        radius: orbitRadius,
        angle: initialAngle,
        speed: orbitSpeed
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
    const { sun, radius, speed } = planet;

    // Increase the angle by orbit speed * deltaTime
    planet.angle += speed * deltaTime;

    // Calculate the new offset from the Sun
    const offsetX = radius * Math.cos(planet.angle);
    const offsetZ = radius * Math.sin(planet.angle);

    // Reposition the planet around the Sun
    planet.object.position.x = sun.position.x + offsetX;
    planet.object.position.z = sun.position.z + offsetZ;
  });
}
