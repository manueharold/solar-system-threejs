import { orbitalParameters } from './orbitalParameters.js';

let orbitActive = false;

export function startOrbitMode(planets) {
    orbitActive = true;
    console.log("🌍 Orbit Mode Activated!");
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
