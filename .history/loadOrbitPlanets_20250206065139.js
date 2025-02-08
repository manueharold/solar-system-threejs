// loadOrbitPlanets.js
import { planetData } from './loadPlanets.js';

// Define orbital speeds for each planet (in radians per second)
// (These values are arbitrary—you can adjust them to taste.)
const orbitalSpeeds = {
  mercury: 0.02,
  venus:   0.015,
  earth:   0.01,
  mars:    0.008,
  jupiter: 0.005,
  saturn:  0.004,
  uranus:  0.003,
  neptune: 0.002,
  // You might want a different speed for the moon:
  moon:    0.03,
};

export function updateOrbitModeAnimation(deltaTime, scene) {
  // Traverse the scene and update any object whose name matches a planet in planetData.
  scene.traverse((child) => {
    // We assume your planet meshes have their name property set (e.g., "earth", "mars", etc.)
    if (child.isMesh && child.name) {
      const planetName = child.name.toLowerCase();

      // Skip the Sun (assumed to have the name "sun")
      if (planetName === 'sun') return;

      // Make sure this planet is one we want to orbit (i.e. it exists in our planetData)
      if (planetData[planetName]) {
        // Initialize a custom property for the orbit angle if it doesn't exist.
        if (child.orbitAngle === undefined) {
          // Start at a random angle to avoid all planets lining up.
          child.orbitAngle = Math.random() * Math.PI * 2;
        }

        // Get the orbital speed (if not defined, use a default of 0.01).
        const speed = orbitalSpeeds[planetName] || 0.01;
        child.orbitAngle += speed * deltaTime;

        // The orbit radius will be taken from your planetData.
        // (If the values in planetData are too large or too small for your scene,
        //  you might need to apply a scaling factor.)
        const orbitRadius = planetData[planetName].distance;

        // Update the planet's position (assuming a circular orbit in the XZ plane)
        child.position.x = Math.cos(child.orbitAngle) * orbitRadius;
        child.position.z = Math.sin(child.orbitAngle) * orbitRadius;
        // Optionally keep Y the same (or add a slight tilt if desired)
      }
    }
  });
}
