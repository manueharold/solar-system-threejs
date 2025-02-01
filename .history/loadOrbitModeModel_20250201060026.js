// Import necessary modules at the top if not already imported.
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// Assuming you have a global or module-scoped loader already:
const orbitLoader = new GLTFLoader();

// Store a reference to the orbit model once loaded (if needed later)
let orbitModel = null;

export function loadOrbitModeModel(scene, camera, controls) {
    // Option 1: Remove all individual planet objects.
    // (If you want to keep them for toggling back later, you might choose to simply hide them.)
    for (const key in scene.children) {
        // For example, if your planets have a naming convention, you might remove those with known names.
        // Here, we assume that planets are stored in a global "planets" object.
        if (scene.children[key] && scene.children[key].name && 
            (scene.children[key].name === 'earth' ||
             scene.children[key].name === 'sun' ||
             scene.children[key].name === 'mercury' ||
             scene.children[key].name === 'venus' ||
             scene.children[key].name === 'mars' ||
             scene.children[key].name === 'jupiter' ||
             scene.children[key].name === 'saturn' ||
             scene.children[key].name === 'uranus' ||
             scene.children[key].name === 'neptune' ||
             scene.children[key].name === 'moon')) {
            scene.remove(scene.children[key]);
        }
    }

    // Option 2: If you stored your planets in an object (as in your loadPlanets function)
    // you can also loop through that object and remove them:
    // Object.values(planets).forEach(planet => scene.remove(planet));
    // planets = {}; // Clear the planets object if you no longer need them.

    // Load the new GLB model for orbit mode.
    orbitLoader.load(
        './3d_models_compressed/solar_system.glb', // Replace with your model's path
        (gltf) => {
            orbitModel = gltf.scene;
            orbitModel.name = 'orbitModeModel';
            scene.add(orbitModel);
            console.log('✅ Orbit Mode model loaded.');

            // Optionally center the model in the scene
            const box = new THREE.Box3().setFromObject(orbitModel);
            const center = new THREE.Vector3();
            box.getCenter(center);
            // Update controls to focus on the center of the orbit model
            controls.target.copy(center);

            // Animate the camera to a good viewing position.
            // Adjust the offset values as needed for your model.
            gsap.to(camera.position, {
                duration: 2,
                x: center.x + 10000,
                y: center.y + 10000,
                z: center.z + 10000,
                ease: "power2.out",
                onUpdate: () => {
                    camera.lookAt(controls.target);
                }
            });
        },
        undefined,
        (error) => {
            console.error('❌ Failed to load Orbit Mode model:', error);
        }
    );
}
