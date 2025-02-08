import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { planetData } from "./loadPlanets.js";

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

  // Define Earth's position using planetData
  const earthPosition = new THREE.Vector3(planetData.earth.distance, 0, 0);
  // Position the camera relative to Earth
  camera.position.set(
    earthPosition.x + 5000,
    3000,
    earthPosition.z + 5000
  );
  camera.lookAt(earthPosition);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Define zoom limits (in units, adjust as needed)
  const minDistance = 10000;  // Minimum distance (zoomed in)
  const maxDistance = 150000; // Maximum distance (zoomed out)

  // Wheel event handler to zoom in/out without OrbitControls
  renderer.domElement.addEventListener(
    "wheel",
    (event) => {
      // Prevent the page from scrolling
      event.preventDefault();

      // Get the current vector from Earth to the camera
      const direction = new THREE.Vector3().subVectors(
        camera.position,
        earthPosition
      );
      const currentDistance = direction.length();

      // Determine a zoom factor based on the wheel delta
      // A positive deltaY zooms out, a negative zooms in.
      const zoomSpeed = 0.001;
      const factor = 1 + event.deltaY * zoomSpeed;

      // Compute the new distance and clamp it within our limits
      let newDistance = currentDistance * factor;
      newDistance = THREE.MathUtils.clamp(newDistance, minDistance, maxDistance);

      // Update the camera position along the same direction
      direction.normalize().multiplyScalar(newDistance);
      camera.position.copy(earthPosition.clone().add(direction));

      // Ensure the camera continues to look at Earth
      camera.lookAt(earthPosition);
    },
    { passive: false } // Use passive: false so that preventDefault() works
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
