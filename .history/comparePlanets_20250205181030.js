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

// Global state to manage visibility of planets.
let visiblePlanets = [];

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
  instance.name = lowerName;
  instance.traverse(child => {
    if (child.isMesh) {
      if (!child.name) child.name = lowerName;
    }
  });
  return instance;
}

/**
 * Hides all planet meshes in the scene except those whose names are in the keepVisible array.
 * @param {THREE.Scene} scene - The scene containing the planets.
 * @param {Array<string>} keepVisible - An array of planet names (in lowercase) to keep visible.
 */
function hideNonComparedPlanets(scene, keepVisible) {
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

  // Flags to indicate if we need to re-layout.
  let leftUpdated = false;
  let rightUpdated = false;

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
        scene.add(newLeftPlanet);
        currentComparison.leftObject = newLeftPlanet;
        currentComparison.left = newLeftName;
        leftUpdated = true;
        
        // Hide non-compared planets after updating left.
        hideNonComparedPlanets(scene, [newLeftName.toLowerCase(), currentComparison.right]);

        if (rightUpdated || currentComparison.right) {
          performComparisonLayout(scene, camera, controls);
        }
      });
    } else {
      const newLeftPlanet = getPlanetInstance(newLeftName);
      if (!newLeftPlanet) return;
      scene.add(newLeftPlanet);
      currentComparison.leftObject = newLeftPlanet;
      currentComparison.left = newLeftName;
      leftUpdated = true;

      // Hide non-compared planets after updating left.
      hideNonComparedPlanets(scene, [newLeftName.toLowerCase(), currentComparison.right]);
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
        scene.add(newRightPlanet);
        currentComparison.rightObject = newRightPlanet;
        currentComparison.right = newRightName;
        rightUpdated = true;

        // Hide non-compared planets after updating right.
        hideNonComparedPlanets(scene, [newRightName.toLowerCase(), currentComparison.left]);

        if (leftUpdated || currentComparison.left) {
          performComparisonLayout(scene, camera, controls);
        }
      });
    } else {
      const newRightPlanet = getPlanetInstance(newRightName);
      if (!newRightPlanet) return;
      scene.add(newRightPlanet);
      currentComparison.rightObject = newRightPlanet;
      currentComparison.right = newRightName;
      rightUpdated = true;

      // Hide non-compared planets after updating right.
      hideNonComparedPlanets(scene, [newRightName.toLowerCase(), currentComparison.left]);
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
    }
  }

  // After processing both sides, update the layout.
  performComparisonLayout(scene, camera, controls);
}

// You can also update the `showAllPlanets` function to reset visibility for all planets.
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
