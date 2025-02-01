import { initScene } from './initScene.js';
import { initLights } from './initLights.js';
import { initSkybox } from './initSkybox.js';
import { loadPlanets, moveToPlanet } from './loadPlanets.js';
import { initControls } from './initControls.js';
import { handleResize, handleMouseEvents } from './handleEvents.js';
import { handleSearchInput } from './searchHandler.js';
import { initSpaceshipMode } from './spaceshipHandler.js';
import { loadOrbitModeModel } from './loadOrbitModeModel.js';

// 🌍 Initialize Scene
const { scene, camera, renderer } = initScene();
const controls = initControls(camera, renderer);
const spaceshipControls = initSpaceshipMode(camera, controls);

// 🔆 Setup Environment
initLights(scene);
initSkybox(scene);

// 🚀 Load Planets
loadPlanets(scene);

moveToPlanet("earth", camera, controls, scene);

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
    const planetsList = ["Sun", "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Moon"];
    handleSearchInput(searchInput, searchSuggestions, planetsList, camera, controls, scene);
});

// Select the buttons using the same IDs as in your HTML
const spaceshipButton = document.getElementById('toggleSpaceshipMode');
const orbitButton = document.getElementById('toggleOrbitMode');



// Spaceship Mode Functionality
spaceshipButton.addEventListener('click', () => {
    console.log('Spaceship Mode activated!');
    // Add functionality for spaceship mode
});

// Orbit Mode Functionality
orbitButton.addEventListener('click', () => {
    console.log('Orbit Mode activated!');
    loadOrbitModeModel(scene, camera, controls);
})

document.addEventListener("click", (event) => {
    if (event.target.matches(".planet")) {
        const planetName = event.target.dataset.name;
        const planetInfo = getPlanetInfo(planetName); // This function remains as is.

        // Dispatch a custom event to notify React
        const planetSelectedEvent = new CustomEvent("planetSelected", { detail: planetInfo });
        window.dispatchEvent(planetSelectedEvent);
    }
});
