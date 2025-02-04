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

// Store planets
let planets = {};
let sceneRef = null;
let moonOrbitPaused = false;

/**
 * Create a realistic Sun mesh with a high-resolution texture,
 * emissive material, and an attached point light.
 */
function createRealisticSun(scene, position, size) {
    // Create a high-poly sphere for smoothness
    const geometry = new THREE.SphereGeometry(1, 64, 64);

    // Load a realistic sun texture
    const textureLoader = new THREE.TextureLoader();
    // Replace this URL with a realistic sun texture image URL
    const sunTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/sprites/sun.png');

    // Use a MeshBasicMaterial to simulate an unlit (glowing) appearance.
    // Alternatively, you can use MeshStandardMaterial with emissive settings.
    const material = new THREE.MeshBasicMaterial({
        map: sunTexture,
        // The sun is self-illuminating, so no need for shading from lights.
        side: THREE.DoubleSide
    });

    const sunMesh = new THREE.Mesh(geometry, material);

    // Scale the sphere based on the desired size.
    sunMesh.scale.set(size, size, size);
    sunMesh.position.set(...position);
    sunMesh.name = 'sun';

    // Add the sun mesh to the scene
    scene.add(sunMesh);

    // Add a point light to simulate the Sun's light
    const sunLight = new THREE.PointLight(0xffffff, 2, 0, 2);
    sunLight.position.copy(sunMesh.position);
    scene.add(sunLight);

    // Store the sun in the planets object for later reference
    planets['sun'] = sunMesh;
    console.log(`✅ Created realistic Sun at ${position}`);

    return sunMesh;
}

/**
 * Load a planet GLB model as before.
 */
function loadPlanetModel(scene, name, modelPath, position, size) {
    return new Promise((resolve, reject) => {
        // (Assuming you already have your GLTFLoader & DRACOLoader set up)
        loader.load(
            modelPath,
            (gltf) => {
                const planet = gltf.scene;
                planet.name = name.toLowerCase();
                planet.position.set(...position);

                // Resize the planet based on the provided size
                const box = new THREE.Box3().setFromObject(planet);
                const scaleFactor = size / box.getSize(new THREE.Vector3()).length();
                planet.scale.set(scaleFactor, scaleFactor, scaleFactor);

                scene.add(planet);
                planets[name.toLowerCase()] = planet;
                console.log(`✅ Loaded: ${planet.name}`);
                resolve(planet);
            },
            undefined,
            (error) => {
                console.error(`❌ Failed to load ${name}:`, error);
                reject(error);
            }
        );
    });
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

        // Create the Sun using our custom realistic method instead of a GLB model.
        createRealisticSun(scene, [-6000000, 0, 0], 20000);

        // Load the rest of the planets (these can be done in parallel)
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

    // Start the animation loop after a delay
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
            planet.rotation.y += rotationSpeeds[planetName];
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
        adjustedZoom = Math.max(planetSize * 8, 150000);
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
