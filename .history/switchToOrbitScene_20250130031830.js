import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

export function switchToOrbitScene(scene, camera, renderer) {
    console.log('Scene children before removal:', scene.children);

    // Remove all existing models (planets, sun, etc.)
    const childrenToRemove = [];
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Group) {
            childrenToRemove.push(child); // Mark groups and meshes for removal
        }
    });

    // Remove all the marked children, including groups
    childrenToRemove.forEach((child) => {
        scene.remove(child);
        // Also remove child objects inside groups
        child.traverse((descendant) => {
            if (descendant instanceof THREE.Mesh || descendant instanceof THREE.Group) {
                scene.remove(descendant);
            }
        });
    });

    console.log('Scene children after removal:', scene.children);

    // Load and add the new solar system orbit model
    const loader = new GLTFLoader();
    loader.load('./3d_models/solar.glb', (gltf) => {
        const solarSystemOrbit = gltf.scene;

        // Apply scaling and positioning as necessary
        const box = new THREE.Box3().setFromObject(solarSystemOrbit);
        const size = box.getSize(new THREE.Vector3());
        const fixedSize = 20000; // Adjust this to fit the solar system model in the scene
        const scaleFactor = fixedSize / size.length();
        solarSystemOrbit.scale.set(scaleFactor, scaleFactor, scaleFactor);

        solarSystemOrbit.position.set(30000, 0, 0); // Adjust as necessary

        // Add the solar system orbit model to the scene
        scene.add(solarSystemOrbit);

    }, undefined, (error) => {
        console.error('Error loading Solar System Orbit model:', error);
    });
}
