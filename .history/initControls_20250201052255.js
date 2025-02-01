import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

export function initControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.zoomSpeed = 1.5; // ✅ Adjusted for smoother zooming

    // 🚀 Predefined Zoom Limits for Each Planet
    const planetZoomLimits = {
        sun: { min: 5000, max: 15000 }, // ✅ Added min zoom-in limit to prevent going inside
        mercury: { min: 1000, max: 5000 },
        venus: { min: 2000, max: 8000 },
        earth: { min: 5000, max: 15000 },
        moon: { min: 500, max: 5000 },
        mars: { min: 1500, max: 8000 },
        jupiter: { min: 50000, max: 150000 },
        saturn: { min: 12000, max: 60000 },
        uranus: { min: 7000, max: 40000 },
        neptune: { min: 7000, max: 40000 }
    };

    // Set default zoom limits to Earth
    controls.minDistance = planetZoomLimits.earth.min;
    controls.maxDistance = planetZoomLimits.earth.max;

    // Function to dynamically adjust zoom limits based on the selected planet
    controls.updateZoomLimits = function (planetName) {
        if (!planetName) {
            console.log("🌍 No planet selected, applying default zoom.");
            controls.minDistance = 2000;
            controls.maxDistance = 1000000;
            return;
        }

        const zoomLimits = planetZoomLimits[planetName.toLowerCase()];
        if (zoomLimits) {
            controls.minDistance = zoomLimits.min;
            controls.maxDistance = zoomLimits.max;
        } else {
            controls.minDistance = 2000;
            controls.maxDistance = 1000000;
        }

        console.log(`🔍 Updated zoom limits for ${planetName}: Min ${controls.minDistance}, Max ${controls.maxDistance}`);
    };

    // 🚀 Apply a zoom-in limit when the camera focuses on the Sun
    function enforceSunZoomLimit() {
        const sunMinZoom = 5000; // Minimum zoom distance for the Sun
        if (controls.target && controls.target.equals(controls.scene.getObjectByName('sun').position)) {
            if (camera.position.distanceTo(controls.target) < sunMinZoom) {
                camera.position.setLength(sunMinZoom); // Keep the zoom level at least as far as the min limit for the Sun
            }
        }
    }

    function updateControls() {
        requestAnimationFrame(updateControls);
        controls.update();
        enforceSunZoomLimit(); // Apply the Sun's zoom-in limit
    }
    updateControls();

    return controls;
}
