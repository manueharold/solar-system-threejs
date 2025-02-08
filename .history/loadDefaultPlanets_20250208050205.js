// loadDefaultPlanets.js
import { loadPlanets, planetData } from "./loadPlanets.js";
import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

/**
 * Switches from Orbit Mode to Original Mode by:
 *   1. Removing all orbit mode objects (orbit model and orbit lines).
 *   2. Removing every planet (including the Sun) from the scene.
 *   3. Reloading the default planets using the loadPlanets.js logic.
 *   4. Animating the camera back to the original view with Earth as the focus.
 *
 * @param {THREE.Scene} scene - The scene to modify.
 * @param {THREE.PerspectiveCamera} camera - The camera to reposition.
 * @param {OrbitControls} controls - The OrbitControls instance to update.
 */
export async function loadDefaultPlanets(scene, camera, controls) {
  // --- 1. Remove Orbit Mode Objects ---
  // Remove the orbit mode model (if it exists)
  const orbitModel = scene.getObjectByName("orbitModeModel");
  if (orbitModel) {
    scene.remove(orbitModel);
    console.log("Removed orbit mode model.");
  }
  
  // Remove all orbit lines (assumed to use a dashed line material)
  scene.traverse((child) => {
    if (child instanceof THREE.Line && child.material instanceof THREE.LineDashedMaterial) {
      scene.remove(child);
      console.log("Removed an orbit line.");
    }
  });
  
  // --- 2. Remove All Planets (including the Sun) ---
  // Get a list of planet names from planetData
  const planetNames = Object.keys(planetData);
  planetNames.forEach((name) => {
    const planetObj = scene.getObjectByName(name);
    if (planetObj) {
      scene.remove(planetObj);
      console.log(`Removed planet: ${name}`);
    }
  });
  
  // Also remove any default planets group (if it exists)
  const defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
  if (defaultPlanetsGroup) {
    scene.remove(defaultPlanetsGroup);
    console.log("Removed defaultPlanetsGroup.");
  }
  
  // --- 3. Reload Default Planets ---
  // Create a new group to hold the default planets
  const newPlanetsGroup = new THREE.Group();
  newPlanetsGroup.name = "defaultPlanetsGroup";
  scene.add(newPlanetsGroup);
  
  // Use your existing loadPlanets.js logic to load the planets into the new group.
  await loadPlanets(newPlanetsGroup);
  console.log("Default planets loaded via loadPlanets.js.");
  
  // Ensure the new group and its children are visible.
  newPlanetsGroup.visible = true;
  newPlanetsGroup.traverse((child) => {
    child.visible = true;
  });
  
  // --- 4. Reposition the Camera to Focus on Earth ---
  // Attempt to retrieve Earth's object (case insensitive)
  const earth = scene.getObjectByName("earth") || scene.getObjectByName("Earth");
  if (earth) {
    // Get Earth's world position (in case it's nested in a group)
    const earthPosition = new THREE.Vector3();
    earth.getWorldPosition(earthPosition);
    
    // Define an offset so the camera is zoomed out enough.
    const offset = 15000; // Adjust this value as needed
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
      duration: 2, // Adjust the duration (in seconds) as needed
      ease: "power2.out",
      onUpdate: () => {
        // Keep the camera focused on Earth during the transition.
        camera.lookAt(earthPosition);
      },
      onComplete: () => {
        // If using OrbitControls, update its target.
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
