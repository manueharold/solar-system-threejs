import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

let currentComparison = {
  left: null,
  right: null,
  leftObject: null,
  rightObject: null
};

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

function processPlanet(side, newName, scene, callback) {
  const currentObject = side === 'left' ? currentComparison.leftObject : currentComparison.rightObject;
  const getPlanetByName = name => scene.getObjectByName(name);

  if (currentObject) {
    animateOut(currentObject, side, () => {
      scene.remove(currentObject);
      currentComparison[`${side}Object`] = null;
      currentComparison[side] = null;

      const newPlanet = getPlanetByName(newName);
      if (newPlanet) {
        if (!newPlanet.parent) scene.add(newPlanet);
        currentComparison[`${side}Object`] = newPlanet;
        currentComparison[side] = newName;
        callback();
      }
    });
  } else {
    const newPlanet = getPlanetByName(newName);
    if (newPlanet) {
      if (!newPlanet.parent) scene.add(newPlanet);
      currentComparison[`${side}Object`] = newPlanet;
      currentComparison[side] = newName;
      callback();
    }
  }
}

export function comparePlanets(newLeftName, newRightName, scene, camera, controls) {
  let animationsCompleted = 0;

  const checkAndLayout = () => {
    animationsCompleted++;
    if (animationsCompleted === 2) {
      performComparisonLayout(scene, camera, controls);
    }
  };

  if (currentComparison.left !== newLeftName) {
    processPlanet('left', newLeftName, scene, checkAndLayout);
  } else {
    animationsCompleted++;
  }

  if (currentComparison.right !== newRightName) {
    processPlanet('right', newRightName, scene, checkAndLayout);
  } else {
    animationsCompleted++;
  }

  if (animationsCompleted === 2) {
    performComparisonLayout(scene, camera, controls);
  }
}

function performComparisonLayout(scene, camera, controls) {
  if (!currentComparison.leftObject || !currentComparison.rightObject) return;

  const left = currentComparison.leftObject;
  const right = currentComparison.rightObject;

  left.updateMatrixWorld();
  right.updateMatrixWorld();

  const sphereLeft = new THREE.Box3().setFromObject(left).getBoundingSphere(new THREE.Sphere());
  const sphereRight = new THREE.Box3().setFromObject(right).getBoundingSphere(new THREE.Sphere());

  const center = new THREE.Vector3().addVectors(sphereLeft.center, sphereRight.center).multiplyScalar(0.5);
  const margin = 500;
  const separation = sphereLeft.radius + sphereRight.radius + margin;

  const targetPosLeft = new THREE.Vector3(center.x - separation * 0.5, center.y, center.z);
  const targetPosRight = new THREE.Vector3(center.x + separation * 0.5, center.y, center.z);

  gsap.to(left.position, { x: targetPosLeft.x, duration: 1, ease: "power2.out" });
  gsap.to(right.position, { x: targetPosRight.x, duration: 1, ease: "power2.out" });

  const maxRadius = Math.max(sphereLeft.radius, sphereRight.radius);
  const cameraDistance = separation + maxRadius * 3;

  const targetCameraPos = new THREE.Vector3(center.x, center.y, center.z + cameraDistance);

  controls.enabled = false;
  gsap.to(camera.position, {
    x: targetCameraPos.x,
    y: targetCameraPos.y,
    z: targetCameraPos.z,
    duration: 1.5,
    ease: "power2.out",
    onUpdate: () => camera.lookAt(center),
    onComplete: () => controls.enabled = true
  });

  gsap.to(controls.target, {
    x: center.x,
    y: center.y,
    z: center.z,
    duration: 1.5,
    ease: "power2.out"
  });
}