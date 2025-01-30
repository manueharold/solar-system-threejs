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

    // Default Zoom Limits (for general space view)
    controls.minDistance = 2000;
    controls.maxDistance = 100000;

    function updateControls() {
        requestAnimationFrame(updateControls);
        controls.update();
    }
    updateControls();

    // 🚀 Special Zoom Limits for Bigger Planets
    const bigPlanets = ["jupiter", "saturn", "uranus", "neptune", "sun"];

    controls.updateZoomLimits = function (planet) {
        if (!planet) return;

        const planetName = planet.name.toLowerCase();

        // ✅ Default zoom-in limit for smaller planets
        let newMinDistance = 2000; 

        // 🔹 If the planet is "big," set a stricter zoom-in limit
        if (bigPlanets.includes(planetName)) {
            newMinDistance = 15000;  // Prevents excessive zoom-in on big planets
        }

        controls.minDistance = newMinDistance;

        console.log(`🔍 Updated zoom limits for ${planet.name}: Min ${controls.minDistance}, Max ${controls.maxDistance}`);
    };

    return controls;
}
