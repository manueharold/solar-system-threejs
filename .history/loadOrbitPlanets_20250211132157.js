// loadOrbitPlanets.js

import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { planetData } from "./loadPlanets.js"; 

// -----------------------------------------------------------------
// 1. Orbit Radii (Adjusted for Sun Scale 10000)
const orbitRadii = {
  mercury: 1500 * 10,  // 15000
  venus:   2300 * 10,  // 23000
  earth:   3100 * 10,  // 31000
  mars:    4400 * 10,  // 44000
  jupiter: 7300 * 10,  // 73000
  saturn:  10700 * 10, // 107000
  uranus:  15700 * 10, // 157000
  neptune: 25000 * 10, // 250000
};

// -----------------------------------------------------------------
// 2. Planet Sizes (Scaled for Visibility)
const orbitPlanetScales = {
  sun:     10000,  // Large Sun for visibility
  mercury: 0.5,
  venus:   0.6,
  earth:   1,
  mars:    0.75,
  jupiter: 900,    // More realistic gas giant
  saturn:  0.9,
  uranus:  1.7,
  neptune: 50,
};

// -----------------------------------------------------------------
// 3. Orbital Periods (Realistic, in Earth days)
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

// -----------------------------------------------------------------
// 4. Compute Orbit Speeds Dynamically
const baseSpeed = 0.01; // Adjust for animation smoothness
const orbitalSpeeds = {};
Object.keys(orbitalPeriods).forEach(planet => {
  orbitalSpeeds[planet] = baseSpeed / Math.sqrt(orbitalPeriods[planet]);
});

// -----------------------------------------------------------------
// 5. Simulation Time Warp Factor
// Chosen so Earth completes an orbit in roughly 60 seconds.
const simulationSpeedFactor = 525000;

// -----------------------------------------------------------------
// 6. Orbit Animation Data & Flags
let orbitingPlanets = [];
let orbitModeEnabled = false;
let pauseOrbit = false; // Global flag to pause all orbit animations

// -----------------------------------------------------------------
/**
 * Creates a dashed circular orbit line for a given radius.
 *
 * @param {number} radius - The radius of the orbit.
 * @param {number} [segments=128] - The number of segments to define the circle.
 * @returns {THREE.Line} - The dashed orbit line.
 */
const createOrbitLine = (radius, segments = 128) => {
  const orbitPoints = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    orbitPoints.push(new THREE.Vector3(
      radius * Math.cos(theta),
      0,
      radius * Math.sin(theta)
    ));
  }
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  const orbitMaterial = new THREE.LineDashedMaterial({
    color: 0x99ccff,      // A soft, light blue
    linewidth: 1,
    dashSize: 20,
    gapSize: 10,
    opacity: 0.75,
    transparent: true,
  });
  const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
  orbitLine.computeLineDistances();
  return orbitLine;
};

/**
 * Repositions the Sun and planets for orbit mode.
 * - Moves the Sun to the origin and scales it.
 * - Hides the Moon.
 * - For each orbiting planet, positions it along a circular orbit with a random starting angle,
 *   creates its orbit line, and stores animation data.
 * - Adjusts the camera and controls for a proper view of the system.
 *
 * @param {THREE.Scene} scene - The scene containing the planets.
 * @param {THREE.Camera} camera - The camera to adjust.
 * @param {Object} controls - The OrbitControls instance.
 */
export const loadOrbitPlanets = (scene, camera, controls) => {
  // Clear any previous orbit data.
  orbitingPlanets = [];

  // --- Place the Sun at the center ---
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
  Object.keys(orbitRadii).forEach(planetName => {
    const planetObj = scene.getObjectByName(planetName);
    if (!planetObj) {
      console.warn(`Planet "${planetName}" not found in scene.`);
      return;
    }

    // Set the planet's scale for visibility.
    const scale = orbitPlanetScales[planetName];
    planetObj.scale.set(scale, scale, scale);

    // Fixed orbit radius for this planet.
    const orbitRadius = orbitRadii[planetName];

    // Create and add the orbit line for visual effect.
    const orbitLine = createOrbitLine(orbitRadius);
    scene.add(orbitLine);

    // Choose a random starting angle (in radians).
    const initialAngle = Math.random() * Math.PI * 2;

    // Compute the orbit speed based on realistic orbital period and simulation speed.
    const orbitSpeed = (2 * Math.PI) / (orbitalPeriods[planetName] * 86400) * simulationSpeedFactor;

    // Set the initial position along the orbit.
    const offsetX = orbitRadius * Math.cos(initialAngle);
    const offsetZ = orbitRadius * Math.sin(initialAngle);
    planetObj.position.set(offsetX, 0, offsetZ);

    // Store the planet's orbit data for animation updates.
    orbitingPlanets.push({
      object: planetObj,
      radius: orbitRadius,
      angle: initialAngle,
      speed: orbitSpeed,
      paused: false,
    });
  });

  // --- Adjust the Camera & Controls ---
  camera.position.set(0, 10000, 15000); // Approximately 18,027 units from the origin.
  camera.lookAt(0, 0, 0);
  if (controls) {
    controls.target.set(0, 0, 0);
    controls.minDistance = 6000;
    controls.maxDistance = 300000;
    controls.update();
  }

  orbitModeEnabled = true;
  console.log("Orbit mode enabled.");
};

/**
 * Updates the orbit animation for all orbiting planets.
 *
 * @param {number} deltaTime - Elapsed time since the last update.
 */
export const updateOrbitModeAnimation = (deltaTime) => {
  if (!orbitModeEnabled || pauseOrbit) return;

  orbitingPlanets.forEach(planet => {
    if (!planet.paused) {
      planet.angle += planet.speed * deltaTime;
      const offsetX = planet.radius * Math.cos(planet.angle);
      const offsetZ = planet.radius * Math.sin(planet.angle);
      planet.object.position.set(offsetX, 0, offsetZ);
    }
  });
};

/**
 * Toggles the global orbit animation pause state.
 *
 * @param {boolean} state - True to pause orbit animations, false to resume.
 */
export const toggleOrbitAnimation = (state) => {
  pauseOrbit = state;
};

/**
 * Pauses the orbit animation for a specific planet.
 *
 * @param {string} planetName - The name of the planet (case insensitive).
 */
export const pauseOrbitForPlanet = (planetName) => {
  const planet = orbitingPlanets.find(p =>
    p.object.name.toLowerCase() === planetName.toLowerCase()
  );
  if (planet) {
    planet.paused = true;
  }
};

/**
 * Resumes the orbit animation for a specific planet.
 *
 * @param {string} planetName - The name of the planet (case insensitive).
 */
export const resumeOrbitForPlanet = (planetName) => {
  const planet = orbitingPlanets.find(p =>
    p.object.name.toLowerCase() === planetName.toLowerCase()
  );
  if (planet) {
    planet.paused = false;
  }
};
