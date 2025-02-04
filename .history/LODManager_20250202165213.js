export function createLODPlanet(name, radius, colors, position, scene) {
    // Create planet geometry and material with LOD
    const geometry = new THREE.IcosahedronGeometry(radius, 4);  // Lower detail for distant planets
    const material = new THREE.MeshStandardMaterial({
        color: colors[0],
        roughness: 1,
        metalness: 0
    });

    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(...position);
    planet.name = name;
    scene.add(planet);
}
