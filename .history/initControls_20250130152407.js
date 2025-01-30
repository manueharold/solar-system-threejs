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

    // 🚀 Dynamically Adjust Zoom Limits Based on Planet Size
    controls.updateZoomLimits = function (planet) {
        if (!planet) return;

        const planetName = planet.name.toLowerCase();

        if (planetName === "sun" || planetName === "jupiter") {
            // 📌 Fully disable zooming for Sun and Jupiter
            controls.enableZoom = true;
            controls.minDistance = 2000; // Minimum zoom distance (farther away)
            controls.maxDistance = 150000; // Allow zooming out
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

    // 🚨 Check if the default planet is the Sun and disable zoom immediately
    setTimeout(() => {
        controls.updateZoomLimits({ name: "sun" }); 
    }, 100); 

    return controls;
}
