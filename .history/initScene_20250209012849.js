import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { planetData } from './loadPlanets.js';

export function initScene() {
    const scene = new THREE.Scene();
    scene.background = null;

    // Set the camera to focus on Earth at the desired position
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100000000);
    
    // Adjust camera to focus on Earth from the beginning using planetData for Earth's position
    const earthPosition = new THREE.Vector3(planetData.earth.distance, 0, 0);  // Earth position from planetData
    camera.position.set(earthPosition.x + 5000, 3000, earthPosition.z + 5000);  // Adjusted for a close view
    camera.lookAt(earthPosition);  // Focus the camera directly on Earth

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    return { scene, camera, renderer };
}