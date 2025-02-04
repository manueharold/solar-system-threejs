export function createLODPlanet(name, radius, textureURL, position, scene) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(textureURL);

    const geometry = new THREE.IcosahedronGeometry(radius, 4);  // Lower detail for distant planets
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 1,
        metalness: 0
    });

    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(...position);
    planet.name = name;
    scene.add(planet);
}
