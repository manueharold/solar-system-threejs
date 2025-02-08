// loadDefaultPlanets.js
import { loadPlanets } from './loadPlanets.js';
import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

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