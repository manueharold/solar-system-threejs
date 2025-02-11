// comparePlanets.js

import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { rotationSpeeds, planetTemplates, loadPlanetAsync, loader, planetData } from "./loadPlanets.js";

// Define zoom limits for the camera.
const MIN_ZOOM = 5000;   // Minimum zoom distance (adjust as needed)
const MAX_ZOOM = 30000;  // Maximum zoom distance (adjust as needed)

// Object to store the currently compared planet objects.
const currentComparison = {
  leftObject: null,
  rightObject: null,
};

/**
 * Helper to determine if Orbit Mode is active.
 */
function isOrbitModeActive() {
  return window.orbitModeEnabled === true;
}

/**
 * Applies quality settings (texture encoding, filtering, anisotropy, etc.)
 * from the original object to the newly loaded one.
 *
 * @param {THREE.Object3D} newObj - The new (re‑loaded) Earth instance.
 * @param {THREE.Object3D} originalObj - The originally loaded Earth instance.
 */
function applyQualitySettings(newObj, originalObj) {
  newObj.traverse((child) => {
    if (child.isMesh && child.material && child.material.map) {
      // Attempt to find the corresponding mesh in the original object by name.
      const origChild = originalObj.getObjectByName(child.name);
      if (origChild && origChild.material && origChild.material.map) {
        // Reassign the texture reference from the original.
        child.material.map = origChild.material.map;
        // Reapply common quality settings.
        child.material.map.encoding = THREE.sRGBEncoding;
        // Use the same filtering as the original or fallback to defaults.
        child.material.map.minFilter = origChild.material.map.minFilter || THREE.LinearFilter;
        child.material.map.magFilter = origChild.material.map.magFilter || THREE.LinearFilter;
        // Set anisotropy to the original value or a high value (e.g., 16).
        child.material.map.anisotropy = origChild.material.map.anisotropy || 16;
        child.material.needsUpdate = true;
      }
    }
  });
}

/**
 * Returns a planet instance for comparison.
 * If Earth is being compared, load it again (so it gets a fresh instance)
 * and then apply the same quality settings as the original Earth.
 */
async function getPlanetInstance(name, scene) {
  const lowerName = name.toLowerCase();
  
  if (lowerName === "earth") {
    // Re-load Earth from the same model path.
    const modelPath = "./3d_models_compressed/earth.glb";
    const newEarth = await loadPlanetAsync(
      loader,
      scene,
      "earth",
      modelPath,
      [planetData.earth.distance, 0, 0],
      planetData.earth.scale * planetData.earth.size
    );
    // Apply the texture and material settings from the original Earth.
    const originalEarth = planetTemplates["earth"];
    if (originalEarth) {
      applyQualitySettings(newEarth, originalEarth);
    }
    return newEarth;
  }
  
  // For Sun and other planets, use the cached template.
  const template = planetTemplates[lowerName];
  if (!template) {
    console.error(`Template for "${name}" not found.`);
    return null;
  }
  if (lowerName === "sun") {
    if (!template.userData.comparisonScaled) {
      template.scale.multiplyScalar(0.05);
      template.userData.comparisonScaled = true;
    }
    return template;
  } else {
    // For other planets, clone the template.
    const instance = template.clone(true);
    instance.name = lowerName;
    instance.traverse((child) => {
      if (child.isMesh) {
        if (!child.name) child.name = lowerName;
        if (child.material) {
          child.material = child.material.clone();
        }
      }
    });
    return instance;
  }
}

/**
 * Helper to animate opacity for all transparent materials of a planet.
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
 */
function animateIn(planet, side, targetPos, onComplete) {
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
}

/**
 * Lays out the two compared planets side by side and adjusts the camera.
 */
function performComparisonLayout(scene, camera, controls) {
  if (!currentComparison.leftObject || !currentComparison.rightObject) return;

  // Compute bounding spheres.
  const sphereLeft = new THREE.Box3()
    .setFromObject(currentComparison.leftObject)
    .getBoundingSphere(new THREE.Sphere());
  const sphereRight = new THREE.Box3()
    .setFromObject(currentComparison.rightObject)
    .getBoundingSphere(new THREE.Sphere());

  // Compute the midpoint and separation.
  const center = sphereLeft.center.clone().add(sphereRight.center).multiplyScalar(0.5);
  const margin = 1000;
  const separation = sphereLeft.radius + sphereRight.radius + margin;

  // Set target positions.
  const targetPosLeft = new THREE.Vector3(center.x - separation * 0.5, center.y, center.z);
  const targetPosRight = new THREE.Vector3(center.x + separation * 0.5, center.y, center.z);

  animateIn(currentComparison.leftObject, "left", targetPosLeft, () => {});
  animateIn(currentComparison.rightObject, "right", targetPosRight, () => {});

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
}

/**
 * Compares two planets by cleaning up any existing ones, loading new models,
 * and setting up the scene layout.
 */
export async function comparePlanets(planet1, planet2, scene, camera, controls) {
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

  // Get the planet instances asynchronously.
  currentComparison.leftObject = await getPlanetInstance(planet1, scene);
  currentComparison.rightObject = await getPlanetInstance(planet2, scene);
  
  // Special handling if either is the Sun.
  if (planet1.toLowerCase() === "sun" || planet2.toLowerCase() === "sun") {
    const sunsToRemove = [];
    scene.traverse((obj) => {
      if (obj.name === "sun" &&
          obj !== currentComparison.leftObject &&
          obj !== currentComparison.rightObject) {
        sunsToRemove.push(obj);
      }
    });
    sunsToRemove.forEach((obj) => scene.remove(obj));
  }
  
  // Add the compared objects to the scene.
  scene.add(currentComparison.leftObject, currentComparison.rightObject);
  performComparisonLayout(scene, camera, controls);
}

/**
 * Continuously updates the rotation of the compared planets.
 */
export function updateComparisonRotation() {
  if (isOrbitModeActive()) return;
  
  if (currentComparison.leftObject && currentComparison.leftObject.name !== "sun") {
    const speed = rotationSpeeds[currentComparison.leftObject.name] || 0.002;
    currentComparison.leftObject.rotation.y += speed;
  }
  
  if (currentComparison.rightObject && currentComparison.rightObject.name !== "sun") {
    const speed = rotationSpeeds[currentComparison.rightObject.name] || 0.002;
    currentComparison.rightObject.rotation.y += speed;
  }
}

/**
 * Makes all planet meshes in the scene visible.
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
 */
export function hideNonComparedPlanets(scene, comparedPlanets) {
  scene.traverse((object) => {
    if (object.isMesh && object.userData.isPlanet) {
      object.visible = comparedPlanets.includes(object.name);
    }
  });
}
