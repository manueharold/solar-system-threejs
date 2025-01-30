import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let velocity = new THREE.Vector3(); // Store movement velocity
let friction = 0.95; // Control how fast the movement slows down
let movementSpeed = 1.5; // Adjust this for faster/slower navigation

export function initControls(camera, renderer, scene, planet) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = true; 

    // Set zoom limits
    controls.minDistance = 100;
    controls.maxDistance = 100000;
    controls.zoomSpeed = 2;
    controls.enableZoom = true;
    controls.enableRotate = false; // Disable OrbitControls rotation (optional)
    controls.enablePan = false; // We are implementing our own pan logic

    // Handle dragging for Google Maps-like movement
    const onMouseDown = (event) => {
        isDragging = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
        velocity.set(0, 0, 0); // Reset velocity when dragging starts
    };

    const onMouseMove = (event) => {
        if (!isDragging) return;

        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
        previousMousePosition = { x: event.clientX, y: event.clientY };

        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);

        // Move in the direction of the drag
        const right = new THREE.Vector3();
        right.crossVectors(camera.up, direction).normalize();

        camera.position.addScaledVector(right, -deltaX * movementSpeed);
        camera.position.addScaledVector(direction, -deltaY * movementSpeed);

        // Store velocity for momentum effect
        velocity.set(-deltaX * movementSpeed, 0, -deltaY * movementSpeed);
    };

    const onMouseUp = () => {
        isDragging = false;
    };

    // Smooth movement after releasing the mouse (momentum effect)
    function applyMomentum() {
        if (!isDragging) {
            camera.position.add(velocity);
            velocity.multiplyScalar(friction); // Apply friction to slow it down
        }
        requestAnimationFrame(applyMomentum);
    }
    applyMomentum();

    // Attach event listeners
    renderer.domElement.addEventListener("mousedown", onMouseDown, false);
    renderer.domElement.addEventListener("mousemove", onMouseMove, false);
    renderer.domElement.addEventListener("mouseup", onMouseUp, false);
    renderer.domElement.addEventListener("mouseleave", onMouseUp, false);

    // **Touch support for mobile users**
    let touchStart = { x: 0, y: 0 };
    renderer.domElement.addEventListener("touchstart", (event) => {
        touchStart.x = event.touches[0].clientX;
        touchStart.y = event.touches[0].clientY;
        velocity.set(0, 0, 0);
    });

    renderer.domElement.addEventListener("touchmove", (event) => {
        event.preventDefault();
        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;

        const deltaX = touchX - touchStart.x;
        const deltaY = touchY - touchStart.y;
        touchStart.x = touchX;
        touchStart.y = touchY;

        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);

        const right = new THREE.Vector3();
        right.crossVectors(camera.up, direction).normalize();

        camera.position.addScaledVector(right, -deltaX * movementSpeed);
        camera.position.addScaledVector(direction, -deltaY * movementSpeed);

        velocity.set(-deltaX * movementSpeed, 0, -deltaY * movementSpeed);
    });

    renderer.domElement.addEventListener("touchend", () => {
        isDragging = false;
    });

    // Hide/show planets based on zoom level
    const checkZoomLevel = () => {
        if (!planet) return;
        const distance = camera.position.length();
        const zoomThreshold = 3000;
        planet.visible = distance >= zoomThreshold;
    };

    // Animation loop to update zoom level
    renderer.setAnimationLoop(() => {
        checkZoomLevel();
    });

    return controls;
}
