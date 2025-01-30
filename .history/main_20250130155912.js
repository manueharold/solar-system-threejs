import { initScene } from './initScene.js';
import { initLights } from './initLights.js';
import { initSkybox } from './initSkybox.js';
import { loadPlanets, moveToPlanet } from './loadPlanets.js';
import { initControls } from './initControls.js';
import { handleResize, handleMouseEvents } from './handleEvents.js';
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { handleSearchInput } from './searchHandler.js';  // Import the search handler function

// 🌍 Initialize scene
const { scene, camera, renderer } = initScene();

// 🔆 Setup environment and planets
initLights(scene);
initSkybox(scene);
loadPlanets(scene);

// 🎮 Initialize controls
const controls = initControls(camera, renderer);

// 📏 Handle resize and mouse events
handleResize(camera, renderer);
handleMouseEvents(scene, camera);

// 🎬 Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// 🔍 Initialize search functionality
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchSuggestions = document.getElementById("searchSuggestions");

    const planetsList = ["Sun", "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];

    // Initialize search input handler
    handleSearchInput(searchInput, searchSuggestions, planetsList, camera, controls, scene);
});
