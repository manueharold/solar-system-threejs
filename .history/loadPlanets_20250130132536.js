import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
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

// Raycasting setup for detecting planet clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Function to handle click events and zoom in on the selected planet
export function setupPlanetClick(scene, camera, renderer, planets, controls) {
    let focusedPlanet = null;  // Track the focused planet

    window.addEventListener('click', onMouseClick, false);

    function onMouseClick(event) {
        // Convert mouse coordinates to normalized device coordinates
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update the ray's direction based on mouse position
        raycaster.setFromCamera(mouse, camera);

        // Find intersected objects (planets)
        const intersects = raycaster.intersectObjects(planets);

        if (intersects.length > 0) {
            const planet = intersects[0].object;

            // If a planet is already focused, zoom out and reset the scene
            if (focusedPlanet === planet) {
                zoomOut();
            } else {
                // Otherwise, zoom in on the new planet
                zoomInOnPlanet(planet);
            }
        }
    }

    function zoomInOnPlanet(planet) {
        const planetPosition = planet.getWorldPosition(new THREE.Vector3());
        const distance = 1000; // Zoom distance
        const duration = 1.5;  // Zoom duration

        // Disable OrbitControls while zooming
        controls.enabled = false;

        // Hide all other planets
        planets.forEach(p => {
            if (p !== planet) p.visible = false;
        });

        // Animate camera zoom-in smoothly
        new TWEEN.Tween(camera.position)
            .to({ x: planetPosition.x, y: planetPosition.y, z: planetPosition.z + distance }, duration * 1000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();

        // Focus camera on the planet
        camera.lookAt(planetPosition);
        focusedPlanet = planet; // Set the focused planet
    }

    function zoomOut() {
        // Enable OrbitControls again
        controls.enabled = true;

        // Show all planets again
        planets.forEach(planet => planet.visible = true);

        // Animate camera zoom-out smoothly (back to the initial camera position)
        const initialPosition = new THREE.Vector3(0, 1000, 28000); // Your initial camera position
        const duration = 1.5;  // Zoom-out duration

        new TWEEN.Tween(camera.position)
            .to({ x: initialPosition.x, y: initialPosition.y, z: initialPosition.z }, duration * 1000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();

        camera.lookAt(new THREE.Vector3(0, 0, 0));  // Focus camera on the scene's center
        focusedPlanet = null; // Reset the focused planet
    }
}

// Update the planet loading function to store planet references
export function loadPlanetModel(scene, modelPath, position, fixedSize, rotationSpeed, planets) {
    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => {
        const planet = gltf.scene;
        planet.name = modelPath.split('/')[2].split('.')[0];  // Set name for easy reference
        const box = new THREE.Box3().setFromObject(planet);
        const size = box.getSize(new THREE.Vector3());
        const scaleFactor = fixedSize / size.length();
        planet.scale.set(scaleFactor, scaleFactor, scaleFactor);
        planet.position.set(...position);
        scene.add(planet);

        planets.push(planet);  // Add planet to the array for raycasting

        // Set up rotation
        const rotate = () => {
            requestAnimationFrame(rotate);
            planet.rotation.y += rotationSpeed;
        };
        rotate();
    }, undefined, (error) => {
        console.error(`Error loading ${modelPath.split('/')[2].split('.')[0]} model:`, error);
    });
}

export function loadPlanets(scene) {
    const planets = [];

    // Earth
    loadPlanetModel(scene, './3d_models/earth.glb', [-6000, 0, 0], 1600, rotationSpeeds.earth, planets);
    
    // Venus
    loadPlanetModel(scene, './3d_models/venus.glb', [-8000, 0, 0], 1520, rotationSpeeds.venus, planets);
    
    // Mercury
    loadPlanetModel(scene, './3d_models/mercury.glb', [-10000, 0, 0], 608, rotationSpeeds.mercury, planets);
    
    // Mars
    loadPlanetModel(scene, './3d_models/mars.glb', [-4000, 0, 0], 848, rotationSpeeds.mars, planets);
    
    // Jupiter
    loadPlanetModel(scene, './3d_models/jupiter1.glb', [3000, 0, 0], 17920, rotationSpeeds.jupiter, planets);
    
    // Saturn
    loadPlanetModel(scene, './3d_models/saturn.glb', [14000, 0, 0], 14560, rotationSpeeds.saturn, planets);
    
    // Uranus
    loadPlanetModel(scene, './3d_models/uranus.glb', [22000, 0, 0], 6400, rotationSpeeds.uranus, planets);
    
    // Neptune
    loadPlanetModel(scene, './3d_models/neptune.glb', [29000, 0, 0], 6000, rotationSpeeds.neptune, planets);
    
    // Sun (No rotation for Sun)
    loadPlanetModel(scene, './3d_models/sun.glb', [-25000, 0, 0], 30000, 0, planets);

    return planets; // Return the planets array for click detection
}
