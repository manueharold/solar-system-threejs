import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap@3.12.2"; // For smooth transitions


Here are the requested changes to the code, where I modified only the swipe motion to a dragging motion, keeping the rest of the code unchanged as per your request:

Updated Code (Dragging Motion)
javascript
Copy
Edit
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

    // Detect drag start
    function onMouseDown(event) {
        isDragging = true;
        previousMousePosition.set(event.clientX, event.clientY); // Record starting position
    }

    // Detect drag end and trigger movement
    function onMouseUp(event) {
        isDragging = false;
    }

    // Handle dragging motion
    function onMouseMove(event) {
        if (!isDragging) return;

        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;

        previousMousePosition.set(event.clientX, event.clientY); // Update previous position to current position

        let direction = new THREE.Vector3();
        
        // Horizontal drag → move left or right
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction.set(deltaX > 0 ? -1 : 1, 0, 0);
        } 
        // Vertical drag → move forward or backward
        else {
            direction.set(0, 0, deltaY > 0 ? 1 : -1);
        }

        moveToNextScene(direction);
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
    renderer.domElement.addEventListener("mousemove", onMouseMove, false);  // Added event listener for mouse move
    renderer.domElement.addEventListener("mouseup", onMouseUp, false);
    renderer.domElement.addEventListener("mouseleave", onMouseUp, false);

    return controls;
}