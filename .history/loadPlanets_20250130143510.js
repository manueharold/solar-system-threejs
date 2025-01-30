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
    const planetPositions = {
        mercury: [-10000, 0, 500],
        venus: [-8000, 0, 1000],
        earth: [-6000, 0, 1500],
        mars: [-4000, 0, 2000],
        jupiter: [3000, 0, 2500],
        saturn: [14000, 0, 3000],
        uranus: [22000, 0, 3500],
        neptune: [29000, 0, 4000],
        sun: [-60000, 0, 5000]
    };

    const targetPlanet = scene.getObjectByName(planetName);
    if (!targetPlanet) {
        console.error(`❌ Planet "${planetName}" not found!`);
        return;
    }

    console.log(`🚀 Moving to: ${planetName}`);

    const targetPosition = new THREE.Vector3(
        targetPlanet.position.x,
        targetPlanet.position.y + 500,  // Slightly above the planet
        targetPlanet.position.z + 800   // Zoom closer
    );

    controls.enabled = false; // Disable user interaction temporarily

    gsap.to(camera.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => camera.lookAt(targetPlanet.position),
        onComplete: () => {
            console.log(`✅ Arrived at ${planetName}`);
            controls.target.copy(targetPlanet.position); // Set new target
            controls.enabled = true; // Re-enable user controls
        }
    });
}

