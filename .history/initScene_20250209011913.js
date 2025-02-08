// initScene.js
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { planetData } from './loadPlanets.js';

export function initScene() {
  const scene = new THREE.Scene();
  scene.background = null;

  // Create the renderer.
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // --- Earth View Camera & Controls ---
  const earthCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    100000000
  );
  const earthPosition = new THREE.Vector3(planetData.earth.distance, 0, 0);
  earthCamera.position.set(earthPosition.x + 5000, 3000, earthPosition.z + 5000);
  earthCamera.lookAt(earthPosition);

  const earthControls = new OrbitControls(earthCamera, renderer.domElement);
  earthControls.target.copy(earthPosition);
  earthControls.minDistance = 10000;
  earthControls.maxDistance = 50000;

  // --- Orbit Mode Camera & Controls ---
  const orbitCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    100000000
  );
  orbitCamera.position.set(0, 800, 2000);
  orbitCamera.lookAt(new THREE.Vector3(0, 0, 0));

  const orbitControls = new OrbitControls(orbitCamera, renderer.domElement);
  orbitControls.target.set(0, 0, 0);
  orbitControls.minDistance = 100;
  orbitControls.maxDistance = 10000;

  return { scene, renderer, earthCamera, earthControls, orbitCamera, orbitControls };
}
