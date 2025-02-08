// loadOrbitPlanets.js
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { planetData } from "./loadPlanets.js"; 

// -----------------------------------------------------------------
// 1. Orbit Radii
const orbitRadii = {
  mercury: 1500,
  venus: 2300,
  earth: 3100,
  mars: 4400,
  jupiter: 7300,
  saturn: 10700,
  uranus: 15700,
  neptune: 25000,
};

// -----------------------------------------------------------------
// 2. Planet Sizes (Scaled for Visibility)
const orbitPlanetScales = {
  sun: 1000,  // Large Sun for visibility
  mercury: 0.5,
  venus: 0.6,
  earth: 1,
  mars: 0.75,
  jupiter: 900, // More realistic gas giant
  saturn: 0.9,
  uranus: 1.7,
  neptune: 50,
};

// -----------------------------------------------------------------
// 3. Orbital Periods (Realistic)
const orbitalPeriods = {
  mercury: 88,
  venus: 225,
  earth: 365,
  mars: 687,
  jupiter: 4333,
  saturn: 10759,
  uranus: 30687,
  neptune: 60190,
};

// -----------------------------------------------------------------
// 4. Compute Orbit Speeds Dynamically
const baseSpeed = 0.01; // Adjust for animation smoothness
const orbitalSpeeds = {};
Object.keys(orbitalPeriods).forEach((planet) => {
  orbitalSpeeds[planet] = baseSpeed / Math.sqrt(orbitalPeriods[planet]);
});

// -----------------------------------------------------------------
// 4. Simulation Time Warp Factor
// Here we choose the factor such that Earth completes an orbit in roughly 60 seconds.
const simulationSpeedFactor = 525000;

// -----------------------------------------------------------------
// 5. Orbit Animation Data & Flag
let orbitingPlanets = [];
let orbitModeEnabled = false;


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

  // --- Hide the Moon when in Orbit Mode ---
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

    // Set the planet’s scale based on orbitPlanetScales.
    const scale = orbitPlanetScales[planetName];
    planetObj.scale.set(scale, scale, scale);

    // Use a fixed orbit radius for this planet.
    const orbitRadius = orbitRadii[planetName];

    // Create a smooth circle geometry for the orbit line.
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
      linewidth: 1,
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
      paused: false  // Orbiting is active by default
    });
  });

  // --- Adjust the Camera & Controls for a Closer Orbit View ---
camera.position.set(0, 800, 2000);  // New camera position for Orbit Mode
camera.lookAt(0, 0, 0);
if (controls) {
  controls.target.set(0, 0, 0);

  // Update the zoom limits for the new view
  controls.minDistance = 100;    // Allow closer zooming
  controls.maxDistance = 10000;  // Allow farther zooming if needed

  controls.update();  // Ensure OrbitControls recompute their state
}

orbitModeEnabled = true;
console.log("Orbit mode enabled.");

let pauseOrbit = false; // Global flag to pause all orbit animations

export function updateOrbitModeAnimation(deltaTime) {
  if (!orbitModeEnabled || pauseOrbit) return; // Stop animation if paused

  orbitingPlanets.forEach((planet) => {
    // Update only if this planet isn’t paused
    if (!planet.paused) {
      planet.angle += planet.speed * deltaTime;
      const offsetX = planet.radius * Math.cos(planet.angle);
      const offsetZ = planet.radius * Math.sin(planet.angle);
      planet.object.position.set(offsetX, 0, offsetZ);
    }
  });
}

// Function to toggle all orbit animation globally
export function toggleOrbitAnimation(state) {
  pauseOrbit = state;
}

/**
 * Pauses the orbit animation for a specific planet.
 * @param {string} planetName - The name of the planet (case insensitive)
 */
export function pauseOrbitForPlanet(planetName) {
  const planet = orbitingPlanets.find(p => p.object.name.toLowerCase() === planetName.toLowerCase());
  if (planet) {
    planet.paused = true;
  }
}

/**
 * Resumes the orbit animation for a specific planet.
 * @param {string} planetName - The name of the planet (case insensitive)
 */
export function resumeOrbitForPlanet(planetName) {
  const planet = orbitingPlanets.find(p => p.object.name.toLowerCase() === planetName.toLowerCase());
  if (planet) {
    planet.paused = false;
  }
}
