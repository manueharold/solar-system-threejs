// loadDefaultPlanets.js
import { loadPlanets } from './loadPlanets.js';
import gsap from "https://cdn.skypack.dev/gsap";

export function loadDefaultPlanets(scene, camera, controls) {
    // Find and remove the orbit model by name:
    const orbit = scene.getObjectByName("orbitModeModel");
    if (orbit) {
        scene.remove(orbit);
        console.log("Removed orbit mode model.");
    }
    
    // (Optional) Clear any stored references in loadPlanets if needed.
    // For example, if you have a global "planets" object, you might reset it here.
    // window.planets = {};

    // Re-load the individual planets
    loadPlanets(scene);
    console.log("Called loadPlanets to re-load individual planets.");

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
