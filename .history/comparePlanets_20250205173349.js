import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { planetTemplates } from "./loadPlanets.js"; // adjust path as needed

// Global state for current comparisons.
let currentComparison = {
  left: null,         // Name string of the left planet.
  right: null,        // Name string of the right planet.
  leftObject: null,   // THREE.Object3D instance used on the left.
  rightObject: null   // THREE.Object3D instance used on the right.
};

/**
 * Return a clone of a planet’s template.
 * Also sets the object's name (and its children’s names) to the lowercase version.
 */
function getPlanetInstance(name) {
  const lowerName = name.toLowerCase();
  const template = planetTemplates[lowerName];
  if (!template) {
    console.error(`Template for "${name}" not found.`);
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
 * If the planet is Earth, remove its moon (child with name "moon").
 */
function removeMoonOrbiting(planet) {
  if (planet.name.toLowerCase() !== "earth") return;
  planet.traverse(child => {
    if (child.name && child.name.toLowerCase() === "moon" && child.parent) {
      child.parent.remove(child);
    }
  });
}

/**
 * A helper that returns a Promise that resolves after a delay (in seconds).
 */
function delay(duration) {
  return new Promise(resolve => gsap.delayedCall(duration, resolve));
}

/**
 * Animate a planet out (moving it offscreen and fading out).
 * Returns a Promise that resolves when the animation completes.
 */
async function animateOut(planet, side) {
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
  await delay(1);
}

/**
 * Animate a planet in (moving it from offscreen into its target position and fading in).
 * Returns a Promise that resolves when the animation completes.
 */
async function animateIn(planet, side, targetPos) {
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
  await delay(1.5);
}

/**
 * Lay out the compared planets side‑by‑side and adjust the camera.
 */
function performComparisonLayout(scene, camera, controls) {
  if (!currentComparison.leftObject || !currentComparison.rightObject) return;

  // Update world matrices.
  currentComparison.leftObject.updateMatrixWorld(true);
  currentComparison.rightObject.updateMatrixWorld(true);

  // Compute bounding spheres.
  const boxLeft = new THREE.Box3().setFromObject(currentComparison.leftObject);
  const sphereLeft = boxLeft.getBoundingSphere(new THREE.Sphere());
  const boxRight = new THREE.Box3().setFromObject(currentComparison.rightObject);
  const sphereRight = boxRight.getBoundingSphere(new THREE.Sphere());

  // Calculate center and separation.
  const center = new THREE.Vector3()
    .addVectors(sphereLeft.center, sphereRight.center)
    .multiplyScalar(0.5);
  const margin = 1000;
  const separation = sphereLeft.radius + sphereRight.radius + margin;

  const targetPosLeft = new THREE.Vector3(center.x - separation * 0.5, center.y, center.z);
  const targetPosRight = new THREE.Vector3(center.x + separation * 0.5, center.y, center.z);

  // Animate planets into position if needed.
  if (currentComparison.leftObject.position.distanceTo(targetPosLeft) > 1) {
    animateIn(currentComparison.leftObject, "left", targetPosLeft);
  } else {
    currentComparison.leftObject.position.copy(targetPosLeft);
  }
  if (currentComparison.rightObject.position.distanceTo(targetPosRight) > 1) {
    animateIn(currentComparison.rightObject, "right", targetPosRight);
  } else {
    currentComparison.rightObject.position.copy(targetPosRight);
  }

  // Adjust the camera.
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
}

/**
 * Helper function to update the planet on one side.
 * Uses async/await to sequence the animation out (if needed) and then add the new planet.
 *
 * @param {string} side - "left" or "right"
 * @param {string} newPlanetName - New planet's name.
 * @param {boolean} isSwapped - Indicates if the two sides were swapped.
 * @param {boolean} resetOpacity - If true, sets the new planet's child opacity to 0.
 */
async function updateComparedPlanet(side, newPlanetName, scene, camera, controls, isSwapped, resetOpacity = false) {
  const lowerName = newPlanetName.toLowerCase();
  const currentSideName = currentComparison[side];
  const currentSideObject = currentComparison[side + "Object"];

  if (currentSideName !== newPlanetName || isSwapped) {
    if (currentSideObject) {
      await animateOut(currentSideObject, side);
      if (currentSideObject.parent) scene.remove(currentSideObject);
      currentComparison[side + "Object"] = null;
      currentComparison[side] = null;
    }
    const newPlanet = getPlanetInstance(newPlanetName);
    if (!newPlanet) return;
    if (lowerName === "earth") removeMoonOrbiting(newPlanet);
    if (resetOpacity) {
      newPlanet.traverse(child => {
        if (child.material && child.material.transparent) {
          child.material.opacity = 0;
        }
      });
    }
    scene.add(newPlanet);
    currentComparison[side + "Object"] = newPlanet;
    currentComparison[side] = newPlanetName;
    performComparisonLayout(scene, camera, controls);
  } else {
    // If the planet is retained, ensure it is visible.
    if (currentSideObject) {
      currentSideObject.visible = true;
      currentSideObject.traverse(child => {
        if (child.material && child.material.transparent) {
          child.material.opacity = 1;
        }
      });
      performComparisonLayout(scene, camera, controls);
    }
  }
}

/**
 * Compare two planets (for example, in a split‑screen view).
 * When a planet is already in use, animate it out before replacing it.
 */
export async function comparePlanets(newLeftName, newRightName, scene, camera, controls) {
  // Check if the two planets have been swapped.
  const isSwapped = currentComparison.left === newRightName && currentComparison.right === newLeftName;
  
  await Promise.all([
    updateComparedPlanet("left", newLeftName, scene, camera, controls, isSwapped),
    updateComparedPlanet("right", newRightName, scene, camera, controls, isSwapped, true)
  ]);

  // Final layout update if both sides are set.
  if (currentComparison.left === newLeftName && currentComparison.right === newRightName) {
    performComparisonLayout(scene, camera, controls);
  }
}

/**
 * Compare two moons.
 * (Works similarly to comparePlanets, but resets the current comparison.)
 */
export function compareMoons(newLeftMoon, newRightMoon, scene, camera, controls) {
  // Reset current comparison state.
  currentComparison = { left: null, right: null, leftObject: null, rightObject: null };

  const leftMoon = getPlanetInstance(newLeftMoon);
  if (!leftMoon) return;
  scene.add(leftMoon);
  currentComparison.leftObject = leftMoon;
  currentComparison.left = newLeftMoon;

  const rightMoon = getPlanetInstance(newRightMoon);
  if (!rightMoon) return;
  scene.add(rightMoon);
  currentComparison.rightObject = rightMoon;
  currentComparison.right = newRightMoon;

  performComparisonLayout(scene, camera, controls);
}

/**
 * Rotation Animation for Compared Planets
 *
 * Call this each frame (e.g., in your main animation loop) to rotate the compared planets.
 */
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

export function updateComparisonRotation() {
  if (currentComparison.leftObject && currentComparison.left) {
    const leftName = currentComparison.left.toLowerCase();
    const leftRotationSpeed = rotationSpeeds[leftName] || baseRotationSpeed;
    currentComparison.leftObject.rotation.y += leftRotationSpeed;
  }
  if (currentComparison.rightObject && currentComparison.right) {
    const rightName = currentComparison.right.toLowerCase();
    const rightRotationSpeed = rotationSpeeds[rightName] || baseRotationSpeed;
    currentComparison.rightObject.rotation.y += rightRotationSpeed;
  }
}

/**
 * Focus on a Compared Planet
 *
 * When a compared planet is clicked, this function animates the camera to zoom in on that planet.
 */
export function focusComparedPlanet(planetName, camera, controls, scene) {
  const lowerName = planetName.toLowerCase();
  console.log("focusComparedPlanet called with:", lowerName);
  
  let targetPlanet = null;
  if (currentComparison.left === lowerName) {
    targetPlanet = currentComparison.leftObject;
  } else if (currentComparison.right === lowerName) {
    targetPlanet = currentComparison.rightObject;
  }
  if (!targetPlanet) {
    console.error(`Compared planet "${planetName}" not found in currentComparison.`, currentComparison);
    return;
  }
  
  console.log("Focusing on planet:", planetName, targetPlanet);
  
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

/**
 * Hides all planet meshes in the scene except those whose names are in the keepVisible array.
 *
 * @param {THREE.Scene} scene - The scene.
 * @param {Array<string>} keepVisible - Array of planet names (in lowercase) to keep visible.
 */
export function hideNonComparedPlanets(scene, keepVisible) {
  scene.traverse(object => {
    if (object.isMesh && object.name) {
      object.visible = keepVisible.includes(object.name.toLowerCase());
    }
  });
}

/**
 * Restores visibility for all planet meshes in the scene.
 */
export function showAllPlanets(scene) {
  scene.traverse(object => {
    if (object.isMesh && object.name) {
      object.visible = true;
    }
  });
}

/**
 * Getter for the current comparison state.
 */
export function getCurrentComparison() {
  return currentComparison;
}
