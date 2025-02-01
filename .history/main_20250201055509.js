import { initScene } from './initScene.js';
import { initLights } from './initLights.js';
import { initSkybox } from './initSkybox.js';
import { loadPlanets, moveToPlanet } from './loadPlanets.js';
import { initControls } from './initControls.js';
import { handleResize, handleMouseEvents } from './handleEvents.js';
import { handleSearchInput } from './searchHandler.js';
import { initSpaceshipMode } from './spaceshipHandler.js';

// 🌍 Initialize Scene
const { scene, camera, renderer } = initScene();
const controls = initControls(camera, renderer);
const spaceshipControls = initSpaceshipMode(camera, controls);

// 🔆 Setup Environment
initLights(scene);
initSkybox(scene);

// 🚀 Load Planets
loadPlanets(scene);

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

// Select the buttons (ensure the IDs match those in your HTML)
const spaceshipButton = document.getElementById('toggleSpaceshipMode');
const orbitButton = document.getElementById('toggleOrbitMode');

// Define desired positions for each mode
const orbitModePosition = { x: 0, y: 20, z: 50 };
const spaceshipModePosition = { x: 0, y: 10, z: 100 };

// Function to activate orbit mode
function activateOrbitMode() {
  console.log('Orbit Mode activated!');
  if (spaceshipControls) {
    spaceshipControls.enabled = false;
  }
  controls.target.set(0, 0, 0);
  gsap.to(camera.position, {
    duration: 2,
    x: orbitModePosition.x,
    y: orbitModePosition.y,
    z: orbitModePosition.z,
    ease: "power2.inOut",
    onUpdate: () => {
      camera.lookAt(controls.target);
    },
    onComplete: () => {
      controls.update();
    }
  });
}

// Function to activate spaceship mode (optional toggle)
function activateSpaceshipMode() {
  console.log('Spaceship Mode activated!');
  if (spaceshipControls) {
    spaceshipControls.enabled = true;
  }
  controls.target.set(0, 0, 0);
  gsap.to(camera.position, {
    duration: 2,
    x: spaceshipModePosition.x,
    y: spaceshipModePosition.y,
    z: spaceshipModePosition.z,
    ease: "power2.inOut",
    onUpdate: () => {
      camera.lookAt(controls.target);
    },
    onComplete: () => {
      controls.update();
    }
  });
}

// Attach event listeners to the buttons
orbitButton.addEventListener('click', () => {
  activateOrbitMode();
});

spaceshipButton.addEventListener('click', () => {
  activateSpaceshipMode();
});

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
