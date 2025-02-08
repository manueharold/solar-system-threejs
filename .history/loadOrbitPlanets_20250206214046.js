// loadOrbitPlanets.js
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { planetData } from "./loadPlanets.js"; 

// -----------------------------------------------------------------
// 1. Orbit Radii
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
const sunOrbitScale = 20;
const orbitPlanetScales = {
  sun: sunOrbitScale,
  mercury: sunOrbitScale * (planetData.mercury.size / planetData.sun.size) * 1.0,
  venus: sunOrbitScale * (planetData.venus.size / planetData.sun.size) * 0.62,
  earth: sunOrbitScale * (planetData.earth.size / planetData.sun.size) * 0.7,
  mars: sunOrbitScale * (planetData.mars.size / planetData.sun.size) * 0.92,
  jupiter: sunOrbitScale * (planetData.jupiter.size / planetData.sun.size) * 0.17,
  saturn: sunOrbitScale * (planetData.saturn.size / planetData.sun.size) * 0.18,
  uranus: sunOrbitScale * (planetData.uranus.size / planetData.sun.size) * 0.34,
  neptune: sunOrbitScale * (planetData.neptune.size / planetData.sun.size) * 0.34,
};

// -----------------------------------------------------------------
// 3. Orbit Animation Data & Flag
let orbitingPlanets = [];
let orbitModeEnabled = false;

// -----------------------------------------------------------------
/**
 * Repositions the Sun and planets for orbit mode.
 * - Moves the Sun to (0,0,0) and scales it based on orbitPlanetScales.
 * - For each planet, places it along a circular orbit with a random starting angle.
 * - Adds orbit lines for visual effect.
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

    // Set the planet’s scale based on orbitPlanetScales.
    const scale = orbitPlanetScales[planetName];
    planetObj.scale.set(scale, scale, scale);

    // Use a fixed orbit radius for this planet.
    const orbitRadius = orbitRadii[planetName];

    // Create orbit lines for each planet (using RingGeometry)
    const orbitGeometry = new THREE.RingGeometry(orbitRadius - 10, orbitRadius + 10, 64);
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x808080, opacity: 0.5, transparent: true });
    const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);
    scene.add(orbitLine);

    // Choose a random starting angle (in radians)
    const initialAngle = Math.random() * Math.PI * 2;

    // Compute an orbit speed
    const orbitSpeed = 0.02 / Math.sqrt(orbitRadius);

    // Initial position for the planet
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
 */
export function updateOrbitModeAnimation(deltaTime) {
  if (!orbitModeEnabled) return;

  orbitingPlanets.forEach((planet) => {
    // Increment the orbit angle based on its speed and the elapsed time.
    planet.angle += planet.speed * deltaTime;
    // Recompute the position along the orbit.
    const offsetX = planet.radius * Math.cos(planet.angle);
    const offsetZ = planet.radius * Math.sin(planet.angle);
    planet.object.position.set(offsetX, 0, offsetZ);
  });
}
