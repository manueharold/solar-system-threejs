import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

export function initScene() {
    const scene = new THREE.Scene();
    scene.background = null;

    // Set the camera to focus on Earth at the desired position
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100000000);

    // Set the camera position near Earth (149600 units away in the x-axis)
    camera.position.set(149600, 3000, 149600 + 5000); // Adjust to be near Earth

    // Make sure the camera looks directly at Earth from the beginning
    camera.lookAt(new THREE.Vector3(149600, 0, 0)); // Focus on Earth's center

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    return { scene, camera, renderer };
}
