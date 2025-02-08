import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { planetData } from "./loadPlanets.js";

export function initScene() {
  const scene = new THREE.Scene();
  scene.background = null;

  // Set up the camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    100000000
  );

  // Position the camera relative to Earth using planetData
  const earthPosition = new THREE.Vector3(planetData.earth.distance, 0, 0);
  camera.position.set(earthPosition.x + 5000, 3000, earthPosition.z + 5000);
  camera.lookAt(earthPosition);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Set up OrbitControls for camera interaction
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;      // Smooth camera movements
  controls.dampingFactor = 0.25;

  // Set zoom (distance) limits
  controls.minDistance = 1000;  // Limit for zooming in
  controls.maxDistance = 15000; // Limit for zooming out

  // Animation loop to render the scene and update controls
  function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Required when damping is enabled
    renderer.render(scene, camera);
  }
  animate();

  // Optionally handle window resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, controls };
}
