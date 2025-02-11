// ===== Module Imports =====
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/DRACOLoader.js";
import gsap from "https://cdn.skypack.dev/gsap";
import { showPlanetInfo, hidePlanetInfo } from "./planetInfo.js";
import { updateComparisonRotation } from "./comparePlanets.js";

// ===== Configuration & Constants =====

// Realistic planetary data (sizes, distances, scales)
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

// Base rotation speed and per-planet speed factors (rotation period)
const baseRotationSpeed = 0.002;
export const rotationSpeeds = {
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
export const planetTemplates = {};  // Cloned planet meshes for comparisons
let planets = {};                   // Stores planet meshes by name
let sceneRef = null;
let moonOrbitPaused = false;
let moonOrbitAngle = 0;
let lastFrameTime = performance.now();
const orbitsEnabled = true;         // For future orbit toggling if needed

// Enable caching to avoid re-downloading assets.
THREE.Cache.enabled = true;

// ===== Loader Setup =====
const textureLoader = new THREE.TextureLoader(); // Reused for all textures
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/libs/draco/");
dracoLoader.preload();

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

/**
 * Creates a realistic Sun mesh with texture and a point light.
 *
 * @param {THREE.Scene} scene - The scene to add the Sun.
 * @param {number[]} position - [x, y, z] coordinates.
 * @param {number} size - Scale factor for the Sun.
 * @returns {THREE.Mesh} The created Sun mesh.
 */
function createRealisticSun(scene, position, size) {
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const sunTexture = textureLoader.load("./textures/8k_sun.jpg");
  const material = new THREE.MeshBasicMaterial({
    map: sunTexture,
    side: THREE.DoubleSide,
  });

  const sunMesh = new THREE.Mesh(geometry, material);
  sunMesh.scale.set(size, size, size);
  sunMesh.position.set(...position);
  sunMesh.name = "sun";
  scene.add(sunMesh);

  // Add a point light at the Sun's position.
  const sunLight = new THREE.PointLight(0xffffff, 2, 0, 2);
  sunLight.position.copy(sunMesh.position);
  scene.add(sunLight);

  // Store the Sun for later use.
  planets.sun = sunMesh;
  planetTemplates.sun = sunMesh.clone(true);
  console.log(`✅ Created realistic Sun at [${position}]`);
  return sunMesh;
}

/**
 * Loads a GLTF planet model, scales it, and adds it to the scene.
 *
 * @param {GLTFLoader} loaderInstance - The GLTFLoader instance.
 * @param {THREE.Scene} scene - The scene to add the planet.
 * @param {string} name - The planet's name.
 * @param {string} modelPath - URL/path to the GLTF model.
 * @param {number[]} position - [x, y, z] coordinates.
 * @param {number} desiredSize - The target size for scaling.
 * @returns {Promise<THREE.Group>} A promise resolving with the loaded planet.
 */
export const loadPlanetAsync = (loaderInstance, scene, name, modelPath, position, desiredSize) =>
  new Promise((resolve, reject) => {
    loaderInstance.load(
      modelPath,
      (gltf) => {
        const planet = gltf.scene;
        planet.name = name.toLowerCase();
        planet.position.set(...position);

        // Compute scale factor based on planet's bounding box.
        const box = new THREE.Box3().setFromObject(planet);
        const sizeVector = new THREE.Vector3();
        box.getSize(sizeVector);
        const scaleFactor = desiredSize / sizeVector.length();
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

/**
 * Loads all planet models (including the Sun) into the scene.
 * Earth is prioritized to frame the scene, then the Sun is created,
 * and the remaining planets load concurrently.
 *
 * @param {THREE.Scene} scene - The scene to populate.
 */
export async function loadPlanets(scene) {
  sceneRef = scene;
  planets = {};

  // Set up a LoadingManager for progress tracking.
  const manager = new THREE.LoadingManager();
  manager.onStart = (url, itemsLoaded, itemsTotal) =>
    console.log(`Started loading: ${url} (${itemsLoaded}/${itemsTotal})`);
  manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progressPercentage = (itemsLoaded / itemsTotal) * 100;
    const loadingBar = document.getElementById("loadingBarProgress");
    if (loadingBar) loadingBar.style.width = `${progressPercentage}%`;
  };
  manager.onLoad = () => console.log("All assets loaded");
  manager.onError = (url) => console.error(`Error loading ${url}`);

  const loaderWithManager = new GLTFLoader(manager);
  loaderWithManager.setDRACOLoader(dracoLoader);

  // Helper for planet loading.
  const loadPlanet = (name, modelPath, position, desiredSize) =>
    loadPlanetAsync(loaderWithManager, scene, name, modelPath, position, desiredSize);

  try {
    // 1. PRIORITIZE: Load Earth first.
    await loadPlanet(
      "earth",
      "https://raw.githubusercontent.com/manueharold/solar-system-threejs/main/3d_models_compressed/earth_draco.glb",
      [planetData.earth.distance, 0, 0],
      planetData.earth.scale * planetData.earth.size
    );

    // Hide the loading UI after Earth loads.
    const loadingContainer = document.getElementById("loadingContainer");
    if (loadingContainer) loadingContainer.style.display = "none";

    // Start the animation loop as soon as Earth is visible.
    animateScene();

    // 2. Create the Sun immediately.
    createRealisticSun(scene, [planetData.sun.distance, 0, 0], planetData.sun.scale);

    // 3. Load the remaining planets concurrently.
    await Promise.all([
      loadPlanet(
        "mercury",
        "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/mercury_draco.glb",
        [planetData.mercury.distance, 0, 0],
        planetData.mercury.scale * planetData.mercury.size
      ),
      loadPlanet(
        "venus",
        "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/venus_draco.glb",
        [planetData.venus.distance, 0, 0],
        planetData.venus.scale * planetData.venus.size
      ),
      loadPlanet(
        "mars",
        "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/mars_draco.glb",
        [planetData.mars.distance, 0, 0],
        planetData.mars.scale * planetData.mars.size
      ),
      loadPlanet(
        "jupiter",
        "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/jupiter_draco.glb",
        [planetData.jupiter.distance, 0, 0],
        planetData.jupiter.scale * planetData.jupiter.size
      ),
      loadPlanet(
        "saturn",
        "https://raw.githubusercontent.com/manueharold/solar-system-threejs/main/3d_models_compressed/saturn_draco.glb",
        [planetData.saturn.distance, 0, 0],
        planetData.saturn.scale * planetData.saturn.size
      ),
      loadPlanet(
        "uranus",
        "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/uranus_draco.glb",
        [planetData.uranus.distance, 0, 0],
        planetData.uranus.scale * planetData.uranus.size
      ),
      loadPlanet(
        "neptune",
        "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/neptune_draco.glb",
        [planetData.neptune.distance, 0, 0],
        planetData.neptune.scale * planetData.neptune.size
      ),
      loadPlanet(
        "moon",
        "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/moon_draco.glb",
        [planetData.earth.distance + planetData.moon.distance, 0, 0],
        planetData.moon.scale * planetData.moon.size
      ),
    ]);
  } catch (error) {
    console.error("Error loading planets:", error);
  }
  // Ensure the animation loop is running.
  animateScene();
}

/**
 * Adjusts the camera position and OrbitControls zoom limits
 * based on the furthest planet.
 *
 * @param {THREE.PerspectiveCamera} camera - The camera to adjust.
 * @param {OrbitControls} controls - The OrbitControls instance.
 */
export function updateZoomSettings(camera, controls) {
  const maxDistance = planetData.neptune.distance + 5000000; // Buffer
  camera.position.z = Math.max(maxDistance * 2, 100000);
  controls.updateZoomLimits("sun"); // Assumes OrbitControls has a custom method.
}

/**
 * The main animation loop.
 * Rotates planets, updates the moon orbit, and handles comparison updates.
 */
function animateScene() {
  requestAnimationFrame(animateScene);

  // Calculate delta time using high-resolution timer.
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastFrameTime) * 0.0005;
  lastFrameTime = currentTime;

  // Rotate each planet if a rotation speed is defined.
  Object.entries(planets).forEach(([name, planet]) => {
    if (rotationSpeeds[name] && (name !== "moon" || !moonOrbitPaused)) {
      planet.rotation.y += rotationSpeeds[name];
    }
  });

  // Update any comparison rotation animations.
  updateComparisonRotation();

  // Update the Moon’s orbit around Earth.
  if (!moonOrbitPaused && planets.moon && planets.earth) {
    moonOrbitAngle += deltaTime;
    const moonDistance = planetData.moon.distance;
    planets.moon.position.x =
      planets.earth.position.x + Math.cos(moonOrbitAngle) * moonDistance;
    planets.moon.position.z =
      planets.earth.position.z + Math.sin(moonOrbitAngle) * moonDistance;
  }
}

/**
 * Animates the camera to focus on a specified planet.
 * Adjusts OrbitControls limits and triggers UI events accordingly.
 *
 * @param {string} planetName - Name of the target planet.
 * @param {THREE.PerspectiveCamera} camera - The camera to animate.
 * @param {OrbitControls} controls - The OrbitControls instance.
 * @param {THREE.Scene} scene - The scene containing the planet.
 * @param {boolean} isOrbitModeActive - Whether Orbit Mode is active.
 * @returns {Promise<void>} Resolves when the animation completes.
 */
export function moveToPlanet(planetName, camera, controls, scene, isOrbitModeActive) {
  return new Promise((resolve, reject) => {
    const nameLower = planetName.toLowerCase();
    const targetPlanet = scene.getObjectByName(nameLower);
    if (!targetPlanet) {
      const errMsg = `❌ Planet "${planetName}" not found in scene!`;
      console.error(errMsg);
      return reject(new Error(errMsg));
    }
    console.log(`🚀 Moving to: ${planetName}`);

    // Pause the Moon’s orbit if not focusing on Earth or in Orbit Mode.
    moonOrbitPaused = isOrbitModeActive || nameLower !== "earth";

    // Compute the planet's bounding sphere for framing.
    const boundingBox = new THREE.Box3().setFromObject(targetPlanet);
    const boundingSphere = boundingBox.getBoundingSphere(new THREE.Sphere());
    const { center: targetFocus, radius: planetRadius } = boundingSphere;

    // Calculate desired camera distance and offset.
    const defaultZoomMultiplier = 3;
    const targetDistance = Math.max(planetRadius * defaultZoomMultiplier, 1000);
    const cameraOffset = planetRadius * 0.5;

    // Update OrbitControls zoom limits.
    controls.minDistance = targetDistance * 0.5;
    controls.maxDistance = targetDistance * 2;

    // Compute the target camera position (above and behind the planet).
    const targetPosition = new THREE.Vector3(
      targetFocus.x,
      targetFocus.y + cameraOffset,
      targetFocus.z + targetDistance
    );

    // Disable controls and hide UI before the transition.
    controls.enabled = false;
    hidePlanetInfo();

    // Animate both the camera position and the OrbitControls target concurrently.
    const tl = gsap.timeline({
      onComplete: () => {
        controls.enabled = true;
        resolve();
      }
    });

    tl.to(camera.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: 2,
      ease: "power2.out"
    }, 0);

    tl.to(controls.target, {
      x: targetFocus.x,
      y: targetFocus.y,
      z: targetFocus.z,
      duration: 2,
      ease: "power2.out"
    }, 0);

    // Display planet information shortly before the animation completes.
    tl.call(() => showPlanetInfo(planetName), null, 1.8);
  });
}

/**
 * An optional secondary update for manual planet rotation.
 * (This duplicates functionality in animateScene; consider removing if unused.)
 */
export function updatePlanets() {
  Object.entries(planets).forEach(([name, planet]) => {
    if (name !== "moon" && rotationSpeeds[name]) {
      planet.rotation.y += rotationSpeeds[name];
    }
  });
  if (planets.moon && planets.earth) {
    moonOrbitAngle += 0.001;
    const moonDistance = planetData.moon.distance;
    planets.moon.position.x =
      planets.earth.position.x + Math.cos(moonOrbitAngle) * moonDistance;
    planets.moon.position.z =
      planets.earth.position.z + Math.sin(moonOrbitAngle) * moonDistance;
  }
}

export { loader };
