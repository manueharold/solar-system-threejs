import { initScene } from './initScene.js';
import { initLights } from './initLights.js';
import { initSkybox } from './initSkybox.js';
import { loadPlanets, moveToPlanet } from './loadPlanets.js';
import { initControls } from './initControls.js';
import { handleResize, handleMouseEvents } from './handleEvents.js';
import { handleSearchInput } from './searchHandler.js';
import { initSpaceshipMode } from './spaceshipHandler.js';
import { loadOrbitModeModel, updateOrbitModeAnimation } from './loadOrbitModeModel.js';


// 🌍 Initialize Scene
const { scene, camera, renderer } = initScene();
const controls = initControls(camera, renderer);
const spaceshipControls = initSpaceshipMode(camera, controls);
const clock = new THREE.Clock();

// 🔆 Setup Environment
initLights(scene);
initSkybox(scene);

// 🚀 Load Planets
loadPlanets(scene);

// 📏 Handle Resize & Events
handleResize(camera, renderer);
handleMouseEvents(scene, camera);


function animate() {
    requestAnimationFrame(animate);
    
    // Get time elapsed since the last frame
    const deltaTime = clock.getDelta();

    // Update orbit mode animations if active
    updateOrbitModeAnimation(deltaTime);

    // Update controls and render the scene
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


// 🌌 Planet Info Panel Interactivity
document.addEventListener("click", (event) => {
    if (event.target.matches(".planet")) {
        const planetName = event.target.dataset.name; // Assuming each planet has a `data-name` attribute.
        const planetInfo = getPlanetInfo(planetName); // Fetch planet info (ensure `getPlanetInfo` is implemented).

        // Populate planet info panel
        document.getElementById("planetName").innerText = planetName;
        document.getElementById("planetDiameter").innerText = planetInfo.diameter;
        document.getElementById("planetDistance").innerText = planetInfo.distanceFromSun;
        document.getElementById("planetOrbitalPeriod").innerText = planetInfo.orbitalPeriod;
        document.getElementById("planetMoons").innerText = planetInfo.moons;

        // Show the panel
        const planetInfoPanel = document.getElementById("planetInfoPanel");
        planetInfoPanel.classList.add("active");
    }

    // Close the panel
    if (event.target.id === "closeInfoPanel") {
        const planetInfoPanel = document.getElementById("planetInfoPanel");
        planetInfoPanel.classList.remove("active");
    }
});
