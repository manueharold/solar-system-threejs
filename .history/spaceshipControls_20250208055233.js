export class SpaceshipControls {
    constructor(camera) {
        this.camera = camera;
        this.baseSpeed = 500;
        this.boostMultiplier = 3;
        this.rotationSpeed = 0.004;
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.spaceshipMode = false;
        this.isBoosting = false;
        this.dampingFactor = 0.95;
        this.maxUpSpeed = 1300;   // Maximum upward speed (for space key)
        this.minDownSpeed = -1300; // Maximum downward speed (for ctrl key)
        this.minZoom = 1000;      // Closest allowed zoom offset (local z translation)
        this.maxZoom = 3000;      // Farthest allowed zoom offset
        this.zoomOffset = 2000;   // Start at a default zoom offset within limits
        this.maxSpeed = 2000;     // Maximum overall movement speed

        this.initControls();
    }

    initControls() {
        document.addEventListener("keydown", (e) => this.onKeyChange(e, true));
        document.addEventListener("keyup", (e) => this.onKeyChange(e, false));
        document.addEventListener("mousemove", (e) => this.onMouseMove(e));
        document.addEventListener("wheel", (e) => this.onZoom(e)); // Handle zooming
        this.updateMovement();
    }

    toggleSpaceshipMode() {
        this.spaceshipMode = !this.spaceshipMode;
        console.log(this.spaceshipMode ? "Spaceship Mode ON" : "Default Control");
        if (!this.spaceshipMode) {
            this.velocity.set(0, 0, 0);
        }
    }

    onKeyChange(event, isPressed) {
        if (!this.spaceshipMode || document.activeElement.tagName === "INPUT") return;
    
        const speed = this.baseSpeed * (this.isBoosting ? this.boostMultiplier : 1);
        const actions = {
            // WASD keys for forward/backward and left/right
            "w": () => this.acceleration.z = isPressed ? -speed : 0,
            "s": () => this.acceleration.z = isPressed ? speed : 0,
            "a": () => this.acceleration.x = isPressed ? -speed : 0,
            "d": () => this.acceleration.x = isPressed ? speed : 0,
            // Space for upward movement
            " ": () => {
                if (isPressed) {
                    // Clamp acceleration.y to not exceed maxUpSpeed
                    this.acceleration.y = Math.min(speed, this.maxUpSpeed);
                } else {
                    this.acceleration.y = 0;
                }
            },
            // Control for downward movement
            "Control": () => {
                if (isPressed) {
                    // Clamp acceleration.y so it doesn't exceed the downward limit
                    this.acceleration.y = Math.max(-speed, this.minDownSpeed);
                } else {
                    this.acceleration.y = 0;
                }
            },
            "Shift": () => this.isBoosting = isPressed,
    
            // Arrow keys mimic WASD functionality
            "ArrowUp": () => this.acceleration.z = isPressed ? -speed : 0,
            "ArrowDown": () => this.acceleration.z = isPressed ? speed : 0,
            "ArrowLeft": () => this.acceleration.x = isPressed ? -speed : 0,
            "ArrowRight": () => this.acceleration.x = isPressed ? speed : 0
        };
    
        if (event.key in actions) {
            actions[event.key]();
        }
    }

    onMouseMove(event) {
        if (this.spaceshipMode) {
            // Rotate the camera based on mouse movement
            this.camera.rotation.y -= event.movementX * this.rotationSpeed;
            this.camera.rotation.x -= event.movementY * this.rotationSpeed;
        }
    }

    onZoom(event) {
        if (!this.spaceshipMode) return;
        
        // Calculate a zoom change factor from the mouse wheel
        const zoomChange = event.deltaY * 0.05; // Adjust sensitivity as needed
        let newZoomOffset = this.zoomOffset + zoomChange;
        
        // Clamp newZoomOffset between minZoom and maxZoom
        newZoomOffset = Math.max(this.minZoom, Math.min(this.maxZoom, newZoomOffset));
        const delta = newZoomOffset - this.zoomOffset;
        this.zoomOffset = newZoomOffset;
        
        // Translate the camera along its local Z axis by the clamped delta
        this.camera.translateZ(delta);
    }

    updateMovement() {
        requestAnimationFrame(() => this.updateMovement());
        if (this.spaceshipMode) {
            // Smoothly interpolate velocity toward the acceleration vector
            this.velocity.lerp(this.acceleration, 0.2);

            // Clamp the vertical (Y) velocity
            this.velocity.y = Math.max(Math.min(this.velocity.y, this.maxUpSpeed), this.minDownSpeed);
            // Clamp overall velocity to a maximum length
            this.velocity.clampLength(0, this.maxSpeed);
    
            // Apply movement in the direction of the camera's current orientation
            this.camera.position.add(this.velocity.clone().applyQuaternion(this.camera.quaternion));
            // Apply damping to gradually reduce velocity over time
            this.velocity.multiplyScalar(this.dampingFactor);
        }
    }
}
