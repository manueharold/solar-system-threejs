// loadOrbitPlanets.js
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { planetData } from "./loadPlanets.js"; 

// ===========================
// 1. Configuration Constants
// ===========================

// Orbit Radii (in scene units)
const orbitRadii = {
  mercury: 1500,
  venus:   2300,
  earth:   3100,
  mars:    4400,
  jupiter: 7300,
  saturn:  10700,
  uranus:  15700,
  neptune: 25000,
};

// Planet Scales for Orbit Mode (for visibility)
const orbitPlanetScales = {
  sun:     1000,  // Large Sun for visibility
  mercury: 0.5,
  venus:   0.6,
  earth:   1,
  mars:    0.75,
  jupiter: 900,   // More realistic gas giant
  saturn:  0.9,
  uranus:  1.7,
  neptune: 50,
};

// Realistic Orbital Periods (in Earth days)
const orbitalPeriods = {
  mercury: 88,
  venus:   225,
  earth:   365,
  mars:    687,
  jupiter: 4333,
  saturn:  10759,
  uranus:  30687,
  neptune: 60190,
};

// Simulation Time Warp Factor – chosen so Earth completes an orbit in ~60 seconds.
const simulationSpeedFactor = 525000;

// ===========================
// 2. Orbit Animation Globals
// ===========================
let orbitingPlanets = [];    // Array to store each planet's orbit data
let orbitModeEnabled = false;
let pauseOrbit = false;      // Global flag to pause/resume all orbit animations

// ===========================
// 3. Helper Functions
// ===========================

/**
 * Creates a dashed circular line representing an orbit.
 *
 * @param {number} orbitRadius - The radius of the orbit.
 * @param {number} [segments=128] - Number of segments to form the circle.
 * @returns {THREE.Line} The dashed orbit line.
 */
function createOrbitLine(orbitRadius, segments = 128) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(
      orbitRadius * Math.cos(theta),
      0,
      orbitRadius * Math.sin(theta)
    ));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineDashedMaterial({
    color: 0x99ccff,  // Soft light blue
    linewidth: 1,
    dashSize: 20,
    gapSize: 10,
    opacity: 0.75,
    transparent: true,
  });
  const line = new THREE.Line(geometry, material);
  line.computeLineDistances();
  return line;
}

// ===========================
// 4. Main Functions
// ===========================

/**
 * Configures the scene for Orbit Mode by repositioning the Sun and planets,
 * setting scales, creating orbit lines, and initializing orbit animation data.
 *
 * @param {THREE.Scene} scene - The Three.js scene.
 * @param {THREE.Camera} camera - The camera to adjust.
 * @param {Object} controls - OrbitControls (if available) to update.
 */
export function loadOrbitPlanets(scene, camera, controls) {
  orbitingPlanets = []; // Reset previous orbit data

  // --- Position the Sun at the center ---
  const sun = scene.getObjectByName("sun");
  if (!sun) {
    console.error("Sun not found in scene!");
    return;
  }
  sun.position.set(0, 0, 0);
  sun.scale.set(orbitPlanetScales.sun, orbitPlanetScales.sun, orbitPlanetScales.sun);

  // --- Hide the Moon in Orbit Mode ---
  const moon = scene.getObjectByName("moon");
  if (moon) {
    moon.visible = false;
  }

  // --- Process each orbiting planet ---
  Object.keys(orbitRadii).forEach((planetName) => {
    const planetObj = scene.getObjectByName(planetName);
    if (!planetObj) {
      console.warn(`Planet "${planetName}" not found in scene.`);
      return;
    }

    // Set the planet's scale (default to 1 if not defined)
    const scale = orbitPlanetScales[planetName] || 1;
    planetObj.scale.set(scale, scale, scale);

    const orbitRadius = orbitRadii[planetName];

    // Add a visual dashed orbit line.
    scene.add(createOrbitLine(orbitRadius));

    // Choose a random starting angle (in radians)
    const initialAngle = Math.random() * Math.PI * 2;

    // Compute the orbit speed using the realistic orbital period.
    // (2π radians divided by period in seconds, then multiplied by the simulation factor)
    const orbitSpeed = (2 * Math.PI) / (orbitalPeriods[planetName] * 86400) * simulationSpeedFactor;

    // Set the planet's initial position along its orbit.
    planetObj.position.set(
      orbitRadius * Math.cos(initialAngle),
      0,
      orbitRadius * Math.sin(initialAngle)
    );

    // Store orbit animation data for this planet.
    orbitingPlanets.push({
      object: planetObj,
      radius: orbitRadius,
      angle: initialAngle,
      speed: orbitSpeed,
      paused: false,  // false means orbiting is active
    });
  });

  // --- Adjust the Camera & Controls for a wider view ---
camera.position.set(0, 1500, 4000);
camera.lookAt(0, 0, 0);
if (controls) {
  controls.target.set(0, 0, 0);
  controls.update();
}

  orbitModeEnabled = true;
  console.log("Orbit mode enabled.");
}

/**
 * Updates the positions of orbiting planets. Call this in your render loop
 * with the elapsed time (deltaTime) to animate the orbits.
 *
 * @param {number} deltaTime - Time elapsed since the last frame (in seconds).
 */
export function updateOrbitModeAnimation(deltaTime) {
  if (!orbitModeEnabled || pauseOrbit) return;
  orbitingPlanets.forEach((planet) => {
    if (!planet.paused) {
      planet.angle += planet.speed * deltaTime;
      planet.object.position.set(
        planet.radius * Math.cos(planet.angle),
        0,
        planet.radius * Math.sin(planet.angle)
      );
    }
  });
}

/**
 * Toggles the global orbit animation pause state.
 *
 * @param {boolean} state - true to pause, false to resume.
 */
export function toggleOrbitAnimation(state) {
  pauseOrbit = state;
}

/**
 * Pauses the orbit animation for a specific planet.
 *
 * @param {string} planetName - Name of the planet (case insensitive).
 */
export function pauseOrbitForPlanet(planetName) {
  const planet = orbitingPlanets.find(
    (p) => p.object.name.toLowerCase() === planetName.toLowerCase()
  );
  if (planet) {
    planet.paused = true;
  }
}

/**
 * Resumes the orbit animation for a specific planet.
 *
 * @param {string} planetName - Name of the planet (case insensitive).
 */
export function resumeOrbitForPlanet(planetName) {
  const planet = orbitingPlanets.find(
    (p) => p.object.name.toLowerCase() === planetName.toLowerCase()
  );
  if (planet) {
    planet.paused = false;
  }
}
