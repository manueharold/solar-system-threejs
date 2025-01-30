import { SpaceshipControls } from "./spaceshipControls.js";

export function initSpaceshipMode(camera, controls) {
    const spaceshipControls = new SpaceshipControls(camera);
    const toggleButton = document.getElementById("toggleSpaceshipMode");

    function toggleMode() {
        spaceshipControls.toggleSpaceshipMode();
        controls.enabled = !spaceshipControls.spaceshipMode;
    
        if (toggleButton) {
            toggleButton.textContent = spaceshipControls.spaceshipMode 
                ? "🚀 Spaceship Mode" 
                : "🌍 Default Control";
        }
    }

    if (toggleButton) toggleButton.addEventListener("click", toggleMode);
    document.addEventListener("keydown", (event) => event.key === "F" && toggleMode());

    return spaceshipControls;
}
