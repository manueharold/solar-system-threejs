import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { planetData } from "./loadPlanets.js";

// Default zoom target is Earth's position for non-orbit mode
export let currentZoomTarget = new THREE.Vector3(planetData.earth.distance, 0, 0);

// Define zoom limits
const minDistance = 10000;  // Minimum distance (zoomed in)
const maxDistance = 150000; // Maximum distance (zoomed out)

export function initScene() {
  const scene = new THREE.Scene();
  scene.background = null;

  // Create the camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    100000000
  );

  // Initially position the camera relative to Earth (non-orbit mode)
  camera.position.set(
    currentZoomTarget.x + 5000,
    3000,
    currentZoomTarget.z + 5000
  );
  camera.lookAt(currentZoomTarget);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // --- Zoom Event Listener ---
  renderer.domElement.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();

      // Calculate direction vector from the current zoom target to the camera
      const direction = new THREE.Vector3().subVectors(camera.position, currentZoomTarget);
      const currentDistance = direction.length();

      // Zoom factor calculation (deltaY > 0 zooms out, < 0 zooms in)
      const zoomSpeed = 0.001;
      const factor = 1 + event.deltaY * zoomSpeed;

      // Calculate and clamp the new distance
      let newDistance = currentDistance * factor;
      newDistance = THREE.MathUtils.clamp(newDistance, minDistance, maxDistance);

      // Update camera position along the same direction
      direction.normalize().multiplyScalar(newDistance);
      camera.position.copy(currentZoomTarget.clone().add(direction));

      // Ensure the camera keeps looking at the zoom target
      camera.lookAt(currentZoomTarget);
    },
    { passive: false }
  );

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  // Handle window resize events
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer };
}
