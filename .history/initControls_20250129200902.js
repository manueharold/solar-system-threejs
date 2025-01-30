import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

export function initControls(camera, renderer, scene, planet) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = true;
    controls.minDistance = 9000;
    controls.maxDistance = 100000;
    controls.zoomSpeed = 2;
    controls.enableZoom = controls.enableRotate = controls.enablePan = true;
    controls.panSpeed = 0.5;
    controls.keyPanSpeed = 7.0;

    let isDragging = false, previousMousePosition = { x: 0, y: 0 }, lastCameraPosition = { x: 0, y: 0 };

    const onMouseDown = (event) => {
        isDragging = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
        lastCameraPosition = { x: camera.position.x, y: camera.position.y };
    };

    const onMouseMove = (event) => {
        if (!isDragging) return;
        const deltaX = event.clientX - previousMousePosition.x, deltaY = event.clientY - previousMousePosition.y;
        const movementSpeed = 0.5;
        camera.position.x = Math.max(lastCameraPosition.x - deltaX * movementSpeed, -500);
        camera.position.y = Math.max(lastCameraPosition.y + deltaY * movementSpeed, -500);
        scene.position.x -= deltaX * movementSpeed;
        scene.position.y += deltaY * movementSpeed;
        previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseUp = () => { isDragging = false; };

    // Add event listeners for mouse drag
    renderer.domElement.addEventListener('mousedown', onMouseDown, false);
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('mouseup', onMouseUp, false);
    renderer.domElement.addEventListener('mouseleave', onMouseUp, false);

    const checkZoomLevel = () => {
        const zoomThreshold = 200;
        planet.visible = camera.position.z >= zoomThreshold;
    };

    renderer.setAnimationLoop(() => checkZoomLevel());

    return controls;
}
