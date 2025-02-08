// loadDefaultPlanets.js
import { loadPlanets } from './loadPlanets.js';
import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

/**
 * Preloads the default planets (including the Sun) into the scene.
 * (This function remains unchanged from your new code if needed elsewhere.)
 */
export function preloadDefaultPlanets(scene) {
    let defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
    if (!defaultPlanetsGroup) {
        defaultPlanetsGroup = new THREE.Group();
        defaultPlanetsGroup.name = "defaultPlanetsGroup";
        scene.add(defaultPlanetsGroup);
        loadPlanets(defaultPlanetsGroup);
        // Initially hide the group (e.g. when starting in orbit mode)
        defaultPlanetsGroup.visible = false;
        console.log("Preloaded default planets (hidden).");
    }
}

/**
 * Loads the default planets and smoothly animates the camera to focus on Earth.
 */
export function loadDefaultPlanets(scene, camera, controls) {
    // Remove the orbit mode model by name if it exists:
    const orbit = scene.getObjectByName("orbitModeModel");
    if (orbit) {
        scene.remove(orbit);
        console.log("Removed orbit mode model.");
    }
    
    // Check if default planets group already exists
    let defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
    if (!defaultPlanetsGroup) {
        defaultPlanetsGroup = new THREE.Group();
        defaultPlanetsGroup.name = "defaultPlanetsGroup";
        scene.add(defaultPlanetsGroup);
        // Load the individual planets into this group
        loadPlanets(defaultPlanetsGroup);
        console.log("Loaded default planets into group.");
    } else {
        // Group already exists; just ensure it's visible
        defaultPlanetsGroup.visible = true;
        console.log("Default planets group is now visible.");
    }

    // Optionally animate the camera back to its default position.
    gsap.to(camera.position, {
        duration: 2,
        x: 0,
        y: 0,
        z: 10000,  // Adjust as needed
        ease: "power2.out",
        onUpdate: () => {
            camera.lookAt(controls.target);
        }
    });
}