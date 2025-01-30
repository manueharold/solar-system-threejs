import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Rotation period ratio for Sun relative to Earth
const rotationSpeedEarth = 0.002;
const rotationRatioSun = 24 * 86400; // Sun's rotation period in seconds (24 days)

export function loadSunModel(scene) {
    const loader = new GLTFLoader();
    loader.load('./3d_models/sun.glb', (gltf) => {
        const sun = gltf.scene;
        const box = new THREE.Box3().setFromObject(sun);
        const size = box.getSize(new THREE.Vector3());
        const fixedSize = 30000;
        const scaleFactor = fixedSize / size.length();
        sun.scale.set(scaleFactor, scaleFactor, scaleFactor);
        sun.position.set(-25000, 0, 0); // Position Sun far before Mercury
        scene.add(sun);

        // Sun Rotation Speed
        const rotate = () => {
            requestAnimationFrame(rotate);
            sun.rotation.y += rotationSpeedEarth / rotationRatioSun; // Sun rotation speed
        };
        rotate();
    }, undefined, (error) => {
        console.error('Error loading Sun model:', error);
    });
}
