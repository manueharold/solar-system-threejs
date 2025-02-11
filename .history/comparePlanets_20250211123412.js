// comparePlanets.js

import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { rotationSpeeds, planetTemplates } from "./loadPlanets.js"; // Assume 'planets' stores the original objects

// Object to store the currently compared planet objects.
const currentComparison = {
  leftObject: null,
  rightObject: null,
};

/**
 * Helper to determine if Orbit Mode is active.
 * Expects that a global flag (window.orbitModeEnabled) is set.
 * @returns {boolean} True if Orbit Mode is active.
 */
function isOrbitModeActive() {
  return window.orbitModeEnabled === true;
}

/**
 * Animates a planet offscreen.
 * @param {THREE.Object3D} planet - The planet to animate out.
 * @param {string} side - "left" or "right" (determines direction).
 * @param {Function} onComplete - Callback fired after the animation.
 */
function animateOut(planet, side, onComplete) {
  const offset = side === "left" ? -2000 : 2000;
  gsap.to(planet.position, {
    x: planet.position.x + offset,
    duration: 1,
    ease: "power2.in",
    onComplete: onComplete
  });
}

/**
 * Animates a planet into view.
 * @param {THREE.Object3D} planet - The planet to animate in.
 * @param {string} side - "left" or "right" (determines starting position).
 * @param {THREE.Vector3} targetPos - The target position for the planet.
 * @param {Function} onComplete - Callback fired after the animation.
 */
function animateIn(planet, side, targetPos, onComplete) {
  // Set starting position offscreen.
  const startX = side === "left" ? targetPos.x - 2000 : targetPos.x + 2000;
  planet.position.set(startX, targetPos.y, targetPos.z);
  gsap.to(planet.position, {
    x: targetPos.x,
    duration: 1.5,
    ease: "power2.out",
    onComplete: onComplete
  });
}

/**
 * Lays out the two compared planets side by side and adjusts the camera.
 * @param {THREE.Scene} scene - The Three.js scene.
 * @param {THREE.Camera} camera - The camera to reposition.
 * @param {Object} controls - Camera controls to update.
 */
function performComparisonLayout(scene, camera, controls) {
  if (!currentComparison.leftObject || !currentComparison.rightObject) return;

  // Compute bounding spheres for both planets.
  const sphereLeft = new THREE.Box3()
    .setFromObject(currentComparison.leftObject)
    .getBoundingSphere(new THREE.Sphere());
  const sphereRight = new THREE.Box3()
    .setFromObject(currentComparison.rightObject)
    .getBoundingSphere(new THREE.Sphere());

  // Calculate the midpoint and required separation.
  const center = sphereLeft.center.clone().add(sphereRight.center).multiplyScalar(0.5);
  const margin = 1000;
  const separation = sphereLeft.radius + sphereRight.radius + margin;

  // Determine target positions for left and right planets.
  const targetPosLeft = new THREE.Vector3(center.x - separation * 0.5, center.y, center.z);
  const targetPosRight = new THREE.Vector3(center.x + separation * 0.5, center.y, center.z);

  // Animate the planets into place.
  animateIn(currentComparison.leftObject, "left", targetPosLeft, () => {});
  animateIn(currentComparison.rightObject, "right", targetPosRight, () => {});

  // Adjust the camera to ensure both planets are in view.
  const cameraDistance = separation + Math.max(sphereLeft.radius, sphereRight.radius) * 8;
  const targetCameraPos = new THREE.Vector3(center.x, center.y, center.z + cameraDistance);

  controls.enabled = false;
  gsap.to(camera.position, {
    x: targetCameraPos.x,
    y: targetCameraPos.y,
    z: targetCameraPos.z,
    duration: 2,
    ease: "power2.out",
    onUpdate: () => camera.lookAt(center),
    onComplete: () => (controls.enabled = true),
  });
  gsap.to(controls.target, {
    x: center.x,
    y: center.y,
    z: center.z,
    duration: 2,
    ease: "power2.out",
  });
}

/**
 * Moves the original planet objects from the solar system into a comparison view.
 * This does not clone them—instead, it removes them from their original parent,
 * stores their original state, and then adds them to the scene for comparison.
 *
 * @param {string} planet1 - The name of the left planet.
 * @param {string} planet2 - The name of the right planet.
 * @param {THREE.Scene} scene - The Three.js scene.
 * @param {THREE.Camera} camera - The camera to adjust.
 * @param {Object} controls - Camera controls to update.
 */
export function comparePlanets(planet1, planet2, scene, camera, controls) {
  if (isOrbitModeActive()) {
    console.log("Comparison is disabled in Orbit Mode.");
    return;
  }
  
  // Get references to the original planet objects.
  const leftPlanet = planets[planet1.toLowerCase()];
  const rightPlanet = planets[planet2.toLowerCase()];
  
  if (!leftPlanet || !rightPlanet) {
    console.error("One or both planets were not found in the main scene.");
    return;
  }
  
  // Save original state for later restoration.
  leftPlanet.userData.originalParent = leftPlanet.parent;
  leftPlanet.userData.originalPosition = leftPlanet.position.clone();
  rightPlanet.userData.originalParent = rightPlanet.parent;
  rightPlanet.userData.originalPosition = rightPlanet.position.clone();
  
  // Remove them from their original parents.
  leftPlanet.parent.remove(leftPlanet);
  rightPlanet.parent.remove(rightPlanet);
  
  // Add them to the current scene (or a dedicated comparison container).
  scene.add(leftPlanet, rightPlanet);
  
  // Store them as the currently compared objects.
  currentComparison.leftObject = leftPlanet;
  currentComparison.rightObject = rightPlanet;
  
  // Optionally, hide any other objects in the scene.
  // (Implement a function similar to hideNonComparedPlanets if needed.)
  
  // Lay out the planets and animate the camera.
  performComparisonLayout(scene, camera, controls);
}

/**
 * Continuously updates the rotation of the compared planets.
 * This function is disabled if Orbit Mode is active.
 */
export function updateComparisonRotation() {
  if (isOrbitModeActive()) return;
  
  if (currentComparison.leftObject) {
    const speed = rotationSpeeds[currentComparison.leftObject.name] || 0.002;
    currentComparison.leftObject.rotation.y += speed;
  }
  
  if (currentComparison.rightObject) {
    const speed = rotationSpeeds[currentComparison.rightObject.name] || 0.002;
    currentComparison.rightObject.rotation.y += speed;
  }
}

/**
 * Restores the compared planets back to their original positions and parents.
 * Call this when the comparison is complete.
 */
export function restorePlanets(scene) {
  if (currentComparison.leftObject && currentComparison.leftObject.userData.originalParent) {
    const left = currentComparison.leftObject;
    left.position.copy(left.userData.originalPosition);
    left.userData.originalParent.add(left);
  }
  if (currentComparison.rightObject && currentComparison.rightObject.userData.originalParent) {
    const right = currentComparison.rightObject;
    right.position.copy(right.userData.originalPosition);
    right.userData.originalParent.add(right);
  }
  
  // Optionally, show any other scene objects that were hidden.
  
  currentComparison.leftObject = currentComparison.rightObject = null;
}
