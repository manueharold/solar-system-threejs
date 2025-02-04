// loadOrbitPlanets.js
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

let orbitModel = null;
let mixer = null; // THREE.AnimationMixer instance

export function loadOrbitPlanets(scene, camera, controls) {
    // Hide the default planets group (but don't remove them)
    const defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
    if (defaultPlanetsGroup) {
        defaultPlanetsGroup.visible = false;  // Hide default planets
        console.log("Hid default planets group.");
    }

    // Load the new GLB model for orbit mode
    const orbitLoader = new GLTFLoader();
    orbitLoader.load(
        './3d_models_compressed/solar_system.glb', // Ensure this path is correct
        (gltf) => {
            orbitModel = gltf.scene;
            orbitModel.name = 'orbitModeModel';

            // Scale up the model
            const scaleFactor = 1000; // Adjust as needed
            orbitModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

            // Center the model at the origin
            const box = new THREE.Box3().setFromObject(orbitModel);
            const center = new THREE.Vector3();
            box.getCenter(center);
            orbitModel.position.sub(center); // Shift to center

            // Add orbit model to the scene
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

            // Set camera to view the model from a far-up perspective
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

            // Set up animation playback if animations exist
            if (gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(orbitModel);
                gltf.animations.forEach((clip) => {
                    const action = mixer.clipAction(clip);
                    action.setLoop(THREE.LoopRepeat, Infinity);
                    action.clampWhenFinished = false;
                    action.timeScale = 1;  // Normal playback speed
                    action.play();
                });
                console.log('🎬 Orbit mode animations started.');
            }
        },
        undefined,
        (error) => {
            console.error('❌ Failed to load orbit mode model:', error);
        }
    );
}

// Update the animation in the render loop
export function updateOrbitModeAnimation(deltaTime) {
    if (mixer) {
        mixer.update(deltaTime);
        // Force looping beyond original animation duration
        mixer.time += deltaTime;
    }
}
