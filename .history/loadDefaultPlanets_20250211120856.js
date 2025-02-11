import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { loadPlanets, planetData } from "./loadPlanets.js";

export async function loadDefaultPlanets(scene, camera, controls) {
  // ----- Remove Orbit Mode Elements -----
  const orbitModeGroup = scene.getObjectByName("orbitModeGroup");
  if (orbitModeGroup) {
    scene.remove(orbitModeGroup);
    console.log("Removed orbit mode group.");
  }

  // Remove all orbit lines to ensure no orbits remain
  const objectsToRemove = [];
  scene.traverse((child) => {
    if (
      child.type === "Line" ||
      child.type === "LineSegments" ||
      child.type === "LineLoop" ||
      (child.userData && child.userData.isOrbitLine)
    ) {
      objectsToRemove.push(child);
    }
  });

  objectsToRemove.forEach((child) => {
    scene.remove(child);
    console.log(`Removed orbit line: ${child.name || "Unnamed Orbit Line"}`);
  });

  // Remove existing planet objects to prevent duplicates.
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
    "moon",
  ];
  planetNames.forEach((name) => {
    const obj = scene.getObjectByName(name);
    if (obj) {
      scene.remove(obj);
      console.log(`Removed ${name} from scene.`);
    }
  });

  await loadPlanets(scene);
  console.log("Default planets reloaded.");
}

