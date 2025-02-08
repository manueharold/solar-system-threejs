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
        // Load the planets into the group. Assume loadPlanets is synchronous or handles its own async logic.
        loadPlanets(defaultPlanetsGroup);
        // Hide the group until needed.
        defaultPlanetsGroup.visible = false;
        console.log("Preloaded default planets (hidden).");
    }
}

/**
 * Shows the preloaded default planets and animates the camera to Earth's position.
 * If the default planets have not been preloaded (for some reason), they will be loaded now.
 */
export function loadDefaultPlanets(scene, camera, controls) {
    // Remove or hide the orbit mode model by name if it exists:
    const orbit = scene.getObjectByName("orbitModeModel");
    if (orbit) {
        // Option 1: Remove the orbit model:
        // scene.remove(orbit);
        // Option 2: Hide it so it can be reused later:
        orbit.visible = false;
        console.log("Orbit mode model hidden.");
    }
    
    let defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
    if (!defaultPlanetsGroup) {
        // In case preload was not called, create and load the group:
        defaultPlanetsGroup = new THREE.Group();
        defaultPlanetsGroup.name = "defaultPlanetsGroup";
        scene.add(defaultPlanetsGroup);
        loadPlanets(defaultPlanetsGroup);
        console.log("Loaded default planets into group.");
    }
    
    // Instantly show the default planets (including the Sun)
    defaultPlanetsGroup.visible = true;
    console.log("Default planets group is now visible.");
    
    // Find Earth's position in the group to animate the camera.
    // Note the lookup is now using "earth" (all lowercase)
    const earth = defaultPlanetsGroup.getObjectByName("earth");
    if (earth) {
        const earthPosition = earth.position.clone();
        // Animate the camera to a position relative to Earth.
        gsap.to(camera.position, {
            duration: 2,
            x: earthPosition.x + 1000, // Adjust these offsets as needed.
            y: earthPosition.y + 500,
            z: earthPosition.z + 1000,
            ease: "power2.out",
            onUpdate: () => {
                camera.lookAt(earthPosition);
            }
        });
        console.log("Camera moved to Earth.");
    } else {
        console.warn("Earth not found in the default planets group.");
    }
}
