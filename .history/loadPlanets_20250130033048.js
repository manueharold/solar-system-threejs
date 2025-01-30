import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Define rotation speeds for planets (fixed values)
const rotationSpeeds = {
    earth: 0.002,
    venus: 0.0025,
    mercury: 0.003,
    mars: 0.002,
    jupiter: 0.001,
    saturn: 0.001,
    uranus: 0.0015,
    neptune: 0.001
};

// Load planet model with specific position and size
function loadPlanetModel(scene, modelPath, position, fixedSize, rotationSpeed) {
    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => {
        const planet = gltf.scene;
        const box = new THREE.Box3().setFromObject(planet);
        const size = box.getSize(new THREE.Vector3());
        const scaleFactor = fixedSize / size.length();
        planet.scale.set(scaleFactor, scaleFactor, scaleFactor);
        planet.position.set(...position);
        scene.add(planet);

        // Set up rotation
        const rotate = () => {
            requestAnimationFrame(rotate);
            planet.rotation.y += rotationSpeed; // Rotation speed
        };
        rotate();
    }, undefined, (error) => {
        console.error(`Error loading ${modelPath.split('/')[2].split('.')[0]} model:`, error);
    });
}

// Load all the planets
export function loadPlanets(scene) {
    // Earth
    loadPlanetModel(scene, './3d_models/earth.glb', [-6000, 0, 0], 1600, rotationSpeeds.earth);
    
    // Venus
    loadPlanetModel(scene, './3d_models/venus.glb', [-8000, 0, 0], 1520, rotationSpeeds.venus);
    
    // Mercury
    loadPlanetModel(scene, './3d_models/mercury.glb', [-10000, 0, 0], 608, rotationSpeeds.mercury);
    
    // Mars
    loadPlanetModel(scene, './3d_models/mars.glb', [-4000, 0, 0], 848, rotationSpeeds.mars);
    
    // Jupiter
    loadPlanetModel(scene, './3d_models/jupiter.glb', [-11000, 0, 0], 17920, rotationSpeeds.jupiter);
    
    // Saturn
    loadPlanetModel(scene, './3d_models/saturn.glb', [-13000, 0, 0], 14560, rotationSpeeds.saturn);
    
    // Uranus
    loadPlanetModel(scene, './3d_models/uranus.glb', [-15000, 0, 0], 6400, rotationSpeeds.uranus);
    
    // Neptune
    loadPlanetModel(scene, './3d_models/neptune.glb', [-17000, 0, 0], 6000, rotationSpeeds.neptune);
    
    // Sun (No rotation for Sun)
    loadPlanetModel(scene, './3d_models/sun.glb', [0, 0, 0], 30000, 0);
}
