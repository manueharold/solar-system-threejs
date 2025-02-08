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
 * Shows the preloaded default planets and animates the camera to Earth's position.
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
  
  // Show the default planets.
  defaultPlanetsGroup.visible = true;
  console.log("Default planets group is now visible.");
  
  // Wait until Earth is loaded before animating the camera.
  const waitForEarthAndAnimate = () => {
    // Since planets are added with their names in lowercase, try "earth" first.
    const earth = defaultPlanetsGroup.getObjectByName("earth") || defaultPlanetsGroup.getObjectByName("Earth");
    if (earth) {
      const earthPosition = earth.position.clone();
      gsap.to(camera.position, {
        duration: 2,
        x: earthPosition.x + 1000, // Adjust offsets as needed.
        y: earthPosition.y + 500,
        z: earthPosition.z + 1000,
        ease: "power2.out",
        onUpdate: () => {
          camera.lookAt(earthPosition);
        }
      });
      console.log("Camera moved to Earth.");
    } else {
      console.warn("Earth not found in default planets group. Retrying...");
      setTimeout(waitForEarthAndAnimate, 100); // Check again after 100ms.
    }
  };

  waitForEarthAndAnimate();
}
