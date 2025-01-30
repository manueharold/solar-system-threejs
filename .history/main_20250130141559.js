import { initScene } from './initScene.js';
import { initLights } from './initLights.js';
import { initSkybox } from './initSkybox.js';
import { loadPlanets, createSearchButton } from './loadPlanets.js'; 
import { initControls } from './initControls.js';
import { handleResize, handleMouseEvents } from './handleEvents.js';
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import TWEEN from "https://cdn.skypack.dev/@tweenjs/tween.js";

// 🌌 Initialize scene, camera, and renderer
const { scene, camera, renderer } = initScene();

// 💡 Setup lights
initLights(scene);

// 🌠 Setup skybox
initSkybox(scene);

// 🪐 Load all planets
loadPlanets(scene);

// 🎮 Initialize controls
const controls = initControls(camera, renderer);

// 🔍 Create search button for selecting planets
createSearchButton(scene, camera, controls);

// 🖥 Handle resizing & mouse interactions
handleResize(camera, renderer);
handleMouseEvents(scene, camera);

// 🎥 Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    TWEEN.update();  // Ensure smooth animations
    renderer.render(scene, camera);
}
animate();
