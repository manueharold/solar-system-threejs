import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

export function initControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.zoomSpeed = 2;
    controls.enableZoom = true;

    // Default Zoom Limits (unchanged)
    controls.minDistance = 2000;
    controls.maxDistance = 100000;

    function updateControls() {
        requestAnimationFrame(updateControls);
        controls.update();
    }
    updateControls();

    // Save original zoom-in function
    const originalDollyIn = controls.dollyIn.bind(controls);

    controls.updateZoomLimits = function (planet) {
        if (!planet) return;

        const planetName = planet.name.toLowerCase();

        if (planetName === "sun" || planetName === "jupiter") {
            // 🚫 Disable zooming in
            controls.dollyIn = function () {}; // Override dollyIn with empty function
            console.log(`🚫 Zoom-in disabled for ${planet.name}, but zoom-out is allowed.`);
        } else {
            // ✅ Restore normal zoom behavior
            controls.dollyIn = originalDollyIn;
            console.log(`🔍 Normal zooming enabled for ${planet.name}`);
        }
    };

    // 🚨 Set default zoom limits if the initial planet is the Sun
    setTimeout(() => {
        controls.updateZoomLimits({ name: "sun" });
    }, 100);

    return controls;
}
