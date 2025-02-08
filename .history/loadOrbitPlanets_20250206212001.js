import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// ===== New Constants for Orbit Mode =====

// These orbit radii and scales are for the orbit mode only.
// (They are independent from your realistic planetData values.)
const orbitRadii = {
    mercury: 100,
    venus: 140,
    earth: 180,
    mars: 200,
    jupiter: 240,
    saturn: 280,
    uranus: 320,
    neptune: 400,
};

  
const orbitPlanetScales = {
    sun: 8,      // Reduce the Sun size slightly
    mercury: 0.3, // Reduce all planets by around 30%-50%
    venus: 0.5,
    earth: 0.6,
    mars: 0.4,
    jupiter: 1.5, // Jupiter is still large but less overwhelming
    saturn: 1.2,
    uranus: 1,
    neptune: 0.9,
};

  
  const baseOrbitSpeed = 0.02; // You can adjust this value
  
  // An array to store orbit data for each planet
  let orbitingPlanets = [];
  
  // A flag so you know if orbit mode is active
  let orbitModeEnabled = false;
  
  // ===== Function to Enable Orbit Mode =====
  /**
   * Repositions the Sun and planets for orbit mode.
   * - Moves the Sun to (0,0,0) with a fixed scale.
   * - For each planet (mercury, venus, earth, mars, jupiter, saturn, uranus, neptune),
   *   it sets a fixed scale and positions it on a circular orbit (with a random starting angle).
   * - Adjusts the camera and OrbitControls target so that (0,0,0) is centered.
   *
   * @param {THREE.Scene} scene - Your scene containing the planets.
   * @param {THREE.PerspectiveCamera} camera - Your main camera.
   * @param {OrbitControls} controls - Your OrbitControls instance.
   */
  export function loadOrbitPlanets(scene, camera, controls) {
    orbitingPlanets = []; // Clear any previous orbit data
  
    // Move the Sun to (0,0,0)
    const sun = scene.getObjectByName("sun");
    if (!sun) {
      console.error("Sun not found in scene!");
      return;
    }
    sun.position.set(0, 0, 0);
    sun.scale.set(orbitPlanetScales.sun, orbitPlanetScales.sun, orbitPlanetScales.sun);
  
    // For each planet with an orbit, reposition it
    Object.keys(orbitRadii).forEach((planetName) => {
      const planetObj = scene.getObjectByName(planetName);
      if (!planetObj) {
        console.warn(`Planet "${planetName}" not found in scene.`);
        return;
      }
  
      // Set fixed scale for orbit mode
      const scale = orbitPlanetScales[planetName];
      planetObj.scale.set(scale, scale, scale);
  
      // Use a fixed orbit radius (from our simplified orbitRadii)
      const orbitRadius = orbitRadii[planetName];
  
      // Choose a random starting angle to spread them out
      const initialAngle = Math.random() * Math.PI * 2;
  
      // A constant orbit speed (you can adjust how speed scales with orbit radius)
      const orbitSpeed = baseOrbitSpeed / Math.sqrt(orbitRadius);
  
      // Compute initial position relative to the Sun at (0,0,0)
      const offsetX = orbitRadius * Math.cos(initialAngle);
      const offsetZ = orbitRadius * Math.sin(initialAngle);
      planetObj.position.set(offsetX, 0, offsetZ);
  
      // Save orbit information so we can update positions later
      orbitingPlanets.push({
        object: planetObj,
        radius: orbitRadius,
        angle: initialAngle,
        speed: orbitSpeed,
      });
    });
  
    // (Optional) Adjust the camera to a fixed position that shows the orbits.
    // Here we choose a position high above and back so the orbits are clearly visible.
    camera.position.set(0, 50, 120);
    camera.lookAt(0, 0, 0);
  
    // If you use OrbitControls, update its target to (0,0,0) and call update().
    if (controls) {
      controls.target.set(0, 0, 0);
      controls.update();
    }
  
    orbitModeEnabled = true;
    console.log("Orbit mode enabled.");
  }
  
  /**
   * Call this function in your main render loop if orbit mode is active.
   *
   * @param {number} deltaTime - Elapsed time since the last frame (in seconds).
   */
  export function updateOrbitModeAnimation(deltaTime) {
    if (!orbitModeEnabled) return;
  
    orbitingPlanets.forEach((planet) => {
      // Increment the orbit angle based on its speed and deltaTime
      planet.angle += planet.speed * deltaTime;
      // Calculate the new position along the orbit
      const offsetX = planet.radius * Math.cos(planet.angle);
      const offsetZ = planet.radius * Math.sin(planet.angle);
      planet.object.position.set(offsetX, 0, offsetZ);
    });
  }
  
