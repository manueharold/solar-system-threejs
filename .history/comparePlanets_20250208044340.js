import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { rotationSpeeds, planetTemplates } from "./loadPlanets.js";

// Object to store the currently compared planet objects.
const currentComparison = {
  leftObject: null,
  rightObject: null,
};

/**
 * Returns a cloned planet instance from the templates.
 * @param {string} name - The planet name.
 * @returns {THREE.Object3D|null} Cloned planet object or null if template not found.
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
  // Ensure all child meshes have a name.
  instance.traverse((child) => {
    if (child.isMesh && !child.name) child.name = lowerName;
  });
  return instance;
}

/**
 * Helper to animate opacity for all transparent materials of a planet.
 * @param {THREE.Object3D} planet - The planet object.
 * @param {number} targetOpacity - The opacity to animate to.
 * @param {number} duration - Animation duration (seconds).
 * @param {string} ease - Easing function name.
 */
function animateMaterials(planet, targetOpacity, duration, ease) {
  planet.traverse((child) => {
    if (child.material && child.material.transparent) {
      gsap.to(child.material, { opacity: targetOpacity, duration, ease });
    }
  });
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
  });
  animateMaterials(planet, 0, 1, "power2.in");
  gsap.delayedCall(1, onComplete);
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
  // Initialize all transparent materials to 0 opacity.
  planet.traverse((child) => {
    if (child.material && child.material.transparent) {
      child.material.opacity = 0;
    }
  });
  gsap.to(planet.position, {
    x: targetPos.x,
    duration: 1.5,
    ease: "power2.out",
  });
  animateMaterials(planet, 1, 1.5, "power2.out");
  gsap.delayedCall(1.5, onComplete);
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

  // Animate planets into their new positions.
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
 * Compares two planets by removing any previous ones, loading new models,
 * and setting up the scene layout.
 * @param {string} planet1 - The name of the left planet.
 * @param {string} planet2 - The name of the right planet.
 * @param {THREE.Scene} scene - The Three.js scene.
 * @param {THREE.Camera} camera - The camera to adjust.
 * @param {Object} controls - Camera controls to update.
 */
export function comparePlanets(planet1, planet2, scene, camera, controls) {
  // Cleanup any existing planets using Promises for brevity.
  const cleanupOldPlanets = () => {
    const removals = [];
    if (currentComparison.leftObject) {
      removals.push(
        new Promise((resolve) => {
          animateOut(currentComparison.leftObject, "left", () => {
            scene.remove(currentComparison.leftObject);
            resolve();
          });
        })
      );
    }
    if (currentComparison.rightObject) {
      removals.push(
        new Promise((resolve) => {
          animateOut(currentComparison.rightObject, "right", () => {
            scene.remove(currentComparison.rightObject);
            resolve();
          });
        })
      );
    }
    return Promise.all(removals).then(() => {
      currentComparison.leftObject = currentComparison.rightObject = null;
    });
  };

  cleanupOldPlanets().then(() => {
    // Load the new planet models.
    currentComparison.leftObject = getPlanetInstance(planet1);
    currentComparison.rightObject = getPlanetInstance(planet2);
    scene.add(currentComparison.leftObject, currentComparison.rightObject);
    performComparisonLayout(scene, camera, controls);
  });
}

/**
 * Continuously updates the rotation of the compared planets.
 */
export function updateComparisonRotation() {
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
 * Makes all planet meshes in the scene visible.
 * @param {THREE.Scene} scene - The Three.js scene.
 */
export function showAllPlanets(scene) {
  scene.traverse((object) => {
    if (object.isMesh && object.userData.isPlanet) {
      object.visible = true;
    }
  });
}

/**
 * Hides any planet meshes in the scene that are not in the compared list.
 * @param {THREE.Scene} scene - The Three.js scene.
 * @param {string[]} comparedPlanets - Array of planet names that should remain visible.
 */
export function hideNonComparedPlanets(scene, comparedPlanets) {
  scene.traverse((object) => {
    if (object.isMesh && object.userData.isPlanet) {
      object.visible = comparedPlanets.includes(object.name);
    }
  });
}
