import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/DRACOLoader.js";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";  
import { showPlanetInfo, hidePlanetInfo } from './planetInfo.js';

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

// ✅ Initialize Loader
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/libs/draco/');
dracoLoader.preload();
loader.setDRACOLoader(dracoLoader);

// Store planets
let planets = {};
let sceneRef = null;
let moonOrbitPaused = false;

// ✅ Load Planet Model
function loadPlanetModel(scene, name, modelPath, position, size) {
    loader.load(
        modelPath,
        (gltf) => {
            const planet = gltf.scene;
            planet.name = name.toLowerCase();
            planet.position.set(...position);

            const box = new THREE.Box3().setFromObject(planet);
            const scaleFactor = size / box.getSize(new THREE.Vector3()).length();
            planet.scale.set(scaleFactor, scaleFactor, scaleFactor);

            scene.add(planet);
            planets[name.toLowerCase()] = planet; // Store planet reference

            console.log(`✅ Loaded: ${planet.name}`);
        },
        undefined,
        (error) => {
            console.error(`❌ Failed to load ${name}:`, error);
        }
    );
}


// ✅ Load Planets into Scene
export function loadPlanets(scene) {
    sceneRef = scene;

    loadPlanetModel(scene, "earth", './3d_models_compressed/earth_draco.glb', [0, 0, 0], 10000);
    loadPlanetModel(scene, "sun", './3d_models_compressed/sun.glb', [-5000000, 0, 0], 20000);
    loadPlanetModel(scene, "mercury", './3d_models_compressed/mercury_draco.glb', [-1000000, 0, 0], 4879);
    loadPlanetModel(scene, "venus", './3d_models_compressed/venus_draco.glb', [-3000000, 0, 0], 8000);
    loadPlanetModel(scene, "mars", './3d_models_compressed/mars_draco.glb', [2279000, 0, 0], 5200);
    loadPlanetModel(scene, "jupiter", './3d_models_compressed/jupiter_draco.glb', [7785000, 0, 0], 15000);
    loadPlanetModel(scene, "saturn", './3d_models_compressed/saturn_draco.glb', [14330000, 0, 0], 13000);
    loadPlanetModel(scene, "uranus", './3d_models_compressed/uranus_draco.glb', [28770000, 0, 0], 12700);
    loadPlanetModel(scene, "neptune", './3d_models_compressed/neptune_draco.glb', [45030000, 0, 0], 12000);
    loadPlanetModel(scene, "moon", './3d_models_compressed/moon_draco.glb', [384400 / 10, 0, 0], 3000);

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

    // Orbit Moon around Earth
    if (!moonOrbitPaused && planets["moon"] && planets["earth"]) {
        const time = Date.now() * 0.0005;
        const moonDistance = 38000;
        planets["moon"].position.x = planets["earth"].position.x + Math.cos(time) * moonDistance;
        planets["moon"].position.z = planets["earth"].position.z + Math.sin(time) * moonDistance;
    }
}

// ✅ Move Camera to a Planet
export function moveToPlanet(planetName, camera, controls, scene) {
    let targetPlanet = scene.getObjectByName(planetName);

    if (!targetPlanet) {
        console.error(`❌ Planet "${planetName}" not found!`);
        return;
    }

    console.log(`🚀 Traveling to: ${planetName}`);

    const targetFocus = new THREE.Vector3().setFromMatrixPosition(targetPlanet.matrixWorld);
    const planetSize = new THREE.Box3().setFromObject(targetPlanet).getSize(new THREE.Vector3()).length();
    const baseZoomFactor = 3;
    let adjustedZoom = Math.max(1000, Math.min(planetSize * baseZoomFactor, 7000));

    const targetPosition = new THREE.Vector3(
        targetFocus.x,
        targetFocus.y,
        targetFocus.z + adjustedZoom
    );

    // 🌐 Get start position
    const startPos = camera.position.clone();
    const distance = startPos.distanceTo(targetPosition);

    // ✅ Determine movement direction dynamically
    let movementDirection = targetFocus.x < startPos.x ? -1 : 1; // -1 = Left, +1 = Right
    let offset = distance * 0.7; // Sideways offset (larger for long travel)

    let sideways = new THREE.Vector3(movementDirection, 0, 0).multiplyScalar(offset); // Move left or right

    const fastTravelPoint = new THREE.Vector3(
        startPos.x + sideways.x,
        startPos.y,
        startPos.z + sideways.z
    );

    const slowApproachPoint = new THREE.Vector3(
        targetPosition.x - movementDirection * (offset * 0.3),
        targetPosition.y,
        targetPosition.z - (offset * 0.3)
    );

    const curve = new THREE.CatmullRomCurve3([startPos, fastTravelPoint, slowApproachPoint, targetPosition]);

    controls.enabled = false;
    let uiShown = false;
    hidePlanetInfo();

    // ❌ Hide all planets except the target
    Object.values(planets).forEach((planet) => {
        if (planet !== targetPlanet) {
            planet.visible = false;
        }
    });

    let progress = { t: 0 };

    gsap.to(progress, {
        t: 1,
        duration: Math.max(2.5, distance / 4000000), // Fast movement
        ease: "power2.out", // Fast at start, slow at the end
        onUpdate: () => {
            const newPos = curve.getPoint(progress.t);
            camera.position.copy(newPos);

            // 🪐 Make target planet visible when close
            if (progress.t > 0.7) {
                targetPlanet.visible = true;
            }

            // ✅ Show planet info when almost there
            if (!uiShown && progress.t > 0.85) {
                showPlanetInfo(planetName);
                uiShown = true;
            }
        },
        onComplete: () => {
            controls.enabled = true;
            Object.values(planets).forEach((planet) => {
                if (planet !== targetPlanet) {
                    planet.visible = true;
                }
            });
        }
    });

    // 🔄 Smoothly adjust camera's look-at target
    gsap.to(controls.target, {
        duration: Math.max(2.5, distance / 4000000),
        ease: "power2.out",
        x: targetFocus.x,
        y: targetFocus.y,
        z: targetFocus.z,
        onUpdate: () => camera.lookAt(controls.target),
    });
}




