// ===== Module Imports =====
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/DRACOLoader.js";
import gsap from "https://cdn.skypack.dev/gsap";  
import { showPlanetInfo, hidePlanetInfo } from './planetInfo.js';
import { updateComparisonRotation } from "./comparePlanets.js";

// ===== Configuration & Constants =====
export const planetData = {
  sun:     { size: 600940, distance: 0,         scale: 100000 },
  mercury: { size: 4879,   distance: 4000000,   scale: 0.5 },
  venus:   { size: 12104,  distance: 6000000,   scale: 1 },
  earth:   { size: 12742,  distance: 10000000,  scale: 1 },
  mars:    { size: 6779,   distance: 15000000,  scale: 1 },
  jupiter: { size: 139820, distance: 25000000,  scale: 1.5 },
  saturn:  { size: 116460, distance: 35000000,  scale: 1.5 },
  uranus:  { size: 50724,  distance: 45000000,  scale: 1.2 },
  neptune: { size: 49244,  distance: 55000000,  scale: 1.2 },
  moon:    { size: 3474,   distance: 38000,     scale: 0.2 } // Relative to Earth
};

const baseRotationSpeed = 0.002;
const rotationSpeeds = {
  mercury: baseRotationSpeed / 58.6,
  venus:   baseRotationSpeed / 243,
  earth:   baseRotationSpeed / 1,
  mars:    baseRotationSpeed / 1.03,
  jupiter: baseRotationSpeed / 0.41,
  saturn:  baseRotationSpeed / 0.45,
  uranus:  baseRotationSpeed / 0.72,
  neptune: baseRotationSpeed / 0.67
};

// ===== Global Variables =====
export const planetTemplates = {};  // For cloning during comparisons
let planets = {};                   // Stores planet mesh objects
let sceneRef = null;
let moonOrbitPaused = false;
let moonOrbitAngle = 0;

// Use THREE.Clock for time-based animations
const clock = new THREE.Clock();

// ===== Loader Setup =====
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/libs/draco/');
dracoLoader.preload();
loader.setDRACOLoader(dracoLoader);

// ===== Helper Functions =====

/**
 * Creates a realistic sun mesh with a point light.
 * @param {THREE.Scene} scene - The scene to which the sun is added.
 * @param {Array<number>} position - [x, y, z] position for the sun.
 * @param {number} size - Scale factor for the sun.
 * @returns {THREE.Mesh} The sun mesh.
 */
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

  // Add a point light at the sun's position
  const sunLight = new THREE.PointLight(0xffffff, 2, 0, 2);
  sunLight.position.copy(sunMesh.position);
  scene.add(sunLight);

  planets['sun'] = sunMesh;
  planetTemplates['sun'] = sunMesh.clone(true);

  console.log(`✅ Created realistic Sun at ${position}`);
  return sunMesh;
}

/**
 * Loads a GLTF planet model, scales it based on size, and adds it to the scene.
 * Also stores a clone for later comparisons.
 *
 * @param {THREE.Scene} scene - The scene where the planet will be added.
 * @param {string} name - The name of the planet.
 * @param {string} modelPath - URL/path to the GLTF model.
 * @param {Array<number>} position - [x, y, z] coordinates for positioning.
 * @param {number} size - The desired size (scaled from planetData).
 * @returns {Promise<THREE.Group>} A promise that resolves to the loaded planet model.
 */
const loadPlanetModel = (scene, name, modelPath, position, size) =>
  new Promise((resolve, reject) => {
    loader.load(
      modelPath,
      (gltf) => {
        const planet = gltf.scene;
        planet.name = name.toLowerCase();
        planet.position.set(...position);

        // Compute scale factor based on the model's bounding box size
        const box = new THREE.Box3().setFromObject(planet);
        const scaleFactor = size / box.getSize(new THREE.Vector3()).length();
        planet.scale.set(scaleFactor, scaleFactor, scaleFactor);

        scene.add(planet);
        planets[planet.name] = planet;
        planetTemplates[planet.name] = planet.clone(true);
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

// ===== Main Functions =====

/**
 * Loads all planets (and the sun) into the scene.
 * Earth is loaded first, then the sun, then the rest of the planets in parallel.
 *
 * @param {THREE.Scene} scene - The scene to populate.
 */
export async function loadPlanets(scene) {
  sceneRef = scene;
  planets = {}; // Reset stored planets

  try {
    // Load Earth first
    await loadPlanetModel(
      scene,
      "earth",
      'https://raw.githubusercontent.com/manueharold/solar-system-threejs/main/3d_models_compressed/earth_draco.glb',
      [planetData.earth.distance, 0, 0],
      planetData.earth.scale * planetData.earth.size
    );

    // Create the sun immediately after Earth
    createRealisticSun(scene, [planetData.sun.distance, 0, 0], planetData.sun.scale);

    // Prepare an array of remaining planets to load in parallel
    const otherPlanets = [
      {
        name: "mercury",
        modelPath: "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/mercury_draco.glb",
        position: [planetData.mercury.distance, 0, 0],
        size: planetData.mercury.scale * planetData.mercury.size
      },
      {
        name: "venus",
        modelPath: "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/venus_draco.glb",
        position: [planetData.venus.distance, 0, 0],
        size: planetData.venus.scale * planetData.venus.size
      },
      {
        name: "mars",
        modelPath: "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/mars_draco.glb",
        position: [planetData.mars.distance, 0, 0],
        size: planetData.mars.scale * planetData.mars.size
      },
      {
        name: "jupiter",
        modelPath: "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/jupiter_draco.glb",
        position: [planetData.jupiter.distance, 0, 0],
        size: planetData.jupiter.scale * planetData.jupiter.size
      },
      {
        name: "saturn",
        modelPath: 'https://raw.githubusercontent.com/manueharold/solar-system-threejs/main/3d_models_compressed/saturn_draco.glb',
        position: [planetData.saturn.distance, 0, 0],
        size: planetData.saturn.scale * planetData.saturn.size
      },
      {
        name: "uranus",
        modelPath: "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/uranus_draco.glb",
        position: [planetData.uranus.distance, 0, 0],
        size: planetData.uranus.scale * planetData.uranus.size
      },
      {
        name: "neptune",
        modelPath: "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/neptune_draco.glb",
        position: [planetData.neptune.distance, 0, 0],
        size: planetData.neptune.scale * planetData.neptune.size
      },
      {
        name: "moon",
        modelPath: "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/moon_draco.glb",
        // Position the moon relative to Earth
        position: [planetData.earth.distance + planetData.moon.distance, 0, 0],
        size: planetData.moon.scale * planetData.moon.size
      }
    ];

    // Load all the remaining planets in parallel.
    await Promise.all(
      otherPlanets.map(planet =>
        loadPlanetModel(scene, planet.name, planet.modelPath, planet.position, planet.size)
      )
    );

  } catch (error) {
    console.error("Error loading planets:", error);
  }

  // Start the animation loop
  animateScene();
}

/**
 * Adjusts the camera position and OrbitControls zoom limits based on the furthest planet.
 *
 * @param {THREE.PerspectiveCamera} camera - The camera to adjust.
 * @param {OrbitControls} controls - The OrbitControls instance to update.
 */
export function updateZoomSettings(camera, controls) {
  const maxDistance = planetData.neptune.distance + 5000000; // Extra buffer for clarity
  camera.position.z = Math.max(maxDistance * 2, 100000);
  controls.updateZoomLimits('sun'); // Assuming OrbitControls has this custom method
}

/**
 * Updates the rotation of the planets and the orbit of the moon.
 * Called on every frame.
 *
 * @param {number} deltaTime - Time elapsed since the last frame.
 */
function updateAnimations(deltaTime) {
  // Rotate planets based on their specific speeds
  Object.entries(planets).forEach(([name, planet]) => {
    if (rotationSpeeds[name]) {
      planet.rotation.y += rotationSpeeds[name] * deltaTime;
    }
  });

  // Update moon orbit (if not paused)
  if (!moonOrbitPaused && planets["moon"] && planets["earth"]) {
    moonOrbitAngle += deltaTime;
    const moonDistance = planetData.moon.distance;
    const earthPos = planets["earth"].position;
    planets["moon"].position.x = earthPos.x + Math.cos(moonOrbitAngle) * moonDistance;
    planets["moon"].position.z = earthPos.z + Math.sin(moonOrbitAngle) * moonDistance;
  }
}

/**
 * The unified animation loop for the solar system.
 */
function animateScene() {
  requestAnimationFrame(animateScene);

  const deltaTime = clock.getDelta(); // Automatically calculates time elapsed

  // Update planet rotations and moon orbit
  updateAnimations(deltaTime);

  // Update compared planets rotation (if any comparison is active)
  updateComparisonRotation();
}

/**
 * Moves the camera to a specified planet, updating OrbitControls and triggering UI events.
 *
 * @param {string} planetName - The target planet name.
 * @param {THREE.PerspectiveCamera} camera - The camera to animate.
 * @param {OrbitControls} controls - The controls to update.
 * @param {THREE.Scene} scene - The scene containing the planet.
 */
export function moveToPlanet(planetName, camera, controls, scene) {
  const targetPlanet = scene.getObjectByName(planetName.toLowerCase());
  if (!targetPlanet) {
    console.error(`❌ Planet "${planetName}" not found!`);
    return;
  }
  console.log(`🚀 Moving to: ${planetName}`);

  // Compute bounding sphere for framing the planet
  const boundingBox = new THREE.Box3().setFromObject(targetPlanet);
  const boundingSphere = boundingBox.getBoundingSphere(new THREE.Sphere());
  const targetFocus = boundingSphere.center;
  const planetRadius = boundingSphere.radius;

  // Determine camera distance and offset
  const defaultZoomMultiplier = 3;
  const targetDistance = Math.max(planetRadius * defaultZoomMultiplier, 1000);
  const cameraOffset = planetRadius * 0.5;  // Offset to avoid clipping

  // Update OrbitControls zoom limits dynamically
  controls.minDistance = targetDistance * 0.5;
  controls.maxDistance = targetDistance * 2;
  console.log(`🔍 Updated zoom limits for ${planetName}: Min ${controls.minDistance}, Max ${controls.maxDistance}`);

  // Determine target camera position (slightly above and behind the planet)
  const targetPosition = new THREE.Vector3(
    targetFocus.x,
    targetFocus.y + cameraOffset,
    targetFocus.z + targetDistance
  );

  // Pause moon orbit when focusing on the moon
  moonOrbitPaused = planetName.toLowerCase() === "moon";

  // Disable controls during the transition and hide planet info
  controls.enabled = false;
  let uiShown = false;
  hidePlanetInfo();

  // Animate camera movement with gsap
  gsap.to(camera.position, {
    x: targetPosition.x,
    y: targetPosition.y,
    z: targetPosition.z,
    duration: 2,
    ease: "power2.out",
    onUpdate: () => {
      if (!uiShown && camera.position.distanceTo(targetPosition) < targetDistance * 1.1) {
        showPlanetInfo(planetName);
        uiShown = true;
      }
    },
    onComplete: () => {
      controls.enabled = true;
    }
  });

  // Animate OrbitControls target for smooth look-at behavior
  gsap.to(controls.target, {
    x: targetFocus.x,
    y: targetFocus.y,
    z: targetFocus.z,
    duration: 2,
    ease: "power2.out",
  });
}

/**
 * An optional external update function if you wish to update animations outside of animateScene.
 *
 * @param {number} deltaTime - The time elapsed since the last update.
 */
export function updatePlanets(deltaTime) {
  updateAnimations(deltaTime);
}
