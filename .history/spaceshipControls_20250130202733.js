import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

export class SpaceshipControls {
    constructor(camera) {
        this.camera = camera;
        this.baseSpeed = 200; // Increased speed 🚀
        this.boostMultiplier = 3; // Boost speed when holding Shift 🔥
        this.rotationSpeed = 0.004; // Faster mouse rotation
        this.velocity = new THREE.Vector3();
        this.spaceshipMode = false;
        this.isBoosting = false; // Track boost status

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
        }
    }

    onKeyDown(event) {
        if (!this.spaceshipMode) return;

        const speed = this.isBoosting ? this.baseSpeed * this.boostMultiplier : this.baseSpeed;

        switch (event.key) {
            case "w": this.velocity.z = -speed; break; // Forward
            case "s": this.velocity.z = speed; break;  // Backward
            case "a": this.velocity.x = -speed; break; // Left
            case "d": this.velocity.x = speed; break;  // Right
            case " ": this.velocity.y = speed; break;  // Up
            case "Shift": 
                this.isBoosting = true; // Enable boost
                this.velocity.multiplyScalar(this.boostMultiplier); 
                break;
        }
    }

    onKeyUp(event) {
        if (!this.spaceshipMode) return;

        if (event.key === "Shift") {
            this.isBoosting = false; // Disable boost
        }

        if (["w", "s", "a", "d", " "].includes(event.key)) {
            this.velocity.set(0, 0, 0);
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
            this.camera.position.add(this.velocity.clone().applyQuaternion(this.camera.quaternion));
        }
    }
}


