import { updateOrbitModeAnimation } from './loadOrbitPlanets.js';
import { updatePlanets } from './loadPlanets.js';
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// ================================
// ANIMATION LOOP
// ================================
export function startAnimation(scene, camera, renderer, controls) {
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const deltaTime = clock.getDelta();

        // Update orbit mode animations if active
        updateOrbitModeAnimation(deltaTime);

        // Update default planets animations (only visible in default mode)
        updatePlanets();

        controls.update();
        renderer.render(scene, camera);
    }

    animate();
}
