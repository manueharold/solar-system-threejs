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

    // Default Zoom Limits (used when no planet is selected)
    controls.minDistance = 2000;
    controls.maxDistance = 100000;

    function updateControls() {
        requestAnimationFrame(updateControls);
        controls.update();
    }
    updateControls();

    // 🚀 Dynamically Adjust Zoom Limits Based on Planet Size
    controls.updateZoomLimits = function (planet) {
        if (!planet) return;

        const planetName = planet.name.toLowerCase();
        const box = new THREE.Box3().setFromObject(planet);
        const planetSize = box.getSize(new THREE.Vector3()).length(); // Get planet's bounding size

        // 📌 Manual limits for the Sun and Jupiter
        if (planetName === "sun") {
            controls.minDistance = 100000;  // Prevents zooming in too close
            controls.maxDistance = 300000; // Allows extra zoom out for a better view
        } else if (planetName === "jupiter") {
            controls.minDistance = 30000;
            controls.maxDistance = 150000;
        } else {
            // ✅ Dynamic zoom limits for all other planets
            const minZoomFactor = 2; // Minimum zoom factor (closer for small planets)
            const maxZoomFactor = 4; // Maximum zoom factor (farther for big planets)

            const newMinDistance = planetSize * minZoomFactor; 
            const newMaxDistance = planetSize * maxZoomFactor + 50000; // Allow some extra zoom out space

            controls.minDistance = Math.max(2000, newMinDistance);
            controls.maxDistance = Math.max(60000, newMaxDistance);
        }

        console.log(`🔍 Updated zoom limits for ${planet.name}: Min ${controls.minDistance}, Max ${controls.maxDistance}`);
    };

    return controls;
}
