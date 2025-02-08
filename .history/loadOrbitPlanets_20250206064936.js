import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";
import { loadPlanets } from "./loadPlanets.js";

// Orbital parameters (radii and speeds)
const orbitalData = {
    mercury: { radius: 0.39, speed: 0.02 },
    venus: { radius: 0.72, speed: 0.01 },
    earth: { radius: 1.0, speed: 0.005 },
    mars: { radius: 1.52, speed: 0.003 },
    jupiter: { radius: 5.2, speed: 0.001 },
    saturn: { radius: 9.58, speed: 0.0005 },
    uranus: { radius: 19.18, speed: 0.00025 },
    neptune: { radius: 30.07, speed: 0.000125 },
};

export function loadOrbitPlanets(scene, camera, controls) {
    loadPlanets(scene, camera, controls);

    const sunGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.name = "Sun";
    scene.add(sun);

    const planets = {};

    Object.keys(orbitalData).forEach((planetName) => {
        const planet = scene.getObjectByName(planetName);
        if (planet) {
            const { radius } = orbitalData[planetName];
            planet.orbitRadius = radius;
            planet.orbitAngle = Math.random() * Math.PI * 2;
            planet.position.set(radius, 0, 0);
            planets[planetName] = planet;
        }
    });

    function animateOrbits() {
        Object.keys(planets).forEach((planetName) => {
            const planet = planets[planetName];
            const { radius, speed } = orbitalData[planetName];

            planet.orbitAngle += speed;
            planet.position.x = radius * Math.cos(planet.orbitAngle);
            planet.position.z = radius * Math.sin(planet.orbitAngle);
        });

        requestAnimationFrame(animateOrbits);
    }

    animateOrbits();
}

export function updateOrbitModeAnimation(deltaTime, scene) {
    // You may add additional logic here for specific updates per frame during orbit mode
    console.log("Updating orbit mode animation", deltaTime);
}
