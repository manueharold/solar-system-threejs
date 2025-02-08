import { initScene } from './initScene.js';
import { initLights } from './initLights.js';
import { initSkybox } from './initSkybox.js';
import { loadPlanets } from './loadPlanets.js';
import { initControls } from './initControls.js';
import { handleResize, handleMouseEvents } from './handleEvents.js';
import { initSpaceshipMode } from './spaceshipHandler.js';
import { setupModeToggles } from './modes.js';
import { setupSearchFunctionality } from './searchHandler.js';
import { comparePlanets, hideNonComparedPlanets, showAllPlanets } from './comparePlanets.js';
import { updateOrbitModeAnimation } from './loadOrbitPlanets.js';

// Wrap everything in DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // INITIALIZATION
    const { scene, camera, renderer } = initScene();
    let orbitModeActive = false; // ✅ Controls orbit animation

    const controls = initControls(camera, renderer);
    const spaceshipControls = initSpaceshipMode(camera, controls);

    // Set renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    initLights(scene);
    initSkybox(scene);
    loadPlanets(scene);
    handleResize(camera, renderer);
    handleMouseEvents(scene, camera);

    // ✅ Setup mode toggles and pass the callback to control animation
    setupModeToggles(scene, camera, controls, (isActive) => {
        orbitModeActive = isActive; // Toggle animation loop
    });

    setupSearchFunctionality(scene, camera, controls);

    // ANIMATION LOOP
    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const deltaTime = clock.getDelta();

        if (orbitModeActive) {
            updateOrbitModeAnimation(deltaTime, scene);
        }

        renderer.render(scene, camera);
        controls.update();
    }
    animate();
});
