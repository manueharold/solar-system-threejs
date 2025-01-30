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

    const planetsList = ["Sun", "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];
    
    handleSearchInput(searchInput, searchSuggestions, planetsList, camera, controls, scene);

    // 🎮 Toggle Spaceship Mode with Button
    if (toggleButton) {
        toggleButton.addEventListener("click", () => {
            spaceshipControls.toggleSpaceshipMode();
            controls.enabled = !spaceshipControls.spaceshipMode;
            
            // Update Button Text
            toggleButton.textContent = spaceshipControls.spaceshipMode ? "Default Control" : "Spaceship Mode";
        });
    }
});

// 🎮 Toggle Spaceship Mode with "F" Key
document.addEventListener("keydown", (event) => {
    if (event.key === "F") {
        spaceshipControls.toggleSpaceshipMode();
        controls.enabled = !spaceshipControls.spaceshipMode;
        
        // Update Button Text
        const toggleButton = document.getElementById("toggleSpaceshipMode");
        if (toggleButton) {
            toggleButton.textContent = spaceshipControls.spaceshipMode ? "Default Control" : "Spaceship Mode";
        }
    }
});
