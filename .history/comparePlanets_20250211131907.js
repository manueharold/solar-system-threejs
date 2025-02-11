// comparePlanets.js

import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import {
  rotationSpeeds,
  planetTemplates,
  loadPlanetAsync,
  loader,
  planetData,
} from "./loadPlanets.js";

// Define zoom limits for the camera.
const MIN_ZOOM = 5000;   // Minimum zoom distance (adjust as needed)
const MAX_ZOOM = 30000;  // Maximum zoom distance (adjust as needed)

// Stores the currently compared planet objects.
const currentComparison = {
  leftObject: null,
  rightObject: null,
};

/**
 * Determines if Orbit Mode is active.
 */
const isOrbitModeActive = () => window.orbitModeEnabled === true;

/**
 * Applies quality settings (texture encoding, filtering, anisotropy, etc.)
 * from the original object to the newly loaded one.
 *
 * @param {THREE.Object3D} newObj - The new instance.
 * @param {THREE.Object3D} originalObj - The original instance.
 */
const applyQualitySettings = (newObj, originalObj) => {
  newObj.traverse((child) => {
    if (child.isMesh && child.material && child.material.map) {
      const origChild = originalObj.getObjectByName(child.name);
      if (origChild && origChild.material && origChild.material.map) {
        child.material.map = origChild.material.map;
        child.material.map.encoding = THREE.sRGBEncoding;
        child.material.map.minFilter =
          origChild.material.map.minFilter || THREE.LinearFilter;
        child.material.map.magFilter =
          origChild.material.map.magFilter || THREE.LinearFilter;
        child.material.map.anisotropy =
          origChild.material.map.anisotropy || 16;
        child.material.needsUpdate = true;
      }
    }
  });
};

/**
 * Returns a planet instance for comparison.
 * For Earth, reloads a fresh instance and applies quality settings.
 * For the Sun, returns a scaled version of the cached template.
 * For other planets, clones the cached template.
 *
 * @param {string} name - The planet name.
 * @param {THREE.Scene} scene - The scene to add the planet.
 * @returns {Promise<THREE.Object3D|null>}
 */
async function getPlanetInstance(name, scene) {
  const lowerName = name.toLowerCase();
  if (lowerName === "earth") {
    const modelPath =
      "https://raw.githubusercontent.com/manueharold/solar-system-threejs/main/3d_models_compressed/earth_draco.glb";
    const newEarth = await loadPlanetAsync(
      loader,
      scene,
      "earth",
      modelPath,
      [planetData.earth.distance, 0, 0],
      planetData.earth.scale * planetData.earth.size
    );
    const originalEarth = planetTemplates["earth"];
    if (originalEarth) applyQualitySettings(newEarth, originalEarth);
    return newEarth;
  }

  if (lowerName === "sun") {
    const template = planetTemplates[lowerName];
    if (!template) {
      console.error(`Template for "${name}" not found.`);
      return null;
    }
    // Scale the Sun for comparison only once.
    if (!template.userData.comparisonScaled) {
      template.scale.multiplyScalar(0.05);
      template.userData.comparisonScaled = true;
    }
    return template;
  }

  // For other planets, clone the template.
  const template = planetTemplates[lowerName];
  if (!template) {
    console.error(`Template for "${name}" not found.`);
    return null;
  }
  const instance = template.clone(true);
  instance.name = lowerName;
  instance.traverse((child) => {
    if (child.isMesh) {
      if (!child.name) child.name = lowerName;
      if (child.material) child.material = child.material.clone();
    }
  });
  return instance;
}

/**
 * Animates the opacity of all transparent materials in the planet.
 *
 * @param {THREE.Object3D} planet - The planet object.
 * @param {number} targetOpacity - The target opacity.
 * @param {number} duration - Animation duration.
 * @param {string} ease - GSAP easing.
 */
const animateMaterials = (planet, targetOpacity, duration, ease) => {
  planet.traverse((child) => {
    if (child.material && child.material.transparent) {
      gsap.to(child.material, { opacity: targetOpacity, duration, ease });
    }
  });
};

/**
 * Animates a planet offscreen.
 *
 * @param {THREE.Object3D} planet - The planet to animate out.
 * @param {string} side - "left" or "right".
 * @param {Function} onComplete - Callback after animation.
 */
const animateOut = (planet, side, onComplete) => {
  const offset = side === "left" ? -2000 : 2000;
  gsap.to(planet.position, {
    x: planet.position.x + offset,
    duration: 1,
    ease: "power2.in",
  });
  animateMaterials(planet, 0, 1, "power2.in");
  gsap.delayedCall(1, onComplete);
};

/**
 * Animates a planet into view.
 *
 * @param {THREE.Object3D} planet - The planet to animate in.
 * @param {string} side - "left" or "right".
 * @param {THREE.Vector3} targetPos - The target position.
 * @param {Function} onComplete - Callback after animation.
 */
const animateIn = (planet, side, targetPos, onComplete) => {
  const startX = side === "left" ? targetPos.x - 2000 : targetPos.x + 2000;
  planet.position.set(startX, targetPos.y, targetPos.z);
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
};

/**
 * Lays out the two compared planets side by side and adjusts the camera.
 *
 * @param {THREE.Scene} scene - The scene.
 * @param {THREE.PerspectiveCamera} camera - The camera.
 * @param {Object} controls - The OrbitControls instance.
 */
const performComparisonLayout = (scene, camera, controls) => {
  const { leftObject, rightObject } = currentComparison;
  if (!leftObject || !rightObject) return;

  // Compute bounding spheres.
  const sphereLeft = new THREE.Box3().setFromObject(leftObject).getBoundingSphere(new THREE.Sphere());
  const sphereRight = new THREE.Box3().setFromObject(rightObject).getBoundingSphere(new THREE.Sphere());

  // Compute the midpoint and separation.
  const center = new THREE.Vector3()
    .addVectors(sphereLeft.center, sphereRight.center)
    .multiplyScalar(0.5);
  const margin = 1000;
  const separation = sphereLeft.radius + sphereRight.radius + margin;

  // Set target positions for left and right objects.
  const targetPosLeft = new THREE.Vector3(center.x - separation * 0.5, center.y, center.z);
  const targetPosRight = new THREE.Vector3(center.x + separation * 0.5, center.y, center.z);

  animateIn(leftObject, "left", targetPosLeft, () => {});
  animateIn(rightObject, "right", targetPosRight, () => {});

  // Calculate an appropriate camera distance.
  let cameraDistance = separation + Math.max(sphereLeft.radius, sphereRight.radius) * 8;
  cameraDistance = Math.max(MIN_ZOOM, Math.min(cameraDistance, MAX_ZOOM));
  const targetCameraPos = new THREE.Vector3(center.x, center.y, center.z + cameraDistance);

  controls.minDistance = MIN_ZOOM;
  controls.maxDistance = MAX_ZOOM;
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
};

/**
 * Compares two planets by cleaning up any existing ones,
 * loading new models, and setting up the scene layout.
 *
 * @param {string} planet1 - The first planet name.
 * @param {string} planet2 - The second planet name.
 * @param {THREE.Scene} scene - The scene.
 * @param {THREE.PerspectiveCamera} camera - The camera.
 * @param {Object} controls - The OrbitControls instance.
 */
export const comparePlanets = async (planet1, planet2, scene, camera, controls) => {
  if (isOrbitModeActive()) {
    console.log("Comparison is disabled in Orbit Mode.");
    return;
  }

  // Cleanup any existing compared planets.
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

  await cleanupOldPlanets();

  // Load the new planet instances.
  currentComparison.leftObject = await getPlanetInstance(planet1, scene);
  currentComparison.rightObject = await getPlanetInstance(planet2, scene);

  // Special handling if either planet is the Sun.
  if (planet1.toLowerCase() === "sun" || planet2.toLowerCase() === "sun") {
    scene.traverse((obj) => {
      if (
        obj.name === "sun" &&
        obj !== currentComparison.leftObject &&
        obj !== currentComparison.rightObject
      ) {
        scene.remove(obj);
      }
    });
  }

  // Add the compared objects to the scene.
  scene.add(currentComparison.leftObject, currentComparison.rightObject);
  performComparisonLayout(scene, camera, controls);
};

/**
 * Continuously updates the rotation of the compared planets.
 */
export const updateComparisonRotation = () => {
  if (isOrbitModeActive()) return;
  const { leftObject, rightObject } = currentComparison;

  if (leftObject && leftObject.name !== "sun") {
    const speed = rotationSpeeds[leftObject.name] || 0.002;
    leftObject.rotation.y += speed;
  }

  if (rightObject && rightObject.name !== "sun") {
    const speed = rotationSpeeds[rightObject.name] || 0.002;
    rightObject.rotation.y += speed;
  }
};

/**
 * Makes all planet meshes in the scene visible.
 *
 * @param {THREE.Scene} scene - The scene.
 */
export const showAllPlanets = (scene) => {
  scene.traverse((object) => {
    if (object.isMesh && object.userData.isPlanet) {
      object.visible = true;
    }
  });
};

/**
 * Hides any planet meshes in the scene that are not in the compared list.
 *
 * @param {THREE.Scene} scene - The scene.
 * @param {string[]} comparedPlanets - Array of planet names to remain visible.
 */
export const hideNonComparedPlanets = (scene, comparedPlanets) => {
  scene.traverse((object) => {
    if (object.isMesh && object.userData.isPlanet) {
      object.visible = comparedPlanets.includes(object.name);
    }
  });
};
