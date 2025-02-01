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

    // 🚀 Predefined Zoom Limits for Each Planet
    const planetZoomLimits = {
        sun: { min: 100000, max: 10000000 }, // Increased max for Sun
        mercury: { min: 1000, max: 5000 },
        venus: { min: 2000, max: 8000 },
        earth: { min: 5000, max: 15000 },
        moon: { min: 500, max: 5000 }, 
        mars: { min: 1500, max: 8000 },
        jupiter: { min: 90000, max: 200000 },
        saturn: { min: 12000, max: 80000 },
        uranus: { min: 7000, max: 50000 },
        neptune: { min: 7000, max: 50000 }
    };

    // Set initial zoom limits
    controls.minDistance = planetZoomLimits.earth.min;  
    controls.maxDistance = planetZoomLimits.earth.max;  

    function updateControls() {
        requestAnimationFrame(updateControls);
        controls.update();
    }
    updateControls();

    // 🚀 Dynamically Adjust Zoom Limits Based on Selected Planet
    controls.updateZoomLimits = function (planetName) {
        if (!planetName) {
            console.log("🌍 No planet selected, applying default zoom.");
            controls.minDistance = 2000;
            controls.maxDistance = 2000000; // Increased global max zoom
            return;
        }

        const zoomLimits = planetZoomLimits[planetName.toLowerCase()];
        if (zoomLimits) {
            controls.minDistance = zoomLimits.min;
            controls.maxDistance = zoomLimits.max;
        } else {
            controls.minDistance = 2000;
            controls.maxDistance = 2000000;
        }

        console.log(`🔍 Updated zoom limits for ${planetName}: Min ${controls.minDistance}, Max ${controls.maxDistance}`);
    };

    return controls;
}
