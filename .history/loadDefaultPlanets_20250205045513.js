// loadDefaultPlanets.js
import { loadPlanets, planetData } from './loadPlanets.js';
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

/**
 * Preloads the default planets (including the Sun) into the scene.
 * This is done on startup so models are in memory, just hidden.
 */
export function preloadDefaultPlanets(scene) {
    let defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
    if (!defaultPlanetsGroup) {
        defaultPlanetsGroup = new THREE.Group();
        defaultPlanetsGroup.name = "defaultPlanetsGroup";
        scene.add(defaultPlanetsGroup);
        loadPlanets(defaultPlanetsGroup); // Load planets initially (hidden)
        defaultPlanetsGroup.visible = false; // Hide them initially
        console.log("Preloaded default planets (hidden).");
    }
}

/**
 * Loads the default planets and sets the camera to focus on Earth.
 * This is called when switching to Original Mode to ensure planets are visible.
 */
export function loadDefaultPlanets(scene, camera, controls) {
    // Hide the orbit mode model if it exists.
    const orbit = scene.getObjectByName("orbitModeModel");
    if (orbit) {
        orbit.visible = false;
        console.log("Orbit mode model hidden.");
    }

    // Get the default planets group (preloaded earlier)
    let defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
    if (!defaultPlanetsGroup) {
        // If planets group doesn't exist, create and load it (shouldn't happen if preloaded)
        defaultPlanetsGroup = new THREE.Group();
        defaultPlanetsGroup.name = "defaultPlanetsGroup";
        scene.add(defaultPlanetsGroup);
        loadPlanets(defaultPlanetsGroup);
        console.log("Loaded default planets into group.");
    }

    // Ensure the default planets are visible
    defaultPlanetsGroup.visible = true;
    defaultPlanetsGroup.traverse(child => {
        child.visible = true; // Ensure each individual planet is also visible
    });
    console.log("Default planets group is now visible.");

    // Get Earth's position (fallback in case Earth is not loaded immediately)
    const earth = scene.getObjectByName("earth") || scene.getObjectByName("Earth");
    if (earth) {
        const earthPosition = new THREE.Vector3();
        earth.getWorldPosition(earthPosition);

        // Set camera position relative to Earth
        const offset = 15000; // Adjust as needed
        camera.position.set(
            earthPosition.x + offset,
            earthPosition.y + offset * 0.5,
            earthPosition.z + offset
        );

        // Make sure camera actually looks at Earth
        camera.lookAt(earthPosition);
        console.log("Camera set to focus on Earth at:", earthPosition);

        // If using OrbitControls, set its target to Earth
        if (controls) {
            controls.target.copy(earthPosition);
            controls.update();
        }
    } else {
        console.warn("Earth not found in scene. Camera positioning might be incorrect.");
    }
}
