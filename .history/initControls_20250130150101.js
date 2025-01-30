import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

export function initControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.minDistance = 2000;
    controls.maxDistance = 100000;
    controls.zoomSpeed = 2;

    function updateControls() {
        requestAnimationFrame(updateControls);
        controls.update();
    }
    updateControls(); // Continuously update controls

    return controls;
}
