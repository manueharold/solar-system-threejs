import { SpaceshipControls } from "./spaceshipControls.js";

export function initSpaceshipMode(camera, controls) {
    const spaceshipControls = new SpaceshipControls(camera);
    const toggleButton = document.getElementById("toggleSpaceshipMode");

    // Ensure event listener is added after the button is available
    if (toggleButton) {
        toggleButton.addEventListener("click", toggleMode);
    }

    // This function toggles spaceship mode and updates the button text
    function toggleMode() {
        spaceshipControls.toggleSpaceshipMode();
        controls.enabled = !spaceshipControls.spaceshipMode;

        if (spaceshipControls.spaceshipMode) {
            toggleButton.innerHTML = `
                <i class="fa-solid fa-rocket"></i>
                <span class="icon-label">Default Control</span>
            `;
        } else {
            toggleButton.innerHTML = `
                <i class="fa-solid fa-rocket"></i>
                <span class="icon-label">Spaceship Mode</span>
            `;
        }
    }

    // Add keyboard event listener to toggle spaceship mode on 'F' key press
    document.addEventListener("keydown", (event) => {
        if (event.key === "F") {
            toggleMode();
        }
    });

    return spaceshipControls;
}
