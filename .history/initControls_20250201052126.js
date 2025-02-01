import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

export function initControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.zoomSpeed = 1.5; 

    // 🚀 Set Default Zoom Limits
    controls.minDistance = 2000;  
    controls.maxDistance = 1000000;  

    const sunMinZoom = 200000; // ✅ Set a hard limit for Sun zoom-in distance

    function enforceSunZoomLimit() {
        if (controls.target.equals(planets["sun"].position)) {
            if (camera.position.distanceTo(planets["sun"].position) < sunMinZoom) {
                camera.position.setLength(sunMinZoom);
            }
        }
    }

    function updateControls() {
        requestAnimationFrame(updateControls);
        controls.update();
        enforceSunZoomLimit(); // ✅ Apply Sun zoom-in limit
    }
    updateControls();

    return controls;
}
