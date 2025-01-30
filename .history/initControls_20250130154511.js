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
        sun: { min: 60000, max: 500000 },  // Bigger zoom range for the Sun
        mercury: { min: 1000, max: 5000 },
        venus: { min: 2000, max: 8000 },
        earth: { min: 4000, max: 10000 },
        moon: { min: 500, max: 3000 },  // 🌙 Added the Moon
        mars: { min: 1500, max: 7000 },
        jupiter: { min: 15000, max: 60000 },
        saturn: { min: 12000, max: 50000 },
        uranus: { min: 7000, max: 35000 },
        neptune: { min: 7000, max: 35000 }
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
