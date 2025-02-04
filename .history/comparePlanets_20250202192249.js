import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// Global variable to store current comparison state.
let currentComparison = {
  left: null,         // The current left planet's name.
  right: null,        // The current right planet's name.
  leftObject: null,   // The actual THREE.Object3D for the left planet.
  rightObject: null   // The actual THREE.Object3D for the right planet.
};

/**
 * Animate a planet offscreen and fade it out.
 * @param {THREE.Object3D} planet - The planet to animate out.
 * @param {string} side - 'left' or 'right' (determines direction of exit).
 * @param {function} onComplete - Callback when animation finishes.
 */

function animateOut(planet, side, onComplete) {
    const offset = side === 'left' ? -2000 : 2000;
    // Animate position offscreen.
    gsap.to(planet.position, {
      x: planet.position.x + offset,
      duration: 1,
      ease: "power2.in"
    });
    // Fade out all materials that support opacity.
    planet.traverse(child => {
      if (child.material && child.material.transparent) {
        gsap.to(child.material, {
          opacity: 0,
          duration: 1,
          ease: "power2.in"
        });
      }
    });
    gsap.delayedCall(1, () => {
      planet.visible = false; // Hide the planet instead of removing it
      onComplete();
    });
  }

/**
 * Animate a planet from offscreen into its target position and fade it in.
 * @param {THREE.Object3D} planet - The planet to animate in.
 * @param {string} side - 'left' or 'right' (determines direction from which it comes in).
 * @param {THREE.Vector3} targetPos - The target position for the planet.
 * @param {function} onComplete - Callback when animation finishes.
 */
function animateIn(planet, side, targetPos, onComplete) {
    // Starting position: offscreen from left if side === 'left', from right if side === 'right'.
    const startX = side === 'left' ? targetPos.x - 2000 : targetPos.x + 2000;
    planet.position.set(startX, targetPos.y, targetPos.z);
    // Set materials' opacity to 0.
    planet.traverse(child => {
      if (child.material && child.material.transparent) {
        child.material.opacity = 0;
      }
    });
    planet.visible = true; // Make the planet visible before animating it in
    // Animate to target position.
    gsap.to(planet.position, {
      x: targetPos.x,
      duration: 1.5,
      ease: "power2.out"
    });
    // Animate opacity to 1.
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
 * Compare two planets by positioning them side by side.
 * If one side is changed, animate the replaced planet out and the new planet in.
 * @param {string} newLeftName - The left planet's name (lowercase).
 * @param {string} newRightName - The right planet's name (lowercase).
 * @param {THREE.Scene} scene - The scene containing the planets.
 * @param {THREE.Camera} camera - The camera to animate.
 * @param {OrbitControls} controls - The OrbitControls instance.
 */
export function comparePlanets(newLeftName, newRightName, scene, camera, controls) {
    // Helper to retrieve a planet object by name from the scene.
    const getPlanetByName = name => scene.getObjectByName(name);
  
    // Process left side.
    if (currentComparison.left !== newLeftName) {
        // If a left planet is currently displayed, animate it out.
        if (currentComparison.leftObject) {
          animateOut(currentComparison.leftObject, 'left', () => {
            currentComparison.leftObject = null; // Just set the reference to null
          });
        }
  
       // Load new left planet.
       const newLeftPlanet = getPlanetByName(newLeftName);
       if (!newLeftPlanet) {
         console.error(`Planet "${newLeftName}" not found in scene.`);
         return;
       }
   
      // Reset opacity and add the planet to the scene if not already present.
      newLeftPlanet.traverse(child => {
        if (child.material && child.material.transparent) {
          child.material.opacity = 0; // Set opacity to 0 initially for smooth fade-in.
        }
      });
  
      if (!newLeftPlanet.parent) scene.add(newLeftPlanet);
      currentComparison.leftObject = newLeftPlanet;
      currentComparison.left = newLeftName;
  
      // Animate the new left planet into position.
      animateIn(newLeftPlanet, 'left', newLeftPlanet.position, () => {
        // Set opacity to 1 after the animation finishes.
        newLeftPlanet.traverse(child => {
          if (child.material && child.material.transparent) {
            gsap.to(child.material, { opacity: 1, duration: 0.5 }); // Ensure opacity is 1 after animation.
          }
        });
  
        // Delay layout update until after animation.
        performComparisonLayout(scene, camera, controls);
      });
    }
  
   // Process right side.
   if (currentComparison.right !== newRightName) {
    // If a right planet is currently displayed, animate it out.
    if (currentComparison.rightObject) {
      animateOut(currentComparison.rightObject, 'right', () => {
        currentComparison.rightObject = null; // Just set the reference to null
      });
    }

    // Load new right planet.
    const newRightPlanet = getPlanetByName(newRightName);
    if (!newRightPlanet) {
      console.error(`Planet "${newRightName}" not found in scene.`);
      return;
    }

    // Reset opacity and add the planet to the scene if not already present.
    newRightPlanet.traverse(child => {
      if (child.material && child.material.transparent) {
        child.material.opacity = 0; // Set opacity to 0 initially for smooth fade-in.
      }
    });

  
       if (!newRightPlanet.parent) scene.add(newRightPlanet);
      currentComparison.rightObject = newRightPlanet;
      currentComparison.right = newRightName;
  
      // Animate the new right planet into position.
      animateIn(newRightPlanet, 'right', newRightPlanet.position, () => {
        // Set opacity to 1 after the animation finishes.
        newRightPlanet.traverse(child => {
          if (child.material && child.material.transparent) {
            gsap.to(child.material, { opacity: 1, duration: 0.5 }); // Ensure opacity is 1 after animation.
          }
        });
  
        // Delay layout update until after animation.
        performComparisonLayout(scene, camera, controls);
      });
    }
  
    // Update layout if both planets are set correctly
    if (currentComparison.left === newLeftName && currentComparison.right === newRightName) {
      performComparisonLayout(scene, camera, controls);
    }
  }

/**
 * Compute target positions for left and right planets and animate camera.
 * This function positions the two compared planets side by side.
 */
function performComparisonLayout(scene, camera, controls) {
  if (!currentComparison.leftObject || !currentComparison.rightObject) {
    // Need both planets available.
    return;
  }
  
  // Ensure world matrices are updated.
  currentComparison.leftObject.updateMatrixWorld(true);
  currentComparison.rightObject.updateMatrixWorld(true);
  
  // Compute bounding spheres.
  const boxLeft = new THREE.Box3().setFromObject(currentComparison.leftObject);
  const sphereLeft = boxLeft.getBoundingSphere(new THREE.Sphere());
  const boxRight = new THREE.Box3().setFromObject(currentComparison.rightObject);
  const sphereRight = boxRight.getBoundingSphere(new THREE.Sphere());
  
  // Compute the midpoint between the two planets.
  const center = new THREE.Vector3().addVectors(sphereLeft.center, sphereRight.center).multiplyScalar(0.5);
  
  // Determine a separation distance based on the spheres and a margin.
  const margin = 1000;
  const separation = sphereLeft.radius + sphereRight.radius + margin;
  
  // Define target positions:
  const targetPosLeft = new THREE.Vector3(center.x - separation * 0.5, center.y, center.z);
  const targetPosRight = new THREE.Vector3(center.x + separation * 0.5, center.y, center.z);
  
  // Animate in left planet if needed.
  if (currentComparison.leftObject.position.distanceTo(targetPosLeft) > 1) {
    animateIn(currentComparison.leftObject, 'left', targetPosLeft, () => {});
  } else {
    currentComparison.leftObject.position.copy(targetPosLeft);
  }
  // Animate in right planet if needed.
  if (currentComparison.rightObject.position.distanceTo(targetPosRight) > 1) {
    animateIn(currentComparison.rightObject, 'right', targetPosRight, () => {});
  } else {
    currentComparison.rightObject.position.copy(targetPosRight);
  }
  
  // Adjust the camera to frame both planets.
  const maxRadius = Math.max(sphereLeft.radius, sphereRight.radius);
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
