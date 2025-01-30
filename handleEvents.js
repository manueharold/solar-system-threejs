export function handleResize(camera, renderer) {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

export function handleMouseEvents(scene, camera) {
    // Example for mouse events (can be expanded)
    document.addEventListener('mousemove', (event) => {
        // Handle mouse movement
    });
}
