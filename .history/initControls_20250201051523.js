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

    // 🚀 Define Minimum Zoom-in Limits (No Max Zoom-Out Limit)
    const planetZoomLimits = {
        sun: { min: 90000 },
        mercury: { min: 1000 },
        venus: { min: 2000 },
        earth: { min: 5000 },
        moon: { min: 500 },
        mars: { min: 1500 },
        jupiter: { min: 90000 },
        saturn: { min: 12000 },
        uranus: { min: 7000 },
        neptune: { min: 7000 }
    };

    // ✅ Apply Initial Zoom-In Limit (Default: Earth)
    controls.minDistance = planetZoomLimits.earth.min;  
    controls.maxDistance = Infinity;  // No zoom-out limit

    function updateControls() {
        requestAnimationFrame(updateControls);
        controls.update();
    }
    updateControls();

    // 🚀 Update Zoom-In Limit When Selecting a Planet
    controls.updateZoomLimits = function (planet) {
        if (!planet) {
            console.log("🌍 No planet selected, applying default zoom.");
            controls.minDistance = 2000;
            controls.maxDistance = Infinity; // No zoom-out limit
            return;
        }

        const planetName = planet.name.toLowerCase();
        const zoomLimits = planetZoomLimits[planetName];

        if (zoomLimits) {
            controls.minDistance = zoomLimits.min;
        } else {
            controls.minDistance = 2000; // Default fallback
        }

        controls.maxDistance = Infinity; // No zoom-out limit
        console.log(`🔍 Updated zoom-in limit for ${planet.name}: Min ${controls.minDistance}`);
    };

    return controls;
}
