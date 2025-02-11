import * as THREE from 'three';
import gsap from 'gsap';

let currentComparison = { leftObject: null, rightObject: null };

/**
 * Animate a planet out before removal.
 */
function animateOut(object, side, onComplete) {
  gsap.to(object.scale, {
    x: 0,
    y: 0,
    z: 0,
    duration: 1,
    ease: 'power2.in',
    onComplete: onComplete,
  });
}

/**
 * Show all planets in the scene.
 */
function showAllPlanets(scene) {
  scene.traverse((obj) => {
    if (obj.isMesh && obj.userData.isPlanet) {
      obj.visible = true;
    }
  });
}

/**
 * Hide all planets except the compared ones.
 */
function hideNonComparedPlanets(scene, comparedNames) {
  scene.traverse((obj) => {
    if (obj.isMesh && obj.userData.isPlanet) {
      obj.visible = comparedNames.includes(obj.name.toLowerCase());
    }
  });
}

/**
 * Resets the scene after a comparison:
 * - Animates out and removes any compared planets.
 * - Restores the default positions/visibility for all planets.
 * - If a single planet is selected (via search), only that planet remains visible.
 *
 * @param {THREE.Scene} scene - The Three.js scene.
 * @param {THREE.Camera} camera - The camera to adjust (if needed).
 * @param {Object} controls - Camera controls to update (if needed).
 * @param {string|null} selectedPlanet - The name of the planet that should remain visible.
 */
export function resetComparedPlanets(scene, camera, controls, selectedPlanet = null) {
  // Animate out any compared planets and remove them from the scene.
  const removals = [];
  if (currentComparison.leftObject) {
    removals.push(
      new Promise((resolve) => {
        animateOut(currentComparison.leftObject, 'left', () => {
          scene.remove(currentComparison.leftObject);
          resolve();
        });
      })
    );
  }
  if (currentComparison.rightObject) {
    removals.push(
      new Promise((resolve) => {
        animateOut(currentComparison.rightObject, 'right', () => {
          scene.remove(currentComparison.rightObject);
          resolve();
        });
      })
    );
  }
  Promise.all(removals).then(() => {
    currentComparison.leftObject = currentComparison.rightObject = null;

    // Restore all planet visibility.
    showAllPlanets(scene);

    // If a single planet is selected, hide all others.
    if (selectedPlanet) {
      hideNonComparedPlanets(scene, [selectedPlanet.toLowerCase()]);
    }

    // Restore planet positions (if their original positions were stored)
    scene.traverse((obj) => {
      if (obj.isMesh && obj.userData.isPlanet && obj.userData.defaultPosition) {
        obj.position.copy(obj.userData.defaultPosition);
      }
    });

    // Reset the camera to its default position
    const defaultCenter = new THREE.Vector3(0, 0, 0);
    const defaultCameraPos = new THREE.Vector3(0, 0, 10000);
    controls.enabled = false;
    gsap.to(camera.position, {
      x: defaultCameraPos.x,
      y: defaultCameraPos.y,
      z: defaultCameraPos.z,
      duration: 2,
      ease: 'power2.out',
      onUpdate: () => camera.lookAt(defaultCenter),
      onComplete: () => (controls.enabled = true),
    });
    gsap.to(controls.target, {
      x: defaultCenter.x,
      y: defaultCenter.y,
      z: defaultCenter.z,
      duration: 2,
      ease: 'power2.out',
    });
  });
}
