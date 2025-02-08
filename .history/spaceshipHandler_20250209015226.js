import { SpaceshipControls } from "./spaceshipControls.js";

export function initSpaceshipMode(camera, controls) {
    const spaceshipControls = new SpaceshipControls(camera);
    const toggleButton = document.getElementById("toggleSpaceshipMode");
    const notification = document.getElementById("spaceshipNotification");
    const guide = document.getElementById("spaceshipGuide");
    const closeGuide = document.getElementById("closeGuide");

    function showSpaceshipNotification() {
        if (!notification) return;
        notification.classList.add("visible");
        setTimeout(() => {
            notification.classList.remove("visible");
        }, 3000);
    }

    function toggleMode() {
        // Check if Spaceship Mode is disabled (Orbit Mode is active)
        if (toggleButton.classList.contains("disabled")) {
            if (notification) {
                notification.classList.add("visible");
                setTimeout(() => {
                    notification.classList.remove("visible");
                }, 3000);
            } else {
                alert("Error: Spaceship Mode is disabled while Orbit Mode is active.");
            }
            return; // Prevent further execution of the toggle function.
        }

        // Otherwise, proceed with toggling Spaceship Mode.
        spaceshipControls.toggleSpaceshipMode();
        controls.enabled = !spaceshipControls.spaceshipMode;

        if (spaceshipControls.spaceshipMode) {
            toggleButton.innerHTML = `
                <i class="fa-solid fa-rocket"></i>
                <span class="icon-label">Default Control</span>
            `;
            showSpaceshipNotification();
            guide.classList.add("active"); // Show guide
        } else {
            toggleButton.innerHTML = `
                <i class="fa-solid fa-rocket"></i>
                <span class="icon-label">Spaceship Mode</span>
            `;
            guide.classList.remove("active"); // Hide guide
        }
    }

    // Add event listeners
    if (toggleButton) {
        toggleButton.addEventListener("click", toggleMode);
    }

    // Also listen for the 'F' key to toggle spaceship mode.
    document.addEventListener("keydown", (event) => {
        if (event.key.toLowerCase() === "f") {
            toggleMode();
        }
    });

    if (closeGuide) {
        closeGuide.addEventListener("click", () => {
            guide.classList.remove("active");
        });
    }

    return spaceshipControls;
}
