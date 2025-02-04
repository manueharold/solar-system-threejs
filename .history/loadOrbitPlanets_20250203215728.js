import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";

let orbitModel = null; // Orbit system model is no longer needed
let mixer = null; // THREE.AnimationMixer instance
let planets = {};

export function loadOrbitPlanets(scene, camera, controls) {
    // Hide the default planets group (but don't remove them)
    const defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
    if (defaultPlanetsGroup) {
        defaultPlanetsGroup.visible = false;  // Hide default planets
        console.log("Hid default planets group.");
    }

    // Re-use planets from loadPlanets.js
    for (const planetName in planets) {
        const planet = planets[planetName];

        // If the planet isn't the moon, make it orbit around the sun
        if (planetName !== "moon") {
            // Set the orbit path for the planet (we'll calculate a circular orbit)
            const radius = planet.userData.orbitDistance;  // Use user data for orbit distance
            const speed = planet.userData.orbitSpeed; // Use user data for orbit speed

            // Animate the planet along its orbit path
            gsap.to(planet.position, {
                x: radius * Math.cos(speed),
                z: radius * Math.sin(speed),
                duration: 1,
                repeat: -1, // Repeat indefinitely for continuous orbit
                ease: "none",
            });
        }
    }

    // Update camera and controls for the orbiting system
    const sun = scene.getObjectByName("sun");
    if (sun) {
        controls.target.set(sun.position.x, sun.position.y, sun.position.z);
    }

    console.log('✅ Planets are now orbiting the Sun.');
}

// Update the animation in the render loop
export function updateOrbitModeAnimation(deltaTime) {
    if (mixer) {
        mixer.update(deltaTime);
    }

    // Manually update planets' orbit positions
    for (const planetName in planets) {
        const planet = planets[planetName];
        if (planetName !== "moon") {
            const radius = planet.userData.orbitDistance;
            const speed = planet.userData.orbitSpeed;
            planet.position.x = radius * Math.cos(speed * Date.now() * 0.0001);
            planet.position.z = radius * Math.sin(speed * Date.now() * 0.0001);
        }
    }
}
