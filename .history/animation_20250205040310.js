import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { updateOrbitModeAnimation } from './loadOrbitPlanets.js';
import { updatePlanets } from './loadPlanets.js';

export function startAnimation(scene, camera, renderer, controls) {
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const deltaTime = clock.getDelta();

        // Update orbit mode animations if active
        updateOrbitModeAnimation(deltaTime);

        // Update default planets animations (rotations, other effects)
        updatePlanets(deltaTime);

        controls.update();
        renderer.render(scene, camera);
    }

    animate();
}