import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// Global variable to track the current comparison state.
let currentComparison = {
  left: null,         // Current left planet's name.
  right: null,        // Current right planet's name.
  leftObject: null,   // THREE.Object3D for the left planet.
  rightObject: null   // THREE.Object3D for the right planet.
};

// Global flag to indicate whether this is the first comparison.
let firstComparison = true;

/**
 * Animate a planet offscreen and fade it out.
 * @param {THREE.Object3D} planet - The planet to animate out.
 * @param {string} side - 'left' or 'right' (determines exit direction).
 * @param {function} onComplete - Callback when animation finishes.
 */
function animateOut(planet, side, onComplete) {
  const offset = side === 'left' ? -2000 : 2000;
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
 * Animate a planet from offscreen into its target position and fade it in.
 * @param {THREE.Object3D} planet - The planet to animate in.
 * @param {string} side - 'left' or 'right' (determines entry side).
 * @param {THREE.Vector3} targetPos - The target position.
 * @param {function} onComplete - Callback when animation finishes.
 */
function animateIn(planet, side, targetPos, onComplete) {
  const startX = side === 'left' ? targetPos.x - 2000 : targetPos.x + 2000;
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
 * Compute target positions for the left and right planets (side by side).
 * Returns an object with properties: center, leftTarget, rightTarget, separation.
 */
function computeTargets(leftObj, rightObj) {
  leftObj.updateMatrixWorld(true);
  rightObj.updateMatrixWorld(true);
  
  // Compute bounding spheres for each planet.
  const boxLeft = new THREE.Box3().setFromObject(leftObj);
  const sphereLeft = boxLeft.getBoundingSphere(new THREE.Sphere());
  const boxRight = new THREE.Box3().setFromObject(rightObj);
  const sphereRight = boxRight.getBoundingSphere(new THREE.Sphere());
  
  // Midpoint between the two planets.
  const center = new THREE.Vector3().addVectors(sphereLeft.center, sphereRight.center).multiplyScalar(0.5);
  
  // Separation based on the two radii plus margin.
  const margin = 1000;
  const separation = sphereLeft.radius + sphereRight.radius + margin;
  
  const leftTarget = new THREE.Vector3(center.x - separation * 0.5, center.y, center.z);
  const rightTarget = new THREE.Vector3(center.x + separation * 0.5, center.y, center.z);
  
  return { center, leftTarget, rightTarget, separation, maxRadius: Math.max(sphereLeft.radius, sphereRight.radius) };
}

/**
 * Perform layout update: reposition left/right planets.
 * If this is the first comparison, also animate the camera.
 */
function performComparisonLayout(scene, camera, controls) {
  if (!currentComparison.leftObject || !currentComparison.rightObject) return;
  
  const { center, leftTarget, rightTarget, separation, maxRadius } = computeTargets(currentComparison.leftObject, currentComparison.rightObject);
  
  // Animate planets into position.
  if (currentComparison.leftObject.position.distanceTo(leftTarget) > 1) {
    animateIn(currentComparison.leftObject, 'left', leftTarget, () => {});
  } else {
    currentComparison.leftObject.position.copy(leftTarget);
  }
  if (currentComparison.rightObject.position.distanceTo(rightTarget) > 1) {
    animateIn(currentComparison.rightObject, 'right', rightTarget, () => {});
  } else {
    currentComparison.rightObject.position.copy(rightTarget);
  }
  
  // If this is the first time, animate the camera to frame both planets.
  if (firstComparison) {
    // Calculate desired camera distance.
    const cameraDistance = separation + maxRadius * 4;
    const targetCameraPos = new THREE.Vector3(center.x, center.y, center.z + cameraDistance);
    
    controls.enabled = false;
    gsap.to(camera.position, {
      x: targetCameraPos.x,
      y: targetCameraPos.y,
      z: targetCameraPos.z,
      duration: 2,
      ease: "power2.out",
      onUpdate: () => camera.lookAt(center),
      onComplete: () => {
        controls.enabled = true;
        firstComparison = false; // Now subsequent comparisons won't move the camera.
      }
    });
    
    gsap.to(controls.target, {
      x: center.x,
      y: center.y,
      z: center.z,
      duration: 2,
      ease: "power2.out"
    });
  } else {
    // For subsequent comparisons, update OrbitControls target (if desired) without moving the camera.
    gsap.to(controls.target, {
      x: center.x,
      y: center.y,
      z: center.z,
      duration: 1,
      ease: "power2.out"
    });
  }
}

/**
 * Compare two planets by positioning them side by side.
 * - On the very first comparison, the camera will move to frame them.
 * - On subsequent changes, only the replaced planet animates off and in.
 * @param {string} newLeftName - Left planet's name (lowercase).
 * @param {string} newRightName - Right planet's name (lowercase).
 * @param {THREE.Scene} scene - The scene.
 * @param {THREE.Camera} camera - The camera.
 * @param {OrbitControls} controls - The OrbitControls instance.
 */
export function comparePlanets(newLeftName, newRightName, scene, camera, controls) {
  // Helper to get planet object from the scene by name.
  const getPlanetByName = name => scene.getObjectByName(name);
  
  // Process left side.
  if (currentComparison.left !== newLeftName) {
    if (currentComparison.leftObject) {
      // Animate out the old left planet.
      animateOut(currentComparison.leftObject, 'left', () => {
        scene.remove(currentComparison.leftObject);
        currentComparison.leftObject = null;
        currentComparison.left = null;
        // Add new left planet.
        const newLeftPlanet = getPlanetByName(newLeftName);
        if (!newLeftPlanet) {
          console.error(`Planet "${newLeftName}" not found in scene.`);
          return;
        }
        // Reset opacity.
        newLeftPlanet.traverse(child => {
          if (child.material && child.material.transparent) {
            child.material.opacity = 0;
          }
        });
        if (!newLeftPlanet.parent) scene.add(newLeftPlanet);
        currentComparison.leftObject = newLeftPlanet;
        currentComparison.left = newLeftName;
        performComparisonLayout(scene, camera, controls);
      });
    } else {
      // No current left planet; simply add it.
      const newLeftPlanet = getPlanetByName(newLeftName);
      if (!newLeftPlanet) {
        console.error(`Planet "${newLeftName}" not found in scene.`);
        return;
      }
      newLeftPlanet.traverse(child => {
        if (child.material && child.material.transparent) {
          child.material.opacity = 0;
        }
      });
      if (!newLeftPlanet.parent) scene.add(newLeftPlanet);
      currentComparison.leftObject = newLeftPlanet;
      currentComparison.left = newLeftName;
      performComparisonLayout(scene, camera, controls);
    }
  }
  
  // Process right side.
  if (currentComparison.right !== newRightName) {
    if (currentComparison.rightObject) {
      // Animate out the old right planet.
      animateOut(currentComparison.rightObject, 'right', () => {
        scene.remove(currentComparison.rightObject);
        currentComparison.rightObject = null;
        currentComparison.right = null;
        // Add new right planet.
        const newRightPlanet = getPlanetByName(newRightName);
        if (!newRightPlanet) {
          console.error(`Planet "${newRightName}" not found in scene.`);
          return;
        }
        newRightPlanet.traverse(child => {
          if (child.material && child.material.transparent) {
            child.material.opacity = 0;
          }
        });
        if (!newRightPlanet.parent) scene.add(newRightPlanet);
        currentComparison.rightObject = newRightPlanet;
        currentComparison.right = newRightName;
        performComparisonLayout(scene, camera, controls);
      });
    } else {
      // No current right planet; simply add it.
      const newRightPlanet = getPlanetByName(newRightName);
      if (!newRightPlanet) {
        console.error(`Planet "${newRightName}" not found in scene.`);
        return;
      }
      newRightPlanet.traverse(child => {
        if (child.material && child.material.transparent) {
          child.material.opacity = 0;
        }
      });
      if (!newRightPlanet.parent) scene.add(newRightPlanet);
      currentComparison.rightObject = newRightPlanet;
      currentComparison.right = newRightName;
      performComparisonLayout(scene, camera, controls);
    }
  }
  
  // If both sides are unchanged (or after processing), update layout.
  if (currentComparison.left === newLeftName && currentComparison.right === newRightName) {
    performComparisonLayout(scene, camera, controls);
  }
}
