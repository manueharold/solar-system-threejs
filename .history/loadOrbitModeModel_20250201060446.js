import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// Create a loader instance for orbit mode
const orbitLoader = new GLTFLoader();

// Store a reference to the orbit model once loaded
let orbitModel = null;

export function loadOrbitModeModel(scene, camera, controls) {
    // List of planet names (lowercase) to remove.
    const planetNames = ['earth', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon'];
    
    // Remove each planet from the scene by iterating backwards.
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
            
            // Scale up the model (adjust scaleFactor as needed).
            const scaleFactor = 1000;
            orbitModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
            
            // Center the model so that its bounding box center is at (0, 0, 0)
            const box = new THREE.Box3().setFromObject(orbitModel);
            const center = new THREE.Vector3();
            box.getCenter(center);
            // Adjust position so that the center of the model moves to (0,0,0)
            orbitModel.position.sub(center);

            scene.add(orbitModel);
            console.log('✅ Orbit Mode model loaded, centered, and scaled.');

            // Compute the bounding sphere for the orbit model
            const sphere = new THREE.Sphere();
            box.getBoundingSphere(sphere);
            const modelRadius = sphere.radius * scaleFactor;
            
            // Set the controls target to the center
            controls.target.set(0, 0, 0);
            
            // Remove the zoom-out limit and set a zoom-in limit.
            // Setting maxDistance to a large value (or Infinity) effectively removes the zoom-out limit.
            controls.minDistance = modelRadius * 1.2;  // Prevent zooming too close.
            controls.maxDistance = Infinity;  // Or set this to a very large number if Infinity is not desired.
            
            // Animate the camera to a good viewing position based on the model size.
            // Here, we position the camera at 3 times the model radius away from the center.
            const desiredDistance = modelRadius * 3;
            gsap.to(camera.position, {
                duration: 2,
                x: desiredDistance,
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
