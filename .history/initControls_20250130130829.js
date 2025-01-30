import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap@3.12.2"; // For smooth transitions

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let targetPosition = new THREE.Vector3(); // Target for camera movement

export function initControls(camera, renderer, scene, planets) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enableZoom = true; // Disable zoom to focus on swiping movement
    controls.enableRotate = true; // Disable default rotation
    controls.enablePan = true; // Disable pan, we'll implement our own

    let swipeStart = new THREE.Vector2();
    let swipeEnd = new THREE.Vector2();
    let isSwipeActive = false;

    // Detect swipe start
    function onMouseDown(event) {
        isDragging = true;
        swipeStart.set(event.clientX, event.clientY);
    }

    // Detect swipe end and trigger movement
    function onMouseUp(event) {
        isDragging = false;
        swipeEnd.set(event.clientX, event.clientY);
        handleSwipe();
    }

    // Handle swipe gesture
    function handleSwipe() {
        const deltaX = swipeEnd.x - swipeStart.x;
        const deltaY = swipeEnd.y - swipeStart.y;
        const threshold = 50; // Minimum movement required to register as a swipe

        if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
            let direction = new THREE.Vector3();

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe → move left or right
                direction.set(deltaX > 0 ? -1 : 1, 0, 0);
            } else {
                // Vertical swipe → move forward or backward
                direction.set(0, 0, deltaY > 0 ? 1 : -1);
            }

            moveToNextScene(direction);
        }
    }

    // Move the camera to the next scene smoothly
    function moveToNextScene(direction) {
        const moveDistance = 5000; // Adjust for how far the camera should move

        targetPosition.copy(camera.position).addScaledVector(direction, moveDistance);

        gsap.to(camera.position, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: 2, // Smooth transition duration
            ease: "power2.out",
        });

        // Optional: Find the closest planet and focus on it
        let closestPlanet = getClosestPlanet(targetPosition, planets);
        if (closestPlanet) {
            gsap.to(camera.lookAt, {
                x: closestPlanet.position.x,
                y: closestPlanet.position.y,
                z: closestPlanet.position.z,
                duration: 2,
                ease: "power2.out",
            });
        }
    }

    // Find the closest planet to a given position
    function getClosestPlanet(position, planets) {
        let closest = null;
        let minDistance = Infinity;

        planets.forEach((planet) => {
            let distance = position.distanceTo(planet.position);
            if (distance < minDistance) {
                minDistance = distance;
                closest = planet;
            }
        });

        return closest;
    }

    // Attach event listeners
    renderer.domElement.addEventListener("mousedown", onMouseDown, false);
    renderer.domElement.addEventListener("mouseup", onMouseUp, false);
    renderer.domElement.addEventListener("mouseleave", onMouseUp, false);

    return controls;
}
