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

    // Ensure dollyIn is available before overriding
    if (typeof controls.dollyIn === "function") {
        const originalDollyIn = controls.dollyIn.bind(controls);

        controls.updateZoomLimits = function (planet) {
            if (!planet) return;

            const planetName = planet.name.toLowerCase();

            if (planetName === "sun" || planetName === "jupiter") {
                // 📌 Disable zooming in but allow zooming out
                controls.enableZoom = true;
                controls.dollyIn = function () {}; // Prevent zoom-in
                console.log(`🚫 Zoom-in disabled for ${planet.name}, but zoom-out is allowed.`);
            } else {
                // ✅ Restore normal zooming for other planets
                controls.enableZoom = true;
                controls.dollyIn = originalDollyIn; // Restore zoom-in function

                const box = new THREE.Box3().setFromObject(planet);
                const planetSize = box.getSize(new THREE.Vector3()).length();

                const minZoomFactor = 2;
                const maxZoomFactor = 4;

                controls.minDistance = Math.max(2000, planetSize * minZoomFactor);
                controls.maxDistance = Math.max(60000, planetSize * maxZoomFactor + 50000);

                console.log(`🔍 Zooming enabled for ${planet.name}: Min ${controls.minDistance}, Max ${controls.maxDistance}`);
            }
        };
    }

    // 🚨 Check if the default planet is the Sun and disable zoom immediately
    setTimeout(() => {
        controls.updateZoomLimits({ name: "sun" }); 
    }, 100); 

    return controls;
}
