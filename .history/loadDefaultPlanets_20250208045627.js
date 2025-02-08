// loadDefaultPlanets.js
import { loadPlanets } from "./loadPlanets.js";
import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

/**
 * Preloads the default planets (including the Sun) into a group that is added to the scene.
 * The group is initially hidden (e.g. when starting in Orbit Mode).
 */
export function preloadDefaultPlanets(scene) {
  let defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
  if (!defaultPlanetsGroup) {
    defaultPlanetsGroup = new THREE.Group();
    defaultPlanetsGroup.name = "defaultPlanetsGroup";
    scene.add(defaultPlanetsGroup);
    loadPlanets(defaultPlanetsGroup);
    // Initially hide the group
    defaultPlanetsGroup.visible = false;
    console.log("Preloaded default planets (hidden).");
  }
}

/**
 * Loads the default planets into the scene and repositions the camera to focus on Earth.
 * This function removes any Orbit Mode objects (such as orbit lines and orbit model) before reloading.
 *
 * @param {THREE.Scene} scene - The scene where objects are removed/loaded.
 * @param {THREE.PerspectiveCamera} camera - The camera to reposition.
 * @param {OrbitControls} controls - The OrbitControls instance to update.
 */
export function loadDefaultPlanets(scene, camera, controls) {
  // --- Remove Orbit Mode Objects ---

  // Remove the orbit mode model if it exists.
  const orbitModel = scene.getObjectByName("orbitModeModel");
  if (orbitModel) {
    scene.remove(orbitModel);
    console.log("Orbit mode model removed.");
  }

  // Remove all orbit lines (assumed to use a LineDashedMaterial).
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

  // Call loadPlanets from loadPlanets.js to load all planets (and the Sun) into the group.
  loadPlanets(defaultPlanetsGroup);
  console.log("Loaded default planets into group.");

  // Make sure the group and all its children are visible.
  defaultPlanetsGroup.visible = true;
  defaultPlanetsGroup.traverse((child) => {
    child.visible = true;
  });
  console.log("Default planets group is now visible.");

  // --- Position the Camera to Focus on Earth ---
  // Attempt to get Earth's object (case insensitive).
  const earth = scene.getObjectByName("earth") || scene.getObjectByName("Earth");
  if (earth) {
    // Use Earth's world position in case it's nested in a group.
    const earthPosition = new THREE.Vector3();
    earth.getWorldPosition(earthPosition);

    // Set the camera position relative to Earth. Adjust the offset as needed.
    const offset = 15000;
    camera.position.set(
      earthPosition.x + offset,
      earthPosition.y + offset * 0.5,
      earthPosition.z + offset
    );

    // Ensure the camera looks at Earth.
    camera.lookAt(earthPosition);
    console.log("Camera set to focus on Earth at:", earthPosition);

    // If using OrbitControls, update its target.
    if (controls) {
      controls.target.copy(earthPosition);
      controls.update();
    }
  } else {
    console.warn("Earth not found in scene. Camera positioning might be incorrect.");
    // Optionally, implement a retry or callback mechanism once Earth is loaded.
  }
}
