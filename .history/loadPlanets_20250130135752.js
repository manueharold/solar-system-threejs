import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import TWEEN from "https://cdn.skypack.dev/@tweenjs/tween.js";

// Define rotation periods for each planet (in Earth days)
const rotationPeriods = {
    earth: 1, venus: 243, mercury: 58.6, mars: 1.03,
    jupiter: 0.41, saturn: 0.45, uranus: 0.72, neptune: 0.67
};

// Base rotation speed for Earth (1 day = 0.002)
const baseRotationSpeed = 0.002;

// Calculate rotation speeds for each planet
const rotationSpeeds = Object.fromEntries(
    Object.entries(rotationPeriods).map(([planet, period]) => [
        planet, baseRotationSpeed / period
    ])
);

let planets = [];  // Array to store references to planet objects

// Load planet model with specific position and size
function loadPlanetModel(scene, modelPath, position, fixedSize, rotationSpeed) {
    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => {
        const planet = gltf.scene;
        planet.name = modelPath.split('/').pop().split('.')[0]; // Extract name from file
        planet.position.set(...position);

        // Scale the planet correctly
        const box = new THREE.Box3().setFromObject(planet);
        const size = box.getSize(new THREE.Vector3());
        const scaleFactor = fixedSize / size.length();
        planet.scale.set(scaleFactor, scaleFactor, scaleFactor);

        scene.add(planet);
        planets.push(planet); // Store reference

        // Set up rotation
        function rotate() {
            requestAnimationFrame(rotate);
            planet.rotation.y += rotationSpeed; // Apply rotation speed
        }
        rotate();
    });
}

// Load all planets
export function loadPlanets(scene) {
    loadPlanetModel(scene, './3d_models/earth.glb', [-6000, 0, 0], 1600, rotationSpeeds.earth);
    loadPlanetModel(scene, './3d_models/venus.glb', [-8000, 0, 0], 1520, rotationSpeeds.venus);
    loadPlanetModel(scene, './3d_models/mercury.glb', [-10000, 0, 0], 608, rotationSpeeds.mercury);
    loadPlanetModel(scene, './3d_models/mars.glb', [-4000, 0, 0], 848, rotationSpeeds.mars);
    loadPlanetModel(scene, './3d_models/jupiter1.glb', [3000, 0, 0], 17920, rotationSpeeds.jupiter);
    loadPlanetModel(scene, './3d_models/saturn.glb', [14000, 0, 0], 14560, rotationSpeeds.saturn);
    loadPlanetModel(scene, './3d_models/uranus.glb', [22000, 0, 0], 6400, rotationSpeeds.uranus);
    loadPlanetModel(scene, './3d_models/neptune.glb', [29000, 0, 0], 6000, rotationSpeeds.neptune);
    loadPlanetModel(scene, './3d_models/sun.glb', [-60000, 0, 0], 30000, 0);
}

// Move camera to a planet and zoom in
export function moveToPlanet(planetName, camera) {
    const targetPlanet = planets.find(p => p.name.toLowerCase() === planetName.toLowerCase());

    if (!targetPlanet) {
        console.log("Planet not found!");
        return;
    }

    const targetPosition = targetPlanet.position.clone();

    // Move camera to planet smoothly
    new TWEEN.Tween(camera.position)
        .to({ x: targetPosition.x, y: targetPosition.y, z: targetPosition.z + 3000 }, 2000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(() => {
            // Zoom in after reaching target
            new TWEEN.Tween(camera.position)
                .to({ x: targetPosition.x, y: targetPosition.y, z: targetPosition.z + 1000 }, 1500)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
        })
        .start();
}

// Create search button functionality
export function createSearchButton(scene, camera) {
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
        moveToPlanet(planetName, camera);  
    });
}
