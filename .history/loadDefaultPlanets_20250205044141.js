// loadDefaultPlanets.js
import { loadPlanets } from './loadPlanets.js';
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
 * Shows the preloaded default planets.
 * If the default planets have not been preloaded, they will be loaded now.
 */
export function loadDefaultPlanets(scene) {
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
}
