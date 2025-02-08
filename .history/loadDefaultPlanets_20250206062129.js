// loadDefaultPlanets.js
import { loadPlanets } from './loadPlanets.js';
import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";


/**
 * Preloads the default planets (including the Sun) into the scene.
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
 * Loads the default planets and sets the camera to focus on Earth.
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

    // Make sure the default planets group (and its children) are visible.
    defaultPlanetsGroup.visible = true;
    defaultPlanetsGroup.traverse(child => {
        child.visible = true;
    });
    console.log("Default planets group is now visible.");

    // Try to get Earth's object from the scene.
    const earth = scene.getObjectByName("earth") || scene.getObjectByName("Earth");
    if (earth) {
        // Use the world position in case Earth is nested inside a group.
        const earthPosition = new THREE.Vector3();
        earth.getWorldPosition(earthPosition);

        // Set camera position relative to Earth
        const offset = 15000; // Adjust this offset as needed
        camera.position.set(
            earthPosition.x + offset,
            earthPosition.y + offset * 0.5,
            earthPosition.z + offset
        );

        // Make sure the camera looks at Earth.
        camera.lookAt(earthPosition);
        console.log("Camera set to focus on Earth at:", earthPosition);

        // If using OrbitControls, update its target.
        if (controls) {
            controls.target.copy(earthPosition);
            controls.update();
        }
    } else {
        // Earth may not have loaded yet.
        console.warn("Earth not found in scene. Camera positioning might be incorrect.");
        // Optionally, you could add a timeout or a callback here to retry the camera positioning
        // once Earth is loaded.
    }
}