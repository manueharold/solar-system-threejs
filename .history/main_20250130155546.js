import { initScene } from './initScene.js';
import { initLights } from './initLights.js';
import { initSkybox } from './initSkybox.js';
import { loadPlanets } from './loadPlanets.js'; 
import { initControls } from './initControls.js';
import { handleResize, handleMouseEvents } from './handleEvents.js';
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { moveToPlanet } from './loadPlanets.js';

// 🌍 Initialize scene
const { scene, camera, renderer } = initScene();

// 🔆 Setup lights, skybox, and planets
initLights(scene);
initSkybox(scene);
loadPlanets(scene, (planet) => moveToPlanet("earth", camera, controls, scene));

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

// 🌍 Move to Earth by default when the scene loads
document.addEventListener("DOMContentLoaded", () => {
    moveToPlanet("earth", camera, controls, scene);  // Move to Earth initially
});

// 🔍 Search Planet Functionality
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchSuggestions = document.getElementById("searchSuggestions");

    const planetsList = ["Sun", "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];

    // 🌎 Handle live search suggestions
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        searchSuggestions.innerHTML = "";
        searchSuggestions.style.display = "none";

        if (query) {
            const filteredPlanets = planetsList.filter(planet => planet.toLowerCase().includes(query));

            if (filteredPlanets.length > 0) {
                searchSuggestions.style.display = "block";
                filteredPlanets.forEach(planet => {
                    const li = document.createElement("li");
                    li.textContent = planet;
                    li.classList.add("text-white");
                    
                    li.addEventListener("click", () => {
                        searchInput.value = planet;
                        searchSuggestions.style.display = "none";
                        moveToPlanet(planet.toLowerCase(), camera, controls, scene);
                    });

                    searchSuggestions.appendChild(li);
                });
            }
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.style.display = "none";
        }
    });

    // 🌍 Search on Enter key
    searchInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            const planetName = searchInput.value.trim().toLowerCase();
            if (planetName) {
                moveToPlanet(planetName, camera, controls, scene);
            }
        }
    });
});
