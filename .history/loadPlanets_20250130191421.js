import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";  // ✅ Import GSAP
import { showPlanetInfo } from "./planetInfo.js";

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
export function loadPlanets(scene) {
    sceneRef = scene;  // Save scene reference for animation

    // Place Earth at the origin (0, 0, 0)
    loadPlanetModel(scene, "earth", './3d_models/earth.glb', [0, 0, 0], 10000);
    
    // Place the Sun before Mercury (at a distance of 50 million km)
    loadPlanetModel(scene, "Sun", './3d_models/sun.glb', [-900000, 0, 0], 20000);  // Sun at -50 million km
    
    // Then load the other planets relative to Earth
    loadPlanetModel(scene, "Mercury", './3d_models/mercury.glb', [-600000, 0, 0], 4879);  // 58 million km from Earth
    loadPlanetModel(scene, "Venus", './3d_models/venus.glb', [-300000, 0, 0], 8000);  // 108.2 million km from Earth
    loadPlanetModel(scene, "Mars", './3d_models/mars.glb', [227900, 0, 0], 5200);  // 227.9 million km from Earth
    loadPlanetModel(scene, "Jupiter", './3d_models/jupiter1.glb', [778500, 0, 0], 15000);  // 778.5 million km from Earth
    loadPlanetModel(scene, "Saturn", './3d_models/saturn.glb', [1433000, 0, 0], 13000);  // 1.433 billion km from Earth
    loadPlanetModel(scene, "Uranus", './3d_models/uranus.glb', [2877000, 0, 0], 12700);  // 2.877 billion km from Earth
    loadPlanetModel(scene, "Neptune", './3d_models/neptune.glb', [4503000, 0, 0], 12000);  // 4.503 billion km from Earth

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
    showPlanetInfo(planetName);  // ✅ Show planet details when moving to it

    // 🎥 Get planet center position
    const targetFocus = new THREE.Vector3().setFromMatrixPosition(targetPlanet.matrixWorld);

    // 📏 Dynamically adjust zoom based on planet size
    const planetSize = new THREE.Box3().setFromObject(targetPlanet).getSize(new THREE.Vector3()).length();
    const baseZoomFactor = 2.5;
    const zoomFactor = planetSize * baseZoomFactor;
    const minZoom = 800;
    const maxZoom = 7000;
    let adjustedZoom = Math.max(minZoom, Math.min(zoomFactor, maxZoom));

    // Special case for the Sun
    if (planetName.toLowerCase() === "sun") {
        adjustedZoom *= 2;
    }

    // 🎯 Target position
    const targetPosition = new THREE.Vector3(
        targetFocus.x,
        targetFocus.y + planetSize * 0.3,
        targetFocus.z + adjustedZoom
    );

    controls.enabled = false;

    // 🎬 Animate camera movement
    gsap.to(camera.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 2,
        ease: "power2.out",
    });

    // 🎯 Keep camera focused on planet
    gsap.to(controls.target, {
        x: targetFocus.x,
        y: targetFocus.y,
        z: targetFocus.z,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => camera.lookAt(controls.target),
        onComplete: () => controls.enabled = true
    });
}
