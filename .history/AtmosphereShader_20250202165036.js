export const atmosphereShader = {
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
            vec3 lightDir = normalize(vec3(0.577, 0.577, 0.577));  // Simulate sunlight
            float intensity = max(dot(vNormal, lightDir), 0.0);
            gl_FragColor = vec4(intensity * 0.5 + 0.5, 0.8, 1.0, 0.7);  // Basic scattering effect
        }
    `
};
