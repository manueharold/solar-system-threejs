import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { planetData } from './loadPlanets.js';

export function initScene() {
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100000000);
    
    const earthPosition = new THREE.Vector3(planetData.earth.distance, 0, 0);
    camera.position.set(earthPosition.x + 5000, 3000, earthPosition.z + 5000);
    camera.lookAt(earthPosition);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Function to reset camera to Earth when exiting orbit mode
    function resetCamera() {
        camera.position.set(earthPosition.x + 5000, 3000, earthPosition.z + 5000);
        camera.lookAt(earthPosition);
    }

    return { scene, camera, renderer, resetCamera };
}
