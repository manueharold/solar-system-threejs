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
    // 1️⃣ Remove the orbit mode model if it exists.
    const orbitModeModel = scene.getObjectByName("orbitModeModel");
    if (orbitModeModel) {
        scene.remove(orbitModeModel);
        console.log("Removed orbit mode model.");
    }

    // 2️⃣ Get or create the default planets group.
    let defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
    if (!defaultPlanetsGroup) {
        defaultPlanetsGroup = new THREE.Group();
        defaultPlanetsGroup.name = "defaultPlanetsGroup";
        scene.add(defaultPlanetsGroup);
        loadPlanets(defaultPlanetsGroup);
        console.log("Loaded default planets into group.");
    }
    // Ensure the group and all its children are visible.
    defaultPlanetsGroup.visible = true;
    defaultPlanetsGroup.traverse(child => child.visible = true);
    console.log("Default planets group is now visible.");

    // 3️⃣ Animate the camera to focus on Earth.
    const earth = scene.getObjectByName("earth") || scene.getObjectByName("Earth");
    if (earth) {
        const earthPosition = new THREE.Vector3();
        earth.getWorldPosition(earthPosition);

        // Calculate the desired camera position with an offset.
        const offset = 15000; // Adjust this offset as needed.
        const targetCameraPosition = {
            x: earthPosition.x + offset,
            y: earthPosition.y + offset * 0.5,
            z: earthPosition.z + offset
        };

        // Use GSAP to animate the camera position.
        gsap.to(camera.position, {
            duration: 2,
            x: targetCameraPosition.x,
            y: targetCameraPosition.y,
            z: targetCameraPosition.z,
            ease: "power2.out",
            onUpdate: () => {
                camera.lookAt(earthPosition);
                if (controls) {
                    controls.target.copy(earthPosition);
                    controls.update();
                }
            }
        });
        console.log("Animating camera to focus on Earth at:", earthPosition);
    } else {
        console.warn("Earth not found in scene. Camera positioning might be incorrect.");
    }
}
