// loadDefaultPlanets.js
import { loadPlanets, planetData } from './loadPlanets.js';
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
    // 1️⃣ Remove orbit mode model if it exists.
    const orbitModeModel = scene.getObjectByName("orbitModeModel");
    if (orbitModeModel) {
        scene.remove(orbitModeModel);
        console.log("Orbit mode model removed.");
    }

    // 2️⃣ Hide the orbit mode model (extra precaution).
    const orbit = scene.getObjectByName("orbitModeModel");
    if (orbit) {
        orbit.visible = false;
        console.log("Orbit mode model hidden.");
    }

    // 3️⃣ Get or create the default planets group.
    let defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
    if (!defaultPlanetsGroup) {
        defaultPlanetsGroup = new THREE.Group();
        defaultPlanetsGroup.name = "defaultPlanetsGroup";
        scene.add(defaultPlanetsGroup);
        loadPlanets(defaultPlanetsGroup);
        console.log("Loaded default planets into group.");
    }

    // 4️⃣ Make sure the default planets group (and its children) are visible.
    defaultPlanetsGroup.visible = true;
    defaultPlanetsGroup.traverse(child => {
        child.visible = true;
    });
    console.log("Default planets group is now visible.");

    // 5️⃣ **Reset texture rotation and offset to prevent spinning textures.**
    defaultPlanetsGroup.traverse((child) => {
        if (child.isMesh && child.material && child.material.map) {
            child.material.map.rotation = 0; // Reset rotation
            child.material.map.offset.set(0, 0); // Reset offset
        }
    });
    console.log("Texture rotations and offsets reset.");

    // 6️⃣ Focus camera on Earth
    const earth = scene.getObjectByName("earth") || scene.getObjectByName("Earth");
    if (earth) {
        const earthPosition = new THREE.Vector3();
        earth.getWorldPosition(earthPosition);

        const offset = 15000; // Adjust this offset as needed
        camera.position.set(
            earthPosition.x + offset,
            earthPosition.y + offset * 0.5,
            earthPosition.z + offset
        );

        camera.lookAt(earthPosition);
        console.log("Camera set to focus on Earth at:", earthPosition);

        if (controls) {
            controls.target.copy(earthPosition);
            controls.update();
        }
    } else {
        console.warn("Earth not found in scene. Camera positioning might be incorrect.");
    }
}
