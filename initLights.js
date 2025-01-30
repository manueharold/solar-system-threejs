import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

export function initLights(scene) {
    // Point light to simulate a light source (like a star)
    const light = new THREE.PointLight(0xffffff, 2, 200);  // Increased distance for a larger light radius
    light.position.set(100, 100, 100);  // Moved to a higher position in the scene to avoid overlap
    scene.add(light);

    // Directional light to simulate sunlight
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(100, 100, 100); // Moved to a different position for more dynamic lighting
    sunLight.castShadow = true; // Enable shadows for more realism
    scene.add(sunLight);

    // Optionally, you can adjust the shadow properties
    sunLight.shadow.mapSize.width = 1024;  // Default is 512, increase for higher resolution shadows
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;  // Near clipping plane for shadow camera
    sunLight.shadow.camera.far = 500;   // Far clipping plane for shadow camera

    // Ambient light to brighten all areas of the scene evenly
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);  // Soft white ambient light
    scene.add(ambientLight);
}
