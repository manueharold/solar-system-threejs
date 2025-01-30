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
function loadPlanetModel(scene, modelPath, position, fixedSize) {
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
            planet.rotation.y += rotationSpeeds[modelPath.split('/')[2].split('.')[0]]; // Get correct speed based on model name
        };
        rotate();
    }, undefined, (error) => {
        console.error(`Error loading ${modelPath.split('/')[2].split('.')[0]} model:`, error);
    });
}

// Load all the planets
export function loadPlanets(scene) {
    // Earth
    loadPlanetModel(scene, './3d_models/earth.glb', [-6000, 0, 0], 1600);
    
    // Venus
    loadPlanetModel(scene, './3d_models/venus.glb', [-5000, 0, 0], 1600);
    
    // Mercury
    loadPlanetModel(scene, './3d_models/mercury.glb', [-7000, 0, 0], 1600);
    
    // Mars
    loadPlanetModel(scene, './3d_models/mars.glb', [-9000, 0, 0], 1600);
    
    // Jupiter
    loadPlanetModel(scene, './3d_models/jupiter.glb', [-11000, 0, 0], 1600);
    
    // Saturn
    loadPlanetModel(scene, './3d_models/saturn.glb', [-13000, 0, 0], 1600);
    
    // Uranus
    loadPlanetModel(scene, './3d_models/uranus.glb', [-15000, 0, 0], 1600);
    
    // Neptune
    loadPlanetModel(scene, './3d_models/neptune.glb', [-17000, 0, 0], 1600);
    
    // Sun (No rotation for Sun)
    loadPlanetModel(scene, './3d_models/sun.glb', [0, 0, 0], 1600);
}
