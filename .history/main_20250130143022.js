import { initScene } from './initScene.js';
import { initLights } from './initLights.js';
import { initSkybox } from './initSkybox.js';
import { loadPlanets } from './loadPlanets.js'; 
import { initControls } from './initControls.js';
import { handleResize, handleMouseEvents } from './handleEvents.js';
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import TWEEN from "https://cdn.skypack.dev/@tweenjs/tween.js";
import { moveToPlanet } from './loadPlanets.js';

// Initialize scene, camera, and renderer
const { scene, camera, renderer } = initScene();

// Setup lights
initLights(scene);

// Setup skybox
initSkybox(scene);

// Load planets
loadPlanets(scene);

// Initialize controls
const controls = initControls(camera, renderer);




// Event handlers for resizing and mouse interactions
handleResize(camera, renderer);
handleMouseEvents(scene, camera);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();
    renderer.render(scene, camera);
}
animate();
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
