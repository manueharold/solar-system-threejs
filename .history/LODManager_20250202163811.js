import { createProceduralPlanet } from './loadPlanets.js'; // Import createProceduralPlanet function

export function createLODPlanet(name, radius, colors, position, scene) {
    const lod = new THREE.LOD();
    const levels = [6, 4, 2];

    levels.forEach((detail, index) => {
        const planet = createProceduralPlanet(name, radius, detail, colors[index], position, scene);
        lod.addLevel(planet, index * 3000);
    });

    scene.add(lod);
    return lod;
}
