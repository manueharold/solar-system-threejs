import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

export function switchToOrbitScene(scene, camera, renderer) {
    // Remove all existing models in the scene (planets and sun)
    scene.children.forEach((child) => {
        // Recursively remove children if the object is a group or a mesh
        if (child instanceof THREE.Group || child instanceof THREE.Mesh) {
            scene.remove(child); // Remove planets, sun, and other meshes
        }
    });

    // Load and add the new solar system orbit model
    const loader = new GLTFLoader();
    loader.load('./3d_models/solar.glb', (gltf) => {
        const solarSystemOrbit = gltf.scene;

        // Optionally apply scaling and positioning if necessary
        const box = new THREE.Box3().setFromObject(solarSystemOrbit);
        const size = box.getSize(new THREE.Vector3());
        const fixedSize = 16000; // Adjust this to fit the solar system model in the scene
        const scaleFactor = fixedSize / size.length();
        solarSystemOrbit.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Optional: Set the position of the solar system orbit model if needed
        solarSystemOrbit.position.set(0, 0, 0); // Adjust as necessary

        // Add the solar system model to the scene
        scene.add(solarSystemOrbit);

        // The model should already have its own rotation animations, no need to add manual rotation
    }, undefined, (error) => {
        console.error('Error loading Solar System Orbit model:', error);
    });
}
