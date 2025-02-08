// loadDefaultPlanets.js
import { loadPlanets, planetData } from "./loadPlanets.js";
import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

/**
 * Switches from Orbit Mode to Original Mode by:
 *   1. Removing all orbit mode objects (orbit model and orbit lines).
 *   2. Removing every planet (including the Sun) from the scene.
 *   3. Reloading the default planets using the loadPlanets.js logic.
 *   4. Animating the camera back to its original view with Earth as the focus.
 *
 * @param {THREE.Scene} scene - The scene to modify.
 * @param {THREE.PerspectiveCamera} camera - The camera to reposition.
 * @param {OrbitControls} controls - The OrbitControls instance to update.
 */
export async function loadDefaultPlanets(scene, camera, controls) {
  // --- Early Check: Ensure scene is defined ---
  if (!scene) {
    console.error("loadDefaultPlanets: 'scene' is undefined. Please pass a valid THREE.Scene instance.");
    return;
  }

  // --- 1. Remove Orbit Mode Objects ---
  // Remove the orbit mode model if it exists.
  const orbitModel = scene.getObjectByName("orbitModeModel");
  if (orbitModel) {
    scene.remove(orbitModel);
    console.log("Removed orbit mode model.");
  }
  
  // Remove all orbit lines (assumed to be dashed lines).
  scene.traverse((child) => {
    if (child instanceof THREE.Line && child.material instanceof THREE.LineDashedMaterial) {
      scene.remove(child);
      console.log("Removed an orbit line.");
    }
  });
  
  // --- 2. Remove All Planets (including the Sun) ---
  const planetNames = Object.keys(planetData);
  planetNames.forEach((name) => {
    const planetObj = scene.getObjectByName(name);
    if (planetObj) {
      scene.remove(planetObj);
      console.log(`Removed planet: ${name}`);
    }
  });
  
  // Also remove any existing default planets group.
  let defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
  if (defaultPlanetsGroup) {
    scene.remove(defaultPlanetsGroup);
    console.log("Removed defaultPlanetsGroup.");
  }
  
  // --- 3. Reload Default Planets ---
  // Create a new group to hold the default planets.
  defaultPlanetsGroup = new THREE.Group();
  defaultPlanetsGroup.name = "defaultPlanetsGroup";
  scene.add(defaultPlanetsGroup);
  
  // Use your loadPlanets.js logic to load the planets into the new group.
  await loadPlanets(defaultPlanetsGroup);
  console.log("Default planets loaded via loadPlanets.js.");
  
  // Ensure the new group and its children are visible.
  defaultPlanetsGroup.visible = true;
  defaultPlanetsGroup.traverse((child) => {
    child.visible = true;
  });
  
  // --- 4. Reposition the Camera to Focus on Earth ---
  // Retrieve Earth's object (using either lowercase or uppercase).
  const earth = scene.getObjectByName("earth") || scene.getObjectByName("Earth");
  if (earth) {
    // Get Earth's world position (in case it's nested in a group).
    const earthPosition = new THREE.Vector3();
    earth.getWorldPosition(earthPosition);
    
    // Define an offset so the camera is zoomed out enough.
    const offset = 15000; // Adjust this value as needed.
    const targetPosition = new THREE.Vector3(
      earthPosition.x + offset,
      earthPosition.y + offset * 0.5,
      earthPosition.z + offset
    );
    
    // Animate the camera to smoothly transition to the target position.
    gsap.to(camera.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: 2, // Adjust duration (in seconds) as needed.
      ease: "power2.out",
      onUpdate: () => {
        // Keep the camera focused on Earth during the transition.
        camera.lookAt(earthPosition);
      },
      onComplete: () => {
        // If OrbitControls are in use, update its target.
        if (controls) {
          controls.target.copy(earthPosition);
          controls.update();
        }
        console.log("Camera transitioned to focus on Earth.");
      }
    });
  } else {
    console.warn("Earth not found in scene after reloading default planets.");
  }
}
