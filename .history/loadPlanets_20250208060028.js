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
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(
  "https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/libs/draco/"
);
dracoLoader.preload();
loader.setDRACOLoader(dracoLoader);

/**
 * Creates a realistic Sun mesh with a texture and an accompanying point light.
 * Also stores the sun in both the planets and planetTemplates collections.
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
 */
function loadPlanetAsync(loaderInstance, scene, name, modelPath, position, size) {
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

/* ─── NEW CODE: Compute and store initial zoom limits ────────────────────── */

/**
 * An object that will hold the computed minimum and maximum zoom distances
 * for each planet based on its bounding sphere.
 */
export const initialZoomLimits = {};

/**
 * Computes and stores initial zoom limits for each planet in planetTemplates.
 * This function should be called after all planets have loaded.
 */
function setInitialZoomLimits() {
  for (const planetName in planetTemplates) {
    const planet = planetTemplates[planetName];
    // Compute the bounding sphere of the planet
    const bbox = new THREE.Box3().setFromObject(planet);
    const sphere = bbox.getBoundingSphere(new THREE.Sphere());
    const radius = sphere.radius;
    // Set the minDistance to 1.5 times the radius,
    // and the maxDistance to, for example, 8 times the radius.
    initialZoomLimits[planetName] = {
      min: radius * 1.5,
      max: radius * 8
    };
    console.log(`Zoom limits for ${planetName}:`, initialZoomLimits[planetName]);
  }
}

/* ───────────────────────────────────────────────────────────────────────────── */

/**
 * Loads all planet models (including the Sun) into the scene.
 */
export async function loadPlanets(scene, controls) {
  sceneRef = scene;
  planets = {}; // Reset stored planets

  // Set up a LoadingManager for progress/error tracking.
  const manager = new THREE.LoadingManager();
  manager.onStart = (url, itemsLoaded, itemsTotal) =>
    console.log(`Started loading: ${url} (${itemsLoaded}/${itemsTotal})`);
  manager.onLoad = () => console.log("All assets loaded");
  manager.onError = (url) =>
    console.error(`There was an error loading ${url}`);

  // Create a new loader using the manager.
  const loaderWithManager = new GLTFLoader(manager);
  loaderWithManager.setDRACOLoader(dracoLoader);

  // Helper to load a planet using the loader with manager.
  const loadPlanet = (name, modelPath, position, size) =>
    loadPlanetAsync(loaderWithManager, scene, name, modelPath, position, size);

  try {
    // Load Earth first.
    const earthPromise = loadPlanet(
      "earth",
      "https://raw.githubusercontent.com/manueharold/solar-system-threejs/main/3d_models_compressed/earth_draco.glb",
      [planetData.earth.distance, 0, 0],
      planetData.earth.scale * planetData.earth.size
    );
    await earthPromise;

    // Create the Sun immediately after Earth.
    createRealisticSun(scene, [planetData.sun.distance, 0, 0], planetData.sun.scale);

    // Load the remaining planets concurrently.
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

    // Once all planets have loaded, compute the initial zoom limits.
    setInitialZoomLimits();

    // Since Earth is our initial view, apply Earth's zoom limits immediately.
    if (initialZoomLimits["earth"]) {
      controls.minDistance = initialZoomLimits["earth"].min;
      controls.maxDistance = initialZoomLimits["earth"].max;
      console.log("Applied initial zoom limits for Earth:", initialZoomLimits["earth"]);
    }
  } catch (error) {
    console.error("Error loading planets:", error);
  }

  // Start the animation loop.
  animateScene();
}

/**
 * Adjusts the camera position and OrbitControls zoom limits based on the furthest planet.
 * (In this example, this function can be updated if you want the default view to use a planet’s zoom limits.)
 */
export function updateZoomSettings(camera, controls) {
  // For the initial view, if Earth is visible then use Earth's zoom limits.
  if (initialZoomLimits["earth"]) {
    controls.minDistance = initialZoomLimits["earth"].min;
    controls.maxDistance = initialZoomLimits["earth"].max;
    // Optionally, adjust the camera position if needed:
    // camera.position.z = (initialZoomLimits["earth"].min + initialZoomLimits["earth"].max) / 2;
    console.log("Updated zoom settings for Earth");
  }
  controls.updateZoomLimits && controls.updateZoomLimits("earth");
}

/**
 * The unified animation loop for rotating planets, updating comparisons,
 * and animating the Moon's orbit around the Earth.
 */
function animateScene() {
  requestAnimationFrame(animateScene);

  // Rotate all planets (skip Moon if its orbit is paused).
  for (const planetName in planets) {
    const planet = planets[planetName];
    if (rotationSpeeds[planetName] && (planetName !== "moon" || !moonOrbitPaused)) {
      planet.rotation.y += rotationSpeeds[planetName];
    }
  }

  // Update any active planet comparisons.
  updateComparisonRotation();

  // Calculate time delta for smooth animation.
  const currentTime = Date.now();
  const deltaTime = (currentTime - lastFrameTime) * 0.0005;
  lastFrameTime = currentTime;

  // Orbit the Moon around the Earth if not paused.
  if (!moonOrbitPaused && planets["moon"] && planets["earth"]) {
    moonOrbitAngle += deltaTime;
    const moonDistance = planetData.moon.distance;
    planets["moon"].position.x =
      planets["earth"].position.x + Math.cos(moonOrbitAngle) * moonDistance;
    planets["moon"].position.z =
      planets["earth"].position.z + Math.sin(moonOrbitAngle) * moonDistance;
  }
}

/**
 * Animates the camera to focus on a specified planet.
 */
export function moveToPlanet(planetName, camera, controls, scene, isOrbitModeActive) {
  return new Promise((resolve, reject) => {
    const targetPlanet = scene.getObjectByName(planetName.toLowerCase());
    if (!targetPlanet) {
      console.error(`❌ Planet "${planetName}" not found!`);
      return reject(new Error(`Planet "${planetName}" not found!`));
    }
    console.log(`🚀 Moving to: ${planetName}`);

    // Pause the Moon's orbit appropriately.
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

    // Update OrbitControls zoom limits based on this planet’s precomputed values,
    // or fallback to dynamically computed values.
    if (initialZoomLimits[planetName.toLowerCase()]) {
      controls.minDistance = initialZoomLimits[planetName.toLowerCase()].min;
      controls.maxDistance = initialZoomLimits[planetName.toLowerCase()].max;
      console.log(`🔍 Updated zoom limits for ${planetName}:`, initialZoomLimits[planetName.toLowerCase()]);
    } else {
      controls.minDistance = targetDistance * 0.5;
      controls.maxDistance = targetDistance * 2;
    }

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
 * A secondary update function that rotates planets and updates the Moon's orbit.
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
    planets["moon"].position.x =
      planets["earth"].position.x + Math.cos(moonOrbitAngle) * moonDistance;
    planets["moon"].position.z =
      planets["earth"].position.z + Math.sin(moonOrbitAngle) * moonDistance;
  }
}
