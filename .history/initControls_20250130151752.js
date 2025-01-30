import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

export function initControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.zoomSpeed = 2;
    controls.enableZoom = true; // Ensure zoom is enabled globally

    // Default Zoom Limits (Preserved)
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
            // 📌 Prevent zooming in too close but allow zooming out
            controls.enableZoom = true;
            controls.minDistance = Math.max(controls.minDistance, 75000); // Prevent zooming too close
            controls.maxDistance = 100000; // Keep the original max distance
            console.log(`🚫 Zoom-in restricted for ${planet.name}, but zoom-out is allowed.`);
        } else {
            // ✅ Enable zooming in and out for other planets
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

    // 🚨 Ensure zoom is restricted on the Sun at startup (but default zoom is unchanged)
    setTimeout(() => {
        controls.updateZoomLimits({ name: "sun" });
    }, 100);

    return controls;
}
