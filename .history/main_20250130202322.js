import { initScene } from './initScene.js';
import { initLights } from './initLights.js';
import { initSkybox } from './initSkybox.js';
import { loadPlanets, moveToPlanet } from './loadPlanets.js';
import { initControls } from './initControls.js';
import { handleResize, handleMouseEvents } from './handleEvents.js';
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { handleSearchInput } from './searchHandler.js';
import { SpaceshipControls } from "./spaceshipControls.js";

// 🌍 Initialize Scene
const { scene, camera, renderer } = initScene();
const controls = initControls(camera, renderer);
const spaceshipControls = new SpaceshipControls(camera);

// 🔆 Setup Environment
initLights(scene);
initSkybox(scene);

// 🚀 Load Planets
loadPlanets(scene, (planet) => {
    if (planet.name.toLowerCase() === "earth") {
        moveToPlanet("earth", camera, controls, scene);
    }
});

// 📏 Handle Resize & Events
handleResize(camera, renderer);
handleMouseEvents(scene, camera);

// 🎬 Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// 🔍 Search Functionality
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchSuggestions = document.getElementById("searchSuggestions");
    const toggleButton = document.getElementById("toggleSpaceshipMode");
    const goBackButton = document.getElementById("goBackButton"); // ⬅️ Add Go Back Button

    const planetsList = ["Sun", "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];
    
    handleSearchInput(searchInput, searchSuggestions, planetsList, camera, controls, scene);

    // 🎮 Toggle Spaceship Mode with HUD button
    if (toggleButton) {
        toggleButton.addEventListener("click", () => {
            spaceshipControls.toggleSpaceshipMode();
            controls.enabled = !spaceshipControls.spaceshipMode;
            goBackButton.style.display = spaceshipControls.spaceshipMode ? "block" : "none"; // Show/Hide "Go Back"
        });
    }

    // 🔙 Go Back to Default Mode
    if (goBackButton) {
        goBackButton.addEventListener("click", () => {
            spaceshipControls.disableSpaceshipMode();
            controls.enabled = true; // Re-enable OrbitControls
            goBackButton.style.display = "none"; // Hide "Go Back"
        });
    }
});


