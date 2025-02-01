export function loadDefaultPlanets(scene, camera, controls) {
    if (orbitModel) {
        scene.remove(orbitModel);
        orbitModel = null;
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
