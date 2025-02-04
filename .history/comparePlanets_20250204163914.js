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
 * This ensures you are not re‑adding the same Object3D.
 *
 * We also set the returned object’s name property (and its children)
 * so that our hide/show logic (based on names) works correctly.
 *
 * @param {string} name - The name of the planet.
 * @returns {THREE.Object3D|null} - A new clone of the planet.
 */
function getPlanetInstance(name) {
  const lowerName = name.toLowerCase();
  const template = planetTemplates[lowerName];
  if (!template) {
    console.error(`Template for "${name}" not found.`);
    return null;
  }
  const instance = template.clone(true);
  // Set the name of the instance and its children if not already set.
  instance.name = lowerName;
  instance.traverse(child => {
    if (child.isMesh) {
      // If a mesh doesn't have a name, give it the parent name.
      if (!child.name) child.name = lowerName;
    }
  });
  return instance;
}

/**
 * If the planet is Earth, remove its moon.
 * (Assumes the moon is a child with name "moon".)
 *
 * @param {THREE.Object3D} planet - The planet model.
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
 * Animate a planet out (moving it offscreen and fading out).
 *
 * @param {THREE.Object3D} planet - The planet to animate out.
 * @param {string} side - "left" or "right".
 * @param {function} onComplete - Callback when done.
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
 * Animate a planet in (moving it from offscreen into its target position and fading in).
 *
 * @param {THREE.Object3D} planet - The planet to animate in.
 * @param {string} side - "left" or "right".
 * @param {THREE.Vector3} targetPos - The target position.
 * @param {function} onComplete - Callback when done.
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
 * Lay out the compared planets side‑by‑side and adjust the camera.
 *
 * @param {THREE.Scene} scene - The scene to add planets to.
 * @param {THREE.Camera} camera - The camera.
 * @param {OrbitControls} controls - The OrbitControls instance.
 */
function performComparisonLayout(scene, camera, controls) {
  if (!currentComparison.leftObject || !currentComparison.rightObject) return;
  
  currentComparison.leftObject.updateMatrixWorld(true);
  currentComparison.rightObject.updateMatrixWorld(true);
  
  const boxLeft = new THREE.Box3().setFromObject(currentComparison.leftObject);
  const sphereLeft = boxLeft.getBoundingSphere(new THREE.Sphere());
  const boxRight = new THREE.Box3().setFromObject(currentComparison.rightObject);
  const sphereRight = boxRight.getBoundingSphere(new THREE.Sphere());
  
  const center = new THREE.Vector3().addVectors(sphereLeft.center, sphereRight.center).multiplyScalar(0.5);
  
  const margin = 1000;
  const separation = sphereLeft.radius + sphereRight.radius + margin;
  
  const targetPosLeft = new THREE.Vector3(center.x - separation * 0.5, center.y, center.z);
  const targetPosRight = new THREE.Vector3(center.x + separation * 0.5, center.y, center.z);
  
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
 * Compare two planets (for example, in a split‑screen view).
 * When a planet is already in use, animate it out before replacing it.
 *
 * @param {string} newLeftName - The left planet’s name.
 * @param {string} newRightName - The right planet’s name.
 * @param {THREE.Scene} scene - The scene.
 * @param {THREE.Camera} camera - The camera.
 * @param {OrbitControls} controls - The OrbitControls instance.
 */
export function comparePlanets(newLeftName, newRightName, scene, camera, controls) {
  const isSwapped = currentComparison.left === newRightName && currentComparison.right === newLeftName;
  const lowerLeft = newLeftName.toLowerCase();
  const lowerRight = newRightName.toLowerCase();

  // Process left side.
  if (currentComparison.left !== newLeftName || isSwapped) {
    if (currentComparison.leftObject) {
      animateOut(currentComparison.leftObject, "left", () => {
        if (currentComparison.leftObject.parent) {
          scene.remove(currentComparison.leftObject);
        }
        currentComparison.leftObject = null;
        currentComparison.left = null;
        
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
    // The left planet is retained.
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
    // The right planet is retained.
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
  
  // Final layout update if both sides are already set.
  if (currentComparison.left === newLeftName && currentComparison.right === newRightName) {
    performComparisonLayout(scene, camera, controls);
  }
}

/**
 * Compare two moons.
 * (This works similarly to comparePlanets. Adjust the layout as needed.)
 *
 * @param {string} newLeftMoon - The left moon’s name.
 * @param {string} newRightMoon - The right moon’s name.
 * @param {THREE.Scene} scene - The scene.
 * @param {THREE.Camera} camera - The camera.
 * @param {OrbitControls} controls - The OrbitControls instance.
 */
export function compareMoons(newLeftMoon, newRightMoon, scene, camera, controls) {
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
 * Call this function each frame (for example, inside your main animation loop)
 * to rotate the compared planets.
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
 * When a compared planet is clicked, this function animates the camera to zoom in
 * on that specific planet.
 *
 * @param {string} planetName - The name of the planet to focus on.
 * @param {THREE.Camera} camera - The camera.
 * @param {OrbitControls} controls - The OrbitControls instance.
 * @param {THREE.Scene} scene - The scene.
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
 * @param {THREE.Scene} scene - The scene containing the planets.
 * @param {Array<string>} keepVisible - An array of planet names (in lowercase) to keep visible.
 */
export function hideNonComparedPlanets(scene, keepVisible) {
  scene.traverse((object) => {
    if (object.isMesh && object.name) {
      if (keepVisible.includes(object.name.toLowerCase())) {
        object.visible = true;
      } else {
        object.visible = false;
      }
    }
  });
}

/**
 * Restores visibility for all planet meshes in the scene.
 * @param {THREE.Scene} scene - The scene containing the planets.
 */
export function showAllPlanets(scene) {
  scene.traverse((object) => {
    if (object.isMesh && object.name) {
      object.visible = true;
    }
  });
}
