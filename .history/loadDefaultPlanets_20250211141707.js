import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { loadPlanets, planetData } from "./loadPlanets.js";

export async function loadDefaultPlanets(scene, camera, controls) {
  // ----- Remove Orbit Mode Elements -----
  const orbitModeGroup = scene.getObjectByName("orbitModeGroup");
  if (orbitModeGroup) {
    scene.remove(orbitModeGroup);
    console.log("Removed orbit mode group.");
  }

  scene.traverse((child) => {
    if (
      (child.type === "Line" ||
       child.type === "LineSegments" ||
       child.type === "LineLoop") &&
      child.name &&
      child.name.includes("orbit")
    ) {
      scene.remove(child);
      console.log(`Removed orbit line: ${child.name}`);
    }
  });
  

  // Remove all existing planet objects to prevent duplicates.
  const planetNames = [
    "sun",
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "moon"
  ];
  planetNames.forEach((name) => {
    const obj = scene.getObjectByName(name);
    if (obj) {
      scene.remove(obj);
      console.log(`Removed ${name} from scene.`);
    }
  });

 // ----- Instantly Set the Camera to Earth -----
const earthPosition = new THREE.Vector3(planetData.earth.distance, 0, 0);

// Updated offsets to match loadPlanets.js initial view
const offsetY = 3000;  // Adjusted for proper view
const offsetZ = 15000; // Ensures it's not inside Earth

camera.position.set(
  earthPosition.x,
  earthPosition.y + offsetY,
  earthPosition.z + offsetZ
);
camera.lookAt(earthPosition);
if (controls) {
  controls.target.copy(earthPosition);
  controls.update();
}
console.log("Camera set to match initial loadPlanets.js view.");

  // Show the loading UI before starting to load Earth.
  const loadingContainer = document.getElementById("loadingContainer");
  if (loadingContainer) {
    loadingContainer.style.display = "block";
  }

  // With the camera already positioned at Earth, loadPlanets will add the planets into the scene.
  await loadPlanets(scene);
  console.log("Default planets reloaded.");
}
