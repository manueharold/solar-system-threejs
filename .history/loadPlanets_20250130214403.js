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
let moonOrbitPaused = false; // Track if the moon orbit should be paused

// ✅ Load Planet Model
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

// ✅ Load Planets into Scene
export function loadPlanets(scene) {
    sceneRef = scene;

    loadPlanetModel(scene, "earth", './3d_models/earth.glb', [0, 0, 0], 10000);
    loadPlanetModel(scene, "sun", './3d_models/sun.glb', [-5000000, 0, 0], 20000);
    loadPlanetModel(scene, "mercury", './3d_models/mercury.glb', [-1000000, 0, 0], 4879);
    loadPlanetModel(scene, "venus", './3d_models/venus.glb', [-3000000, 0, 0], 8000);
    loadPlanetModel(scene, "mars", './3d_models/mars.glb', [2279000, 0, 0], 5200);
    loadPlanetModel(scene, "jupiter", './3d_models/jupiter1.glb', [7785000, 0, 0], 15000);
    loadPlanetModel(scene, "saturn", './3d_models/saturn.glb', [14330000, 0, 0], 13000);
    loadPlanetModel(scene, "uranus", './3d_models/uranus.glb', [28770000, 0, 0], 12700);
    loadPlanetModel(scene, "neptune", './3d_models/neptune.glb', [45030000, 0, 0], 12000);
    loadPlanetModel(scene, "moon", './3d_models/moon.glb', [384400 / 10, 0, 0], 3000);

    // ✅ Start animations after planets load
    setTimeout(() => {
        animateScene();
    }, 3000);
}

// 🔄 Unified Animation Loop for Planets & Moon Orbit
function animateScene() {
    requestAnimationFrame(animateScene);

    // Rotate Planets
    for (const planetName in planets) {
        const planet = planets[planetName];
        if (rotationSpeeds[planetName]) {
            planet.rotation.y += rotationSpeeds[planetName];  // Apply rotation
        }
    }

    // Orbit Moon around Earth (if not paused)
    if (!moonOrbitPaused && planets["moon"] && planets["earth"]) {
        const time = Date.now() * 0.0005; // Adjust speed if needed
        const moonDistance = 38000; // Adjust scale if needed
        planets["moon"].position.x = planets["earth"].position.x + Math.cos(time) * moonDistance;
        planets["moon"].position.z = planets["earth"].position.z + Math.sin(time) * moonDistance;
    }
}

// ✅ Move Camera to a Planet
export function moveToPlanet(planetName, camera, controls, scene) {
    let targetPlanet = scene.getObjectByName(planetName);

    if (planetName === "moon") {
        moonOrbitPaused = true; // Pause Moon orbit
    } else {
        moonOrbitPaused = false; // Resume orbit when leaving the Moon
    }

    if (!targetPlanet) {
        console.error(`❌ Planet "${planetName}" not found!`);
        return;
    }

    console.log(`🚀 Moving to: ${planetName}`);

    const targetFocus = new THREE.Vector3().setFromMatrixPosition(targetPlanet.matrixWorld);
    const planetSize = new THREE.Box3().setFromObject(targetPlanet).getSize(new THREE.Vector3()).length();
    const baseZoomFactor = 2.5;
    let adjustedZoom = Math.max(500, Math.min(planetSize * baseZoomFactor, 5000));

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
