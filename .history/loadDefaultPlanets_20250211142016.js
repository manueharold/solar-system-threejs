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

  // ----- Adjust the Camera Based on Earth's Bounding Sphere -----
  // Instead of using a fixed offset, we compute Earth’s true center
  // so the camera is positioned outside its model.
  const earth = scene.getObjectByName("earth");
  if (earth) {
    const box = new THREE.Box3().setFromObject(earth);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const earthCenter = sphere.center;
    // Use a factor relative to Earth's bounding sphere radius
    const offsetZ = sphere.radius * 3; // Adjust multiplier as needed
    const offsetY = sphere.radius * 0.5;

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
    console.log("Camera adjusted based on Earth's bounding sphere.");
  } else {
    console.warn("Earth not found. Camera position may be incorrect.");
  }

  // Hide the loading UI
  if (loadingContainer) {
    loadingContainer.style.display = "none";
  }
}