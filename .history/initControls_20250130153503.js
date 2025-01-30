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

    let disableZoomIn = false;

    controls.updateZoomLimits = function (planet) {
        if (!planet) return;

        const planetName = planet.name.toLowerCase();
        disableZoomIn = planetName === "sun" || planetName === "jupiter";

        console.log(`🔍 Zoom-in ${disableZoomIn ? "disabled" : "enabled"} for ${planet.name}`);
    };

    // Intercept mouse wheel zooming
    renderer.domElement.addEventListener("wheel", (event) => {
        if (disableZoomIn && event.deltaY < 0) {
            event.preventDefault(); // Block zoom-in
        }
    }, { passive: false });

    // Intercept touch pinch zooming
    renderer.domElement.addEventListener("touchmove", (event) => {
        if (disableZoomIn && event.touches.length > 1) {
            event.preventDefault(); // Block zoom-in
        }
    }, { passive: false });

    // 🚨 Disable zoom-in for the default planet if it's the Sun
    setTimeout(() => {
        controls.updateZoomLimits({ name: "sun" });
    }, 100);

    return controls;
}
