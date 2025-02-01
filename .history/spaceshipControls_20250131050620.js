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
        this.maxUpSpeed = 100;  // Limit for upward movement
        this.minDownSpeed = -50;  // Limit for downward movement

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
            // WASD keys
            "w": () => this.acceleration.z = -speed,
            "s": () => this.acceleration.z = speed,
            "a": () => this.acceleration.x = -speed,
            "d": () => this.acceleration.x = speed,
            " ": () => {
                if (isPressed) {
                    // Limit upward speed
                    this.acceleration.y = Math.min(speed, this.maxUpSpeed);
                } else {
                    this.acceleration.y = 0;
                }
            },
            "Control": () => {
                if (isPressed) {
                    // Opposite of space: move downward
                    this.acceleration.y = Math.max(-speed, this.minDownSpeed);
                }
            },
            "Shift": () => this.isBoosting = isPressed,

            // Arrow keys
            "ArrowUp": () => this.acceleration.z = -speed,
            "ArrowDown": () => this.acceleration.z = speed,
            "ArrowLeft": () => this.acceleration.x = -speed,
            "ArrowRight": () => this.acceleration.x = speed
        };

        if (event.key in actions) {
            if (event.key === "Shift" || event.key === "Control" || event.key === " ") return actions[event.key]();
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
