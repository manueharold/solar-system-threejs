export class SpaceshipControls {
    constructor(camera) {
        this.camera = camera;
        this.baseSpeed = 500; // Increased base speed 🚀
        this.boostMultiplier = 3; // Boost speed when holding Shift 🔥
        this.rotationSpeed = 0.004; // Smooth camera rotation
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.spaceshipMode = false;
        this.isBoosting = false;
        this.dampingFactor = 0.95; // Smooth stop effect

        this.initControls();
    }

    initControls() {
        document.addEventListener("keydown", (event) => this.onKeyDown(event));
        document.addEventListener("keyup", (event) => this.onKeyUp(event));
        document.addEventListener("mousemove", (event) => this.onMouseMove(event));
        this.updateMovement();
    }

    toggleSpaceshipMode() {
        this.spaceshipMode = !this.spaceshipMode;
        console.log(this.spaceshipMode ? "🚀 Spaceship Mode ON" : "🌍 Default Control");

        if (!this.spaceshipMode) {
            this.velocity.set(0, 0, 0); // Stop movement when switching back
            this.acceleration.set(0, 0, 0);
        }
    }

    onKeyDown(event) {
        if (!this.spaceshipMode) return;
    
        // ✅ Prevent movement if typing in input fields
        if (document.activeElement.tagName === "INPUT") return;
    
        const speed = this.isBoosting ? this.baseSpeed * this.boostMultiplier : this.baseSpeed;
    
        switch (event.key) {
            case "w": this.acceleration.z = -speed; break; // Forward
            case "s": this.acceleration.z = speed; break;  // Backward
            case "a": this.acceleration.x = -speed; break; // Left
            case "d": this.acceleration.x = speed; break;  // Right
            case " ": this.acceleration.y = speed; break;  // Up
            case "Shift": 
                this.isBoosting = true;
                this.acceleration.multiplyScalar(this.boostMultiplier); 
                break;
        }
    }
    
    onKeyUp(event) {
        if (!this.spaceshipMode) return;
    
        if (document.activeElement.tagName === "INPUT") return; // ✅ Prevent stopping when typing
    
        if (event.key === "Shift") {
            this.isBoosting = false;
        }
    
        if (["w", "s", "a", "d", " "].includes(event.key)) {
            this.acceleration.set(0, 0, 0);
        }
    }

    onMouseMove(event) {
        if (!this.spaceshipMode) return;
        this.camera.rotation.y -= event.movementX * this.rotationSpeed;
        this.camera.rotation.x -= event.movementY * this.rotationSpeed;
    }

    updateMovement() {
        requestAnimationFrame(() => this.updateMovement());
        if (this.spaceshipMode) {
            // Apply acceleration to velocity
            this.velocity.lerp(this.acceleration, 0.2); // Smooth acceleration

            // Apply velocity to position
            this.camera.position.add(this.velocity.clone().applyQuaternion(this.camera.quaternion));

            // Apply damping (smooth stop effect)
            this.velocity.multiplyScalar(this.dampingFactor);
        }
    }
}
