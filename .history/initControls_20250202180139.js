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
        sun: { min: 8000, max: 50000 }, // ✅ Added min zoom-in limit to prevent going inside
        mercury: { min: 2000, max: 50000 },
        venus: { min: 3000, max: 50000 },
        earth: { min: 4000, max: 50000 },
        moon: { min: 3000, max: 50000 }, 
        mars: { min: 3000, max:50000 },
        jupiter: { min: 5000, max: 50000 },
        saturn: { min: 10000, max: 50000 },
        uranus: { min: 10000, max: 50000 },
        neptune: { min: 10000, max: 50000 }
    };

    controls.minDistance = planetZoomLimits.earth.min;  
    controls.maxDistance = planetZoomLimits.earth.max;  

    // 🚀 Dynamically Adjust Zoom Limits Based on Selected Planet
    controls.updateZoomLimits = function (planetName) {
        if (!planetName) {
            console.log("🌍 No planet selected, applying default zoom.");
            controls.minDistance = 50000;
            controls.maxDistance = 1000000;
            return;
        }
    
        const zoomLimits = planetZoomLimits[planetName.toLowerCase()];
        if (zoomLimits) {
            controls.minDistance = zoomLimits.min;
            controls.maxDistance = zoomLimits.max;
        } else {
            controls.minDistance = 10000;
            controls.maxDistance = 1000000;
        }
    
        // Correct check for the Sun
        if (planetName.toLowerCase() === 'sun') {
            controls.minDistance = 8000;
            controls.maxDistance = planetZoomLimits.sun.max;
        }
    
        console.log(`🔍 Updated zoom limits for ${planetName}: Min ${controls.minDistance}, Max ${controls.maxDistance}`);
    };
    

    function updateControls() {
        requestAnimationFrame(updateControls);
        controls.update();
    }
    updateControls();

    return controls;
}
