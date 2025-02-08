import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// Create a loader instance for orbit mode
const orbitLoader = new GLTFLoader();
let orbitModel = null;

// Orbital parameters (Semi-major axis `a`, Semi-minor axis `b`, Orbital speed)
const orbits = {
  mercury: { a: 0.39, b: 0.38, speed: 0.24, inclination: 7 },
  venus: { a: 0.72, b: 0.71, speed: 0.62, inclination: 3.4 },
  earth: { a: 1, b: 0.99, speed: 1, inclination: 0 },
  mars: { a: 1.52, b: 1.51, speed: 1.88, inclination: 1.8 },
  jupiter: { a: 5.2, b: 5.1, speed: 11.86, inclination: 1.3 },
  saturn: { a: 9.58, b: 9.54, speed: 29.46, inclination: 2.5 },
  uranus: { a: 19.22, b: 19.18, speed: 84, inclination: 0.8 },
  neptune: { a: 30.05, b: 30, speed: 164.8, inclination: 1.8 },
};

// Function to animate planets along elliptical orbits
function animateOrbits(planets) {
  Object.keys(planets).forEach((planetName) => {
    const planet = planets[planetName];
    const orbit = orbits[planetName];

    if (!orbit) return; // Skip if no orbit data

    gsap.to(planet.position, {
      duration: orbit.speed * 10, // Adjust duration for realistic timing
      repeat: -1,
      ease: "none",
      modifiers: {
        x: (x) => {
          const time = (performance.now() / 1000) * (1 / orbit.speed); // Continuous movement
          return orbit.a * Math.cos(time) * 100; // Adjust for scene scale
        },
        z: (z) => {
          const time = (performance.now() / 1000) * (1 / orbit.speed);
          return orbit.b * Math.sin(time) * 100;
        },
      },
    });

    // Apply inclination (tilted orbits)
    planet.rotation.set(THREE.MathUtils.degToRad(orbit.inclination), 0, 0);
  });
}

// Load the orbit mode planets
export function loadOrbitPlanets(scene, camera, controls) {
  // Hide the default planets group if it exists
  const defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
  if (defaultPlanetsGroup) {
    defaultPlanetsGroup.visible = false;
    console.log("Hid default planets group.");
  }

  // Hide individual planets in normal mode
  const planetNames = Object.keys(orbits);
  scene.traverse((child) => {
    if (child.name && planetNames.includes(child.name)) {
      child.visible = false;
      console.log(`Hiding ${child.name} in scene.`);
    }
  });

  // Load the solar system model
  orbitLoader.load(
    "./3d_models_compressed/solar_system.glb",
    (gltf) => {
      orbitModel = gltf.scene;
      orbitModel.name = "orbitModeModel";

      // Scale the model
      const scaleFactor = 100;
      orbitModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // Center the model
      const box = new THREE.Box3().setFromObject(orbitModel);
      const center = new THREE.Vector3();
      box.getCenter(center);
      orbitModel.position.sub(center);

      // Add orbit model to the scene
      scene.add(orbitModel);
      console.log("✅ Orbit mode model loaded, centered, and scaled.");

      // Adjust controls target
      controls.target.set(0, 0, 0);

      // Compute bounding sphere
      const updatedBox = new THREE.Box3().setFromObject(orbitModel);
      const sphere = new THREE.Sphere();
      updatedBox.getBoundingSphere(sphere);
      const modelRadius = sphere.radius;

      // Set camera zoom limits
      controls.minDistance = modelRadius * 0.1;
      controls.maxDistance = Infinity;

      // Move camera to a good view
      const desiredDistance = modelRadius * 3;
      gsap.to(camera.position, {
        duration: 2,
        x: 0,
        y: desiredDistance,
        z: desiredDistance,
        ease: "power2.out",
        onUpdate: () => {
          camera.lookAt(controls.target);
        },
      });

      // Find planet objects and start animation
      const planets = {};
      gltf.scene.traverse((child) => {
        if (orbits[child.name]) {
          planets[child.name] = child;
        }
      });

      animateOrbits(planets); // Start orbit animations
    },
    undefined,
    (error) => {
      console.error("❌ Failed to load orbit mode model:", error);
    }
  );
}
