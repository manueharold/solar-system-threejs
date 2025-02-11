import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";
import { loadPlanets, planetData } from "./loadPlanets.js";

// You can also import orbitPlanetScales if needed, or just hardcode the orbit value for Earth.
const orbitPlanetScales = {
  earth: 1, // The (smaller) scale used during Orbit Mode
};

//
// searchedPlanet: a boolean flag (default false)
//    - false: switching back from Orbit Mode without having searched a planet
//    - true:  switching back after having searched for Earth (or another planet)
//
export async function loadDefaultPlanets(scene, camera, controls, searchedPlanet = false) {
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

  // ----- Reset Earth's Transformation -----
  // Find Earth in the scene.
  const earth = scene.getObjectByName("earth");
  if (earth) {
    // Reset Earth’s position and rotation to the default values.
    earth.position.set(planetData.earth.distance, 0, 0);
    earth.rotation.set(0, 0, 0);

    // Apply one of two scaling logics:
    if (searchedPlanet) {
      // (Case 2) When a planet (Earth) was searched,
      // reset Earth’s scale to the original (larger) default.
      earth.scale.set(
        planetData.earth.scale,
        planetData.earth.scale,
        planetData.earth.scale
      );
      console.log("Earth scale reset to original default due to search.");
    } else {
      // (Case 1) When switching back without a search,
      // keep Earth at the Orbit Mode scale.
      earth.scale.set(
        orbitPlanetScales.earth,
        orbitPlanetScales.earth,
        orbitPlanetScales.earth
      );
      console.log("Earth scale set to Orbit Mode size (no search detected).");
    }
    earth.updateMatrixWorld(true);
  } else {
    console.warn("Earth not found in scene.");
  }

  // ----- Set Camera to Default View -----
  // Use planetData.earth.distance for Earth's intended position.
  const earthPosition = new THREE.Vector3(planetData.earth.distance, 0, 0);
  // The camera offsets below match your initScene defaults.
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
