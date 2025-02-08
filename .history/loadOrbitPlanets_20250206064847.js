import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";
import { loadPlanets } from "./loadPlanets.js";

// Orbital parameters (radii and speeds)
const orbitalData = {
    mercury: { radius: 0.39, speed: 0.02 }, // radius in AU, speed in radians per frame
    venus: { radius: 0.72, speed: 0.01 },
    earth: { radius: 1.0, speed: 0.005 },
    mars: { radius: 1.52, speed: 0.003 },
    jupiter: { radius: 5.2, speed: 0.001 },
    saturn: { radius: 9.58, speed: 0.0005 },
    uranus: { radius: 19.18, speed: 0.00025 },
    neptune: { radius: 30.07, speed: 0.000125 },
    // Add other planets or moons as needed
};

export function loadOrbitPlanets(scene, camera, controls) {
    // Load the planets from the loadPlanets.js module
    loadPlanets(scene, camera, controls);

    // Create the Sun (center of the solar system)
    const sunGeometry = new THREE.SphereGeometry(0.1, 32, 32); // Radius of Sun
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.name = "Sun";
    scene.add(sun);

    // Store planet objects for easy access and animation
    const planets = {};

    // Create planets and set their initial positions based on orbital data
    Object.keys(orbitalData).forEach((planetName) => {
        const planet = scene.getObjectByName(planetName);
        if (planet) {
            const { radius } = orbitalData[planetName];
            planet.orbitRadius = radius;
            planet.orbitAngle = Math.random() * Math.PI * 2; // Random starting angle
            planet.position.set(radius, 0, 0); // Set the initial position along the X-axis
            planets[planetName] = planet;
        }
    });

    // Animate planets in orbit around the Sun using GSAP
    function animateOrbits() {
        Object.keys(planets).forEach((planetName) => {
            const planet = planets[planetName];
            const { radius, speed } = orbitalData[planetName];

            // Update the planet's position based on its orbital speed and radius
            planet.orbitAngle += speed;
            planet.position.x = radius * Math.cos(planet.orbitAngle);
            planet.position.z = radius * Math.sin(planet.orbitAngle);
        });

        // Call the animateOrbits function every frame
        requestAnimationFrame(animateOrbits);
    }

    animateOrbits();
}
