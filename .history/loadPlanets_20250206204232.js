// ===== Module Imports =====
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/DRACOLoader.js";
import gsap from "https://cdn.skypack.dev/gsap";  
import { showPlanetInfo, hidePlanetInfo } from './planetInfo.js';
import { updateComparisonRotation } from "./comparePlanets.js";

// ===== Configuration & Constants =====

// Planet size and distance data (realistic values scaled down)
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

// Base rotation speed and rotation speeds per planet (relative factors)
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
export const planetTemplates = {};  // For cloning during comparisons
let planets = {};                   // Stores planet mesh objects
let sceneRef = null;
let moonOrbitPaused = false;
let moonOrbitAngle = 0;
let lastFrameTime = Date.now();
let orbitsEnabled = true; // Toggle for planetary orbits

THREE.Cache.enabled = true;

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

  // Store the sun mesh in planets and planetTemplates so it can be cloned later for comparisons
  planets['sun'] = sunMesh;
  planetTemplates['sun'] = sunMesh.clone(true);  // This line is added

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
const loadPlanetModel = (scene, name, modelPath, position, size) => {
  return new Promise((resolve, reject) => {
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

        // Add to scene and store for future reference
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
};

// ===== Main Functions =====

/**
 * Loads all planets (and the sun) into the scene.
 * The Earth is loaded first, then the sun, then the rest of the planets.
 *
 * @param {THREE.Scene} scene - The scene to populate.
 */
export async function loadPlanets(scene) {
  sceneRef = scene;
  planets = {}; // Reset stored planets

  // Create a LoadingManager (optional, but good for progress/error tracking)
  const manager = new THREE.LoadingManager();
  manager.onStart = (url, itemsLoaded, itemsTotal) => {
    console.log(`Started loading: ${url} (${itemsLoaded} of ${itemsTotal})`);
  };
  manager.onLoad = () => {
    console.log("All assets loaded");
  };
  manager.onError = (url) => {
    console.error(`There was an error loading ${url}`);
  };

  // Reassign loader with the manager (if needed)
  const loaderWithManager = new GLTFLoader(manager);
  loaderWithManager.setDRACOLoader(dracoLoader);

  // Helper to load a planet using the loader with manager
  const loadPlanet = (name, modelPath, position, size) => {
    return new Promise((resolve, reject) => {
      loaderWithManager.load(
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
  };

  try {
    // Start loading all models concurrently (if ordering isn’t critical)
    const earthPromise = loadPlanet(
      "earth",
      'https://raw.githubusercontent.com/manueharold/solar-system-threejs/main/3d_models_compressed/earth_draco.glb',
      [planetData.earth.distance, 0, 0],
      planetData.earth.scale * planetData.earth.size
    );

    // Start other planet loads concurrently
    const mercuryPromise = loadPlanet(
      "mercury",
      "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/mercury_draco.glb",
      [planetData.mercury.distance, 0, 0],
      planetData.mercury.scale * planetData.mercury.size
    );
    const venusPromise = loadPlanet(
      "venus",
      "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/venus_draco.glb",
      [planetData.venus.distance, 0, 0],
      planetData.venus.scale * planetData.venus.size
    );
    const marsPromise = loadPlanet(
      "mars",
      "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/mars_draco.glb",
      [planetData.mars.distance, 0, 0],
      planetData.mars.scale * planetData.mars.size
    );
    const jupiterPromise = loadPlanet(
      "jupiter",
      "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/jupiter_draco.glb",
      [planetData.jupiter.distance, 0, 0],
      planetData.jupiter.scale * planetData.jupiter.size
    );
    const saturnPromise = loadPlanet(
      "saturn",
      'https://raw.githubusercontent.com/manueharold/solar-system-threejs/main/3d_models_compressed/saturn_draco.glb',
      [planetData.saturn.distance, 0, 0],
      planetData.saturn.scale * planetData.saturn.size
    );
    const uranusPromise = loadPlanet(
      "uranus",
      "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/uranus_draco.glb",
      [planetData.uranus.distance, 0, 0],
      planetData.uranus.scale * planetData.uranus.size
    );
    const neptunePromise = loadPlanet(
      "neptune",
      "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/neptune_draco.glb",
      [planetData.neptune.distance, 0, 0],
      planetData.neptune.scale * planetData.neptune.size
    );
    const moonPromise = loadPlanet(
      "moon",
      "https://cdn.jsdelivr.net/gh/manueharold/solar-system-threejs@main/3d_models_compressed/moon_draco.glb",
      [planetData.earth.distance + planetData.moon.distance, 0, 0],
      planetData.moon.scale * planetData.moon.size
    );

    // Wait for Earth to load first if ordering matters
    await earthPromise;

    // Create the sun immediately after Earth
    createRealisticSun(scene, [planetData.sun.distance, 0, 0], planetData.sun.scale);

    // Wait for the remaining planets concurrently
    await Promise.all([
      mercuryPromise,
      venusPromise,
      marsPromise,
      jupiterPromise,
      saturnPromise,
      uranusPromise,
      neptunePromise,
      moonPromise,
    ]);
  } catch (error) {
    console.error("Error loading planets:", error);
  }

  // Start the animation loop immediately
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



/// --- Unified Animation Loop for Planets & Moon Orbit ---
function animateScene() {
  requestAnimationFrame(animateScene);

  // Rotate Solar System Planets immediately
  for (const planetName in planets) {
    const planet = planets[planetName];
    if (rotationSpeeds[planetName]) {
      planet.rotation.y += rotationSpeeds[planetName]; // Apply rotation to main models
    }
  }

  // Update compared planets rotation (if any comparison is active)
  updateComparisonRotation();

  // Calculate delta time for smooth updates
  const currentTime = Date.now();
  const deltaTime = (currentTime - lastFrameTime) * 0.0005; // Adjust the multiplier as needed
  lastFrameTime = currentTime;

  // Orbit Moon around Earth using persistent angle if not paused
  if (!moonOrbitPaused && planets["moon"] && planets["earth"]) {
    moonOrbitAngle += deltaTime;
    const moonDistance = planetData.moon.distance;
    planets["moon"].position.x = planets["earth"].position.x + Math.cos(moonOrbitAngle) * moonDistance;
    planets["moon"].position.z = planets["earth"].position.z + Math.sin(moonOrbitAngle) * moonDistance;
  }
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

  // Dynamically adjust the target distance (slightly larger than the planet's radius)
  const defaultZoomMultiplier = 3;
  const targetDistance = Math.max(planetRadius * defaultZoomMultiplier, 1000);
  const cameraOffset = planetRadius * 0.5;  // Offset camera a bit more to avoid clipping

  // Update OrbitControls zoom limits dynamically
  controls.minDistance = targetDistance * 0.5;
  controls.maxDistance = targetDistance * 2;
  console.log(`🔍 Updated zoom limits for ${planetName}: Min ${controls.minDistance}, Max ${controls.maxDistance}`);

  // Determine target camera position (slightly above and behind the planet)
  const targetPosition = new THREE.Vector3(
    targetFocus.x,
    targetFocus.y + cameraOffset,  // Keep the camera slightly above the planet
    targetFocus.z + targetDistance
  );

  // Pause extra animations (like moon orbit) when focusing on the moon
  moonOrbitPaused = planetName.toLowerCase() === "moon";

  // Disable controls during the transition and hide planet info
  controls.enabled = false;
  let uiShown = false;
  hidePlanetInfo();

  // Animate camera movement with offset
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


export function updatePlanets() {
  // Rotate planets (excluding the moon for now)
  for (const planetName in planets) {
    const planet = planets[planetName];
    if (planetName !== "moon" && rotationSpeeds[planetName]) {
      planet.rotation.y += rotationSpeeds[planetName];  // Rotate each planet
    }
  }

  // Additional logic can be added to update other animations (e.g., moon orbit)
  if (planets["moon"] && planets["earth"]) {
    moonOrbitAngle += 0.001;
    const moonDistance = planetData.moon.distance;
    planets["moon"].position.x = planets["earth"].position.x + Math.cos(moonOrbitAngle) * moonDistance;
    planets["moon"].position.z = planets["earth"].position.z + Math.sin(moonOrbitAngle) * moonDistance;
  }
}
