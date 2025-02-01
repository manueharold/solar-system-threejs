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
let lastPlanet = "earth"; 
let moonOrbitPhase = 0;

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

    setTimeout(() => {
        animateScene();
    }, 3000);
}

// 🔄 Animation Loop for Planets & Moon Orbit
function animateScene() {
    requestAnimationFrame(animateScene);

    for (const planetName in planets) {
        const planet = planets[planetName];
        if (rotationSpeeds[planetName]) {
            planet.rotation.y += rotationSpeeds[planetName];  
        }
    }

    // Ensure moon orbit phase is updated only if the orbit is not paused
    if (!moonOrbitPaused && planets["moon"] && planets["earth"]) {
        const moonDistance = 38000;
        planets["moon"].position.x = planets["earth"].position.x + Math.cos(moonOrbitPhase) * moonDistance;
        planets["moon"].position.z = planets["earth"].position.z + Math.sin(moonOrbitPhase) * moonDistance;
        moonOrbitPhase += 0.005;  // Maintain the orbit phase even when paused
    }
}

// ✅ Move Camera to a Planet
export function moveToPlanet(planetName, camera, controls, scene) {
    let targetPlanet = scene.getObjectByName(planetName);
    let lastPlanetObj = scene.getObjectByName(lastPlanet);

    // Pause the Moon's orbit if moving to the Moon
    if (planetName === "moon") {
        moonOrbitPaused = true;  // Pause the orbit
    } else {
        moonOrbitPaused = false;  // Resume the orbit after the movement
    }

    if (!targetPlanet) {
        console.error(`❌ Planet "${planetName}" not found!`);
        return;
    }

    const targetFocus = new THREE.Vector3().setFromMatrixPosition(targetPlanet.matrixWorld);
    const planetSize = new THREE.Box3().setFromObject(targetPlanet).getSize(new THREE.Vector3()).length();
    const baseZoomFactor = 2.5;
    let adjustedZoom = Math.max(500, Math.min(planetSize * baseZoomFactor, 5000));

    // Calculate direction vector between last planet and target planet
    let directionVector = new THREE.Vector3();
    if (lastPlanetObj) {
        let lastFocus = new THREE.Vector3().setFromMatrixPosition(lastPlanetObj.matrixWorld);
        directionVector.subVectors(targetFocus, lastFocus).normalize();
    }

    // Calculate target position for the camera
    const targetPosition = new THREE.Vector3(
        targetFocus.x - directionVector.x * adjustedZoom,
        targetFocus.y + planetSize * 0.3,
        targetFocus.z - directionVector.z * adjustedZoom
    );

    // Keep track of the current "up" direction to prevent flip when moving
    const currentUp = camera.up.clone(); 

    controls.enabled = false;
    let uiShown = false;

    hidePlanetInfo();

    // 🌌 Gradually fade out other planets
    Object.keys(planets).forEach(name => {
        if (name !== planetName) {
            gsap.to(planets[name].children[0].material, {
                opacity: 0,
                duration: 1,
                ease: "power1.out",
            });
        }
    });

    setTimeout(() => {
        Object.keys(planets).forEach(name => {
            if (name !== planetName) {
                planets[name].visible = false;
            }
        });
    }, 1000);

    targetPlanet.visible = true;
    if (targetPlanet.children[0].material) {
        targetPlanet.children[0].material.opacity = 0;
    }

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

            if (targetPlanet.children[0].material) {
                targetPlanet.children[0].material.opacity = 1 - (distance / adjustedZoom);
            }
        },
        onComplete: () => {
            controls.enabled = true;
            lastPlanet = planetName;

            // Fix camera "up" direction and adjust final planet visibility and fade-in
            camera.up.copy(currentUp);

            setTimeout(() => {
                Object.keys(planets).forEach(name => {
                    planets[name].visible = true;
                    if (planets[name].children[0].material) {
                        gsap.to(planets[name].children[0].material, {
                            opacity: 1,
                            duration: 1,
                            ease: "power1.out"
                        });
                    }
                });
            }, 500);
        }
    });

    // Adjust camera target to the new planet
    gsap.to(controls.target, {
        x: targetFocus.x,
        y: targetFocus.y,
        z: targetFocus.z,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => camera.lookAt(controls.target),
    });

    // If moving from Moon to Earth, account for Moon's position
    if (planetName === "earth" && lastPlanet === "moon") {
        const moonPosition = planets["moon"].position.clone();
        const cameraOffset = new THREE.Vector3(
            moonPosition.x - directionVector.x * adjustedZoom,
            moonPosition.y + planetSize * 0.3,
            moonPosition.z - directionVector.z * adjustedZoom
        );

        // Set the camera position from the Moon's current position instead of Earth
        gsap.to(camera.position, {
            x: cameraOffset.x,
            y: cameraOffset.y,
            z: cameraOffset.z,
            duration: 2,
            ease: "power2.out",
        });
    }
}


