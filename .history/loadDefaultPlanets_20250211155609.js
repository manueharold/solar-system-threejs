import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";
import { loadPlanets, planetData, rotationSpeeds } from "./loadPlanets.js";

export async function loadDefaultPlanets(scene, camera, controls) {
  // --- Reset Orbit Mode flag ---
  window.orbitModeEnabled = false;

  // ----- Remove Orbit Mode Elements -----
  const orbitModeGroup = scene.getObjectByName("orbitModeGroup");
  if (orbitModeGroup) {
    scene.remove(orbitModeGroup);
    console.log("Removed orbit mode group.");
  }

  // Remove any orbit-related lines (e.g., for orbits) from the scene.
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

  // ----- Set Rotation Speeds on Each Planet -----
  // For each planet whose name exists in the rotationSpeeds object,
  // assign the rotation speed (in radians per frame) to its userData.
  Object.keys(rotationSpeeds).forEach((planetName) => {
    const planet = scene.getObjectByName(planetName);
    if (planet) {
      planet.userData.rotationSpeed = rotationSpeeds[planetName];
      console.log(
        `Set rotation speed for ${planetName} to ${rotationSpeeds[planetName]} rad per frame`
      );
    }
  });

  // ----- Reset Earth's Transformation -----
  const earth = scene.getObjectByName("earth");
  if (earth) {
    // Position Earth according to its configuration.
    earth.position.set(planetData.earth.distance, 0, 0);

    // Reset Earth’s rotation.
    earth.rotation.set(0, 0, 0);

    // Optionally increase Earth's scale (here we make it 10x larger than its default scale).
    const scaleFactor = 10;
    earth.scale.set(
      planetData.earth.scale * scaleFactor,
      planetData.earth.scale * scaleFactor,
      planetData.earth.scale * scaleFactor
    );

    earth.updateMatrixWorld(true);
    console.log("Earth reset and resized:", earth.position, earth.scale);
  } else {
    console.warn("Earth not found in scene.");
  }

  // ----- Set Camera to Default View -----
  // Use Earth's position from the configuration.
  const earthPosition = new THREE.Vector3(planetData.earth.distance, 0, 0);
  // Offset the camera so it is positioned above and behind Earth.
  camera.position.set(earthPosition.x + 5000, 3000, earthPosition.z + 5000);
  camera.lookAt(earthPosition);
  console.log("Camera set to default view:", camera.position);

  if (controls) {
    controls.target.copy(earthPosition);
    // Set the zoom limits (adjust as needed).
    controls.minDistance = 3000;
    controls.maxDistance = 50000;
    controls.update();
  }

  // Hide the loading UI.
  if (loadingContainer) {
    loadingContainer.style.display = "none";
  }
}
