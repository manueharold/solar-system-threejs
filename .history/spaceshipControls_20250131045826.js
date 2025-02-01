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
        this.minY = -500; // Minimum vertical position
        this.maxY = 500;  // Maximum vertical position

        this.initControls();
    }

    initControls() {
        document.addEventListener("keydown", (e) => this.onKeyChange(e, true));
        document.addEventListener("keyup", (e) => this.onKeyChange(e, false));
        document.addEventListener("mousemove", (e) => this.onMouseMove(e));
        this.updateMovement();
    }

    toggleSpaceshipMode() {
        this.spaceshipMode = !this.spaceshipMode;
        console.log(this.spaceshipMode ? "🚀 Spaceship Mode ON" : "🌍 Default Control");
        if (!this.spaceshipMode) this.velocity.set(0, 0, 0);
    }

    onKeyChange(event, isPressed) {
        if (!this.spaceshipMode || document.activeElement.tagName === "INPUT") return;

        const speed = this.baseSpeed * (this.isBoosting ? this.boostMultiplier : 1);
        const actions = {
            // WASD keys - Move forward/backward (Z axis)
            "w": () => this.acceleration.z = -speed,  // Forward (up)
            "s": () => this.acceleration.z = speed,   // Backward (down)
            
            // Arrow keys - Move up/down (Y axis)
            "ArrowUp": () => this.acceleration.y = speed,   
            "ArrowDown": () => this.acceleration.y = -speed,  
            "ArrowLeft": () => this.acceleration.x = -speed,
            "ArrowRight": () => this.acceleration.x = speed,
            
            "a": () => this.acceleration.x = -speed,  // Left (X axis)
            "d": () => this.acceleration.x = speed,   // Right (X axis)
            " ": () => this.acceleration.y = speed,  // Move Up (Spacebar)
            "Shift": () => this.isBoosting = isPressed
        };

        if (event.key in actions) {
            if (event.key === "Shift") return actions[event.key]();
            isPressed ? actions[event.key]() : this.acceleration.set(0, 0, 0);
        }
    }

    onMouseMove(event) {
        if (this.spaceshipMode) {
            this.camera.rotation.y -= event.movementX * this.rotationSpeed;
            this.camera.rotation.x -= event.movementY * this.rotationSpeed;
        }
    }

    updateMovement() {
        requestAnimationFrame(() => this.updateMovement());
        if (this.spaceshipMode) {
            this.velocity.lerp(this.acceleration, 0.2);
            this.camera.position.add(this.velocity.clone().applyQuaternion(this.camera.quaternion));
            this.velocity.multiplyScalar(this.dampingFactor);
        }
    }
}
