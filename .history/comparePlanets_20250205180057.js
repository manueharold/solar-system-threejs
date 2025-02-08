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

// Fixed positions for the compared planets.
const FIXED_LEFT_POS  = new THREE.Vector3(-1000, 0, 0);
const FIXED_RIGHT_POS = new THREE.Vector3( 1000, 0, 0);
const CAMERA_CENTER   = new THREE.Vector3(0, 0, 0);
const CAMERA_POS      = new THREE.Vector3(0, 0, 3000);

/**
 * Return a clone of a planet’s template.
 * This ensures you are not re‑adding the same Object3D.
 * Also sets the object's name (and its children’s names) to the lowercase version of the provided name.
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
  // Set the name of the instance and its children so that our visibility functions work correctly.
  instance.name = lowerName;
  instance.traverse(child => {
    if (child.isMesh) {
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
 * Animate a planet out (fading out and moving it offscreen).
 *
 * @param {THREE.Object3D} planet - The planet to animate out.
 * @param {string} side - "left" or "right".
 * @param {function} onComplete - Callback when done.
 */
function animateOut(planet, side, onComplete) {
  // Animate from the fixed position to an offscreen position.
  const offset = side === "left" ? -2000 : 2000;
  const offscreenX = (side === "left" ? FIXED_LEFT_POS.x : FIXED_RIGHT_POS.x) + offset;
  gsap.to(planet.position, {
    x: offscreenX,
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
 * Animate a planet in (moving it from offscreen to its fixed position while fading in).
 *
 * @param {THREE.Object3D} planet - The planet to animate in.
 * @param {string} side - "left" or "right".
 * @param {function} onComplete - Callback when done.
 */
function animateIn(planet, side, onComplete) {
  // Start offscreen.
  const targetPos = side === "left" ? FIXED_LEFT_POS : FIXED_RIGHT_POS;
  const offset = side === "left" ? -2000 : 2000;
  const startX = targetPos.x + offset;
  planet.position.set(startX, targetPos.y, targetPos.z);
  // Ensure opacity starts at zero.
  planet.traverse(child => {
    if (child.material && child.material.transparent) {
      child.material.opacity = 0;
    }
  });
  // Animate position and opacity.
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
 * Lay out the compared planets in fixed positions and adjust the camera.
 *
 * Left planet will always be at FIXED_LEFT_POS, right at FIXED_RIGHT_POS,
 * and the camera will look at CAMERA_CENTER from CAMERA_POS.
 *
 * @param {THREE.Scene} scene - The scene to add planets to.
 * @param {THREE.Camera} camera - The camera.
 * @param {OrbitControls} controls - The OrbitControls instance.
 */
function performComparisonLayout(scene, camera, controls) {
  // Reposition planets to the fixed positions.
  if (currentComparison.leftObject) {
    currentComparison.leftObject.position.copy(FIXED_LEFT_POS);
    currentComparison.leftObject.visible = true;
  }
  if (currentComparison.rightObject) {
    currentComparison.rightObject.position.copy(FIXED_RIGHT_POS);
    currentComparison.rightObject.visible = true;
  }
  
  // Adjust the camera.
  controls.enabled = false;
  gsap.to(camera.position, {
    x: CAMERA_POS.x,
    y: CAMERA_POS.y,
    z: CAMERA_POS.z,
    duration: 2,
    ease: "power2.out",
    onUpdate: () => camera.lookAt(CAMERA_CENTER),
    onComplete: () => controls.enabled = true
  });
  gsap.to(controls.target, {
    x: CAMERA_CENTER.x,
    y: CAMERA_CENTER.y,
    z: CAMERA_CENTER.z,
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
  console.log(`🔄 Comparing Planets: Left=${newLeftName}, Right=${newRightName}`);
  console.log("Current Comparison State:", currentComparison);

  let leftChanged  = currentComparison.left !== newLeftName;
  let rightChanged = currentComparison.right !== newRightName;

  function addPlanet(side, planetName, callback) {
    console.log(`✅ Adding planet to ${side}:`, planetName);
    const newPlanet = getPlanetInstance(planetName);
    if (!newPlanet) {
      console.error(`❌ Failed to get planet instance: ${planetName}`);
      return;
    }
    if (planetName.toLowerCase() === "earth") removeMoonOrbiting(newPlanet);

    // Place the planet immediately at its fixed position.
    newPlanet.visible = true;
    newPlanet.position.copy(side === "left" ? FIXED_LEFT_POS : FIXED_RIGHT_POS);
    scene.add(newPlanet);

    if (side === "left") {
      currentComparison.leftObject = newPlanet;
      currentComparison.left = planetName;
    } else {
      currentComparison.rightObject = newPlanet;
      currentComparison.right = planetName;
    }
    if (callback) callback(newPlanet);
  }

  function showBothPlanets() {
    if (currentComparison.leftObject) {
      currentComparison.leftObject.visible = true;
      console.log(`👀 Showing left planet: ${currentComparison.leftObject.name}`);
    }
    if (currentComparison.rightObject) {
      currentComparison.rightObject.visible = true;
      console.log(`👀 Showing right planet: ${currentComparison.rightObject.name}`);
    }
    console.log("🌍 Both planets are now visible.");
  }

  // First-time comparison: add both planets immediately.
  if (!currentComparison.leftObject && !currentComparison.rightObject) {
    console.log("🆕 First-time planet comparison. Adding both immediately.");
    addPlanet("left", newLeftName, () => showBothPlanets());
    addPlanet("right", newRightName, () => showBothPlanets());
    // Layout after a short delay.
    setTimeout(() => {
      performComparisonLayout(scene, camera, controls);
    }, 500);
    return;
  }

  let completedAnimations = 0;
  function animatePlanetSwitch(side, oldPlanet, newPlanetName) {
    if (oldPlanet) {
      console.log(`🚀 Hiding ${side} planet: ${oldPlanet.name}`);
      // Animate the old planet out.
      animateOut(oldPlanet, side, () => {
        console.log(`🗑 Removed ${side} planet: ${oldPlanet.name}`);
        scene.remove(oldPlanet);
        addPlanet(side, newPlanetName, (newPlanet) => {
          // Animate the new planet in.
          animateIn(newPlanet, side, () => {
            completedAnimations++;
            if (completedAnimations === 2) showBothPlanets();
          });
        });
      });
    } else {
      // No previous planet – add and animate in.
      addPlanet(side, newPlanetName, (newPlanet) => {
        animateIn(newPlanet, side, () => {
          completedAnimations++;
          if (completedAnimations === 2) showBothPlanets();
        });
      });
    }
  }

  // If only one planet is switching, animate only that side.
  if (leftChanged) {
    animatePlanetSwitch("left", currentComparison.leftObject, newLeftName);
  } else {
    completedAnimations++;
  }
  if (rightChanged) {
    animatePlanetSwitch("right", currentComparison.rightObject, newRightName);
  } else {
    completedAnimations++;
  }

  // After changes, update layout to ensure both planets are in their fixed positions.
  setTimeout(() => {
    performComparisonLayout(scene, camera, controls);
  }, 1000);
}

/**
 * Compare two moons.
 * (Works similarly to comparePlanets. Adjust the layout as needed.)
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
 * Rotation Animation for Compared Planets.
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
 * Focus on a Compared Planet.
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

/**
 * Getter for the current comparison state.
 * This is used by other modules (like the search handler) to decide whether to restore full
 * planet visibility or only the compared planets.
 */
export function getCurrentComparison() {
  return currentComparison;
}
