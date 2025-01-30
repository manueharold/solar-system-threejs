import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap@3.12.2"; // For smooth movement

let isDragging = false;
let previousMousePosition = new THREE.Vector2();
let velocity = new THREE.Vector3(); // Store movement speed

export function initControls(camera, renderer, scene, planets) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enableZoom = false; // Disable zoom to focus on dragging
    controls.enableRotate = false; // Disable default rotation
    controls.enablePan = false; // Disable pan (custom movement instead)

    const movementFactor = 2; // Adjust this for faster/slower movement

    function onMouseDown(event) {
        isDragging = true;
        previousMousePosition.set(event.clientX, event.clientY);
    }

    function onMouseMove(event) {
        if (!isDragging) return;

        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;

        previousMousePosition.set(event.clientX, event.clientY);

        // Convert 2D mouse movement into 3D world movement
        let moveDirection = new THREE.Vector3();
        camera.getWorldDirection(moveDirection);

        let rightVector = new THREE.Vector3();
        rightVector.crossVectors(camera.up, moveDirection).normalize();

        // Adjust movement based on mouse drag direction
        let movement = new THREE.Vector3();
        movement.addScaledVector(moveDirection, -deltaY * movementFactor);
        movement.addScaledVector(rightVector, -deltaX * movementFactor);

        // Update velocity for smooth animation
        velocity.copy(movement);
    }

    function onMouseUp() {
        isDragging = false;
    }

    function animate() {
        if (isDragging) {
            // Apply movement smoothly
            gsap.to(camera.position, {
                x: camera.position.x + velocity.x,
                y: camera.position.y + velocity.y,
                z: camera.position.z + velocity.z,
                duration: 0.2, // Smooth transition
                ease: "power2.out",
            });
        }

        requestAnimationFrame(animate);
    }

    // Attach event listeners
    renderer.domElement.addEventListener("mousedown", onMouseDown, false);
    renderer.domElement.addEventListener("mousemove", onMouseMove, false);
    renderer.domElement.addEventListener("mouseup", onMouseUp, false);
    renderer.domElement.addEventListener("mouseleave", onMouseUp, false);

    animate(); // Start animation loop

    return controls;
}
