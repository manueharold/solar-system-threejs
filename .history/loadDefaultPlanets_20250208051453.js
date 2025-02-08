import { loadPlanets } from "./loadPlanets.js";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

export async function loadDefaultPlanets(scene, camera, controls) {
  // 1. Remove the Orbit Mode Group (if it exists)
  const orbitModeGroup = scene.getObjectByName("orbitModeGroup");
  if (orbitModeGroup) {
    scene.remove(orbitModeGroup);
    console.log("Removed orbit mode group.");
  }

  // 2. Remove all orbit lines (assumed to be dashed lines)
  scene.traverse(child => {
    if (child instanceof THREE.Line && child.material instanceof THREE.LineDashedMaterial) {
      scene.remove(child);
      console.log("Removed orbit line:", child.name);
    }
  });

  // 3. Remove all existing planets to prevent duplicates.
  // (Assuming your planets are named as in planetData.)
  const planetNames = [
    "sun",
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune"
  ];
  planetNames.forEach(name => {
    const obj = scene.getObjectByName(name);
    if (obj) {
      scene.remove(obj);
      console.log(`Removed ${name} from scene.`);
    }
  });

  // 4. Reload default planets using the existing logic from loadPlanets.js
  await loadPlanets(scene);
  console.log("Default planets reloaded.");

  // 5. Animate (or set) the camera to focus on Earth and zoom out more.
  // Try to find Earth in the scene (by lowercase or uppercase name).
  const earth = scene.getObjectByName("earth") || scene.getObjectByName("Earth");
  if (earth) {
    // Get Earth's world position.
    const earthPos = new THREE.Vector3();
    earth.getWorldPosition(earthPos);

    // Adjust these offset values as needed.
    // Here we set the camera to be much further away from Earth.
    const offsetX = 20000;
    const offsetY = 10000;
    const offsetZ = 20000;

    camera.position.set(earthPos.x + offsetX, earthPos.y + offsetY, earthPos.z + offsetZ);
    camera.lookAt(earthPos);

    if (controls) {
      controls.target.copy(earthPos);
      controls.update();
    }
    console.log("Camera set to focus on Earth with an increased zoom-out.");
  } else {
    console.warn("Earth not found in scene. Using fallback camera position.");
    camera.position.set(0, 2000, 5000);
    camera.lookAt(0, 0, 0);
    if (controls) {
      controls.target.set(0, 0, 0);
      controls.update();
    }
  }
}
