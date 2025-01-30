import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Function to load a planet model
function loadPlanetModel(scene, modelPath, position, scaleFactor) {
    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => {
        const planet = gltf.scene;
        const box = new THREE.Box3().setFromObject(planet);
        const size = box.getSize(new THREE.Vector3());
        const scale = scaleFactor / size.length();
        planet.scale.set(scale, scale, scale);
        planet.position.set(...position);
        scene.add(planet);
    }, undefined, (error) => {
        console.error('Error loading model:', error);
    });
}

// Load all the planets with the correct positions and sizes as per the original script
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
    
    // Sun
    loadPlanetModel(scene, './3d_models/sun.glb', [0, 0, 0], 1600);
}
