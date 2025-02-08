// loadOrbitPlanets.js
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";
import { planetData } from './loadPlanets.js';

// Define orbital speeds for each planet (values are arbitrary; adjust as needed)
const orbitalSpeeds = {
  mercury: 0.02,
  venus:   0.015,
  earth:   0.01,
  mars:    0.008,
  jupiter: 0.005,
  saturn:  0.004,
  uranus:  0.003,
  neptune: 0.002,
  moon:    0.03,
};

// Export the loadOrbitPlanets function so that it can be imported in other modules
export function loadOrbitPlanets(scene, camera, controls) {
  // Example: create a simple Sun at the origin if it doesn't already exist.
  if (!scene.getObjectByName("sun")) {
    const sunGeometry = new THREE.SphereGeometry(50, 32, 32); // adjust size as needed
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.name = "sun";
    sun.position.set(0, 0, 0);
    scene.add(sun);
  }

  // For each planet loaded by loadPlanets.js (assumes their names match keys in planetData),
  // initialize orbit properties.
  scene.traverse((child) => {
    if (child.isMesh && child.name && child.name.toLowerCase() !== "sun") {
      const planetName = child.name.toLowerCase();
      if (planetData[planetName]) {
        // Set an initial orbit angle if not already set
        if (child.orbitAngle === undefined) {
          child.orbitAngle = Math.random() * Math.PI * 2;
        }
      }
    }
  });

  // You can add additional setup here if needed (e.g., setting up controls, camera positions, etc.)
  console.log("Switched to Orbit Mode using the loaded planets.");
}

// Optionally, you can also export your update function if needed:
export function updateOrbitModeAnimation(deltaTime, scene) {
  scene.traverse((child) => {
    if (child.isMesh && child.name && child.name.toLowerCase() !== "sun") {
      const planetName = child.name.toLowerCase();
      if (planetData[planetName]) {
        // Update the orbit angle based on the orbital speed
        const speed = orbitalSpeeds[planetName] || 0.01;
        child.orbitAngle += speed * deltaTime;

        // Update the planet's position assuming a circular orbit (modify as needed)
        const orbitRadius = planetData[planetName].distance;
        child.position.x = Math.cos(child.orbitAngle) * orbitRadius;
        child.position.z = Math.sin(child.orbitAngle) * orbitRadius;
      }
    }
  });
}
