import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let lastCameraPosition = { x: 0, y: 0 };

export function initControls(camera, renderer, scene, planet) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = true; // Allow for movement in the XY plane

    // Set zoom limits
    controls.minDistance = 100; // Minimum zoom
    controls.maxDistance = 100000; // Maximum zoom
    controls.zoomSpeed = 2; // Increase the zoom speed

    // Allow camera movement in space (drag to move)
    controls.enableZoom = true;
    controls.enableRotate = true; // Enable rotation if desired
    controls.enablePan = true; // Allow panning in all directions

    // Set movement speed
    controls.panSpeed = 0.5; // Control how fast the camera moves during pan
    controls.keyPanSpeed = 7.0; // Speed of camera movement via keyboard (optional)

    // Custom mouse drag functionality to move the entire scene
    const onMouseDown = (event) => {
        isDragging = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
        lastCameraPosition = { x: camera.position.x, y: camera.position.y }; // Store initial position
    };

    const onMouseMove = (event) => {
        if (!isDragging) return;

        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;

        // Sensitivity multiplier
        const movementSpeed = 0.5;

        // Calculate new camera position with movement speed
        let newCameraX = lastCameraPosition.x - deltaX * movementSpeed;
        let newCameraY = lastCameraPosition.y + deltaY * movementSpeed;

        // Adjust camera position based on movement, but limit to prevent it from getting too close to objects
        const minCameraDistance = 500; // Prevent the camera from getting too close to the center (or big objects)
        newCameraX = Math.max(newCameraX, -minCameraDistance);
        newCameraY = Math.max(newCameraY, -minCameraDistance);

        camera.position.x = newCameraX;
        camera.position.y = newCameraY;

        // Optionally, move the scene instead of just the camera to simulate the camera's motion
        scene.position.x -= deltaX * movementSpeed;
        scene.position.y += deltaY * movementSpeed;

        previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseUp = () => {
        isDragging = false;
    };

    // Add event listeners for mouse drag
    renderer.domElement.addEventListener('mousedown', onMouseDown, false);
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('mouseup', onMouseUp, false);
    renderer.domElement.addEventListener('mouseleave', onMouseUp, false); // Stop dragging if mouse leaves the canvas

    // Check zoom level and hide/show planet
    const checkZoomLevel = () => {
        if (!planet) return; // Ensure planet exists before checking visibility

        const distance = camera.position.length(); // Get the current camera distance from origin

        const zoomThreshold = 3000; // Distance threshold for hiding the planet
        if (distance < zoomThreshold) {
            if (planet.visible) planet.visible = false; // Hide planet when zooming in too close
        } else {
            if (!planet.visible) planet.visible = true; // Show planet again when zooming out
        }
    };

    // Update visibility of planet on each render
    renderer.setAnimationLoop(() => {
        checkZoomLevel();
    });

    return controls;
}
