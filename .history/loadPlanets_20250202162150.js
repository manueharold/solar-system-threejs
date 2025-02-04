import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/DRACOLoader.js";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";
import { showPlanetInfo, hidePlanetInfo } from './planetInfo.js';
import { SimplexNoise } from "https://cdn.skypack.dev/simplex-noise";
import { createAtmosphere } from "./AtmosphereShader.js";



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
const atmosphere = createAtmosphere(5000, scene);
dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/libs/draco/');
dracoLoader.preload();
loader.setDRACOLoader(dracoLoader);

// Store planets
let planets = {};
let sceneRef = null;
let moonOrbitPaused = false;

// ✅ Load Planet Model
function createProceduralPlanet(name, radius, detail, color, position, scene) {
    const geometry = new THREE.IcosahedronGeometry(radius, detail);
    const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 1,
        metalness: 0
    });

    // Apply noise for terrain
    const noise = new SimplexNoise();
    const vertices = geometry.attributes.position;
    
    for (let i = 0; i < vertices.count; i++) {
        let vertex = new THREE.Vector3().fromBufferAttribute(vertices, i);
        let elevation = noise.noise3D(vertex.x, vertex.y, vertex.z);
        vertex.multiplyScalar(1 + elevation * 0.1);
        vertices.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    geometry.computeVertexNormals();
    
    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(...position);
    planet.name = name;
    scene.add(planet);
    
    planets[name.toLowerCase()] = planet; // Store reference
}

// Example usage inside `loadPlanets()`
export function loadPlanets(scene) {
    createProceduralPlanet("earth", 5000, 5, 0x2288cc, [0, 0, 0], scene);
    createProceduralPlanet("mars", 3000, 5, 0xff6633, [2279000, 0, 0], scene);
}

// ✅ Load Planets into Scene
export async function loadPlanets(scene) {
    sceneRef = scene;
    planets = {}; // Reset planets object

    try {
        // Load Earth first and wait for it to finish
        await loadPlanetModel(
            scene,
            "earth",
            'https://raw.githubusercontent.com/manueharold/solar-system-threejs/main/3d_models_compressed/earth_draco.glb',
            [0, 0, 0],
            10000
        );

        // Now load the rest of the planets (these can be done in parallel or sequentially)
        loadPlanetModel(
            scene,
            "sun",
            "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/sun.glb",
            [-6000000, 0, 0],
            20000
        );
        loadPlanetModel(
            scene,
            "mercury",
            "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/mercury_draco.glb",
            [-4000000, 0, 0],
            4879
        );
        loadPlanetModel(
            scene,
            "venus",
            "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/venus_draco.glb",
            [-2000000, 0, 0],
            8000
        );
        loadPlanetModel(
            scene,
            "mars",
            "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/mars_draco.glb",
            [2279000, 0, 0],
            5200
        );
        loadPlanetModel(
            scene,
            "jupiter",
            "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/jupiter_draco.glb",
            [7785000, 0, 0],
            15000
        );
        loadPlanetModel(
            scene,
            "saturn",
            'https://raw.githubusercontent.com/manueharold/solar-system-threejs/main/3d_models_compressed/saturn_draco.glb',
            [14330000, 0, 0],
            13000
        );
        loadPlanetModel(
            scene,
            "uranus",
            "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/uranus_draco.glb",
            [28770000, 0, 0],
            12700
        );
        loadPlanetModel(
            scene,
            "neptune",
            "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/neptune_draco.glb",
            [45030000, 0, 0],
            12000
        );
        loadPlanetModel(
            scene,
            "moon",
            "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/moon_draco.glb",
            [384400 / 10, 0, 0],
            3000
        );
    } catch (error) {
        console.error("Error loading Earth:", error);
    }

    // Start the animation loop after a delay (if needed)
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
            planet.rotation.y += rotationSpeeds[planetName]; // Apply rotation
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

    console.log(`🚀 Moving to: ${planetName}`);

    // Update zoom limits for the selected planet
    controls.updateZoomLimits(planetName);

    const targetFocus = new THREE.Vector3().setFromMatrixPosition(targetPlanet.matrixWorld);
    const planetSize = new THREE.Box3().setFromObject(targetPlanet).getSize(new THREE.Vector3()).length();

    let adjustedZoom;
    if (planetName === "sun") {
        adjustedZoom = Math.max(planetSize * 8, 150000); // Zoom out even more for Sun
    } else {
        const baseZoomFactor = 8;
        adjustedZoom = Math.max(1000, Math.min(planetSize * baseZoomFactor, 10000));
    }

    const targetPosition = new THREE.Vector3(
        targetFocus.x,
        targetFocus.y + planetSize * 0.6,
        targetFocus.z + adjustedZoom
    );

    if (planetName === "moon") {
        moonOrbitPaused = true;
    } else {
        moonOrbitPaused = false;
    }

    controls.enabled = false;
    let uiShown = false;
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

// Function to update planet rotations and moon orbit (called from main.js)
export function updatePlanets() {
    // Rotate Planets
    for (const planetName in planets) {
        const planet = planets[planetName];
        if (rotationSpeeds[planetName]) {
            planet.rotation.y += rotationSpeeds[planetName];
        }
    }

    // Orbit Moon around Earth continuously
    if (!moonOrbitPaused && planets["moon"] && planets["earth"]) {
        const time = Date.now() * 0.0005;
        const moonDistance = 38000;
        planets["moon"].position.x = planets["earth"].position.x + Math.cos(time) * moonDistance;
        planets["moon"].position.z = planets["earth"].position.z + Math.sin(time) * moonDistance;
    }
}
