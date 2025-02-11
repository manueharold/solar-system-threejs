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


  // Cancel any GSAP animations that might be affecting the camera/controls
  gsap.killTweensOf(camera.position);
  gsap.killTweensOf(controls.target);

  // Show the loading UI before starting to load Earth.
  const loadingContainer = document.getElementById("loadingContainer");
  if (loadingContainer) {
    loadingContainer.style.display = "block";
  }

  // Reload planets (which re-adds them to the scene)
  await loadPlanets(scene);
  console.log("Default planets reloaded.");

  // Update world matrices before computing bounding boxes.
  scene.updateMatrixWorld(true);
  const earth = scene.getObjectByName("earth");
  if (earth) {
    earth.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(earth);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    console.log("Computed Earth bounding sphere:", sphere);

    const earthCenter = sphere.center;
    // Use a fallback if the computed radius seems too small.
    const computedRadius = sphere.radius;
    const expectedRadius = (planetData.earth.size * planetData.earth.scale) / 2;
    const effectiveRadius = (computedRadius && computedRadius > 0.1)
      ? computedRadius
      : expectedRadius;
    
    // Increase the offset multipliers to ensure the camera is outside Earth.
    const offsetZ = effectiveRadius * 5;
    const offsetY = effectiveRadius * 2;
    
    // Set the camera position and lookAt target.
    camera.position.set(
      earthCenter.x,
      earthCenter.y + offsetY,
      earthCenter.z + offsetZ
    );
    camera.lookAt(earthCenter);
    console.log("Camera set to:", camera.position);

    // Update the OrbitControls target.
    if (controls) {
      controls.target.copy(earthCenter);
      controls.update();
    }
    console.log("Camera adjusted to a safe position outside Earth's model.");
  } else {
    console.warn("Earth not found. Camera position may be incorrect.");
  }

  // Hide the loading UI.
  if (loadingContainer) {
    loadingContainer.style.display = "none";
  }
}
