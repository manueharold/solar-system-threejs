import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

export function initControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.zoomSpeed = 2;

    function updateControls() {
        requestAnimationFrame(updateControls);
        controls.update();
    }
    updateControls();

    // 🚀 Predefined Zoom Limits for Each Planet
    const planetZoomLimits = {
        sun: { min: 50000, max: 300000 },
        mercury: { min: 800, max: 5000 },
        venus: { min: 1500, max: 7000 },
        earth: { min: 1600, max: 8000 },
        mars: { min: 1000, max: 6000 },
        jupiter: { min: 10000, max: 50000 },
        saturn: { min: 8000, max: 40000 },
        uranus: { min: 5000, max: 30000 },
        neptune: { min: 5000, max: 30000 }
    };

    // 🚀 Dynamically Adjust Zoom Limits Based on Selected Planet
    controls.updateZoomLimits = function (planet) {
        if (!planet) return;

        const planetName = planet.name.toLowerCase();
        const zoomLimits = planetZoomLimits[planetName];

        if (zoomLimits) {
            controls.minDistance = zoomLimits.min;
            controls.maxDistance = zoomLimits.max;
        } else {
            controls.minDistance = 2000;  // Default min
            controls.maxDistance = 100000; // Default max
        }

        console.log(`🔍 Updated zoom limits for ${planet.name}: Min ${controls.minDistance}, Max ${controls.maxDistance}`);
    };

    return controls;
}
