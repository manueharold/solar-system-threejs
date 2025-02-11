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
    const obj = scene.getObjectByName(name);
    if (obj) {
      scene.remove(obj);
      console.log(`Removed ${name} from scene.`);
    }
  });

  // Show the loading UI before starting to load Earth.
  const loadingContainer = document.getElementById("loadingContainer");
  if (loadingContainer) {
    loadingContainer.style.display = "block";
  }

  // With the camera already positioned (temporarily) near Earth,
  // loadPlanets will add the planets into the scene.
  await loadPlanets(scene);
  console.log("Default planets reloaded.");

  const earth = scene.getObjectByName("earth");
if (earth) {
    const box = new THREE.Box3().setFromObject(earth);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const earthCenter = sphere.center;

    // Increase the offset to prevent the camera from being inside Earth
    const offsetZ = sphere.radius * 5;  // Increased multiplier
    const offsetY = sphere.radius * 2;

    camera.position.set(
      earthCenter.x,
      earthCenter.y + offsetY,
      earthCenter.z + offsetZ
    );
    camera.lookAt(earthCenter);

    if (controls) {
      controls.target.copy(earthCenter);
      controls.update();
    }
    console.log("Camera adjusted to a safer position outside Earth's model.");
} else {
    console.warn("Earth not found. Camera position may be incorrect.");
}


  // Hide the loading UI
  if (loadingContainer) {
    loadingContainer.style.display = "none";
  }
}