import { initScene } from './initScene.js';
import { initLights } from './initLights.js';
import { initSkybox } from './initSkybox.js';
import { loadPlanets } from './loadPlanets.js'; 
import { initControls } from './initControls.js';
import { handleResize, handleMouseEvents } from './handleEvents.js';
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { moveToPlanet } from './loadPlanets.js';

// Initialize scene
const { scene, camera, renderer } = initScene();

// Setup lights, skybox, and planets
initLights(scene);
initSkybox(scene);
loadPlanets(scene);

// Initialize controls
const controls = initControls(camera, renderer);

// Handle resize and mouse events
handleResize(camera, renderer);
handleMouseEvents(scene, camera);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Handle search input
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");

    searchInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            const planetName = searchInput.value.trim().toLowerCase();
            if (planetName) {
                moveToPlanet(planetName, camera, controls, scene);
            }
        }
    });
});
