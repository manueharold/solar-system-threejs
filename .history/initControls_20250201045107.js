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

    // Set initial zoom limits (default: Earth)
    controls.minDistance = planetZoomLimits.earth.min;
    controls.maxDistance = planetZoomLimits.earth.max;

    function updateControls() {
        requestAnimationFrame(updateControls);
        controls.update();
    }
    updateControls();

    return controls;
}
