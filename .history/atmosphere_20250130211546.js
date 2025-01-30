import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

export function createAtmosphereGlow(planet, color) {
    const atmosphereGeometry = new THREE.SphereGeometry(planet.scale.x * 1.1, 32, 32);
    const atmosphereMaterial = new THREE.ShaderMaterial({
        uniforms: {
            glowColor: { value: new THREE.Color(color) },
            intensity: { value: 0.8 }
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
                float glow = dot(vNormal, vec3(0, 0, 1.0));
                gl_FragColor = vec4(glowColor, glow * intensity);
            }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide,
        transparent: true
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    planet.add(atmosphere);
}
