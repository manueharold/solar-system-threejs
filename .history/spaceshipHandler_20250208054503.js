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
