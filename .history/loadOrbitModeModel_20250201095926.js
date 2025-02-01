import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// Create a loader instance for orbit mode
const orbitLoader = new GLTFLoader();

// Store a reference to the orbit model and animation mixer
let orbitModel = null;
let mixer = null; // THREE.AnimationMixer instance
let orbitModeActive = false;


export function loadOrbitModeModel(scene, camera, controls) {
    // Remove the individual planet objects
    const planetNames = ['earth', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon'];
    for (let i = scene.children.length - 1; i >= 0; i--) {
        const child = scene.children[i];
        if (child.name && planetNames.includes(child.name)) {
            console.log(`Removing ${child.name} from scene.`);
            scene.remove(child);
        }
    }

    // Load the new GLB model for orbit mode
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

            // Add model to scene
            scene.add(orbitModel);
            console.log('✅ Orbit Mode model loaded, centered, and scaled.');

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

            // ✅ Set up animation playback
            if (gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(orbitModel);
                gltf.animations.forEach((clip) => {
                    const action = mixer.clipAction(clip);
                    action.setLoop(THREE.LoopRepeat, Infinity);
                    action.clampWhenFinished = false;  // Ensure it doesn't stop at the end
                    action.play();
                });
                console.log('🎬 Orbit mode animations started.');
            }
            
        },
        undefined,
        (error) => {
            console.error('❌ Failed to load Orbit Mode model:', error);
        }
    );
}

// ✅ Update the animation in the render loop
export function updateOrbitModeAnimation(deltaTime) {
    if (mixer) {
        mixer.update(deltaTime);
    }
}
