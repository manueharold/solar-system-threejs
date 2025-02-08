// loadOrbitPlanets.js
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// Store references to planets and their orbit speeds
let planets = [];
let clock = new THREE.Clock(); // For updating animation timing

export function loadOrbitPlanets(scene, camera, controls) {
    // Find the Sun in the scene
    const sun = scene.getObjectByName("sun");
    if (!sun) {
        console.error("☀️ Sun not found in the scene!");
        return;
    }

    // Collect all planets except the sun
    const planetNames = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
    planets = [];
    
    scene.traverse((child) => {
        if (child.name && planetNames.includes(child.name)) {
            planets.push({
                object: child,
                radius: child.position.distanceTo(sun.position), // Distance from the Sun
                speed: 0.2 / child.position.distanceTo(sun.position) // Adjust speed dynamically
            });
            console.log(`✅ ${child.name} added for orbiting.`);
        }
    });
}

export function updateOrbitModeAnimation() {
    const elapsedTime = clock.getElapsedTime();
    
    planets.forEach(({ object, radius, speed }, index) => {
        const angle = elapsedTime * speed; // Determine current angle
        
        object.position.x = Math.cos(angle) * radius + 0; // Orbit around Sun
        object.position.z = Math.sin(angle) * radius + 0;
    });
}

export function animate(renderer, scene, camera, controls) {
    requestAnimationFrame(() => animate(renderer, scene, camera, controls));
    updateOrbitModeAnimation();
    controls.update();
    renderer.render(scene, camera);
}
