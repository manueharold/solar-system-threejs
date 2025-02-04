import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

export function initGalaxyBackground(scene) {
  // Vertex Shader: pass along UV coordinates.
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  // Fragment Shader: create a procedural starfield and a galactic band.
  const fragmentShader = `
    varying vec2 vUv;

    // A simple hash function for generating pseudo-random values.
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      // Base background: a deep space color
      vec3 color = vec3(0.0, 0.0, 0.05);

      // Create a star layer.
      // Increase the multiplier in vUv to change the star density.
      float starProbability = random(vUv * 1000.0);
      // Using step() to decide if a star should appear at this fragment.
      float star = step(0.998, starProbability);
      
      // Add bright white stars.
      color += vec3(star);

      // Optional: create a galactic band (like a subtle Milky Way effect)
      // Adjust the center and width of the band by tweaking the values.
      float band = smoothstep(0.45, 0.5, abs(vUv.y - 0.5));
      // Blend in a bluish tint for the galactic region.
      color = mix(color, color + vec3(0.1, 0.1, 0.3), 1.0 - band);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // Create a large sphere geometry that will act as our skybox.
  const geometry = new THREE.SphereGeometry(100000, 64, 64);

  // Create a ShaderMaterial with our custom shaders.
  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.BackSide // Render the inside of the sphere.
  });

  // Create the mesh and add it to the scene.
  const skybox = new THREE.Mesh(geometry, material);
  scene.add(skybox);
}
