import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { loadPlanets, planetData } from "./loadPlanets.js";

export async function loadDefaultPlanets(scene, camera, controls) {
  // ----- Remove Orbit Mode Elements -----
  const orbitModeGroup = scene.getObjectByName("orbitModeGroup");
  if (orbitModeGroup) {
    if (orbitModeGroup.parent) {
      orbitModeGroup.parent.remove(orbitModeGroup);
    } else {
      scene.remove(orbitModeGroup);
    }
    console.log("Removed orbit mode group.");
  }

  // Remove any orbit lines (for both THREE.Line and THREE.LineSegments) in the scene.
  scene.traverse((child) => {
    if ((child.isLine || child.isLineSegments) && child.name && child.name.toLowerCase().includes("orbit")) {
      if (child.parent) {
        child.parent.remove(child);
      } else {
        scene.remove(child);
      }
      console.log(`Removed orbit line: ${child.name}`);
    }
  });

  // Additionally, if the Sun object exists, remove any orbit line among its children.
  const sunObj = scene.getObjectByName("sun");
  if (sunObj) {
    sunObj.traverse((child) => {
      if ((child.isLine || child.isLineSegments) && child.name && child.name.toLowerCase().includes("orbit")) {
        if (child.parent) {
          child.parent.remove(child);
        }
        console.log(`Removed Sun orbit line from Sun: ${child.name}`);
      }
    });
  }

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
      if (obj.parent) {
        obj.parent.remove(obj);
      } else {
        scene.remove(obj);
      }
      console.log(`Removed ${name} from scene.`);
    }
  });

  // ----- Instantly Set the Camera to Earth -----
  // We know from planetData that Earth is positioned at [planetData.earth.distance, 0, 0].
  const earthPosition = new THREE.Vector3(planetData.earth.distance, 0, 0);
  
  // Adjust the offsets depending on the environment.
  // On Vercel, we increase the offsets to avoid the camera starting inside Earth.
  const isVercel = window.location.hostname.includes("vercel");
  const offsetY = isVercel ? 8000 : 5000; // vertical offset
  const offsetZ = isVercel ? 12000 : 8000; // depth offset

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
  console.log("Camera instantly set to Earth initial position.");

  // ----- Load Default Planets with Loading UI for Earth -----
  // Show the loading UI before starting to load Earth.
  const loadingContainer = document.getElementById("loadingContainer");
  if (loadingContainer) {
    loadingContainer.style.display = "block";
  }

  // With the camera already positioned at Earth, loadPlanets will add the planets into the scene.
  await loadPlanets(scene);
  console.log("Default planets reloaded.");

  // Schedule a delayed removal to catch any orbit lines that may be added asynchronously.
  setTimeout(() => {
    scene.traverse((child) => {
      if ((child.isLine || child.isLineSegments) && child.name && child.name.toLowerCase().includes("orbit")) {
        if (child.parent) {
          child.parent.remove(child);
        } else {
          scene.remove(child);
        }
        console.log(`(Delayed) Removed orbit line: ${child.name}`);
      }
    });
    // Also check the Sun's children once more.
    const newSunObj = scene.getObjectByName("sun");
    if (newSunObj) {
      newSunObj.traverse((child) => {
        if ((child.isLine || child.isLineSegments) && child.name && child.name.toLowerCase().includes("orbit")) {
          if (child.parent) {
            child.parent.remove(child);
          }
          console.log(`(Delayed) Removed Sun orbit line: ${child.name}`);
        }
      });
    }
  }, 200);
}
