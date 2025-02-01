// sunShader.js
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// Vertex Shader: Pass UV coordinates and position to the fragment shader
const sunVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader: Creates a dynamic, noise-like effect for a fiery surface
// (This example uses a simple sine-based "noise"; feel free to enhance it using proper GLSL noise)
const sunFragmentShader = `
  uniform float time;
  varying vec2 vUv;
  varying vec3 vPosition;

  // Simple noise function using sine (for more complexity, you could import a noise library)
  float noise(vec2 p) {
    return sin(p.x) * sin(p.y);
  }

  void main() {
    // Create a moving pattern by offsetting the UV coordinates with time
    float n = noise(vUv * 10.0 + time * 0.5);
    // Interpolate between orange and yellow colors
    vec3 color = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 1.0, 0.0), n);
    // Create a soft glow effect near the center of the texture
    float intensity = 1.0 - smoothstep(0.0, 0.5, length(vUv - 0.5));
    gl_FragColor = vec4(color * intensity, 1.0);
  }
`;

// Function to create and return the Sun mesh
export function createSunMesh(size = 20000) {
  const geometry = new THREE.SphereGeometry(1, 128, 128);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 }
    },
    vertexShader: sunVertexShader,
    fragmentShader: sunFragmentShader,
    side: THREE.DoubleSide,
  });

  const sunMesh = new THREE.Mesh(geometry, material);
  // Scale the sun to the desired size
  sunMesh.scale.set(size, size, size);
  // Disable frustum culling so the sun is always rendered
  sunMesh.frustumCulled = false;
  return sunMesh;
}
