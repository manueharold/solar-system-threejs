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

     // Set initial zoom limits (default: Earth)
     controls.minDistance = planetZoomLimits.earth.min;
     controls.maxDistance = planetZoomLimits.earth.max;
 
     function updateControls() {
         requestAnimationFrame(updateControls);
         controls.update();
     }
     updateControls();

     // 🚀 Dynamically Adjust Zoom Limits Based on Selected Planet
     controls.updateZoomLimits = function (planet) {
        if (!planet) {
            console.log("🌍 No planet selected, applying default zoom.");
            controls.minDistance = 2000;
            controls.maxDistance = 1000000;
            return;
        }

        const planetName = planet.name.toLowerCase();
        const zoomLimits = planetZoomLimits[planetName];

        if (zoomLimits) {
            controls.minDistance = zoomLimits.min;
            controls.maxDistance = zoomLimits.max;
        } else {
            controls.minDistance = 2000;
            controls.maxDistance = 100000;
        }

        console.log(`🔍 Updated zoom limits for ${planet.name}: Min ${controls.minDistance}, Max ${controls.maxDistance}`);
    };

    return controls;
}

