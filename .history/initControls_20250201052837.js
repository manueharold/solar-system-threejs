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

    controls.minDistance = planetZoomLimits.earth.min;  
    controls.maxDistance = planetZoomLimits.earth.max;  

    // 🚀 Dynamically Adjust Zoom Limits Based on Selected Planet
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

        // Explicitly set zoom limits for the Sun
        if (planetName.toLowerCase() === 'sun') {
            controls.minDistance = planetZoomLimits.sun.min; // Set Sun's min zoom-in limit
            controls.maxDistance = planetZoomLimits.sun.max; // Set Sun's max zoom-out limit
        }

        console.log(`🔍 Updated zoom limits for ${planetName}: Min ${controls.minDistance}, Max ${controls.maxDistance}`);
    };

    // 🚀 Fix zoom limit issues for the Sun
    controls.addEventListener('change', function() {
        if (controls.object.position.distanceTo(controls.target) < planetZoomLimits.sun.min) {
            // Prevent zooming inside the Sun (for the Sun only)
            const direction = new THREE.Vector3().subVectors(controls.object.position, controls.target).normalize();
            controls.object.position.copy(controls.target).add(direction.multiplyScalar(planetZoomLimits.sun.min));
        }
    });

    function updateControls() {
        requestAnimationFrame(updateControls);
        controls.update();
    }
    updateControls();

    return controls;
}
