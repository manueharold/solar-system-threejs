import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { planetData } from './loadPlanets.js';

export function initScene() {
    const scene = new THREE.Scene();
    scene.background = null;

    // Create a PerspectiveCamera.
    // Near and far clipping planes are set to 1 and 100000000 respectively.
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        1,
        100000000
    );

    // Determine Earth's position from planetData.
    const earthPosition = new THREE.Vector3(planetData.earth.distance, 0, 0);
    
    // Position the camera relative to Earth for a close-up view.
    camera.position.set(earthPosition.x + 5000, 3000, earthPosition.z + 5000);
    camera.lookAt(earthPosition);

    // Create the renderer.
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create OrbitControls for the camera.
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(earthPosition);  // Set the focus (target) of the controls to Earth.

    // Set zoom limits:
    controls.minDistance = 10000;  
    controls.maxDistance = 50000; 

    // Optionally, update controls on each frame if needed:
    // controls.update();

    return { scene, camera, renderer, controls };
}
