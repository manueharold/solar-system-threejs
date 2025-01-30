import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

export function createAtmosphereGlow(planet, size, color) {
    const atmosphereGeometry = new THREE.SphereGeometry(size * 1.1, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
        uniforms: {
            glowColor: { value: new THREE.Color(color) },
            intensity: { value: 1.2 }
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            uniform vec3 glowColor;
            uniform float intensity;
            void main() {
                float glow = pow(dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                gl_FragColor = vec4(glowColor, glow * intensity);
            }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide,
        transparent: true
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.position.set(planet.position.x, planet.position.y, planet.position.z);
    planet.add(atmosphere);
}
