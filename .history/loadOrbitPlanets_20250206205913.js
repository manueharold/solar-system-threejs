import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

let orbitingPlanets = [];
const distanceScale = 1e-6; // Adjust as needed
const baseOrbitSpeed = 0.02;

export function loadOrbitPlanets(scene) {
  const sun = scene.getObjectByName("sun");
  if (!sun) {
    console.error("Sun not found!");
    return;
  }

  orbitingPlanets = [];
  const planetNames = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"];

  planetNames.forEach((name) => {
    const planetObj = scene.getObjectByName(name);
    if (planetObj) {
      // Original distance from the Sun
      const originalRadius = planetObj.position.distanceTo(sun.position);

      // Scale it down
      const orbitRadius = originalRadius * distanceScale;

      // Add a random angle offset so they don't all start on the same side
      const randomOffset = Math.random() * Math.PI * 2;
      const initialAngle = Math.atan2(planetObj.position.z, planetObj.position.x) + randomOffset;

      // Speed can be constant or inversely proportional to radius
      const orbitSpeed = baseOrbitSpeed;

      // Reposition to the new orbit radius at that angle
      planetObj.position.set(
        orbitRadius * Math.cos(initialAngle),
        planetObj.position.y, // keep Y the same if you like
        orbitRadius * Math.sin(initialAngle)
      );

      orbitingPlanets.push({
        object: planetObj,
        radius: orbitRadius,
        angle: initialAngle,
        speed: orbitSpeed,
      });

      console.log(`${name} -> Original dist: ${originalRadius}, scaled: ${orbitRadius}, angle: ${initialAngle}`);
    }
  });
}

export function updateOrbitModeAnimation(deltaTime) {
  orbitingPlanets.forEach((planet) => {
    planet.angle += planet.speed * deltaTime;
    planet.object.position.x = planet.radius * Math.cos(planet.angle);
    planet.object.position.z = planet.radius * Math.sin(planet.angle);
  });
}
