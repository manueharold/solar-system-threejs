import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { loadPlanets, planetData } from "./loadPlanets.js";

export async function loadDefaultPlanets(scene, camera, controls) {
  // --- Remove Orbit Mode Elements ---

  // Remove the orbit mode group if it exists
  const orbitModeGroup = scene.getObjectByName("orbitModeGroup");
  if (orbitModeGroup) {
    scene.remove(orbitModeGroup);
    console.log("Removed orbit mode group.");
  }

  // Create a Set of planet names for fast lookup
  const planetNameSet = new Set([
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
  ]);

  // Remove orbit lines and planet objects in one pass by filtering the top-level children.
  // (Assumes that these objects were added directly to scene.children.)
  const objectsToRemove = scene.children.filter(child => {
    const isOrbitLine = (child.type === "Line" && child.name && child.name.includes("orbit"));
    const isPlanet    = planetNameSet.has(child.name);
    return isOrbitLine || isPlanet;
  });

  // Dispose and remove each object found
  objectsToRemove.forEach(obj => {
    // Dispose geometry and materials for every mesh in this object's hierarchy.
    obj.traverse(child => {
      if (child.isMesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      }
    });
    scene.remove(obj);
    console.log(`Removed ${obj.name} from scene and cleared memory.`);
  });

  // --- Load the Default Planets ---
  await loadPlanets(scene);
  console.log("Default planets reloaded.");

  // --- Reposition the Camera ---
  const earthPosition = new THREE.Vector3(planetData.earth.distance, 0, 0);
  const offsetY = 5000; // vertical offset
  const offsetZ = 8000; // depth offset

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

  console.log("Camera repositioned after planets are loaded.");
}
