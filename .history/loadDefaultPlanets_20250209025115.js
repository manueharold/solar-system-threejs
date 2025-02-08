// loadDefaultPlanets.js
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { loadPlanets } from "./loadPlanets.js";

export async function loadDefaultPlanets(scene, camera, controls) {
  // ----- Remove Orbit Mode Elements -----
  const orbitModeGroup = scene.getObjectByName("orbitModeGroup");
  if (orbitModeGroup) {
    scene.remove(orbitModeGroup);
    console.log("Removed orbit mode group.");
  }

  // Remove any orbit lines (assuming they’re THREE.Line objects with "orbit" in the name)
  scene.traverse((child) => {
    if (child.type === "Line" && child.name && child.name.includes("orbit")) {
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

  // ----- Load Default Planets -----
  // Wait for loadPlanets to add the default planets into the scene.
  await loadPlanets(scene);
  console.log("Default planets reloaded.");

  // ----- Reposition the Camera Relative to Earth -----
  // Instead of using fixed offsets, we find the Earth object and compute its bounding sphere.
  // This helps us determine Earth’s size so that we can place the camera far enough away.
  const earth = scene.getObjectByName("earth");
  if (earth) {
    // Create a bounding box and then a bounding sphere for Earth.
    const box = new THREE.Box3().setFromObject(earth);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    
    // Choose a safe offset based on Earth’s radius.
    // (Multiply by a factor that you can adjust to get your desired view distance.)
    const safeOffset = sphere.radius * 3; 
    
    // Position the camera offset in both the Y and Z directions.
    // You can adjust this vector if you’d prefer a different view angle.
    const newCameraPos = new THREE.Vector3(
      earth.position.x,
      earth.position.y + safeOffset,
      earth.position.z + safeOffset
    );
    camera.position.copy(newCameraPos);
    camera.lookAt(earth.position);

    if (controls) {
      controls.target.copy(earth.position);
      controls.update();
    }
    console.log("Camera repositioned relative to Earth.");
  } else {
    console.warn("Earth object not found. Camera position not updated.");
  }
}
