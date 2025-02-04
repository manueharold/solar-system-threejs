import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { planetTemplates } from "./loadPlanets.js"; // This should have keys like "earth", "mars", etc.

// Global state for current comparisons.
let currentComparison = {
  left: null,         // String name of the left planet (e.g. "earth")
  right: null,        // String name of the right planet (e.g. "mars")
  leftObject: null,   // THREE.Object3D for the left planet
  rightObject: null   // THREE.Object3D for the right planet
};

/**
 * Returns a clone of the planet template from planetTemplates.
 * Also ensures that the returned instance and its child meshes are named using the lowercase planet name.
 *
 * @param {string} name - The name of the planet.
 * @returns {THREE.Object3D|null} - A new clone of the planet template, or null if not found.
 */
function getPlanetInstance(name) {
  const lowerName = name.toLowerCase();
  const template = planetTemplates[lowerName];
  if (!template) {
    console.error(`Template for "${name}" not found in planetTemplates.`);
    return null;
  }
  const instance = template.clone(true);
  instance.name = lowerName;
  instance.traverse(child => {
    if (child.isMesh && !child.name) {
      child.name = lowerName;
    }
  });
  return instance;
}

/**
 * If the planet is Earth, remove any child named "moon" (case‑insensitive).
 *
 * @param {THREE.Object3D} planet - The planet object.
 */
function removeMoonOrbiting(planet) {
  if (planet.name.toLowerCase() !== "earth") return;
  planet.traverse(child => {
    if (child.name && child.name.toLowerCase() === "moon") {
      if (child.parent) child.parent.remove(child);
    }
  });
}

/**
 * Animates the given planet offscreen and fades its opacity to 0.
 *
 * @param {THREE.Object3D} planet - The planet to animate out.
 * @param {string} side - Either "left" or "right".
 * @param {function} onComplete - Callback after animation.
 */
function animateOut(planet, side, onComplete) {
  const offset = side === "left" ? -2000 : 2000;
  gsap.to(planet.position, {
    x: planet.position.x + offset,
    duration: 1,
    ease: "power2.in"
  });
  planet.traverse(child => {
    if (child.material && child.material.transparent) {
      gsap.to(child.material, {
        opacity: 0,
        duration: 1,
        ease: "power2.in"
      });
    }
  });
  gsap.delayedCall(1, onComplete);
}

/**
 * Animates a planet in from offscreen to its target position and fades in.
 *
 * @param {THREE.Object3D} planet - The planet to animate in.
 * @param {string} side - "left" or "right".
 * @param {THREE.Vector3} targetPos - The desired position.
 * @param {function} onComplete - Callback when finished.
 */
function animateIn(planet, side, targetPos, onComplete) {
  const startX = side === "left" ? targetPos.x - 2000 : targetPos.x + 2000;
  planet.position.set(startX, targetPos.y, targetPos.z);
  planet.traverse(child => {
    if (child.material && child.material.transparent) {
      child.material.opacity = 0;
    }
  });
  gsap.to(planet.position, {
    x: targetPos.x,
    duration: 1.5,
    ease: "power2.out"
  });
  planet.traverse(child => {
    if (child.material && child.material.transparent) {
      gsap.to(child.material, {
        opacity: 1,
        duration: 1.5,
        ease: "power2.out"
      });
    }
  });
  gsap.delayedCall(1.5, onComplete);
}

/**
 * Positions the two compared planets side‑by‑side, adjusts the camera,
 * and hides any other planet meshes in the scene.
 *
 * @param {THREE.Scene} scene - The scene.
 * @param {THREE.Camera} camera - The camera.
 * @param {OrbitControls} controls - The OrbitControls instance.
 */
function performComparisonLayout(scene, camera, controls) {
  if (!currentComparison.leftObject || !currentComparison.rightObject) return;
  
  // Ensure the objects' matrices are up to date.
  currentComparison.leftObject.updateMatrixWorld(true);
  currentComparison.rightObject.updateMatrixWorld(true);
  
  // Compute bounding spheres.
  const boxLeft = new THREE.Box3().setFromObject(currentComparison.leftObject);
  const sphereLeft = boxLeft.getBoundingSphere(new THREE.Sphere());
  const boxRight = new THREE.Box3().setFromObject(currentComparison.rightObject);
  const sphereRight = boxRight.getBoundingSphere(new THREE.Sphere());
  
  // Calculate the midpoint between the two planets.
  const center = new THREE.Vector3().addVectors(sphereLeft.center, sphereRight.center).multiplyScalar(0.5);
  
  // Compute separation: add a margin so the planets don't overlap.
  const margin = 1000;
  const separation = sphereLeft.radius + sphereRight.radius + margin;
  
  // Target positions for left and right planets.
  const targetPosLeft = new THREE.Vector3(center.x - separation * 0.5, center.y, center.z);
  const targetPosRight = new THREE.Vector3(center.x + separation * 0.5, center.y, center.z);
  
  // Animate in each planet if not already in position.
  if (currentComparison.leftObject.position.distanceTo(targetPosLeft) > 1) {
    animateIn(currentComparison.leftObject, "left", targetPosLeft, () => {});
  } else {
    currentComparison.leftObject.position.copy(targetPosLeft);
  }
  if (currentComparison.rightObject.position.distanceTo(targetPosRight) > 1) {
    animateIn(currentComparison.rightObject, "right", targetPosRight, () => {});
  } else {
    currentComparison.rightObject.position.copy(targetPosRight);
  }
  
  // Adjust the camera so that both planets are visible.
  const comparisonCameraDistanceMultiplier = 8;
  const maxRadius = Math.max(sphereLeft.radius, sphereRight.radius);
  const cameraDistance = separation + maxRadius * comparisonCameraDistanceMultiplier;
  const targetCameraPos = new THREE.Vector3(center.x, center.y, center.z + cameraDistance);
  
  controls.enabled = false;
  gsap.to(camera.position, {
    x: targetCameraPos.x,
    y: targetCameraPos.y,
    z: targetCameraPos.z,
    duration: 2,
    ease: "power2.out",
    onUpdate: () => camera.lookAt(center),
    onComplete: () => controls.enabled = true
  });
  gsap.to(controls.target, {
    x: center.x,
    y: center.y,
    z: center.z,
    duration: 2,
    ease: "power2.out"
  });
  
  // Finally, hide any planet meshes that are not part of the comparison.
  hideNonComparedPlanets(scene, [
    currentComparison.left.toLowerCase(),
    currentComparison.right.toLowerCase()
  ]);
}

/**
 * Hides all meshes in the scene whose name (lowercase) is not in the keepVisible array.
 *
 * @param {THREE.Scene} scene - The scene.
 * @param {Array<string>} keepVisible - Array of planet names (lowercase) to remain visible.
 */
export function hideNonComparedPlanets(scene, keepVisible) {
  scene.traverse(object => {
    if (object.isMesh && object.name) {
      object.visible = keepVisible.includes(object.name.toLowerCase());
    }
  });
}

/**
 * Compare two planets.
 * If one of the compared options changes, the corresponding planet is animated out,
 * removed from the scene, and then replaced by the newly selected planet.
 * The planet that is retained remains visible.
 *
 * @param {string} newLeftName - The new left planet’s name.
 * @param {string} newRightName - The new right planet’s name.
 * @param {THREE.Scene} scene - The scene.
 * @param {THREE.Camera} camera - The camera.
 * @param {OrbitControls} controls - The OrbitControls instance.
 */
export function comparePlanets(newLeftName, newRightName, scene, camera, controls) {
  const lowerLeft = newLeftName.toLowerCase();
  const lowerRight = newRightName.toLowerCase();
  const isSwapped = (currentComparison.left === newRightName && currentComparison.right === newLeftName);

  // Process left side.
  if (currentComparison.left !== newLeftName || isSwapped) {
    // If an old left planet exists, animate it out and remove it.
    if (currentComparison.leftObject) {
      animateOut(currentComparison.leftObject, "left", () => {
        if (currentComparison.leftObject.parent) {
          scene.remove(currentComparison.leftObject);
        }
        currentComparison.leftObject = null;
        currentComparison.left = null;
        // Create and add the new left planet.
        const newLeftPlanet = getPlanetInstance(newLeftName);
        if (!newLeftPlanet) return;
        if (lowerLeft === "earth") {
          removeMoonOrbiting(newLeftPlanet);
        }
        scene.add(newLeftPlanet);
        currentComparison.leftObject = newLeftPlanet;
        currentComparison.left = newLeftName;
        performComparisonLayout(scene, camera, controls);
      });
    } else {
      // If no old left planet, simply add the new one.
      const newLeftPlanet = getPlanetInstance(newLeftName);
      if (!newLeftPlanet) return;
      if (lowerLeft === "earth") {
        removeMoonOrbiting(newLeftPlanet);
      }
      scene.add(newLeftPlanet);
      currentComparison.leftObject = newLeftPlanet;
      currentComparison.left = newLeftName;
      performComparisonLayout(scene, camera, controls);
    }
  } else {
    // If the left planet is retained, ensure it is visible.
    if (currentComparison.leftObject) {
      currentComparison.leftObject.visible = true;
      currentComparison.leftObject.traverse(child => {
        if (child.material && child.material.transparent) {
          child.material.opacity = 1;
        }
      });
      performComparisonLayout(scene, camera, controls);
    }
  }

  // Process right side.
  if (currentComparison.right !== newRightName || isSwapped) {
    if (currentComparison.rightObject) {
      animateOut(currentComparison.rightObject, "right", () => {
        if (currentComparison.rightObject.parent) {
          scene.remove(currentComparison.rightObject);
        }
        currentComparison.rightObject = null;
        currentComparison.right = null;
        const newRightPlanet = getPlanetInstance(newRightName);
        if (!newRightPlanet) return;
        if (lowerRight === "earth") {
          removeMoonOrbiting(newRightPlanet);
        }
        // Ensure new planet opacity is set to fully visible.
        newRightPlanet.traverse(child => {
          if (child.material && child.material.transparent) {
            child.material.opacity = 1;
          }
        });
        scene.add(newRightPlanet);
        currentComparison.rightObject = newRightPlanet;
        currentComparison.right = newRightName;
        performComparisonLayout(scene, camera, controls);
      });
    } else {
      const newRightPlanet = getPlanetInstance(newRightName);
      if (!newRightPlanet) return;
      if (lowerRight === "earth") {
        removeMoonOrbiting(newRightPlanet);
      }
      newRightPlanet.traverse(child => {
        if (child.material && child.material.transparent) {
          child.material.opacity = 0;
        }
      });
      scene.add(newRightPlanet);
      currentComparison.rightObject = newRightPlanet;
      currentComparison.right = newRightName;
      performComparisonLayout(scene, camera, controls);
    }
  } else {
    if (currentComparison.rightObject) {
      currentComparison.rightObject.visible = true;
      currentComparison.rightObject.traverse(child => {
        if (child.material && child.material.transparent) {
          child.material.opacity = 1;
        }
      });
      performComparisonLayout(scene, camera, controls);
    }
  }
}

/**
 * Rotates the compared planets. (Call this from your main animation loop.)
 */
export function updateComparisonRotation() {
  const baseRotationSpeed = 0.002;
  const rotationSpeeds = {
    earth: baseRotationSpeed / 1,
    venus: baseRotationSpeed / 243,
    mercury: baseRotationSpeed / 58.6,
    mars: baseRotationSpeed / 1.03,
    jupiter: baseRotationSpeed / 0.41,
    saturn: baseRotationSpeed / 0.45,
    uranus: baseRotationSpeed / 0.72,
    neptune: baseRotationSpeed / 0.67
  };
  if (currentComparison.leftObject && currentComparison.left) {
    const leftName = currentComparison.left.toLowerCase();
    const speed = rotationSpeeds[leftName] || baseRotationSpeed;
    currentComparison.leftObject.rotation.y += speed;
  }
  if (currentComparison.rightObject && currentComparison.right) {
    const rightName = currentComparison.right.toLowerCase();
    const speed = rotationSpeeds[rightName] || baseRotationSpeed;
    currentComparison.rightObject.rotation.y += speed;
  }
}

/**
 * Moves the camera to focus on the specified compared planet.
 *
 * @param {string} planetName - The planet name.
 * @param {THREE.Camera} camera - The camera.
 * @param {OrbitControls} controls - The OrbitControls instance.
 * @param {THREE.Scene} scene - The scene.
 */
export function focusComparedPlanet(planetName, camera, controls, scene) {
  const lowerName = planetName.toLowerCase();
  let targetPlanet = null;
  if (currentComparison.left === lowerName) {
    targetPlanet = currentComparison.leftObject;
  } else if (currentComparison.right === lowerName) {
    targetPlanet = currentComparison.rightObject;
  }
  if (!targetPlanet) {
    console.error(`Compared planet "${planetName}" not found.`);
    return;
  }
  
  const boundingBox = new THREE.Box3().setFromObject(targetPlanet);
  const boundingSphere = boundingBox.getBoundingSphere(new THREE.Sphere());
  const targetFocus = boundingSphere.center;
  const planetRadius = boundingSphere.radius;
  
  const focusMultiplier = 2;
  const targetDistance = Math.max(planetRadius * focusMultiplier, 1000);
  const targetCameraPos = new THREE.Vector3(
    targetFocus.x,
    targetFocus.y + planetRadius * 0.5,
    targetFocus.z + targetDistance
  );
  
  controls.enabled = false;
  gsap.to(camera.position, {
    x: targetCameraPos.x,
    y: targetCameraPos.y,
    z: targetCameraPos.z,
    duration: 2,
    ease: "power2.out",
    onUpdate: () => camera.lookAt(targetFocus),
    onComplete: () => controls.enabled = true
  });
  gsap.to(controls.target, {
    x: targetFocus.x,
    y: targetFocus.y,
    z: targetFocus.z,
    duration: 2,
    ease: "power2.out"
  });
}
