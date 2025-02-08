// loadDefaultPlanets.js
import { loadPlanets } from './loadPlanets.js';
import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

/**
 * Preloads the default planets (including Earth) into the scene.
 * The group is created and immediately hidden so that its models are available instantly later.
 */
export function preloadDefaultPlanets(scene) {
    let defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
    if (!defaultPlanetsGroup) {
        defaultPlanetsGroup = new THREE.Group();
        defaultPlanetsGroup.name = "defaultPlanetsGroup";
        scene.add(defaultPlanetsGroup);
        // Load the planets into the group (assumes loadPlanets handles any asynchronous tasks)
        loadPlanets(defaultPlanetsGroup);
        // Initially hide the group.
        defaultPlanetsGroup.visible = false;
        console.log("Preloaded default planets (hidden).");
    }
}

/**
 * Reveals the preloaded default planets and animates the camera to focus on Earth.
 * If the default planets haven't been preloaded, they are loaded now.
 */
export function loadDefaultPlanets(scene, camera, controls) {
    // Hide (or remove) the orbit mode model if it exists.
    const orbit = scene.getObjectByName("orbitModeModel");
    if (orbit) {
        orbit.visible = false;
        console.log("Orbit mode model hidden.");
    }
    
    let defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
    if (!defaultPlanetsGroup) {
        // In case preload was not called, create and load the group.
        defaultPlanetsGroup = new THREE.Group();
        defaultPlanetsGroup.name = "defaultPlanetsGroup";
        scene.add(defaultPlanetsGroup);
        loadPlanets(defaultPlanetsGroup);
        console.log("Loaded default planets into group.");
    }
    
    // Instantly reveal the default planets group (including Earth).
    defaultPlanetsGroup.visible = true;
    console.log("Default planets group is now visible.");
    
    // Find Earth's position in the group to animate the camera's focus on Earth.
    const earth = defaultPlanetsGroup.getObjectByName("Earth");
    if (earth) {
        const earthPosition = earth.position.clone();
        gsap.to(camera.position, {
            duration: 2,
            x: earthPosition.x + 1000, // Adjust offset values as needed
            y: earthPosition.y + 500,
            z: earthPosition.z + 1000,
            ease: "power2.out",
            onUpdate: () => {
                camera.lookAt(earthPosition);
            }
        });
        console.log("Camera moved to focus on Earth.");
    } else {
        console.warn("Earth not found in the default planets group.");
    }
}
