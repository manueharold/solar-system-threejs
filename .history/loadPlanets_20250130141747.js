import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import TWEEN from "https://cdn.skypack.dev/@tweenjs/tween.js";

// 🌎 Rotation Speeds (adjusted based on actual rotation periods)
const rotationPeriods = {
    earth: 1, venus: 243, mercury: 58.6, mars: 1.03,
    jupiter: 0.41, saturn: 0.45, uranus: 0.72, neptune: 0.67
};
const baseRotationSpeed = 0.002;
const rotationSpeeds = Object.fromEntries(
    Object.entries(rotationPeriods).map(([planet, period]) => [
        planet, baseRotationSpeed / period
    ])
);

// Store planet objects
let planets = {};

// Load planet model function
function loadPlanetModel(scene, name, modelPath, position, size) {
    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => {
        const planet = gltf.scene;
        planet.name = name.toLowerCase();
        planet.position.set(...position);

        // Scale planet properly
        const box = new THREE.Box3().setFromObject(planet);
        const scaleFactor = size / box.getSize(new THREE.Vector3()).length();
        planet.scale.set(scaleFactor, scaleFactor, scaleFactor);

        scene.add(planet);
        planets[planet.name] = planet;  
        console.log(`✅ Loaded: ${planet.name}`);
    });
}

// Load all planets into the scene
export function loadPlanets(scene) {
    loadPlanetModel(scene, "Earth", './3d_models/earth.glb', [-6000, 0, 0], 1600);
    loadPlanetModel(scene, "Venus", './3d_models/venus.glb', [-8000, 0, 0], 1520);
    loadPlanetModel(scene, "Mercury", './3d_models/mercury.glb', [-10000, 0, 0], 608);
    loadPlanetModel(scene, "Mars", './3d_models/mars.glb', [-4000, 0, 0], 848);
    loadPlanetModel(scene, "Jupiter", './3d_models/jupiter1.glb', [3000, 0, 0], 17920);
    loadPlanetModel(scene, "Saturn", './3d_models/saturn.glb', [14000, 0, 0], 14560);
    loadPlanetModel(scene, "Uranus", './3d_models/uranus.glb', [22000, 0, 0], 6400);
    loadPlanetModel(scene, "Neptune", './3d_models/neptune.glb', [29000, 0, 0], 6000);
    loadPlanetModel(scene, "Sun", './3d_models/sun.glb', [-60000, 0, 0], 30000);
}

// Move camera to a planet and zoom in
export function moveToPlanet(planetName, camera, controls, scene) {
    const target = planets[planetName.toLowerCase()];
    
    if (!target) {
        console.log(`❌ Planet "${planetName}" not found!`);
        return;
    }

    console.log(`🚀 Moving to: ${planetName}`);

    // Hide all other planets
    scene.children.forEach((obj) => {
        if (obj.name !== planetName && obj.name !== "stars") {
            obj.visible = false;
        }
    });

    // Get planet position and adjust zoom distance
    const planetPosition = target.position;
    const zoomDistance = 1500;

    const targetPosition = {
        x: planetPosition.x,
        y: planetPosition.y,
        z: planetPosition.z + zoomDistance,
    };

    controls.enabled = false;

    // Animate camera movement
    new TWEEN.Tween(camera.position)
        .to(targetPosition, 2000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(() => {
            console.log(`✅ Arrived at ${planetName}`);
            setTimeout(() => resetView(scene), 3000); // Show all planets after 3 seconds
            controls.enabled = true;
        })
        .start();
}

// Reset view to show all planets again
export function resetView(scene) {
    scene.children.forEach((obj) => obj.visible = true);
}

// Create search button and input field
export function createSearchButton(scene, camera, controls) {
    const searchButton = document.createElement("button");
    searchButton.textContent = "Search Planet";
    searchButton.style.position = "absolute";
    searchButton.style.top = "20px";
    searchButton.style.left = "20px";
    searchButton.style.zIndex = "10";
    document.body.appendChild(searchButton);

    const input = document.createElement("input");
    input.placeholder = "Enter planet name...";
    input.style.position = "absolute";
    input.style.top = "60px";
    input.style.left = "20px";
    input.style.zIndex = "10";
    document.body.appendChild(input);

    searchButton.addEventListener("click", () => {
        const planetName = input.value.trim();
        moveToPlanet(planetName, camera, controls, scene);
    });
} 

