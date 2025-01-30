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
        const box = new THREE.Box3().setFromObject(planet);
        const planetSize = box.getSize(new THREE.Vector3()).length();

        if (planetName === "sun" || planetName === "jupiter") {
            // 🚫 Prevent zooming in by locking minDistance to a higher value
            controls.minDistance = Math.max(defaultMinDistance, 10000); // Set to a higher value to prevent zooming in
            console.log(`🚫 Zoom-in disabled for ${planet.name}, but zoom-out is allowed.`);
        } else {
            // ✅ Adjust minDistance dynamically based on planet size
            const minZoomFactor = 2.5; // Increased factor to make small planets more visible
            const maxZoomFactor = 4;

            controls.minDistance = Math.max(defaultMinDistance, planetSize * minZoomFactor);
            controls.maxDistance = Math.max(defaultMaxDistance, planetSize * maxZoomFactor + 50000);

            console.log(`🔍 Zooming enabled for ${planet.name}: Min ${controls.minDistance}, Max ${controls.maxDistance}`);
        }
    };

    // 🚨 Set default zoom limits if the initial planet is the Sun
    setTimeout(() => {
        controls.updateZoomLimits({ name: "sun" });
    }, 100);

    return controls;
}