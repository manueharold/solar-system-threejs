export const atmosphereShader = {
    vertexShader: `
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec3 vNormal;
        void main() {
            float intensity = pow(0.5 - dot(vNormal, vec3(0,0,1)), 2.0);
            gl_FragColor = vec4(0.3, 0.6, 1.0, 0.5) * intensity;
        }
    `
};

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
