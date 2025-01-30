import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Function to transition to the orbit scene
export function switchToOrbitScene(scene, camera, renderer) {
    // Remove all existing models in the scene
    scene.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
            scene.remove(child); // Remove planets, sun, and other meshes
        }
    });

    // Load and add the new solar system orbit model
    const loader = new GLTFLoader();
    loader.load('./3d_models/solarSystem.glb', (gltf) => {
        const solarSystemOrbit = gltf.scene;
        scene.add(solarSystemOrbit);

        // The model should already have its own rotation animations, no need to add manual rotation
    }, undefined, (error) => {
        console.error('Error loading Solar System Orbit model:', error);
    });
}
