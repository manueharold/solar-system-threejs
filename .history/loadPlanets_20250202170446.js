import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import SimplexNoise from "https://cdn.skypack.dev/simplex-noise@2.4.0";  // Import SimplexNoise
import { atmosphereShader } from './atmosphereShader.js'; // Import atmosphere shader
import { createLODPlanet } from './LODManager.js'; // Import LOD manager
import { showPlanetInfo, hidePlanetInfo } from "./planetInfo.js";

const textureLoader = new THREE.TextureLoader();

// 🌎 Rotation Speeds
const baseRotationSpeed = 0.002;
const rotationSpeeds = {
    earth: baseRotationSpeed / 1,
    venus: baseRotationSpeed / 243,
    mercury: baseRotationSpeed / 58.6,
    mars: baseRotationSpeed / 1.03,
    jupiter: baseRotationSpeed / 0.41,
    saturn: baseRotationSpeed / 0.45,
    uranus: baseRotationSpeed / 0.72,
    neptune: baseRotationSpeed / 0.67
};

let planets = {}; // Store generated planets
let moonOrbitPaused = false;

// ✅ Create Procedural Planet with Atmosphere and LOD
export function createProceduralPlanet(name, radius, detail, color, position, scene) {
    // Generate planet geometry
    const geometry = new THREE.IcosahedronGeometry(radius, detail);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.5, // Adjust this if too high
        metalness: 0
    });

    // Apply noise for terrain
    const noise = new SimplexNoise(); // Correctly initialize SimplexNoise
    const vertices = geometry.attributes.position;
    
    for (let i = 0; i < vertices.count; i++) {
        let vertex = new THREE.Vector3().fromBufferAttribute(vertices, i);
        let elevation = noise.noise3D(vertex.x, vertex.y, vertex.z); // Ensure noise3D is called correctly
        vertex.multiplyScalar(1 + elevation * 0.1); // Adjust the elevation
        vertices.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    geometry.computeVertexNormals();
    
    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(...position);
    planet.name = name;
    scene.add(planet);

    planets[name.toLowerCase()] = planet; // Store reference
    
    // Add atmosphere effect to the planet
    createAtmosphere(radius, scene);

    return planet;
}

// ✅ Create Atmosphere (Atmosphere Shader)
export function createAtmosphere(radius, scene) {
    const geometry = new THREE.SphereGeometry(radius * 1.1, 32, 32);
    const material = new THREE.ShaderMaterial({
        vertexShader: atmosphereShader.vertexShader,
        fragmentShader: atmosphereShader.fragmentShader,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });

    const atmosphere = new THREE.Mesh(geometry, material);
    scene.add(atmosphere);
    return atmosphere;
}

// ✅ Load Procedural Planets with LOD into Scene
export function loadPlanets(scene) {
    sceneRef = scene;
    planets = {}; // Reset planets object

    loadPlanetModel(scene, "earth", './3d_models_compressed/earth_draco.glb', [0, 0, 0], 10000);
    loadPlanetModel(scene, "sun", './3d_models_compressed/sun.glb', [-6000000, 0, 0], 20000);
    loadPlanetModel(scene, "mercury", './3d_models_compressed/mercury_draco.glb', [-4000000, 0, 0], 4879);
    loadPlanetModel(scene, "venus", './3d_models_compressed/venus_draco.glb', [-2000000, 0, 0], 8000);
    loadPlanetModel(scene, "mars", './3d_models_compressed/mars_draco.glb', [2279000, 0, 0], 5200);
    loadPlanetModel(scene, "jupiter", './3d_models_compressed/jupiter_draco.glb', [7785000, 0, 0], 15000);
    loadPlanetModel(scene, "saturn", './3d_models_compressed/saturn_draco.glb', [14330000, 0, 0], 13000);
    loadPlanetModel(scene, "uranus", './3d_models_compressed/uranus_draco.glb', [28770000, 0, 0], 12700);
    loadPlanetModel(scene, "neptune", './3d_models_compressed/neptune_draco.glb', [45030000, 0, 0], 12000);
    loadPlanetModel(scene, "moon", './3d_models_compressed/moon_draco.glb', [384400 / 10, 0, 0], 3000);

    // ✅ Start animations after planets load
    setTimeout(() => {
        animateScene();
    }, 3000);
}


// 🔄 Animation Loop for Rotation & Moon Orbit
function animateScene() {
    requestAnimationFrame(animateScene);

    // Rotate Planets
    for (const planetName in planets) {
        const planet = planets[planetName];
        if (rotationSpeeds[planetName]) {
            planet.rotation.y += rotationSpeeds[planetName];
        }
    }

    // Orbit Moon around Earth
    if (!moonOrbitPaused && planets["moon"] && planets["earth"]) {
        const time = Date.now() * 0.0005;
        const moonDistance = 38000;
        planets["moon"].position.x = planets["earth"].position.x + Math.cos(time) * moonDistance;
        planets["moon"].position.z = planets["earth"].position.z + Math.sin(time) * moonDistance;
    }
}

// ✅ Move Camera to a Planet
export function moveToPlanet(planetName, camera, controls, scene) {
    let targetPlanet = scene.getObjectByName(planetName);
    if (!targetPlanet) {
        console.error(`❌ Planet "${planetName}" not found!`);
        return;
    }

    console.log(`🚀 Moving to: ${planetName}`);

    const targetFocus = new THREE.Vector3().setFromMatrixPosition(targetPlanet.matrixWorld);
    const planetSize = new THREE.Box3().setFromObject(targetPlanet).getSize(new THREE.Vector3()).length();

    let adjustedZoom = Math.max(1000, Math.min(planetSize * 8, 10000));
    const targetPosition = new THREE.Vector3(
        targetFocus.x,
        targetFocus.y + planetSize * 0.6,
        targetFocus.z + adjustedZoom
    );

    if (planetName === "moon") {
        moonOrbitPaused = true;
    } else {
        moonOrbitPaused = false;
    }

    controls.enabled = false;
    gsap.to(camera.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 2,
        ease: "power2.out",
        onComplete: () => {
            controls.enabled = true;
        }
    });
    gsap.to(controls.target, {
        x: targetFocus.x,
        y: targetFocus.y,
        z: targetFocus.z,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => camera.lookAt(controls.target),
    });
}

animateScene();  // Start the animation loop
