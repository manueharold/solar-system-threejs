// loadDefaultPlanets.js
import { loadPlanets, planetData } from './loadPlanets.js';
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
        loadPlanets(defaultPlanetsGroup);
        defaultPlanetsGroup.visible = false;
        console.log("Preloaded default planets (hidden).");
    }
}

/**
 * Loads the default planets and sets the camera to focus on Earth.
 */
export function loadDefaultPlanets(scene, camera) {
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

    // Set the camera to focus on Earth using planetData
    const earthPosition = new THREE.Vector3(planetData.earth.distance, 0, 0);
    camera.position.set(earthPosition.x + 5000, 3000, earthPosition.z + 5000);
    camera.lookAt(earthPosition);
    console.log("Camera set to focus on Earth.");
}
