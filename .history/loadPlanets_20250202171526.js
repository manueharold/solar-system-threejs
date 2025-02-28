// --- Import Statements ---
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";
import { showPlanetInfo, hidePlanetInfo } from './planetInfo.js';
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/DRACOLoader.js";

// --- Initialize GLTF & DRACO Loaders ---
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/libs/draco/');
dracoLoader.preload();
loader.setDRACOLoader(dracoLoader);

// --- Rotation Speeds ---
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

// --- Planet Storage & State ---
let planets = {};
let sceneRef = null;
let moonOrbitPaused = false;

// --- Create a Realistic Sun ---
function createRealisticSun(scene, position, size) {
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const textureLoader = new THREE.TextureLoader();
  const sunTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/sprites/sun.png');

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

// --- Load Planets into the Scene ---
export async function loadPlanets(scene) {
  sceneRef = scene;
  planets = {}; // Reset planets

  try {
    // Load Earth first and wait for it to finish
    await loadPlanetModel(
      scene,
      "earth",
      'https://raw.githubusercontent.com/manueharold/solar-system-threejs/main/3d_models_compressed/earth_draco.glb',
      [0, 0, 0],
      10000
    );

    // Create the Sun using our custom function
    createRealisticSun(scene, [-6000000, 0, 0], 20000);

    // Load other planets (they can load asynchronously)
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

  // Start animation after a short delay (if needed)
  setTimeout(() => {
    animateScene();
  }, 3000);
}

// --- Animation Loop ---
function animateScene() {
  requestAnimationFrame(animateScene);

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

// --- Move Camera to a Planet ---
export function moveToPlanet(planetName, camera, controls, scene) {
  let targetPlanet = scene.getObjectByName(planetName);
  if (!targetPlanet) {
    console.error(`❌ Planet "${planetName}" not found!`);
    return;
  }

  console.log(`🚀 Moving to: ${planetName}`);
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

  moonOrbitPaused = (planetName === "moon");

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

// --- Update Planets (for external calls) ---
export function updatePlanets() {
  for (const planetName in planets) {
    const planet = planets[planetName];
    if (rotationSpeeds[planetName]) {
      planet.rotation.y += rotationSpeeds[planetName];
    }
  }

  if (!moonOrbitPaused && planets["moon"] && planets["earth"]) {
    const time = Date.now() * 0.0005;
    const moonDistance = 38000;
    planets["moon"].position.x = planets["earth"].position.x + Math.cos(time) * moonDistance;
    planets["moon"].position.z = planets["earth"].position.z + Math.sin(time) * moonDistance;
  }
}
