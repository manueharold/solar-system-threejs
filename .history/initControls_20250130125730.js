import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

export function initControls(camera, renderer, scene, planet) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = true; // Allow movement in the XY plane

    // Set zoom limits
    controls.minDistance = 100; // Minimum zoom
    controls.maxDistance = 100000; // Maximum zoom
    controls.zoomSpeed = 2;

    // Enable movement controls
    controls.enableZoom = true;
    controls.enableRotate = true; // Enable rotation if desired
    controls.enablePan = true; // Allow panning in all directions
    controls.panSpeed = 0.5; // Control pan speed
    controls.keyPanSpeed = 7.0; // Speed of movement via keyboard

    // Custom mouse drag functionality for Google Maps-like movement
    const onMouseDown = (event) => {
        isDragging = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseMove = (event) => {
        if (!isDragging) return;

        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;

        const movementSpeed = 0.1; // Adjust movement speed as needed

        // Get camera direction
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);

        // Move forward/backward based on vertical mouse movement
        camera.position.addScaledVector(direction, -deltaY * movementSpeed);

        // Move left/right based on horizontal mouse movement
        const right = new THREE.Vector3();
        right.crossVectors(camera.up, direction).normalize();
        camera.position.addScaledVector(right, -deltaX * movementSpeed);

        previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseUp = () => {
        isDragging = false;
    };

    // Attach event listeners for dragging
    renderer.domElement.addEventListener('mousedown', onMouseDown, false);
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('mouseup', onMouseUp, false);
    renderer.domElement.addEventListener('mouseleave', onMouseUp, false); // Stop dragging if mouse leaves the canvas

    // Check zoom level and hide/show planet
    const checkZoomLevel = () => {
        if (!planet) return; // Ensure planet exists before checking visibility

        const distance = camera.position.length(); // Get camera distance from origin
        const zoomThreshold = 3000; // Threshold for hiding the planet

        planet.visible = distance >= zoomThreshold; // Hide if too close
    };

    // Update visibility of planet on each frame
    renderer.setAnimationLoop(() => {
        checkZoomLevel();
    });

    return controls;
}
