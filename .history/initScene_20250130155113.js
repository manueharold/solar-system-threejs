import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

export function initScene() {
    const scene = new THREE.Scene();
    scene.background = null;

    // ✅ Set camera position to focus on Earth at (149600, 0, 0)
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100000000);
    camera.position.set(149600, 3000, 149600 + 5000); // Move near Earth

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    return { scene, camera, renderer };
}
