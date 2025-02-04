import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

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
  // Set maxDistance to Infinity to allow unlimited zooming out.
  controls.minDistance = 0;
  controls.maxDistance = Infinity;

  // Update zoom limits based on the selected planet.
  // We no longer restrict maxDistance when a planet is selected.
  controls.updateZoomLimits = function (planetName) {
    const planetZoomLimits = {
      sun: { min: 8000 },
      mercury: { min: 2000 },
      venus: { min: 3000 },
      earth: { min: 4000 },
      moon: { min: 3000 },
      mars: { min: 3000 },
      jupiter: { min: 5000 },
      saturn: { min: 10000 },
      uranus: { min: 10000 },
      neptune: { min: 10000 }
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
    // Always allow zooming out infinitely.
    controls.maxDistance = Infinity;
    console.log(
      `🔍 Updated zoom limits for ${planetName || "default"}: Min ${controls.minDistance}, Max ${controls.maxDistance}`
    );
  };

  function updateControls() {
    requestAnimationFrame(updateControls);
    controls.update();
  }
  updateControls();

  return controls;
}
