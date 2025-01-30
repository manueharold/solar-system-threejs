import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Define rotation period for each planet in Earth days
const rotationPeriods = {
    earth: 1,
    venus: 243,
    mercury: 58.6,
    mars: 1.03,
    jupiter: 0.41,
    saturn: 0.45,
    uranus: 0.72,
    neptune: 0.67
};

// Base rotation speed for Earth (1 day = 0.002)
const baseRotationSpeed = 0.002;

// Calculate rotation speeds for each planet based on its rotation period
const rotationSpeeds = Object.fromEntries(
    Object.entries(rotationPeriods).map(([planet, period]) => [
        planet,
        baseRotationSpeed / period
    ])
);

// Load planet model with specific position and size
function loadPlanetModel(scene, modelPath, position, fixedSize, rotationSpeed) {
    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => {
        const planet = gltf.scene;
        const box = new THREE.Box3().setFromObject(planet);
        const size = box.getSize(new THREE.Vector3());
        const scaleFactor = fixedSize / size.length();
        planet.scale.set(scaleFactor, scaleFactor, scaleFactor);
        planet.position.set(...position);
        scene.add(planet);

        // Set up rotation
        const rotate = () => {
            requestAnimationFrame(rotate);
            planet.rotation.y += rotationSpeed; // Rotation speed
        };
        rotate();
    }, undefined, (error) => {
        console.error(`Error loading ${modelPath.split('/')[2].split('.')[0]} model:`, error);
    });
}

// Load all the planets
export function loadPlanets(scene) {
    // Earth
    loadPlanetModel(scene, './3d_models/earth.glb', [-6000, 0, 0], 1600, rotationSpeeds.earth);
    
    // Venus
    loadPlanetModel(scene, './3d_models/venus.glb', [-8000, 0, 0], 1520, rotationSpeeds.venus);
    
    // Mercury
    loadPlanetModel(scene, './3d_models/mercury.glb', [-10000, 0, 0], 608, rotationSpeeds.mercury);
    
    // Mars
    loadPlanetModel(scene, './3d_models/mars.glb', [-4000, 0, 0], 848, rotationSpeeds.mars);
    
    // Jupiter
    loadPlanetModel(scene, './3d_models/jupiter1.glb', [3000, 0, 0], 17920, rotationSpeeds.jupiter);
    
    // Saturn
    loadPlanetModel(scene, './3d_models/saturn.glb', [14000, 0, 0], 14560, rotationSpeeds.saturn);
    
    // Uranus
    loadPlanetModel(scene, './3d_models/uranus.glb', [22000, 0, 0], 6400, rotationSpeeds.uranus);
    
    // Neptune
    loadPlanetModel(scene, './3d_models/neptune.glb', [29000, 0, 0], 6000, rotationSpeeds.neptune);
    
    // Sun (No rotation for Sun)
    loadPlanetModel(scene, './3d_models/sun.glb', [-50000, 0, 0], 30000, 0);
}

// Function to move the camera to the specified planet
export function moveToPlanet(planetName, camera, scene) {
    const planetPositions = {
        mercury: [convertAUToSceneUnits(planetDistances.mercury), 0, 0],
        venus: [convertAUToSceneUnits(planetDistances.venus), 0, 0],
        earth: [convertAUToSceneUnits(planetDistances.earth), 0, 0],
        mars: [convertAUToSceneUnits(planetDistances.mars), 0, 0],
        jupiter: [convertAUToSceneUnits(planetDistances.jupiter), 0, 0],
        saturn: [convertAUToSceneUnits(planetDistances.saturn), 0, 0],
        uranus: [convertAUToSceneUnits(planetDistances.uranus), 0, 0],
        neptune: [convertAUToSceneUnits(planetDistances.neptune), 0, 0],
        sun: [0, 0, 0]
    };

    const targetPosition = planetPositions[planetName.toLowerCase()];

    if (targetPosition) {
        // Animate camera movement
        new THREE.Tween(camera.position)
            .to({ x: targetPosition[0], y: targetPosition[1], z: targetPosition[2] }, 2000)
            .easing(THREE.Easing.Quadratic.Out)
            .start();
    } else {
        console.log("Planet not found!");
    }
}

// Create search button functionality
export function createSearchButton(scene, camera) {
    const searchButton = document.createElement("button");
    searchButton.textContent = "Search Planet";
    searchButton.style.position = "absolute";
    searchButton.style.top = "20px";
    searchButton.style.left = "20px";
    searchButton.style.zIndex = "10";  // Ensure it's above the Three.js canvas
    document.body.appendChild(searchButton);

    const input = document.createElement("input");
    input.placeholder = "Enter planet name...";
    input.style.position = "absolute";
    input.style.top = "60px";
    input.style.left = "20px";
    input.style.zIndex = "10";  // Ensure it's above the Three.js canvas
    document.body.appendChild(input);

    searchButton.addEventListener("click", () => {
        const planetName = input.value.trim();  // Get the value from the input field
        moveToPlanet(planetName, camera, scene);  // Call moveToPlanet with the entered planet name
    });
}
