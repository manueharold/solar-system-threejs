import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";
import { showPlanetInfo } from "./planetInfo.js";

const loader = new GLTFLoader();
const baseRotationSpeed = 0.002;
const planets = {};  // Store loaded planets
let sceneRef = null; 

const rotationSpeeds = {
    earth: baseRotationSpeed / 1, venus: baseRotationSpeed / 243, mercury: baseRotationSpeed / 58.6,
    mars: baseRotationSpeed / 1.03, jupiter: baseRotationSpeed / 0.41, saturn: baseRotationSpeed / 0.45,
    uranus: baseRotationSpeed / 0.72, neptune: baseRotationSpeed / 0.67
};

const planetData = [
    { name: "earth", model: './3d_models/earth.glb', position: [0, 0, 0], size: 10000, loadDistance: 500000 },
    { name: "sun", model: './3d_models/sun.glb', position: [-900000, 0, 0], size: 20000, loadDistance: 2000000 },
    { name: "mercury", model: './3d_models/mercury.glb', position: [-600000, 0, 0], size: 4879, loadDistance: 800000 },
    { name: "venus", model: './3d_models/venus.glb', position: [-300000, 0, 0], size: 8000, loadDistance: 700000 },
    { name: "mars", model: './3d_models/mars.glb', position: [227900, 0, 0], size: 5200, loadDistance: 900000 },
    { name: "jupiter", model: './3d_models/jupiter1.glb', position: [778500, 0, 0], size: 15000, loadDistance: 1200000 },
    { name: "saturn", model: './3d_models/saturn.glb', position: [1433000, 0, 0], size: 13000, loadDistance: 1500000 },
    { name: "uranus", model: './3d_models/uranus.glb', position: [2877000, 0, 0], size: 12700, loadDistance: 1800000 },
    { name: "neptune", model: './3d_models/neptune.glb', position: [4503000, 0, 0], size: 12000, loadDistance: 2000000 }
];

// ✅ Load a single planet when needed
function loadPlanet(name, modelPath, position, size, scene) {
    if (planets[name]) return; // Already loaded

    loader.load(modelPath, (gltf) => {
        const planet = gltf.scene;
        planet.name = name;
        planet.position.set(...position);

        // Scale planet properly
        const box = new THREE.Box3().setFromObject(planet);
        const scaleFactor = size / box.getSize(new THREE.Vector3()).length();
        planet.scale.set(scaleFactor, scaleFactor, scaleFactor);

        scene.add(planet);
        planets[name] = planet;
        console.log(`✅ Loaded: ${name}`);
    });
}

// ✅ Lazy Load Planets
export function checkAndLoadPlanets(camera, scene) {
    planetData.forEach(({ name, model, position, size, loadDistance }) => {
        const distance = camera.position.distanceTo(new THREE.Vector3(...position));

        if (distance < loadDistance) {
            loadPlanet(name, model, position, size, scene);
        } else if (planets[name] && distance > loadDistance * 1.2) {
            // Remove planet if too far to free memory
            scene.remove(planets[name]);
            delete planets[name];
            console.log(`❌ Unloaded: ${name}`);
        }
    });
}

// ✅ Load only nearby planets at startup
export function loadPlanets(scene) {
    sceneRef = scene;
    planetData.forEach(({ name, model, position, size, loadDistance }) => {
        if (position[0] < loadDistance * 0.5) {
            loadPlanet(name, model, position, size, scene);
        }
    });
    setTimeout(animatePlanets, 3000);
}

// 🔄 Animate Planet Rotation
function animatePlanets() {
    function rotate() {
        Object.values(planets).forEach(planet => {
            if (rotationSpeeds[planet.name]) {
                planet.rotation.y += rotationSpeeds[planet.name];
            }
        });
        requestAnimationFrame(rotate);
    }
    rotate();
}

// 🚀 Move Camera to Planet
export function moveToPlanet(planetName, camera, controls, scene) {
    checkAndLoadPlanets(camera, scene); // Ensure planet is loaded

    const targetPlanet = scene.getObjectByName(planetName);
    if (!targetPlanet) {
        console.error(`❌ Planet "${planetName}" not found!`);
        return;
    }

    console.log(`🚀 Moving to: ${planetName}`);
    showPlanetInfo(planetName);

    const targetFocus = new THREE.Vector3().setFromMatrixPosition(targetPlanet.matrixWorld);
    const planetSize = new THREE.Box3().setFromObject(targetPlanet).getSize(new THREE.Vector3()).length();
    const baseZoomFactor = 2.5;
    let adjustedZoom = Math.max(800, Math.min(planetSize * baseZoomFactor, 7000));

    if (planetName === "sun") adjustedZoom *= 2;

    const targetPosition = new THREE.Vector3(targetFocus.x, targetFocus.y + planetSize * 0.3, targetFocus.z + adjustedZoom);

    controls.enabled = false;

    gsap.to(camera.position, { x: targetPosition.x, y: targetPosition.y, z: targetPosition.z, duration: 2, ease: "power2.out" });
    gsap.to(controls.target, { x: targetFocus.x, y: targetFocus.y, z: targetFocus.z, duration: 2, ease: "power2.out",
        onUpdate: () => camera.lookAt(controls.target), onComplete: () => controls.enabled = true 
    });
}
