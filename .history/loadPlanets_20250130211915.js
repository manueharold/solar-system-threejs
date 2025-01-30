import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";  
import { showPlanetInfo, hidePlanetInfo } from "./planetInfo.js";
import { createAtmosphereGlow } from "./atmosphere.js";

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

const atmosphereColors = {
    earth: 0x0077FF,   // Blue Glow
    mars: 0xFF4500,    // Orange Glow
    venus: 0xFFD700,   // Yellow Glow
    neptune: 0x4169E1  // Deep Blue Glow
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

        if (atmosphereColors[planet.name]) {
    createAtmosphereGlow(planet, atmosphereColors[planet.name]);
}
    });
}

// Load planets into the scene
export function loadPlanets(scene) {
    sceneRef = scene;

    loadPlanetModel(scene, "earth", './3d_models/earth.glb', [0, 0, 0], 10000);
    loadPlanetModel(scene, "sun", './3d_models/sun.glb', [-900000, 0, 0], 20000);
    loadPlanetModel(scene, "mercury", './3d_models/mercury.glb', [-600000, 0, 0], 4879);
    loadPlanetModel(scene, "venus", './3d_models/venus.glb', [-300000, 0, 0], 8000);
    loadPlanetModel(scene, "mars", './3d_models/mars.glb', [227900, 0, 0], 5200);
    loadPlanetModel(scene, "jupiter", './3d_models/jupiter1.glb', [778500, 0, 0], 15000);
    loadPlanetModel(scene, "saturn", './3d_models/saturn.glb', [1433000, 0, 0], 13000);
    loadPlanetModel(scene, "uranus", './3d_models/uranus.glb', [2877000, 0, 0], 12700);
    loadPlanetModel(scene, "neptune", './3d_models/neptune.glb', [4503000, 0, 0], 12000);

    // ✅ Start rotating planets after loading them
    setTimeout(animatePlanets, 3000); // Small delay to ensure planets are loaded
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


