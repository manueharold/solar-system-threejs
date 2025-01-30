import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

export function initSkybox(scene) {
    const textureLoader = new THREE.TextureLoader();
    const skyboxTexture = textureLoader.load('textures/panorama_galaxy.png');

    // Create a very large sphere to encompass the entire scene, simulating infinity
    const skyboxGeometry = new THREE.SphereGeometry(1000000, 200, 200); // Significantly larger radius (adjust as needed)
    const skyboxMaterial = new THREE.MeshBasicMaterial({
        map: skyboxTexture,
        side: THREE.BackSide,
        // Optionally set texture repeat settings for better tiling if needed
        // map: skyboxTexture, wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping
    });
    const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    scene.add(skybox);
}
