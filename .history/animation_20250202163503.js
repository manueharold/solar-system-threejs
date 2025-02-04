import { loadPlanets } from './loadPlanets.js';
import { updateOrbitModeAnimation } from './loadOrbitPlanets.js';
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// ================================
// ANIMATION LOOP
// ================================
export function startAnimation(scene, camera, renderer, controls) {
    const clock = new THREE.Clock();

    // Load planets when animation starts
    const { planets, rotationSpeeds, moonOrbitPaused } = loadPlanets(scene);  // Destructure the returned values

    function animate() {
        requestAnimationFrame(animate);

        const deltaTime = clock.getDelta();

        // Update orbit mode animations if active
        updateOrbitModeAnimation(deltaTime);

        // Rotate Planets & Orbit Moon
        for (const planetName in planets) {
            const planet = planets[planetName];
            if (rotationSpeeds[planetName]) {
                planet.rotation.y += rotationSpeeds[planetName];
            }
        }

        if (!moonOrbitPaused && planets["moon"] && planets["earth"]) {
            const time = Date.now() * 0.0005;
            const moonDistance = 38000;
            planets["moon"].position.x = planets["earth"].position.x + Math.cos(time) * moonDistance;
            planets["moon"].position.z = planets["earth"].position.z + Math.sin(time) * moonDistance;
        }

        controls.update();
        renderer.render(scene, camera);
    }

    animate();
}
