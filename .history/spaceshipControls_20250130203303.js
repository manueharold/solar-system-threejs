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
            "w": () => this.acceleration.z = -speed,
            "s": () => this.acceleration.z = speed,
            "a": () => this.acceleration.x = -speed,
            "d": () => this.acceleration.x = speed,
            " ": () => this.acceleration.y = speed,
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
