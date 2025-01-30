import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

export function initControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.zoomSpeed = 2;
    controls.enableZoom = true; // ✅ Ensure zoom is enabled by default

    // Default Zoom Limits
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

        if (planetName === "sun" || planetName === "jupiter") {
            // 📌 Instead of fully disabling zoom, set a high minimum distance
            controls.enableZoom = true; // Ensure zoom remains enabled globally
            controls.minDistance = 75000; // Prevent close zoom-in
            controls.maxDistance = 120000; // Keep a reasonable zoom-out range
            console.log(`🚫 Restricted zoom for ${planet.name}`);
        } else {
            // ✅ Enable zooming for other planets and adjust limits dynamically
            controls.enableZoom = true;

            const box = new THREE.Box3().setFromObject(planet);
            const planetSize = box.getSize(new THREE.Vector3()).length();

            const minZoomFactor = 2;
            const maxZoomFactor = 4;

            controls.minDistance = Math.max(2000, planetSize * minZoomFactor);
            controls.maxDistance = Math.max(60000, planetSize * maxZoomFactor + 50000);

            console.log(`🔍 Zooming enabled for ${planet.name}: Min ${controls.minDistance}, Max ${controls.maxDistance}`);
        }
    };

    // 🚨 Ensure zoom is restricted on the Sun at startup
    setTimeout(() => {
        controls.updateZoomLimits({ name: "sun" });
    }, 100);

    return controls;
}
