import { orbitalParameters } from './orbitalParameters.js';
import gsap from "https://cdn.skypack.dev/gsap";

let orbitActive = false;


export function startOrbitMode(planets) {
    orbitActive = true;
    console.log("🌍 Orbit Mode Activated!");

    // Optionally, reposition the camera to a better view:
    gsap.to(camera.position, {
      duration: 2,
      x: 0,
      y: 5000000,  // adjust these values as needed
      z: 5000000,
      ease: "power2.out",
      onUpdate: () => {
        camera.lookAt(new THREE.Vector3(0, 0, 0));
      }
    });
}


export function stopOrbitMode(planets) {
    orbitActive = false;
    console.log("🌍 Reverting to Default Mode!");

    // Reset planets to their original positions (if stored)
    for (const planetName in planets) {
        const planet = planets[planetName];
        if (planet.userData.originalPosition) {
            planet.position.copy(planet.userData.originalPosition);
        }
    }
}

export function updateOrbitPositions(deltaTime, planets) {
    if (!orbitActive) return;
    console.log("Updating orbit positions...");  // Debug log

    for (const planetName in orbitalParameters) {
        if (planetName === 'sun') continue;

        const params = orbitalParameters[planetName];
        params.angle += params.angularSpeed * deltaTime;

        const x = params.distance * Math.cos(params.angle);
        const z = params.distance * Math.sin(params.angle);

        if (planetName === 'moon' && planets['earth']) {
            const earthPos = planets['earth'].position;
            planets['moon'].position.set(
                earthPos.x + params.distance * Math.cos(params.angle),
                earthPos.y,
                earthPos.z + params.distance * Math.sin(params.angle)
            );
        } else if (planets[planetName]) {
            planets[planetName].position.set(x, 0, z);
        }
    }
}
