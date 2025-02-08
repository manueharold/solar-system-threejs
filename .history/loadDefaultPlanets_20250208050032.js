// loadDefaultPlanets.js
import { loadPlanets } from "./loadPlanets.js";
import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

/**
 * Switches from Orbit Mode back to Original Mode.
 * - Removes all orbit mode objects (orbit model and orbit lines).
 * - Reloads the default planets (using loadPlanets.js) into a new group.
 * - Smoothly repositions the camera to focus on Earth (the initial view).
 *
 * @param {THREE.Scene} scene - The scene to modify.
 * @param {THREE.PerspectiveCamera} camera - The camera to reposition.
 * @param {OrbitControls} controls - The OrbitControls instance to update.
 */
export async function loadDefaultPlanets(scene, camera, controls) {
  // --- Remove Orbit Mode Objects ---
  // Remove the orbit mode model if it exists.
  const orbitModel = scene.getObjectByName("orbitModeModel");
  if (orbitModel) {
    scene.remove(orbitModel);
    console.log("Orbit mode model removed.");
  }
  
  // Remove all orbit lines (assumed to be dashed lines).
  const orbitLines = [];
  scene.traverse((child) => {
    if (child instanceof THREE.Line && child.material instanceof THREE.LineDashedMaterial) {
      orbitLines.push(child);
    }
  });
  orbitLines.forEach((line) => {
    scene.remove(line);
    console.log("Orbit line removed.");
  });
  
  // Ensure the Moon is visible (it is hidden in Orbit Mode).
  const moon = scene.getObjectByName("moon");
  if (moon) {
    moon.visible = true;
  }
  
  // --- Remove Existing Default Planets Group (if any) ---
  let defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
  if (defaultPlanetsGroup) {
    scene.remove(defaultPlanetsGroup);
    console.log("Existing defaultPlanetsGroup removed.");
  }
  
  // --- Reload Default Planets ---
  defaultPlanetsGroup = new THREE.Group();
  defaultPlanetsGroup.name = "defaultPlanetsGroup";
  scene.add(defaultPlanetsGroup);
  
  // Use your existing loadPlanets.js logic to load the planets into the new group.
  await loadPlanets(defaultPlanetsGroup);
  console.log("Default planets loaded into group.");
  
  // Make sure the default planets group and its children are visible.
  defaultPlanetsGroup.visible = true;
  defaultPlanetsGroup.traverse((child) => (child.visible = true));
  console.log("Default planets group is now visible.");
  
  // --- Reposition the Camera to Focus on Earth ---
  // Retrieve Earth's object (using either lowercase or uppercase name).
  const earth = scene.getObjectByName("earth") || scene.getObjectByName("Earth");
  if (earth) {
    // Get Earth's world position (in case it is nested in a group).
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
        // Continuously update the camera's lookAt so it remains focused on Earth.
        camera.lookAt(earthPosition);
      },
      onComplete: () => {
        // Update OrbitControls target if they are in use.
        if (controls) {
          controls.target.copy(earthPosition);
          controls.update();
        }
        console.log("Camera transitioned to focus on Earth.");
      }
    });
  } else {
    console.warn("Earth not found in scene. Camera positioning may be incorrect.");
  }
}
