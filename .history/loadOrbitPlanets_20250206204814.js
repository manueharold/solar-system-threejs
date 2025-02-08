import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";

// Store planets and their orbital parameters
let orbitingPlanets = [];
const orbitalData = {
    mercury: { radius: 10, speed: 0.04 },
    venus: { radius: 15, speed: 0.03 },
    earth: { radius: 20, speed: 0.02 },
    mars: { radius: 25, speed: 0.015 },
    jupiter: { radius: 35, speed: 0.008 },
    saturn: { radius: 45, speed: 0.006 },
    uranus: { radius: 55, speed: 0.004 },
    neptune: { radius: 65, speed: 0.002 }
};

export function loadOrbitPlanets(scene) {
    const sun = scene.getObjectByName("sun");
    if (!sun) {
        console.error("❌ Sun not found in the scene!");
        return;
    }

    orbitingPlanets = [];
    
    scene.traverse((child) => {
        if (child.name && orbitalData[child.name]) {
            orbitingPlanets.push({
                object: child,
                angle: Math.random() * Math.PI * 2,
                ...orbitalData[child.name]
            });
            console.log(`✅ ${child.name} added for orbiting.`);
        }
    });
}

export function updateOrbitModeAnimation(deltaTime) {
    orbitingPlanets.forEach(planet => {
        planet.angle += planet.speed * deltaTime;
        planet.object.position.x = planet.radius * Math.cos(planet.angle);
        planet.object.position.z = planet.radius * Math.sin(planet.angle);
    });
}
