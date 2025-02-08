// loadDefaultPlanets.js
import { loadPlanets } from './loadPlanets.js';
import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

/**
 * Preloads the default planets (including the Sun) into the scene.
 * The group is set to invisible so that it does not appear until needed.
 */
export function preloadDefaultPlanets(scene) {
  let defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
  if (!defaultPlanetsGroup) {
    defaultPlanetsGroup = new THREE.Group();
    defaultPlanetsGroup.name = "defaultPlanetsGroup";
    scene.add(defaultPlanetsGroup);
    // Load the planets into the group.
    loadPlanets(defaultPlanetsGroup);
    // Hide the group until needed.
    defaultPlanetsGroup.visible = false;
    console.log("Preloaded default planets (hidden).");
  }
}

/**
 * Shows the preloaded default planets and animates the camera to focus on Earth's position.
 * If the default planets have not been preloaded, they will be loaded now.
 */
export function loadDefaultPlanets(scene, camera, controls) {
    // Hide the orbit mode model if it exists.
    const orbit = scene.getObjectByName("orbitModeModel");
    if (orbit) {
      orbit.visible = false;
      console.log("Orbit mode model hidden.");
    }
  
    // Get the default planets group.
    let defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
    if (!defaultPlanetsGroup) {
      // If the group doesn't exist, create and load the planets.
      defaultPlanetsGroup = new THREE.Group();
      defaultPlanetsGroup.name = "defaultPlanetsGroup";
      scene.add(defaultPlanetsGroup);
      loadPlanets(defaultPlanetsGroup);
      console.log("Loaded default planets into group.");
    }
  
    // Ensure the default planets are visible.
    defaultPlanetsGroup.visible = true;
    console.log("Default planets group is now visible.");
  
    function moveCameraToEarth() {
        const earth = scene.getObjectByName("earth") || scene.getObjectByName("Earth");
      
        if (earth) {
          // Get Earth's world position
          const earthWorldPos = new THREE.Vector3();
          earth.getWorldPosition(earthWorldPos);
      
          console.log("Camera moving to Earth at:", earthWorldPos);
      
          // Adjust camera offsets based on Earth's scale
          const cameraOffset = 20000; // Adjust offset to be proportional to Earth's distance
          const targetPosition = new THREE.Vector3(
            earthWorldPos.x + cameraOffset,
            earthWorldPos.y + cameraOffset * 0.5, // Slightly above
            earthWorldPos.z + cameraOffset
          );
      
          // Animate camera movement
          gsap.to(camera.position, {
            duration: 2,
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            ease: "power2.out",
            onUpdate: () => {
              camera.lookAt(earthWorldPos);
            },
            onComplete: () => {
              console.log("✅ Camera reached Earth's position:", targetPosition);
            }
          });
      
        } else {
          console.warn("❌ Earth not found in the scene. Retrying...");
          setTimeout(moveCameraToEarth, 100);
        }
        }

    }
