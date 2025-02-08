import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import gsap from "https://cdn.skypack.dev/gsap";  
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Light source
const light = new THREE.PointLight(0xffffff, 2, 200);
light.position.set(0, 0, 0);
scene.add(light);

// Sun setup
const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
const sunMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffaa00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planets data
const planets = [
  { name: 'Mercury', size: 0.4, distance: 5, speed: 0.02, color: 0xaaaaaa },
  { name: 'Venus', size: 0.9, distance: 7, speed: 0.015, color: 0xffcc88 },
  { name: 'Earth', size: 1, distance: 10, speed: 0.01, color: 0x2266ff },
  { name: 'Mars', size: 0.8, distance: 13, speed: 0.008, color: 0xff4422 },
  { name: 'Jupiter', size: 2.5, distance: 18, speed: 0.004, color: 0xffaa77 },
  { name: 'Saturn', size: 2.2, distance: 22, speed: 0.003, color: 0xffcc77 },
  { name: 'Uranus', size: 1.5, distance: 26, speed: 0.002, color: 0x88ccff },
  { name: 'Neptune', size: 1.4, distance: 30, speed: 0.0015, color: 0x4477ff }
];

// Create planets and orbit lines
const planetMeshes = [];
const orbits = [];
planets.forEach(planet => {
  const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: planet.color });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  planetMeshes.push({ mesh, distance: planet.distance, speed: planet.speed, angle: Math.random() * Math.PI * 2 });

  // Create orbit line
  const orbitGeometry = new THREE.RingGeometry(planet.distance - 0.05, planet.distance + 0.05, 64);
  const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
  orbit.rotation.x = Math.PI / 2;
  scene.add(orbit);
  orbits.push(orbit);
});

// Camera position
camera.position.set(0, 5, 40);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  
  // Move planets around the Sun
  planetMeshes.forEach(planet => {
    planet.angle += planet.speed;
    planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
    planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
  });
  
  renderer.render(scene, camera);
}
animate();

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

export function loadOrbitPlanets(scene, camera, controls) {
    // Use the passed-in scene, camera, and controls to set up the orbit mode.
  }
