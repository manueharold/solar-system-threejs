// loadOrbitPlanets.js
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// List of planet names (in lowercase) to work on
const planetNames = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon'];

// Define orbit speeds (you can adjust these values as needed)
// These are arbitrary relative speeds for orbital motion.
const orbitSpeeds = {
  mercury: 0.04,
  venus:   0.03,
  earth:   0.02,
  mars:    0.015,
  jupiter: 0.01,
  saturn:  0.008,
  uranus:  0.006,
  neptune: 0.005,
  // If you want the moon to orbit the earth (not the sun) you may handle it separately.
};

// Global variables for the loaded model and orbit pivots
let orbitModel = null;
let mixer = null; // In case you want to use GLTF animations for something else
// A dictionary to store pivot objects for each planet:
const orbitPivots = {};

// A clock for delta time in the animation loop
const clock = new THREE.Clock();

/**
 * loadOrbitPlanets sets up the solar system in "orbit mode."
 * It loads a GLB model (assumed to contain the Sun and planets) and then
 * creates an orbit pivot for each planet (except the Sun) so that they orbit around the Sun.
 *
 * @param {THREE.Scene} scene - The scene to add the solar system.
 * @param {THREE.PerspectiveCamera} camera - The camera to adjust.
 * @param {OrbitControls} controls - The OrbitControls instance.
 */
export function loadOrbitPlanets(scene, camera, controls) {
  // Hide the default planets group if it exists
  const defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
  if (defaultPlanetsGroup) {
    defaultPlanetsGroup.visible = false;
    console.log("Hid default planets group.");
  }

  // Hide any individual planets in the scene by name
  scene.traverse((child) => {
    if (child.name && (child.name.toLowerCase() === 'sun' || planetNames.includes(child.name.toLowerCase()))) {
      child.visible = false;
      console.log(`Hiding ${child.name} in scene.`);
    }
  });

  // Load the GLB model for orbit mode
  const orbitLoader = new GLTFLoader();
  orbitLoader.load(
    './3d_models_compressed/solar_system.glb',
    (gltf) => {
      orbitModel = gltf.scene;
      orbitModel.name = 'orbitModeModel';

      // Scale the model (adjust as needed)
      const scaleFactor = 100;
      orbitModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // Center the model at the origin
      const box = new THREE.Box3().setFromObject(orbitModel);
      const center = new THREE.Vector3();
      box.getCenter(center);
      orbitModel.position.sub(center); // Shift to center

      // Add the model to the scene
      scene.add(orbitModel);
      console.log('✅ Orbit mode model loaded, centered, and scaled.');

      // Update the controls target to the center
      controls.target.set(0, 0, 0);

      // Compute bounding sphere to determine a good viewing distance
      const updatedBox = new THREE.Box3().setFromObject(orbitModel);
      const sphere = new THREE.Sphere();
      updatedBox.getBoundingSphere(sphere);
      const modelRadius = sphere.radius;

      // Set zoom-in and zoom-out limits
      controls.minDistance = modelRadius * 0.1;
      controls.maxDistance = Infinity;

      // Animate the camera to a good viewing position
      const desiredDistance = modelRadius * 3;
      gsap.to(camera.position, {
        duration: 2,
        x: 0,
        y: desiredDistance,
        z: desiredDistance,
        ease: "power2.out",
        onUpdate: () => {
          camera.lookAt(controls.target);
        }
      });

      // Optionally, if there are GLTF animations, set up the mixer (if needed)
      if (gltf.animations.length > 0) {
        console.log("Available animations:", gltf.animations);
        mixer = new THREE.AnimationMixer(orbitModel);
        const clip = THREE.AnimationClip.findByName(gltf.animations, 'Animation');
        if (clip) {
          const action = mixer.clipAction(clip);
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.clampWhenFinished = false;
          action.timeScale = 1;
          action.play();
          console.log(`🎬 Playing animation: ${clip.name}`);
        } else {
          console.warn('Animation clip not found.');
        }
      }

      // Now create orbit pivots for each planet (except the Sun)
      // Assumption: In your GLB model, the Sun is named "sun" (or "Sun") and is at the center.
      // Each planet should be a direct child (or accessible in the hierarchy) with its name.
      const sun = orbitModel.getObjectByName("sun") || orbitModel.getObjectByName("Sun");
      if (!sun) {
        console.error("Sun not found in the model. Make sure your Sun is named 'sun'!");
        return;
      }

      // For each planet name in our list, find its object, remove it from its parent,
      // create a pivot (centered at the Sun's position), add the planet to that pivot,
      // and then add the pivot to the scene.
      planetNames.forEach((pName) => {
        // Use case-insensitive search:
        const planet = orbitModel.getObjectByName(pName) || orbitModel.getObjectByName(pName.charAt(0).toUpperCase() + pName.slice(1));
        if (planet) {
          // Remove the planet from the model so we can reparent it
          planet.parent.remove(planet);

          // Create a new pivot
          const pivot = new THREE.Object3D();
          pivot.name = `${pName}_pivot`;
          // Position the pivot at the Sun’s position (which is at or near the origin)
          pivot.position.copy(sun.position);

          // Compute the planet’s offset relative to the Sun
          // (Make a clone to preserve the original world position)
          const planetWorldPos = new THREE.Vector3();
          planet.getWorldPosition(planetWorldPos);
          const offset = planetWorldPos.sub(sun.position);

          // Set the planet’s position relative to the pivot
          planet.position.copy(offset);

          // Add the planet to the pivot
          pivot.add(planet);
          // Add the pivot to the scene so it rotates about the Sun
          scene.add(pivot);
          // Store the pivot so we can update its rotation later in the animation loop
          orbitPivots[pName] = pivot;

          // Make sure the planet is visible now
          planet.visible = true;
          console.log(`✅ Created orbit pivot for ${pName} with offset:`, offset);
        } else {
          console.warn(`Planet "${pName}" not found in the model.`);
        }
      });

      // Start the animation loop
      animate();
    },
    undefined,
    (error) => {
      console.error('❌ Failed to load orbit mode model:', error);
    }
  );
}

/**
 * The unified animation loop for the orbit mode.
 * This updates both any GLTF animations and the custom orbital rotations.
 */
function animate() {
  requestAnimationFrame(animate);
  const deltaTime = clock.getDelta();

  // Update any GLTF animations (if using mixer)
  if (mixer) {
    mixer.update(deltaTime);
  }

  // For each pivot (each planet orbiting the Sun), rotate it about the Y-axis.
  // This causes its child (the planet) to orbit the Sun.
  for (const pName in orbitPivots) {
    const pivot = orbitPivots[pName];
    const speed = orbitSpeeds[pName] || 0.01; // Default speed if not defined
    pivot.rotation.y += speed * deltaTime;
  }

  // (Optional) You can also update camera controls if you pass them in
  // For example, if you have an 'controls' reference, you might call:
  // controls.update();

  // Render the scene (if you have a renderer available here)
  // For example:
  // renderer.render(scene, camera);
  // If your main render loop is elsewhere, you may remove this.
  // Also, you might want to remove or reduce logging in a production build:
  // console.log("🔄 Animation loop running...");
}

// (If you are not using a separate render loop elsewhere, you could export animate instead)
// export { animate };
