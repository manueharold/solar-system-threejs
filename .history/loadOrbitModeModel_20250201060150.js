import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// Create a loader instance for orbit mode
const orbitLoader = new GLTFLoader();

// Store a reference to the orbit model once loaded
let orbitModel = null;

export function loadOrbitModeModel(scene, camera, controls) {
    // Define the list of planet names to remove
    const planetNames = ['earth', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon'];
    
    // Remove each planet from the scene by iterating backwards
    for (let i = scene.children.length - 1; i >= 0; i--) {
        const child = scene.children[i];
        if (child.name && planetNames.includes(child.name)) {
            console.log(`Removing ${child.name} from scene.`);
            scene.remove(child);
        }
    }
    
    // Load the new GLB model for orbit mode.
    orbitLoader.load(
        './3d_models_compressed/solar_system.glb', // Confirm this path is correct.
        (gltf) => {
            orbitModel = gltf.scene;
            orbitModel.name = 'orbitModeModel';
            scene.add(orbitModel);
            console.log('✅ Orbit Mode model loaded.');

            // Center the orbit mode model in the scene.
            const box = new THREE.Box3().setFromObject(orbitModel);
            const center = new THREE.Vector3();
            box.getCenter(center);
            
            // Update controls to focus on the center of the orbit model.
            controls.target.copy(center);

            // Animate the camera to a good viewing position relative to the center.
            gsap.to(camera.position, {
                duration: 2,
                x: center.x + 10000,  // Adjust these offset values as needed.
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
