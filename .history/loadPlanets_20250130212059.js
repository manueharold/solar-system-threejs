import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";  
import { showPlanetInfo, hidePlanetInfo } from "./planetInfo.js";


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

// ✅ Load planet model
function loadPlanetModel(scene, name, modelPath, position, size) {
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
    });
}

// Load planets into the scene
export function loadPlanets(scene) {
    sceneRef = scene;

    for (const planetName in planetData) {
        const data = planetData[planetName];

        const positionX = planetName === "sun" ? 0 : data.distance / 1000; // Scale down distance for visualization
        const size = data.diameter / 2; // Approximate radius

        loadPlanetModel(scene, planetName, `./3d_models/${planetName}.glb`, [positionX, 0, 0], size);
    }
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

    const targetFocus = new THREE.Vector3().setFromMatrixPosition(targetPlanet.matrixWorld);
    const planetSize = new THREE.Box3().setFromObject(targetPlanet).getSize(new THREE.Vector3()).length();
    const baseZoomFactor = 2.5;
    let adjustedZoom = Math.max(800, Math.min(planetSize * baseZoomFactor, 7000));

    if (planetName.toLowerCase() === "sun") {
        adjustedZoom *= 2;
    }

    const targetPosition = new THREE.Vector3(
        targetFocus.x,
        targetFocus.y + planetSize * 0.3,
        targetFocus.z + adjustedZoom
    );

    controls.enabled = false;
    let uiShown = false;

    // Hide UI before moving
    hidePlanetInfo();

    gsap.to(camera.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => {
            const distance = camera.position.distanceTo(targetPosition);
            if (!uiShown && distance < adjustedZoom * 1.1) {
                showPlanetInfo(planetName);
                uiShown = true;
            }
        },
        onComplete: () => {
            controls.enabled = true;
        }
    });

    gsap.to(controls.target, {
        x: targetFocus.x,
        y: targetFocus.y,
        z: targetFocus.z,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => camera.lookAt(controls.target),
    });
}


