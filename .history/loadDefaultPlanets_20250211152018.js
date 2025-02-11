import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";
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
    const objectsToRemove = [];
    scene.traverse((child) => {
      if (child.name === name) {
        objectsToRemove.push(child);
      }
    });
    objectsToRemove.forEach((obj) => {
      scene.remove(obj);
      console.log(`Removed ${obj.name} from scene.`);
    });
  });

  // Cancel any GSAP animations that might be affecting the camera/controls.
  gsap.killTweensOf(camera.position);
  gsap.killTweensOf(controls.target);

  // Show the loading UI before starting to load planets.
  const loadingContainer = document.getElementById("loadingContainer");
  if (loadingContainer) {
    loadingContainer.style.display = "block";
  }

  // Reload planets (which re-adds them to the scene).
  await loadPlanets(scene);
  console.log("Default planets reloaded.");

  // ---- Set Camera to Default View ----
  // Use planetData.earth.distance for Earth's position.
  const earthPosition = new THREE.Vector3(planetData.earth.distance, 0, 0);
  // Adjust camera position relative to Earth.
  // These offset values match your initScene defaults.
  camera.position.set(earthPosition.x + 5000, 3000, earthPosition.z + 5000);
  camera.lookAt(earthPosition);
  console.log("Camera set to default view:", camera.position);

  if (controls) {
    controls.target.copy(earthPosition);
    controls.update();
  }

  // Hide the loading UI.
  if (loadingContainer) {
    loadingContainer.style.display = "none";
  }
}
