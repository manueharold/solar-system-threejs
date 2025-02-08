// loadOrbitPlanets.js
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// Create a loader instance for orbit mode
const orbitLoader = new GLTFLoader();

// Store a reference to the orbit model
let orbitModel = null;

export function loadOrbitPlanets(scene, camera, controls) {
    // Hide the default planets group if it exists
    const defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
    if (defaultPlanetsGroup) {
        defaultPlanetsGroup.visible = false;
        console.log("Hid default planets group.");
    }

    // Instead of removing individual planet objects, we hide them.
    const planetNames = ['earth', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon'];
    scene.traverse((child) => {
        if (child.name && planetNames.includes(child.name)) {
            child.visible = false;
            console.log(`Hiding ${child.name} in scene.`);
        }
    });

    // Load the new GLB model for orbit mode
    orbitLoader.load(
        './3d_models_compressed/solar_system.glb',
        (gltf) => {
            orbitModel = gltf.scene;
            orbitModel.name = 'orbitModeModel';

            // Scale the model (adjust as needed)
            const scaleFactor = 100; // Adjust from 1000 to 100
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

            // Option 1: If you want to use the GLTF animation for its first 20 seconds,
            // you could play it here. However, if you’re noticing a reset every 20 seconds,
            // you might choose to disable it:
            //
            // if (gltf.animations.length > 0) {
            //     console.log("Available animations:", gltf.animations);
            //     const mixer = new THREE.AnimationMixer(gltf.scene);
            //     const clip = THREE.AnimationClip.findByName(gltf.animations, 'Animation');
            //     if (clip) {
            //         const action = mixer.clipAction(clip);
            //         action.setLoop(THREE.LoopOnce, 0); // Play once and then stop
            //         action.play();
            //         console.log(`🎬 Played one pass of the baked animation: ${clip.name}`);
            //     } else {
            //         console.warn('Animation clip not found.');
            //     }
            // }
            //
            // Option 2: Use a custom continuous GSAP animation to rotate the entire model.
            // This creates a seamless, continuous orbit effect.
            gsap.to(orbitModel.rotation, {
                y: 2 * Math.PI,      // one full rotation (360°)
                duration: 120,       // adjust duration (in seconds) for desired speed
                ease: "none",        // no easing for constant speed
                repeat: -1           // infinite repeats
            });
            console.log("🎬 Started continuous orbital rotation.");
        },
        undefined,
        (error) => {
            console.error('❌ Failed to load orbit mode model:', error);
        }
    );
}

// Remove the animation mixer update since we are not using the baked GLTF animation anymore
// and instead rely on GSAP for continuous rotation.

// Create a THREE.Clock instance for any other animations (if needed)
const clock = new THREE.Clock();

// Main animation loop
export function animate(renderer, scene, camera, controls) {
    requestAnimationFrame(() => animate(renderer, scene, camera, controls));
    const deltaTime = clock.getDelta();

    // If you had other animations (or wish to update custom orbital motions),
    // you could update them here. For example, if you wanted to rotate individual planets
    // around the sun manually instead of the entire model, you could do so here.

    controls.update();
    renderer.render(scene, camera);
    // Optionally, comment out the following console log once debugging is done.
    // console.log("🔄 Animation loop running...");
}
