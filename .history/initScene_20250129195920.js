import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

export function initScene() {
    const scene = new THREE.Scene();
    scene.background = null; // Remove the black background

    // Camera setup with adjusted near and far planes
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000000); // Increased far plane
    camera.position.set(0, 1000, 28000);  // Position the camera farther from the center

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    return { scene, camera, renderer };
}


