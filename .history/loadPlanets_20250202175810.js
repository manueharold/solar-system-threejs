import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/DRACOLoader.js";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";  
import { showPlanetInfo, hidePlanetInfo } from './planetInfo.js';

// 🌎 Realistic Size & Distance Constants
const planetData = {
  sun: { size: 696340, distance: 0, scale: 20000 },
  mercury: { size: 4879, distance: 4000000, scale: 0.5 },
  venus: { size: 12104, distance: 6000000, scale: 1 },
  earth: { size: 12742, distance: 10000000, scale: 1 },
  mars: { size: 6779, distance: 15000000, scale: 1 },
  jupiter: { size: 139820, distance: 25000000, scale: 1.5 },
  saturn: { size: 116460, distance: 35000000, scale: 1.5 },
  uranus: { size: 50724, distance: 45000000, scale: 1.2 },
  neptune: { size: 49244, distance: 55000000, scale: 1.2 },
  moon: { size: 3474, distance: 38000, scale: 0.2 }, // Relative to Earth
};

// 🌍 Rotation Speeds
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

// --- Create a Realistic Sun ---
function createRealisticSun(scene, position, size) {
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const textureLoader = new THREE.TextureLoader();
  const sunTexture = textureLoader.load('./textures/8k_sun.jpg');

  const material = new THREE.MeshBasicMaterial({
    map: sunTexture,
    side: THREE.DoubleSide
  });

  const sunMesh = new THREE.Mesh(geometry, material);
  sunMesh.scale.set(size, size, size);
  sunMesh.position.set(...position);
  sunMesh.name = 'sun';

  scene.add(sunMesh);

  // Attach a point light at the Sun's position
  const sunLight = new THREE.PointLight(0xffffff, 2, 0, 2);
  sunLight.position.copy(sunMesh.position);
  scene.add(sunLight);

  planets['sun'] = sunMesh;
  console.log(`✅ Created realistic Sun at ${position}`);

  return sunMesh;
}

// ✅ Load Planet Model
// --- Load a Planet Model ---
function loadPlanetModel(scene, name, modelPath, position, size) {
  return new Promise((resolve, reject) => {
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
  planets = {}; // Reset planets

  try {
    // Load Earth first and wait for it to finish
    await loadPlanetModel(
      scene,
      "earth",
      'https://raw.githubusercontent.com/manueharold/solar-system-threejs/main/3d_models_compressed/earth_draco.glb',
      [planetData.earth.distance, 0, 0],
      planetData.earth.scale * planetData.earth.size
    );

    // Create the Sun using our custom function
    createRealisticSun(scene, [planetData.sun.distance, 0, 0], planetData.sun.scale);

    // Load other planets (asynchronously)
    loadPlanetModel(
      scene,
      "mercury",
      "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/mercury_draco.glb",
      [planetData.mercury.distance, 0, 0],
      planetData.mercury.scale * planetData.mercury.size
    );
    loadPlanetModel(
      scene,
      "venus",
      "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/venus_draco.glb",
      [planetData.venus.distance, 0, 0],
      planetData.venus.scale * planetData.venus.size
    );
    loadPlanetModel(
      scene,
      "mars",
      "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/mars_draco.glb",
      [planetData.mars.distance, 0, 0],
      planetData.mars.scale * planetData.mars.size
    );
    loadPlanetModel(
      scene,
      "jupiter",
      "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/jupiter_draco.glb",
      [planetData.jupiter.distance, 0, 0],
      planetData.jupiter.scale * planetData.jupiter.size
    );
    loadPlanetModel(
      scene,
      "saturn",
      'https://raw.githubusercontent.com/manueharold/solar-system-threejs/main/3d_models_compressed/saturn_draco.glb',
      [planetData.saturn.distance, 0, 0],
      planetData.saturn.scale * planetData.saturn.size
    );
    loadPlanetModel(
      scene,
      "uranus",
      "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/uranus_draco.glb",
      [planetData.uranus.distance, 0, 0],
      planetData.uranus.scale * planetData.uranus.size
    );
    loadPlanetModel(
      scene,
      "neptune",
      "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/neptune_draco.glb",
      [planetData.neptune.distance, 0, 0],
      planetData.neptune.scale * planetData.neptune.size
    );
    loadPlanetModel(
      scene,
      "moon",
      "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/moon_draco.glb",
      [planetData.earth.distance + planetData.moon.distance, 0, 0],
      planetData.moon.scale * planetData.moon.size
    );
  } catch (error) {
    console.error("Error loading planets:", error);
  }

  // Start animation after a short delay (if needed)
  setTimeout(() => {
    animateScene();
  }, 3000);
}

// Function to update planet positions and zoom settings based on distances
export function updateZoomSettings(camera, controls) {
  const maxDistance = planetData.neptune.distance + 5000000; // Max distance from the Sun to Neptune + some extra distance for clear view
  camera.position.z = Math.max(maxDistance * 2, 100000);  // Adjust camera zoom out for better viewing

  controls.updateZoomLimits('sun');
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
    const moonDistance = planetData.moon.distance;
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