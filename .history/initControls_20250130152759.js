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
    const defaultMinDistance = 2000;
    const defaultMaxDistance = 100000;

    controls.minDistance = defaultMinDistance;
    controls.maxDistance = defaultMaxDistance;

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
            // 🔒 Prevent zooming in by locking minDistance to current distance
            controls.enableZoom = true;
            controls.minDistance = camera.position.length(); // Lock current zoom level
            controls.maxDistance = 150000; // Allow zooming out
            console.log(`🚫 Zoom-in disabled for ${planet.name}, but zoom-out is allowed.`);
        } else {
            // ✅ Enable zooming normally for other planets
            controls.enableZoom = true;
            controls.minDistance = defaultMinDistance;
            controls.maxDistance = defaultMaxDistance;
            console.log(`🔍 Zooming enabled for ${planet.name}: Min ${controls.minDistance}, Max ${controls.maxDistance}`);
        }
    };

    // 🚨 Set default zoom limits if the initial planet is the Sun
    setTimeout(() => {
        controls.updateZoomLimits({ name: "sun" });
    }, 100);

    return controls;
}
