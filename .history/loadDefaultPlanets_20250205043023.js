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
  
  // Get or create the default planets group.
  let defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
  if (!defaultPlanetsGroup) {
    defaultPlanetsGroup = new THREE.Group();
    defaultPlanetsGroup.name = "defaultPlanetsGroup";
    scene.add(defaultPlanetsGroup);
    loadPlanets(defaultPlanetsGroup);
    console.log("Loaded default planets into group.");
  }
  
  // Ensure the default planets are visible.
  defaultPlanetsGroup.visible = true;
  console.log("Default planets group is now visible.");
  
  // Wait until Earth is loaded and then animate the camera to focus on Earth.
  const waitForEarthAndAnimate = () => {
    // Search the entire scene for Earth.
    const earth = scene.getObjectByName("earth") || scene.getObjectByName("Earth");
    if (earth) {
      // Get Earth's world position.
      const earthWorldPos = new THREE.Vector3();
      earth.getWorldPosition(earthWorldPos);
      
      // Animate the camera to a position relative to Earth.
      gsap.to(camera.position, {
        duration: 2,
        x: earthWorldPos.x + 1000, // Adjust these offsets as needed.
        y: earthWorldPos.y + 500,
        z: earthWorldPos.z + 1000,
        ease: "power2.out",
        onUpdate: () => {
          // Continuously update the camera to look at Earth's world position.
          camera.lookAt(earthWorldPos);
        }
      });
      console.log("Camera moved to Earth at:", earthWorldPos);
    } else {
      console.warn("Earth not found in the scene. Retrying...");
      setTimeout(waitForEarthAndAnimate, 100);
    }
  };

  waitForEarthAndAnimate();
}
