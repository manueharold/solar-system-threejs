import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// Create a loader instance for orbit mode
const orbitLoader = new GLTFLoader();

// Store a reference to the orbit model once loaded
let orbitModel = null;

export function loadOrbitModeModel(scene, camera, controls) {
    // Remove the individual planet objects.
    const planetNames = ['earth', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon'];
    for (let i = scene.children.length - 1; i >= 0; i--) {
        const child = scene.children[i];
        if (child.name && planetNames.includes(child.name)) {
            console.log(`Removing ${child.name} from scene.`);
            scene.remove(child);
        }
    }
    
    // Load the new GLB model for orbit mode.
    orbitLoader.load(
        './3d_models_compressed/solar_system.glb', // Confirm that this path is correct.
        (gltf) => {
            orbitModel = gltf.scene;
            orbitModel.name = 'orbitModeModel';
            
            // Scale up the model.
            const scaleFactor = 1000; // Change this value as desired.
            orbitModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
            
            // Center the model at the origin.
            const box = new THREE.Box3().setFromObject(orbitModel);
            const center = new THREE.Vector3();
            box.getCenter(center);
            // Shift the model so its center is at (0, 0, 0)
            orbitModel.position.sub(center);
            
            // Add the orbit model to the scene.
            scene.add(orbitModel);
            console.log('✅ Orbit Mode model loaded, centered, and scaled.');

            // Update the controls target to the center.
            controls.target.set(0, 0, 0);

            // Recompute the bounding box and bounding sphere now that the model is scaled and centered.
            const updatedBox = new THREE.Box3().setFromObject(orbitModel);
            const sphere = new THREE.Sphere();
            updatedBox.getBoundingSphere(sphere);
            const modelRadius = sphere.radius;
            
            // Set the zoom-in limit so you cannot zoom inside the model.
            controls.minDistance = modelRadius * 1.2;
            // Remove the zoom-out limit.
            controls.maxDistance = Infinity;
            
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
        },
        undefined,
        (error) => {
            console.error('❌ Failed to load Orbit Mode model:', error);
        }
    );
}
