import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// Create a loader instance for orbit mode
const orbitLoader = new GLTFLoader();

// Store a reference to the orbit model and animation mixer
let orbitModel = null;
let mixer = null; // THREE.AnimationMixer instance

export function loadOrbitModeModel(orbitGroup, camera, controls) {
    // Before loading, clear previous orbit models if necessary:
    orbitGroup.clear();

    orbitLoader.load(
        './3d_models_compressed/solar_system.glb',
        (gltf) => {
            orbitModel = gltf.scene;
            orbitModel.name = 'orbitModeModel';
            
            // Scale and center orbitModel...
            const scaleFactor = 1000; // Adjust as needed
            orbitModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
            const box = new THREE.Box3().setFromObject(orbitModel);
            const center = new THREE.Vector3();
            box.getCenter(center);
            orbitModel.position.sub(center);
            
            // Add the orbit model to the orbit group
            orbitGroup.add(orbitModel);
            console.log('✅ Orbit Mode model loaded, centered, and scaled.');
            
            // Update the controls target
            controls.target.set(0, 0, 0);
            // Adjust zoom limits and animate camera...
        },
        undefined,
        (error) => {
            console.error('❌ Failed to load Orbit Mode model:', error);
        }
    );
}

// Update the animation in the render loop
export function updateOrbitModeAnimation(deltaTime) {
    if (mixer) {
        mixer.update(deltaTime);
        
        // Force looping beyond original animation duration
        mixer.time += deltaTime;  // Keep increasing time
    }
}