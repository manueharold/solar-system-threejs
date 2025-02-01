import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import gsap from "https://cdn.skypack.dev/gsap";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// Create a loader instance for orbit mode
const orbitLoader = new GLTFLoader();

// Store references to planets
const planetData = {
    mercury: { radius: 200, speed: 8.8 },  // Speeds relative to Earth's orbit
    venus: { radius: 350, speed: 6.5 },
    earth: { radius: 500, speed: 5.0 },
    mars: { radius: 750, speed: 4.2 },
    jupiter: { radius: 1200, speed: 2.0 },
    saturn: { radius: 1600, speed: 1.6 },
    uranus: { radius: 2000, speed: 1.2 },
    neptune: { radius: 2300, speed: 1.0 },
};

// Store planet objects
const planets = {};

export function loadOrbitModeModel(scene, camera, controls) {
    // Remove existing planets
    Object.keys(planetData).forEach((name) => {
        const planet = scene.getObjectByName(name);
        if (planet) scene.remove(planet);
    });

    // Load the Solar System model (e.g., the Sun and orbit rings)
    orbitLoader.load(
        './3d_models_compressed/solar_system.glb',
        (gltf) => {
            const orbitModel = gltf.scene;
            orbitModel.name = 'orbitModeModel';
            scene.add(orbitModel);

            console.log('✅ Orbit Mode model loaded.');

            // Position the camera
            controls.target.set(0, 0, 0);
            gsap.to(camera.position, {
                duration: 2,
                x: 0,
                y: 3000,
                z: 3000,
                ease: "power2.out",
                onUpdate: () => camera.lookAt(0, 0, 0),
            });

            // Find planets in the model and animate them
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    const planetName = child.name.toLowerCase();
                    if (planetData[planetName]) {
                        planets[planetName] = child;
                        startOrbitAnimation(child, planetName);
                    }
                }
            });
        },
        undefined,
        (error) => console.error('❌ Failed to load Orbit Mode model:', error)
    );
}

// Function to animate a planet in an elliptical orbit
function startOrbitAnimation(planet, name) {
    const { radius, speed } = planetData[name];

    gsap.to(planet.position, {
        duration: speed,
        repeat: -1,
        ease: "linear",
        motionPath: {
            path: [
                { x: radius, z: 0 },
                { x: 0, z: radius * 0.8 },  // Slightly elliptical orbit
                { x: -radius, z: 0 },
                { x: 0, z: -radius * 0.8 },
                { x: radius, z: 0 },
            ],
            type: "cubic",
        },
    });
}
