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

    // 🚀 Predefined Zoom Limits for Each Planet
    const planetZoomLimits = {
        sun: { min: 90000, max: 5000000 },
        mercury: { min: 1000, max: 5000 },
        venus: { min: 2000, max: 8000 },
        earth: { min: 5000, max: 10000 },
        moon: { min: 500, max: 3000 },
        mars: { min: 1500, max: 7000 },
        jupiter: { min: 90000, max: 100000 },
        saturn: { min: 12000, max: 50000 },
        uranus: { min: 7000, max: 35000 },
        neptune: { min: 7000, max: 35000 }
    };

    // Set initial zoom limits (default: Earth)
    controls.minDistance = planetZoomLimits.earth.min;
    controls.maxDistance = planetZoomLimits.earth.max;

    function updateControls() {
        requestAnimationFrame(updateControls);
        controls.update();
    }
    updateControls();

    // 🚀 Dynamically Adjust Zoom Limits Based on Selected Planet
    controls.updateZoomLimits = function (planet, scene) {
        if (!planet) {
            console.log("🌍 No planet selected, applying default zoom.");
            controls.minDistance = 2000;
            controls.maxDistance = 1000000;
            return;
        }

        const planetName = planet.name.toLowerCase();
        const zoomLimits = planetZoomLimits[planetName];

        if (zoomLimits) {
            // Apply predefined zoom limits
            controls.minDistance = zoomLimits.min;
            controls.maxDistance = zoomLimits.max;
        } else if (scene) {
            // Dynamically calculate zoom limits if no predefined limits are available
            const targetPlanet = scene.getObjectByName(planet.name);
            if (targetPlanet) {
                const planetSize = new THREE.Box3().setFromObject(targetPlanet).getSize(new THREE.Vector3()).length();
                const dynamicMin = Math.max(500, planetSize * 0.5); // Example calculation for min zoom
                const dynamicMax = Math.min(5000000, planetSize * 20); // Example calculation for max zoom
                controls.minDistance = dynamicMin;
                controls.maxDistance = dynamicMax;
                console.log(`🌌 Dynamic zoom limits calculated for ${planet.name}: Min ${dynamicMin}, Max ${dynamicMax}`);
            } else {
                console.warn(`⚠️ Planet "${planet.name}" not found in the scene! Using default limits.`);
                controls.minDistance = 2000;
                controls.maxDistance = 100000;
            }
        } else {
            // Apply default zoom limits if no scene or predefined data is available
            controls.minDistance = 2000;
            controls.maxDistance = 100000;
        }

        console.log(`🔍 Updated zoom limits for ${planet.name}: Min ${controls.minDistance}, Max ${controls.maxDistance}`);
    };

    return controls;
}
