import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";
import SimplexNoise from "https://cdn.skypack.dev/simplex-noise@2.4.0";  // Specific version
import { showPlanetInfo, hidePlanetInfo } from "./planetInfo.js";

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

// ✅ Create Procedural Planet
function createProceduralPlanet(name, radius, detail, color, position, scene) {
    const geometry = new THREE.IcosahedronGeometry(radius, detail);
    const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 1,
        metalness: 0
    });

    // Apply noise for terrain
    const noise = new SimplexNoise();
    const vertices = geometry.attributes.position;
    
    for (let i = 0; i < vertices.count; i++) {
        let vertex = new THREE.Vector3().fromBufferAttribute(vertices, i);
        let elevation = noise.noise3D(vertex.x, vertex.y, vertex.z);
        vertex.multiplyScalar(1 + elevation * 0.1);
        vertices.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    geometry.computeVertexNormals();
    
    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(...position);
    planet.name = name;
    scene.add(planet);
    
    planets[name.toLowerCase()] = planet; // Store reference
}

// ✅ Load Procedural Planets into Scene
export function loadPlanets(scene) {
    createProceduralPlanet("earth", 5000, 5, 0x2288cc, [0, 0, 0], scene);
    createProceduralPlanet("mars", 3000, 5, 0xff6633, [2279000, 0, 0], scene);
    createProceduralPlanet("venus", 4000, 5, 0xffcc88, [-2000000, 0, 0], scene);
    createProceduralPlanet("mercury", 2500, 5, 0xaaaaaa, [-4000000, 0, 0], scene);
    createProceduralPlanet("jupiter", 15000, 5, 0xffaa66, [7785000, 0, 0], scene);
    createProceduralPlanet("saturn", 13000, 5, 0xffdd99, [14330000, 0, 0], scene);
    createProceduralPlanet("uranus", 12700, 5, 0x99ccff, [28770000, 0, 0], scene);
    createProceduralPlanet("neptune", 12000, 5, 0x3366ff, [45030000, 0, 0], scene);
    createProceduralPlanet("moon", 3000, 5, 0xcccccc, [384400 / 10, 0, 0], scene);

    return { planets, rotationSpeeds, moonOrbitPaused };  // Return the necessary variables
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
