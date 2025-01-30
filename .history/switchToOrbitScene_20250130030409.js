import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

function switchToOrbitScene(scene, camera, renderer) {
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

        // Orbit animation (if needed)
        const rotateOrbit = () => {
            requestAnimationFrame(rotateOrbit);
            solarSystemOrbit.rotation.y += 0.002; // Adjust the speed for orbit animation
        };
        rotateOrbit();
    }, undefined, (error) => {
        console.error('Error loading Solar System Orbit model:', error);
    });
}
