import { SpaceshipControls } from "./spaceshipControls.js";

export function initSpaceshipMode(camera, controls) {
    const spaceshipControls = new SpaceshipControls(camera);
    const toggleButton = document.getElementById("toggleSpaceshipMode");

    function toggleMode() {
    spaceshipControls.toggleSpaceshipMode();
    controls.enabled = !spaceshipControls.spaceshipMode;


    if (toggleButton) {
    // Update the button text content based on the spaceship mode state
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

    if (toggleButton) toggleButton.addEventListener("click", toggleMode);
    document.addEventListener("keydown", (event) => event.key === "F" && toggleMode());

    return spaceshipControls;
}
}
