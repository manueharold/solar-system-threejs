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

  // Show the loading UI.
  const loadingContainer = document.getElementById("loadingContainer");
  if (loadingContainer) {
    loadingContainer.style.display = "block";
  }

  // Reload planets (which re-adds them to the scene)
  await loadPlanets(scene);
  console.log("Default planets reloaded.");

  // Instead of computing Earth's bounding sphere (which might be influenced by orbit mode),
  // use a static offset based on known planetData values.
  // Assume Earth is placed at or near the origin in default mode.
  const earthRadius = (planetData.earth.size * planetData.earth.scale) / 2;
  const offsetZ = earthRadius * 5; // adjust multiplier as needed
  const offsetY = earthRadius * 2;
  const defaultEarthCenter = new THREE.Vector3(0, 0, 0);

  camera.position.set(defaultEarthCenter.x, defaultEarthCenter.y + offsetY, defaultEarthCenter.z + offsetZ);
  camera.lookAt(defaultEarthCenter);
  console.log("Camera set to:", camera.position);

  if (controls) {
    controls.target.copy(defaultEarthCenter);
    controls.update();
  }

  // Hide the loading UI.
  if (loadingContainer) {
    loadingContainer.style.display = "none";
  }
}
