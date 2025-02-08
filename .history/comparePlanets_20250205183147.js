import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { planetTemplates } from "./loadPlanets.js"; // adjust path as needed

let currentComparison = {
  left: null,
  right: null,
  leftObject: null,
  rightObject: null
};

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
    if (child.isMesh && !child.name) child.name = lowerName;
  });
  return instance;
}

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

function performComparisonLayout(scene, camera, controls) {
  if (!currentComparison.leftObject || !currentComparison.rightObject) return;

  // Create bounding spheres for accurate positioning
  const boxLeft = new THREE.Box3().setFromObject(currentComparison.leftObject);
  const sphereLeft = boxLeft.getBoundingSphere(new THREE.Sphere());
  const boxRight = new THREE.Box3().setFromObject(currentComparison.rightObject);
  const sphereRight = boxRight.getBoundingSphere(new THREE.Sphere());

  // Calculate the midpoint between the two planets
  const center = new THREE.Vector3()
    .addVectors(sphereLeft.center, sphereRight.center)
    .multiplyScalar(0.5);

  const margin = 1000;
  const separation = sphereLeft.radius + sphereRight.radius + margin;

  // Set target positions
  const targetPosLeft = new THREE.Vector3(center.x - separation * 0.5, center.y, center.z);
  const targetPosRight = new THREE.Vector3(center.x + separation * 0.5, center.y, center.z);

  // Animate planets toward each other
  gsap.to(currentComparison.leftObject.position, {
    x: targetPosLeft.x,
    y: targetPosLeft.y,
    z: targetPosLeft.z,
    duration: 2,
    ease: "power2.out"
  });

  gsap.to(currentComparison.rightObject.position, {
    x: targetPosRight.x,
    y: targetPosRight.y,
    z: targetPosRight.z,
    duration: 2,
    ease: "power2.out"
  });

  // Fade in the planets as they arrive
  gsap.to(currentComparison.leftObject.material, {
    opacity: 1,
    duration: 2,
    ease: "power2.out"
  });

  gsap.to(currentComparison.rightObject.material, {
    opacity: 1,
    duration: 2,
    ease: "power2.out"
  });

  // Camera movement with zoom-in effect
  const cameraDistance = separation + Math.max(sphereLeft.radius, sphereRight.radius) * 8;
  const targetCameraPos = new THREE.Vector3(center.x, center.y, center.z + cameraDistance);

  gsap.to(camera.position, {
    x: targetCameraPos.x,
    y: targetCameraPos.y,
    z: targetCameraPos.z,
    duration: 2,
    ease: "power2.out",
    onUpdate: () => camera.lookAt(center),
  });

  // Camera zoom-in effect (Field of View adjustment)
  gsap.to(camera, {
    fov: 50,
    duration: 2,
    ease: "power2.out",
    onUpdate: () => camera.updateProjectionMatrix(),
  });

  // Adjust controls target for smooth look-at
  gsap.to(controls.target, {
    x: center.x,
    y: center.y,
    z: center.z,
    duration: 2,
    ease: "power2.out"
  });

  // Enable controls after animation is done
  gsap.delayedCall(2, () => {
    controls.enabled = true;
  });
}


export function comparePlanets(planet1, planet2, scene, camera, controls) {
  const cleanupOldPlanets = (onComplete) => {
      let objectsToRemove = 0;
      let removedCount = 0;

      const checkAndComplete = () => {
          removedCount++;
          if (removedCount === objectsToRemove) {
              currentComparison.leftObject = null;
              currentComparison.rightObject = null;
              onComplete(); // Proceed to next comparison after cleanup
          }
      };

      if (currentComparison.leftObject) {
          objectsToRemove++;
          animateOut(currentComparison.leftObject, "left", () => {
              scene.remove(currentComparison.leftObject);
              checkAndComplete();
          });
      }
      if (currentComparison.rightObject) {
          objectsToRemove++;
          animateOut(currentComparison.rightObject, "right", () => {
              scene.remove(currentComparison.rightObject);
              checkAndComplete();
          });
      }

      // If no planets were present, trigger immediately
      if (objectsToRemove === 0) {
          onComplete();
      }
  };

  cleanupOldPlanets(() => {
      currentComparison.leftObject = getPlanetInstance(planet1);
      currentComparison.rightObject = getPlanetInstance(planet2);

      scene.add(currentComparison.leftObject);
      scene.add(currentComparison.rightObject);

      performComparisonLayout(scene, camera, controls);
  });
}

export function updateComparisonRotation() {
  const rotationSpeed = 0.002;
  if (currentComparison.leftObject) currentComparison.leftObject.rotation.y += rotationSpeed;
  if (currentComparison.rightObject) currentComparison.rightObject.rotation.y += rotationSpeed;
}


export function showAllPlanets(scene) {
  scene.traverse((object) => {
      if (object.isMesh && object.userData.isPlanet) {
          object.visible = true; // Make all planets visible
      }
  });
}

// 🚫 Hide non-compared planets (new function)
export function hideNonComparedPlanets(scene, comparedPlanets) {
  scene.traverse((object) => {
      if (object.isMesh && object.userData.isPlanet) {
          object.visible = comparedPlanets.includes(object.name); // Only show compared planets
      }
  });
}

