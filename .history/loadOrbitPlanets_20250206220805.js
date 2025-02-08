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

const orbitPlanetScales = {
  sun: 1000, // Keep Sun size separate
  mercury: 0.1,
  venus: 0.2,
  earth: 0.3,
  mars: 0.4,
  jupiter: 0.5, // Slightly reduced
  saturn: 0.06,
  uranus: 0.05,
  neptune: planetData.neptune.size * (0.6),
};

// -----------------------------------------------------------------
// 3. Realistic Orbital Periods (in Earth days)
// Data source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/
const orbitalPeriods = {
  mercury: 200,
  venus: 300,
  earth: 365,
  mars: 687,
  jupiter: 4333,
  saturn: 10759,
  uranus: 30687,
  neptune: 60190,
};

// -----------------------------------------------------------------
// 4. Simulation Time Warp Factor
// Here we choose the factor such that Earth completes an orbit in roughly 60 seconds.
const simulationSpeedFactor = 525000;

// -----------------------------------------------------------------
// 5. Orbit Animation Data & Flag
let orbitingPlanets = [];
let orbitModeEnabled = false;

// -----------------------------------------------------------------
/**
 * Repositions the Sun and planets for orbit mode.
 * - Moves the Sun to (0,0,0) and scales it based on orbitPlanetScales.
 * - For each planet, places it along a circular orbit with a random starting angle.
 * - Adds enhanced orbit lines for visual effect.
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

    // Create a smooth circle geometry for the orbit line.
    // Using 128 segments to make it smooth.
    const segments = 128;
    const orbitPoints = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      orbitPoints.push(new THREE.Vector3(orbitRadius * Math.cos(theta), 0, orbitRadius * Math.sin(theta)));
    }
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);

    // Use a dashed line material with enhanced color and dash properties.
    const orbitMaterial = new THREE.LineDashedMaterial({
      color: 0x99ccff,      // A soft, light blue
      linewidth: 1,         // Note: linewidth might not work in all browsers/environments
      dashSize: 20,
      gapSize: 10,
      opacity: 0.75,
      transparent: true,
    });

    // Create the line and compute dash distances.
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    orbitLine.computeLineDistances();
    scene.add(orbitLine);

    // Choose a random starting angle (in radians)
    const initialAngle = Math.random() * Math.PI * 2;

    // Compute the orbit speed using the realistic orbital period.
    const orbitSpeed = (2 * Math.PI) / (orbitalPeriods[planetName] * 86400) * simulationSpeedFactor;

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
 * Example usage in your main render loop:
 * 
 * function animate(time) {
 *   requestAnimationFrame(animate);
 *   const deltaTime = clock.getDelta();
 *   updateOrbitModeAnimation(deltaTime);
 *   renderer.render(scene, camera);
 * }
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
