import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

/**
 * Compare two planets by repositioning them side by side.
 * @param {string} planetName1 - The first planet's name.
 * @param {string} planetName2 - The second planet's name.
 * @param {THREE.Scene} scene - The scene containing the planets.
 * @param {THREE.Camera} camera - The camera to animate.
 * @param {OrbitControls} controls - The OrbitControls instance.
 */
export function comparePlanets(planetName1, planetName2, scene, camera, controls) {
  // Retrieve the planet objects from the scene.
  const planet1 = scene.getObjectByName(planetName1.toLowerCase());
  const planet2 = scene.getObjectByName(planetName2.toLowerCase());
  if (!planet1 || !planet2) {
    console.error(`❌ One or both planets not found: "${planetName1}", "${planetName2}"`);
    return;
  }

  // Reset positions to the original positions if available.
  // (Ensure that you saved the original position during model loading.)
  if (planet1.userData.originalPosition) {
    planet1.position.copy(planet1.userData.originalPosition);
  }
  if (planet2.userData.originalPosition) {
    planet2.position.copy(planet2.userData.originalPosition);
  }

  // Update matrices so world transforms are current.
  planet1.updateMatrixWorld(true);
  planet2.updateMatrixWorld(true);

  // Compute each planet's bounding sphere for size and center information.
  const box1 = new THREE.Box3().setFromObject(planet1);
  const sphere1 = box1.getBoundingSphere(new THREE.Sphere());
  const box2 = new THREE.Box3().setFromObject(planet2);
  const sphere2 = box2.getBoundingSphere(new THREE.Sphere());

  // Compute a "comparison center" (midpoint between the two planet centers).
  const center = new THREE.Vector3().addVectors(sphere1.center, sphere2.center).multiplyScalar(0.5);

  // Determine a separation distance based on the sum of the two radii plus a margin.
  const margin = 1000; // Adjust margin as needed.
  const separation = sphere1.radius + sphere2.radius + margin;

  // Define target positions relative to the center.
  // Planet1 goes to the left (negative X) and planet2 to the right.
  const targetPos1 = new THREE.Vector3(center.x - separation * 0.5, center.y, center.z);
  const targetPos2 = new THREE.Vector3(center.x + separation * 0.5, center.y, center.z);

  // Animate repositioning of the planets using gsap.
  gsap.to(planet1.position, {
    x: targetPos1.x,
    y: targetPos1.y,
    z: targetPos1.z,
    duration: 2,
    ease: "power2.out"
  });
  
  gsap.to(planet2.position, {
    x: targetPos2.x,
    y: targetPos2.y,
    z: targetPos2.z,
    duration: 2,
    ease: "power2.out"
  });

  // Adjust the camera so that both planets appear in view.
  const maxRadius = Math.max(sphere1.radius, sphere2.radius);
  // Adjust the multiplier as needed to achieve a nice framing.
  const cameraDistance = separation + maxRadius * 4;
  
  // Define the target camera position: offset along the Z axis relative to the center.
  const targetCameraPos = new THREE.Vector3(center.x, center.y, center.z + cameraDistance);

  // Disable OrbitControls during the camera animation.
  controls.enabled = false;
  gsap.to(camera.position, {
    x: targetCameraPos.x,
    y: targetCameraPos.y,
    z: targetCameraPos.z,
    duration: 2,
    ease: "power2.out",
    onUpdate: () => {
      camera.lookAt(center);
    },
    onComplete: () => {
      controls.enabled = true;
    }
  });
  
  // Animate updating the OrbitControls target to the new center.
  gsap.to(controls.target, {
    x: center.x,
    y: center.y,
    z: center.z,
    duration: 2,
    ease: "power2.out"
  });
}
