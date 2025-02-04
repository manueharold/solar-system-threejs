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
        this.maxUpSpeed = 300;  // Limit for upward movement
        this.minDownSpeed = -300;  // Limit for downward movement

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
            "w": () => this.acceleration.z = isPressed ? -speed : 0,
            "s": () => this.acceleration.z = isPressed ? speed : 0,
            "a": () => this.acceleration.x = isPressed ? -speed : 0,
            "d": () => this.acceleration.x = isPressed ? speed : 0,
            " ": () => {
                if (isPressed) {
                    // Limit upward speed
                    this.acceleration.y = Math.min(speed, this.maxUpSpeed);
                } else {
                    this.acceleration.y = 0;  // Stop upward movement when space is released
                }
            },
            "Control": () => {
                if (isPressed) {
                    // Opposite of space: move downward
                    this.acceleration.y = Math.max(-speed, this.minDownSpeed);
                } else {
                    this.acceleration.y = 0;  // Stop downward movement when ctrl is released
                }
            },
            "Shift": () => this.isBoosting = isPressed,
    
            // Arrow keys
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
