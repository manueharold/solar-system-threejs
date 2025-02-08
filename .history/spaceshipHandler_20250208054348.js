export function initSpaceshipMode(camera, controls) {
    const spaceshipControls = new SpaceshipControls(camera);
    const toggleButton = document.getElementById("toggleSpaceshipMode");
    const guide = document.getElementById("spaceshipGuide");
    const closeGuide = document.getElementById("closeGuide");

    function toggleMode() {
        spaceshipControls.toggleSpaceshipMode();
        controls.enabled = !spaceshipControls.spaceshipMode;

        if (spaceshipControls.spaceshipMode) {
            toggleButton.innerHTML = `
                <i class="fa-solid fa-rocket"></i>
                <span class="icon-label">Default Control</span>
            `;
            guide.classList.add("active");  // Show guide when spaceship mode is enabled
        } else {
            toggleButton.innerHTML = `
                <i class="fa-solid fa-rocket"></i>
                <span class="icon-label">Spaceship Mode</span>
            `;
            guide.classList.remove("active"); // Hide guide when exiting spaceship mode
        }
    }

    if (toggleButton) {
        toggleButton.addEventListener("click", toggleMode);
    }

    closeGuide.addEventListener("click", () => {
        guide.classList.remove("active");
    });

    return spaceshipControls;
}
