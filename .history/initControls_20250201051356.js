import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

export function initControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.zoomSpeed = 1.5; // Adjusted for smoother zooming

    // 🚀 Min Zoom Limits (No Max Zoom-Out Limit)
    const planetMinZoomLimits = {
        sun: 50000,
        mercury: 1000,
        venus: 2000,
        earth: 5000,
        moon: 500,
        mars: 1500,
        jupiter: 50000,
        saturn: 12000,
        uranus: 7000,
        neptune: 7000
    };

    // ✅ Apply Initial Zoom-In Limit (Default: Earth)
    controls.minDistance = planetMinZoomLimits.earth;  
    controls.maxDistance = Infinity;  // No zoom-out limit

    function updateControls() {
        requestAnimationFrame(updateControls);
        controls.update();
    }
    updateControls();

    // 🚀 Dynamically Adjust Zoom-In Limit When Selecting Planets
    controls.updateZoomLimits = function (planetName) {
        if (!planetName) {
            console.log("🌍 No planet selected, applying default zoom.");
            controls.minDistance = 2000;
            controls.maxDistance = Infinity; // No zoom-out limit
            return;
        }

        const minZoom = planetMinZoomLimits[planetName.toLowerCase()];
        if (minZoom !== undefined) {
            controls.minDistance = minZoom;
        } else {
            controls.minDistance = 2000; // Default fallback
        }

        controls.maxDistance = Infinity; // No zoom-out limit
        console.log(`🔍 Updated zoom-in limit for ${planetName}: Min ${controls.minDistance}`);
    };

    return controls;
}
