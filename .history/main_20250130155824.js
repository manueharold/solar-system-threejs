import { initScene } from './initScene.js';
import { initLights } from './initLights.js';
import { initSkybox } from './initSkybox.js';
import { loadPlanets, moveToPlanet } from './loadPlanets.js';
import { initControls } from './initControls.js';
import { handleResize, handleMouseEvents } from './handleEvents.js';
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

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

// 🔍 Search Planet Functionality
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchSuggestions = document.getElementById("searchSuggestions");
    const planetsList = ["Sun", "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];

    // 🌎 Handle live search suggestions
    const handleSearch = () => {
        const query = searchInput.value.toLowerCase();
        searchSuggestions.innerHTML = "";
        searchSuggestions.style.display = query ? "block" : "none";

        planetsList
            .filter(planet => planet.toLowerCase().includes(query))
            .forEach(planet => {
                const li = document.createElement("li");
                li.textContent = planet;
                li.classList.add("text-white");
                li.onclick = () => {
                    searchInput.value = planet;
                    searchSuggestions.style.display = "none";
                    moveToPlanet(planet.toLowerCase(), camera, controls, scene);
                };
                searchSuggestions.appendChild(li);
            });
    };

    // Event listeners for search input and key press
    searchInput.addEventListener("input", handleSearch);
    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            const planetName = searchInput.value.trim().toLowerCase();
            if (planetName) moveToPlanet(planetName, camera, controls, scene);
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.style.display = "none";
        }
    });
});
