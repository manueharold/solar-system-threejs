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

    // 🌍 Default Zoom Limits (for general space view)
    controls.minDistance = 1000; 
    controls.maxDistance = 50000; 

    function updateControls() {
        requestAnimationFrame(updateControls);
        controls.update();
    }
    updateControls(); 

    // 🚀 Function to dynamically adjust zoom for planets
    controls.updateZoomLimits = function (planet) {
        if (!planet) return; // Safety check

        // Get planet size
        const box = new THREE.Box3().setFromObject(planet);
        const size = box.getSize(new THREE.Vector3()).length();

        // 🔹 Calculate zoom limits based on size
        controls.minDistance = size * 1.2;  // Allow close zooming
        controls.maxDistance = size * 10;   // Keep it proportional

        console.log(`🔍 Adjusted zoom for ${planet.name}: Min ${controls.minDistance}, Max ${controls.maxDistance}`);
    };

    return controls;
}
