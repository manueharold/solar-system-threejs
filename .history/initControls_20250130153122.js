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

    // Default Zoom Limits
    controls.minDistance = 2000;
    controls.maxDistance = 100000;

    function updateControls() {
        requestAnimationFrame(updateControls);
        controls.update();
    }
    updateControls();

    // 📌 Dynamically adjust zoom limits based on planet
    controls.updateZoomLimits = function (planet) {
        if (!planet) return;

        const planetName = planet.name.toLowerCase();

        if (planetName === "sun" || planetName === "jupiter") {
            // 🔒 Prevent zooming in by locking minDistance to the camera's current position
            controls.enableZoom = true;
            controls.minDistance = camera.position.length();
            controls.maxDistance = 150000; // Allow zooming out
            console.log(`🚫 Zoom-in disabled for ${planet.name}, but zoom-out is allowed.`);
        } else {
            // ✅ Keep current zoom level instead of resetting it
            controls.enableZoom = true;
            controls.minDistance = Math.min(controls.minDistance, camera.position.length());
            controls.maxDistance = 100000; // Restore default max zoom-out
            console.log(`🔍 Zooming enabled for ${planet.name}: Min ${controls.minDistance}, Max ${controls.maxDistance}`);
        }
    };

    // 🚨 Set zoom limits if the initial planet is the Sun
    setTimeout(() => {
        controls.updateZoomLimits({ name: "sun" });
    }, 100);

    return controls;
}
