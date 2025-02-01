export function loadDefaultPlanets(scene, camera, controls) {
    // Look up and remove the orbit mode model from the scene:
    const orbit = scene.getObjectByName('orbitModeModel');
    if (orbit) {
        scene.remove(orbit);
    }
    
    // Re-load the planets if needed
    loadPlanets(scene);

    // Optionally animate the camera back to its default position.
    // Define your default camera position and animate:
    gsap.to(camera.position, {
        duration: 2,
        x: 0,
        y: 0,
        z: 10000,  // Adjust as needed
        ease: "power2.out",
        onUpdate: () => {
            camera.lookAt(controls.target);
        }
    });
}
