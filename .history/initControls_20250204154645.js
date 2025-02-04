import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { planetData } from './loadPlanets.js';  // Make sure this is correctly imported

export function initControls(camera, renderer) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.screenSpacePanning = true;
  controls.enableZoom = true;
  controls.enableRotate = true;
  controls.enablePan = true;
  controls.zoomSpeed = 1.5;

  // Set initial zoom limits.
  controls.minDistance = 0;
  controls.maxDistance = Infinity;

  // Set initial focus on Earth.
  const earthPosition = new THREE.Vector3(planetData.earth.distance, 0, 0);
  controls.target.set(earthPosition.x, earthPosition.y, earthPosition.z);  // Focus on Earth

  // Update zoom limits based on the selected planet.
  controls.updateZoomLimits = function (planetName) {
    const planetZoomLimits = {
      sun: { min: 8000 },
      mercury: { min: 2000 },
      venus: { min: 3000 },
      earth: { min: 4000 },
      moon: { min: 3000 },
      mars: { min: 3000 },
      jupiter: { min: 8000 },
      saturn: { min: 8000 },
      uranus: { min: 5000 },
      neptune: { min: 8000 }
    };

    if (planetName) {
      const zoomLimits = planetZoomLimits[planetName.toLowerCase()];
      if (zoomLimits) {
        controls.minDistance = zoomLimits.min;
      } else {
        controls.minDistance = 10000;
      }
    } else {
      controls.minDistance = 0;
    }
    controls.maxDistance = Infinity;  // Always allow zooming out infinitely.
    console.log(
      `🔍 Updated zoom limits for ${planetName || "default"}: Min ${controls.minDistance}, Max ${controls.maxDistance}`
    );
  };

  // Function to update controls in the animation loop
  function updateControls() {
    requestAnimationFrame(updateControls);
    controls.update();
  }
  updateControls();

  return controls;
}
