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

  const boxLeft = new THREE.Box3().setFromObject(currentComparison.leftObject);
  const sphereLeft = boxLeft.getBoundingSphere(new THREE.Sphere());
  const boxRight = new THREE.Box3().setFromObject(currentComparison.rightObject);
  const sphereRight = boxRight.getBoundingSphere(new THREE.Sphere());

  const center = new THREE.Vector3()
    .addVectors(sphereLeft.center, sphereRight.center)
    .multiplyScalar(0.5);

  const margin = 1000;
  const separation = sphereLeft.radius + sphereRight.radius + margin;

  const targetPosLeft = new THREE.Vector3(center.x - separation * 0.5, center.y, center.z);
  const targetPosRight = new THREE.Vector3(center.x + separation * 0.5, center.y, center.z);

  animateIn(currentComparison.leftObject, "left", targetPosLeft, () => {});
  animateIn(currentComparison.rightObject, "right", targetPosRight, () => {});

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
    onComplete: () => (controls.enabled = true)
  });

  gsap.to(controls.target, {
    x: center.x,
    y: center.y,
    z: center.z,
    duration: 2,
    ease: "power2.out"
  });
}

export function comparePlanets(planet1, planet2, scene, camera, controls) {
  if (currentComparison.leftObject && currentComparison.rightObject) {
    animateOut(currentComparison.leftObject, "left", () => {
      scene.remove(currentComparison.leftObject);
    });
    animateOut(currentComparison.rightObject, "right", () => {
      scene.remove(currentComparison.rightObject);
    });
  }

  currentComparison.leftObject = getPlanetInstance(planet1);
  currentComparison.rightObject = getPlanetInstance(planet2);

  scene.add(currentComparison.leftObject);
  scene.add(currentComparison.rightObject);

  performComparisonLayout(scene, camera, controls);
}

export function updateComparisonRotation() {
  const rotationSpeed = 0.002;
  if (currentComparison.leftObject) currentComparison.leftObject.rotation.y += rotationSpeed;
  if (currentComparison.rightObject) currentComparison.rightObject.rotation.y += rotationSpeed;
}
