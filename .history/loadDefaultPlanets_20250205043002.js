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

    // Find Earth's position
    const earth = defaultPlanetsGroup.getObjectByName("Earth");
    if (earth) {
        const earthPosition = earth.position.clone();
        
        // Animate the camera to Earth's position
        gsap.to(camera.position, {
            duration: 2,
            x: earthPosition.x + 500, // Adjust distance if needed
            y: earthPosition.y + 500,
            z: earthPosition.z + 1000,
            ease: "power2.out",
            onUpdate: () => {
                camera.lookAt(earthPosition);
            }
        });

        console.log("Camera moved to Earth.");
    } else {
        console.warn("Earth not found in the scene.");
    }
}
