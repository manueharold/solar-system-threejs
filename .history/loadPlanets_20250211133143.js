// ===== Module Imports =====
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/DRACOLoader.js";
import gsap from "https://cdn.skypack.dev/gsap";
import { showPlanetInfo, hidePlanetInfo } from "./planetInfo.js";
import { updateComparisonRotation } from "./comparePlanets.js";

// ===== Configuration & Constants =====

// Planet size, distance, and scale data (realistic values scaled down)
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

// Base rotation speed and per-planet factors
const baseRotationSpeed = 0.002;
export const rotationSpeeds = {
  mercury: baseRotationSpeed / 58.6,
  venus: baseRotationSpeed / 243,
  earth: baseRotationSpeed / 1,
  mars: baseRotationSpeed / 1.03,
  jupiter: baseRotationSpeed / 0.41,
  saturn: baseRotationSpeed / 0.45,
  uranus: baseRotationSpeed / 0.72,
  neptune: baseRotationSpeed / 0.67 
};

// ===== Global Variables =====
export const planetTemplates = {};  // Clones for later comparisons
let planets = {};                   // Stores planet meshes by name
let sceneRef = null;
let moonOrbitPaused = false;
let moonOrbitAngle = 0;
let lastFrameTime = Date.now();
let orbitsEnabled = true;           // (Not used explicitly, but available if needed)

THREE.Cache.enabled = true;

// ===== Loader Setup =====
const textureLoader = new THREE.TextureLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/libs/draco/");
dracoLoader.preload();

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

/**
 * Creates a realistic Sun mesh with a texture and an accompanying point light.
 * Also stores the sun in both the planets and planetTemplates collections.
 *
 * @param {THREE.Scene} scene - The scene to add the Sun.
 * @param {Array<number>} position - [x, y, z] coordinates.
 * @param {number} size - Scale factor for the Sun.
 * @returns {THREE.Mesh} The created Sun mesh.
 */
function createRealisticSun(scene, position, size) {
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const textureLoader = new THREE.TextureLoader();
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

  // Add a point light at the Sun's position
  const sunLight = new THREE.PointLight(0xffffff, 2, 0, 2);
  sunLight.position.copy(sunMesh.position);
  scene.add(sunLight);

  // Store the Sun mesh for later use (e.g., comparisons)
  planets["sun"] = sunMesh;
  planetTemplates["sun"] = sunMesh.clone(true);
  console.log(`✅ Created realistic Sun at [${position}]`);
  return sunMesh;
}

/**
 * Loads a GLTF planet model using the provided loader, scales it, and adds it to the scene.
 * The loaded planet is stored in the global planets and planetTemplates objects.
 *
 * @param {GLTFLoader} loaderInstance - The GLTFLoader to use (with manager if needed).
 * @param {THREE.Scene} scene - The scene to add the planet.
 * @param {string} name - The planet's name.
 * @param {string} modelPath - URL/path to the GLTF model.
 * @param {Array<number>} position - [x, y, z] coordinates.
 * @param {number} size - Desired size (usually calculated as scale * planetData.size).
 * @returns {Promise<THREE.Group>} A promise that resolves with the loaded planet.
 */
export function loadPlanetAsync(loaderInstance, scene, name, modelPath, position, size) {
  return new Promise((resolve, reject) => {
    loaderInstance.load(
      modelPath,
      (gltf) => {
        const planet = gltf.scene;
        planet.name = name.toLowerCase();
        planet.position.set(...position);

        // Compute a scale factor based on the planet's bounding box size
        const box = new THREE.Box3().setFromObject(planet);
        const scaleFactor =
          size / box.getSize(new THREE.Vector3()).length();
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
}

/**
 * Loads all planet models (including the Sun) into the scene.
 * Earth is loaded first (to help frame the scene), then the Sun is created,
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
    const loadingBarProgress = document.getElementById("loadingBarProgress");
    if (loadingBarProgress) {
      loadingBarProgress.style.width = `${progressPercentage}%`;
    }
  };
  manager.onLoad = () => console.log("All assets loaded");
  manager.onError = (url) =>
    console.error(`There was an error loading ${url}`);

  const loaderWithManager = new GLTFLoader(manager);
  loaderWithManager.setDRACOLoader(dracoLoader);
  const loadPlanet = (name, modelPath, position, size) =>
    loadPlanetAsync(loaderWithManager, scene, name, modelPath, position, size);

  try {
    // 1. PRIORITIZE: Load Earth first.
    await loadPlanet(
      "earth",
      "https://raw.githubusercontent.com/manueharold/solar-system-threejs/main/3d_models_compressed/earth_draco.glb",
      [planetData.earth.distance, 0, 0],
      planetData.earth.scale * planetData.earth.size
    );

    // Hide the loading UI once Earth is loaded.
    const loadingContainer = document.getElementById("loadingContainer");
    if (loadingContainer) {
      loadingContainer.style.display = "none";
    }

    // Start the animation loop immediately so Earth rotates.
    animateScene();

    // 2. Create the Sun as soon as Earth is loaded.
    createRealisticSun(scene, [planetData.sun.distance, 0, 0], planetData.sun.scale);

    // 3. Load the remaining planets concurrently.
    Promise.all([
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
    ]).catch((error) => {
      console.error("Error loading planets:", error);
    });
  } catch (error) {
    console.error("Error loading planets:", error);
  }
  // Start the animation loop.
  animateScene();
}

/**
 * Adjusts the camera position and OrbitControls zoom limits based on the furthest planet.
 *
 * @param {THREE.PerspectiveCamera} camera - The camera to adjust.
 * @param {OrbitControls} controls - The OrbitControls instance to update.
 */
export function updateZoomSettings(camera, controls) {
  const maxDistance = planetData.neptune.distance + 5000000; // Extra buffer
  camera.position.z = Math.max(maxDistance * 2, 100000);
  controls.updateZoomLimits("sun"); // Assuming OrbitControls has this custom method
}

/**
 * The unified animation loop for rotating planets, updating comparisons,
 * and animating the Moon's orbit around the Earth.
 */
function animateScene() {
  requestAnimationFrame(animateScene);
  for (const planetName in planets) {
    const planet = planets[planetName];
    if (rotationSpeeds[planetName] && (planetName !== "moon" || !moonOrbitPaused)) {
      planet.rotation.y += rotationSpeeds[planetName];
    }
  }
  updateComparisonRotation();
  const currentTime = Date.now();
  const deltaTime = (currentTime - lastFrameTime) * 0.0005;
  lastFrameTime = currentTime;
  if (!moonOrbitPaused && planets["moon"] && planets["earth"]) {
    moonOrbitAngle += deltaTime;
    const moonDistance = planetData.moon.distance;
    planets["moon"].position.x = planets["earth"].position.x + Math.cos(moonOrbitAngle) * moonDistance;
    planets["moon"].position.z = planets["earth"].position.z + Math.sin(moonOrbitAngle) * moonDistance;
  }
}


/**
 * Helper function to adjust the target position to avoid collisions.
 * It checks if the straight line from startPos to targetPos comes too close
 * to any planet (except the target) and, if so, offsets the target position.
 *
 * @param {THREE.Vector3} startPos - The starting camera position.
 * @param {THREE.Vector3} targetPos - The originally computed target camera position.
 * @param {THREE.Scene} scene - The scene containing the planet models.
 * @param {string} excludeName - The name (in lowercase) of the target planet (to ignore).
 * @returns {THREE.Vector3} - An adjusted target position.
 */
function avoidCollisions(startPos, targetPos, scene, excludeName) {
  const safeTarget = targetPos.clone();
  const direction = new THREE.Vector3().subVectors(safeTarget, startPos);
  const line = new THREE.Line3(startPos, safeTarget);
  const margin = 50; // extra clearance (adjust as needed)

  // Iterate over all planet objects (using the global 'planets' object)
  Object.values(planets).forEach(planet => {
    // Skip the target planet
    if (planet.name.toLowerCase() === excludeName) return;

    // Compute a bounding sphere for the planet.
    const sphere = new THREE.Sphere();
    new THREE.Box3().setFromObject(planet).getBoundingSphere(sphere);

    // Find the closest point on the line segment to the planet's center.
    const closestPoint = new THREE.Vector3();
    line.closestPointToPoint(sphere.center, true, closestPoint);

    const distance = sphere.center.distanceTo(closestPoint);
    if (distance < sphere.radius + margin) {
      // Calculate how much to offset: the difference plus margin.
      const offsetAmount = (sphere.radius + margin) - distance;

      // Compute a perpendicular direction.
      let perp = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0));
      if (perp.length() < 0.001) {
        // In case direction is nearly vertical, choose an arbitrary perpendicular vector.
        perp = new THREE.Vector3(1, 0, 0);
      }
      perp.normalize();

      // Offset the target position along this perpendicular direction.
      safeTarget.add(perp.multiplyScalar(offsetAmount));
    }
  });

  return safeTarget;
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
 * @returns {Promise} Resolves when the camera animation completes.
 */
export function moveToPlanet(planetName, camera, controls, scene, isOrbitModeActive) {
  return new Promise((resolve, reject) => {
    const targetPlanet = scene.getObjectByName(planetName.toLowerCase());
    if (!targetPlanet) {
      console.error(`❌ Planet "${planetName}" not found!`);
      return reject(new Error(`Planet "${planetName}" not found!`));
    }
    console.log(`🚀 Moving to: ${planetName}`);

    if (isOrbitModeActive) {
  moonOrbitPaused = true;
} else {
  moonOrbitPaused = (planetName.toLowerCase() !== "earth");
}


    // Compute the planet's bounding sphere for framing.
    const boundingBox = new THREE.Box3().setFromObject(targetPlanet);
    const boundingSphere = boundingBox.getBoundingSphere(new THREE.Sphere());
    const targetFocus = boundingSphere.center;
    const planetRadius = boundingSphere.radius;

    // Determine target distance and camera offset.
    const defaultZoomMultiplier = 3;
    const targetDistance = Math.max(planetRadius * defaultZoomMultiplier, 1000);
    const cameraOffset = planetRadius * 0.5;

    // Dynamically update OrbitControls zoom limits.
    controls.minDistance = targetDistance * 0.5;
    controls.maxDistance = targetDistance * 2;
    console.log(
      `🔍 Updated zoom limits for ${planetName}: Min ${controls.minDistance}, Max ${controls.maxDistance}`
    );

    // Define the target camera position (above and behind the planet).
    const targetPosition = new THREE.Vector3(
      targetFocus.x,
      targetFocus.y + cameraOffset,
      targetFocus.z + targetDistance
    );

    // Disable controls during the transition and hide planet info.
    controls.enabled = false;
    let uiShown = false;
    hidePlanetInfo();

    // Animate the camera position.
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
        resolve();
      }
    });

    // Smoothly update the OrbitControls target.
    gsap.to(controls.target, {
      x: targetFocus.x,
      y: targetFocus.y,
      z: targetFocus.z,
      duration: 2,
      ease: "power2.out"
    });
  });
}

/**
 * A secondary update function for manual planet rotation updates.
 */
export function updatePlanets() {
  for (const planetName in planets) {
    const planet = planets[planetName];
    if (planetName !== "moon" && rotationSpeeds[planetName]) {
      planet.rotation.y += rotationSpeeds[planetName];
    }
  }
  if (planets["moon"] && planets["earth"]) {
    moonOrbitAngle += 0.001;
    const moonDistance = planetData.moon.distance;
    planets["moon"].position.x = planets["earth"].position.x + Math.cos(moonOrbitAngle) * moonDistance;
    planets["moon"].position.z = planets["earth"].position.z + Math.sin(moonOrbitAngle) * moonDistance;
  }
}
