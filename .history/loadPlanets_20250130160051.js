import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";  // ✅ Import GSAP

// 🌎 Rotation Speeds
const baseRotationSpeed = 0.002;
const rotationSpeeds = {
    earth: baseRotationSpeed / 1,
    venus: baseRotationSpeed / 243,
    mercury: baseRotationSpeed / 58.6,
    mars: baseRotationSpeed / 1.03,
    jupiter: baseRotationSpeed / 0.41,
    saturn: baseRotationSpeed / 0.45,
    uranus: baseRotationSpeed / 0.72,
    neptune: baseRotationSpeed / 0.67
};

// Store planets
let planets = {};
let sceneRef = null;  // Store reference to the scene

// Load planet model
function loadPlanetModel(scene, name, modelPath, position, size, callback) {
    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => {
        const planet = gltf.scene;
        planet.name = name.toLowerCase();
        planet.position.set(...position);

        // Scale planet
        const box = new THREE.Box3().setFromObject(planet);
        const scaleFactor = size / box.getSize(new THREE.Vector3()).length();
        planet.scale.set(scaleFactor, scaleFactor, scaleFactor);

        scene.add(planet);
        planets[planet.name] = planet;  
        console.log(`✅ Loaded: ${planet.name}`);

        if (callback) callback(planet);  // Call the callback after planet is loaded
    });
}

// Load planets into the scene
// Load planets into the scene
export function loadPlanets(scene, moveToPlanetCallback) {
    sceneRef = scene;  // Save scene reference for animation

    // First load Earth
    loadPlanetModel(scene, "Earth", './3d_models/earth.glb', [149600, 0, 0], 1600, moveToPlanetCallback); // Move to Earth after it's loaded
    
    // Then load the other planets
    loadPlanetModel(scene, "Sun", './3d_models/sun.glb', [0, 0, 0], 30000);  
    loadPlanetModel(scene, "Mercury", './3d_models/mercury.glb', [58000, 0, 0], 608);
    loadPlanetModel(scene, "Venus", './3d_models/venus.glb', [108200, 0, 0], 1520);
    loadPlanetModel(scene, "Mars", './3d_models/mars.glb', [227900, 0, 0], 848);
    loadPlanetModel(scene, "Jupiter", './3d_models/jupiter1.glb', [778500, 0, 0], 17920);
    loadPlanetModel(scene, "Saturn", './3d_models/saturn.glb', [1433000, 0, 0], 14560);
    loadPlanetModel(scene, "Uranus", './3d_models/uranus.glb', [2877000, 0, 0], 6400);
    loadPlanetModel(scene, "Neptune", './3d_models/neptune.glb', [4503000, 0, 0], 6000);

    animatePlanets();  // ✅ Start rotation animation
}

// 🔄 Animate Planet Rotation
function animatePlanets() {
    function rotate() {
        for (const planetName in planets) {
            const planet = planets[planetName];
            if (rotationSpeeds[planetName]) {
                planet.rotation.y += rotationSpeeds[planetName];  // Apply rotation
            }
        }
        requestAnimationFrame(rotate);  // Keep looping
    }
    rotate();  // Start loop
}

// Move camera to a planet using GSAP
export function moveToPlanet(planetName, camera, controls, scene) {
    const targetPlanet = scene.getObjectByName(planetName);
    if (!targetPlanet) {
        console.error(`❌ Planet "${planetName}" not found!`);
        return;
    }

    console.log(`🚀 Moving to: ${planetName}`);

    // Get planet center position
    const targetFocus = new THREE.Vector3().setFromMatrixPosition(targetPlanet.matrixWorld);

    // ✅ Dynamically adjust zoom based on planet size
    const planetSize = new THREE.Box3().setFromObject(targetPlanet).getSize(new THREE.Vector3()).length();
    
    // Adjust zoom based on planet size
    const baseZoomFactor = 2.5;  // General zoom level
    const zoomFactor = planetSize * baseZoomFactor;

    // ✅ If the planet is smaller, zoom in **closer**
    const minZoom = 800;   // Minimum zoom for small planets
    const maxZoom = 7000;  // Maximum zoom for big planets
    let adjustedZoom = Math.max(minZoom, Math.min(zoomFactor, maxZoom));

    // 🌞 Special case for the Sun: Zoom out more
    if (planetName.toLowerCase() === "sun") {
        adjustedZoom *= 2; // Increase zoom distance for the Sun
    }

    const targetPosition = new THREE.Vector3(
        targetFocus.x,
        targetFocus.y + planetSize * 0.3,  // Adjust height based on size
        targetFocus.z + adjustedZoom        // Adjust zoom dynamically
    );

    controls.enabled = false; // Temporarily disable controls

    // ✅ Smoothly move the camera to the planet with proper zoom
    gsap.to(camera.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 2,
        ease: "power2.out",
    });

    // ✅ Ensure the camera focus remains exactly at the planet center
    gsap.to(controls.target, {
        x: targetFocus.x,
        y: targetFocus.y,
        z: targetFocus.z,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => {
            camera.lookAt(controls.target); // Keep focus steady
        },
        onComplete: () => {
            console.log(`✅ Arrived at ${planetName}`);
            controls.enabled = true; // Re-enable user controls
        }
    });
}
