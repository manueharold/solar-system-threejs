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

    // 📌 Dynamically adjust zoom-in limits based on the planet
    controls.updateZoomLimits = function (planet) {
        if (!planet) return;

        const planetName = planet.name.toLowerCase();

        if (planetName === "sun" || planetName === "jupiter") {
            // 🚫 Prevent zooming in by locking minDistance to the current camera position
            controls.minDistance = Math.max(controls.minDistance, camera.position.length());
            console.log(`🚫 Zoom-in disabled for ${planet.name}, but zoom-out is allowed.`);
        } else {
            // ✅ Restore normal zoom limits for other planets
            controls.minDistance = 2000;
            controls.maxDistance = 100000;
            console.log(`🔍 Zooming enabled for ${planet.name}: Min ${controls.minDistance}, Max ${controls.maxDistance}`);
        }
    };

    // 🚨 If the initial planet is the Sun, disable zoom-in immediately
    setTimeout(() => {
        controls.updateZoomLimits({ name: "sun" });
    }, 100);

    return controls;
}
