// ================================
// IMPORTS
// ================================
import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { initScene } from './initScene.js';
import { initLights } from './initLights.js';
import { initSkybox } from './initSkybox.js';
import { loadPlanets, updatePlanets, moveToPlanet } from './loadPlanets.js';
import { initControls } from './initControls.js';
import { handleResize, handleMouseEvents } from './handleEvents.js';
import { handleSearchInput } from './searchHandler.js';
import { initSpaceshipMode } from './spaceshipHandler.js';
import { loadOrbitModeModel, updateOrbitModeAnimation } from './loadOrbitModeModel.js';
import { loadDefaultPlanets } from './loadDefaultPlanets.js';

// ================================
// SCENE, CAMERA, RENDERER & CONTROLS INITIALIZATION
// ================================
const { scene, camera, renderer } = initScene();
const controls = initControls(camera, renderer);
const spaceshipControls = initSpaceshipMode(camera, controls);
const clock = new THREE.Clock();

// ================================
// SETUP ENVIRONMENT
// ================================
initLights(scene);
initSkybox(scene);

// ================================
// LOAD DEFAULT (ORIGINAL) PLANETS ON STARTUP
// ================================
loadPlanets(scene);

// ================================
// HANDLE WINDOW RESIZE & MOUSE EVENTS
// ================================
handleResize(camera, renderer);
handleMouseEvents(scene, camera);

// ================================
// MAIN ANIMATION LOOP
// ================================
function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();

    // Update orbit model animations if active
    updateOrbitModeAnimation(deltaTime);

    // Update default planets animations (only visible when in default mode)
    updatePlanets();

    controls.update();
    renderer.render(scene, camera);
}
animate();

// ================================
// SEARCH FUNCTIONALITY
// ================================
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchSuggestions = document.getElementById("searchSuggestions");
    const planetsList = ["Sun", "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Moon"];
    handleSearchInput(searchInput, searchSuggestions, planetsList, camera, controls, scene);
});

// ================================
// MODE TOGGLING: SPACESHIP MODE & ORBIT/ORIGINAL MODE
// ================================
const spaceshipButton = document.getElementById('toggleSpaceshipMode');
const orbitButton = document.getElementById('toggleOrbitMode');
let orbitModeActive = false;

// --- Spaceship Mode Handler (if needed) ---
spaceshipButton.addEventListener('click', () => {
    console.log('Spaceship Mode activated!');
    // Add spaceship mode functionality here if desired.
});

// --- Orbit / Original Mode Toggle ---
orbitButton.addEventListener('click', () => {
    if (!orbitModeActive) {
        // Switch to Orbit Mode:
        // (loadOrbitModeModel should remove the individual planets by name)
        orbitModeActive = true;
        orbitButton.innerText = "Original Mode";
        loadOrbitModeModel(scene, camera, controls);
    } else {
        // Switch back to Default (Original) Mode:
        // (loadDefaultPlanets should remove the orbit model and re-load the planets)
        orbitModeActive = false;
        orbitButton.innerText = "Orbit Mode";
        loadDefaultPlanets(scene, camera, controls);
    }
});

// ================================
// PLANET INFO PANEL INTERACTIVITY
// ================================
document.addEventListener("click", (event) => {
    // Open the Planet Info Panel if a planet element is clicked
    if (event.target.matches(".planet")) {
        const planetName = event.target.dataset.name;  // Each planet element should have a data-name attribute
        const planetInfo = getPlanetInfo(planetName);     // Make sure getPlanetInfo is defined elsewhere

        // Populate the panel
        document.getElementById("planetName").innerText = planetName;
        document.getElementById("planetDiameter").innerText = planetInfo.diameter;
        document.getElementById("planetDistance").innerText = planetInfo.distanceFromSun;
        document.getElementById("planetOrbitalPeriod").innerText = planetInfo.orbitalPeriod;
        document.getElementById("planetMoons").innerText = planetInfo.moons;

        // Show the panel
        document.getElementById("planetInfoPanel").classList.add("active");
    }

    // Close the info panel if the close button is clicked
    if (event.target.id === "closeInfoPanel") {
        document.getElementById("planetInfoPanel").classList.remove("active");
    }
});
