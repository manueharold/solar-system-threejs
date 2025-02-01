import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

export function createSolarFlareParticles(count = 500, radius = 22000) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const sizes = [];

  // Generate random positions on a spherical shell around the Sun
  for (let i = 0; i < count; i++) {
    // Random spherical coordinates
    const theta = Math.acos(THREE.MathUtils.randFloatSpread(2)); // [0, PI]
    const phi = THREE.MathUtils.randFloat(0, Math.PI * 2);
    const r = radius + THREE.MathUtils.randFloatSpread(3000); // Add randomness to the radius

    const x = r * Math.sin(theta) * Math.cos(phi);
    const y = r * Math.sin(theta) * Math.sin(phi);
    const z = r * Math.cos(theta);
    positions.push(x, y, z);
    sizes.push(THREE.MathUtils.randFloat(10, 30));
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

  // Create a shader material for the particles
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      // Replace with a path to your flare texture image file
      pointTexture: { value: new THREE.TextureLoader().load('./textures/solarFlare.png') }
    },
    vertexShader: `
      attribute float size;
      uniform float time;
      varying float vAlpha;
      void main() {
        // Animate the size slightly over time
        float animatedSize = size * (1.0 + 0.3 * sin(time + position.x * 0.001));
        vAlpha = 0.5 + 0.5 * sin(time + position.y * 0.002);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = animatedSize * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D pointTexture;
      varying float vAlpha;
      void main() {
        vec4 color = texture2D(pointTexture, gl_PointCoord);
        gl_FragColor = vec4(color.rgb, color.a * vAlpha);
      }
    `,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
  });

  const particles = new THREE.Points(geometry, material);
  return particles;
}
