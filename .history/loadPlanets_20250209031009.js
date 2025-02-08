// ===== Module Imports =====
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/DRACOLoader.js";
import gsap from "https://cdn.skypack.dev/gsap";
import { showPlanetInfo, hidePlanetInfo } from "./planetInfo.js";
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
  moon:    { size: 3474,   distance: 38000,     scale: 0.2 }
};

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
export const planetTemplates = {};
let planets = {};
let sceneRef = null;
let moonOrbitPaused = false;
let moonOrbitAngle = 0;
let lastFrameTime = Date.now();
let orbitsEnabled = true;

THREE.Cache.enabled = true;

// ===== Loader Setup =====
const textureLoader = new THREE.TextureLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/libs/draco/");
dracoLoader.preload();

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

/**
 * Creates a realistic Sun mesh with texture and point light.
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

  const sunLight = new THREE.PointLight(0xffffff, 2, 0, 2);
  sunLight.position.copy(sunMesh.position);
  scene.add(sunLight);

  planets["sun"] = sunMesh;
  planetTemplates["sun"] = sunMesh.clone(true);
  console.log(`✅ Created realistic Sun at [${position}]`);
  return sunMesh;
}

/**
 * Loads a GLTF planet model, scales it, and adds it to the scene.
 */
function loadPlanetAsync(loaderInstance, scene, name, modelPath, position, size) {
  return new Promise((resolve, reject) => {
    loaderInstance.load(
      modelPath,
      (gltf) => {
        const planet = gltf.scene;
        planet.name = name.toLowerCase();
        planet.position.set(...position);

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
}

/**
 * Loads all planet models into the scene.
 * Earth is loaded first, then the Sun is created,
 * and the remaining planets load concurrently.
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
}

/**
 * Adjusts the camera and OrbitControls based on the furthest planet.
 */
export function updateZoomSettings(camera, controls) {
  const maxDistance = planetData.neptune.distance + 5000000;
  camera.position.z = Math.max(maxDistance * 2, 100000);
  controls.update();
}

/**
 * Animation loop for rotating planets and updating the Moon's orbit.
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
    moonOrbitPaused = isOrbitModeActive ? true : (planetName.toLowerCase() !== "earth");
    const boundingBox = new THREE.Box3().setFromObject(targetPlanet);
    const boundingSphere = boundingBox.getBoundingSphere(new THREE.Sphere());
    const targetFocus = boundingSphere.center;
    const planetRadius = boundingSphere.radius;
    const defaultZoomMultiplier = 3;
    const targetDistance = Math.max(planetRadius * defaultZoomMultiplier, 1000);
    const cameraOffset = planetRadius * 0.5;
    const direction = new THREE.Vector3().subVectors(targetFocus, camera.position).normalize();
    const raycaster = new THREE.Raycaster(camera.position, direction);
    const planetArray = Object.values(planets);
    const intersections = raycaster.intersectObjects(planetArray, true);
    let safeTarget = targetFocus.clone();
    if (intersections.length > 0) {
      for (let inter of intersections) {
        if (inter.object.name !== planetName.toLowerCase()) {
          safeTarget = inter.point.clone().add(direction.clone().multiplyScalar(-100));
          break;
        }
      }
    }
    controls.minDistance = targetDistance * 0.5;
    controls.maxDistance = targetDistance * 2;
    console.log(`🔍 Updated zoom limits for ${planetName}: Min ${controls.minDistance}, Max ${controls.maxDistance}`);
    const targetPosition = new THREE.Vector3(
      safeTarget.x,
      safeTarget.y + cameraOffset,
      safeTarget.z + targetDistance
    );
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
    gsap.to(controls.target, {
      x: safeTarget.x,
      y: safeTarget.y,
      z: safeTarget.z,
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
