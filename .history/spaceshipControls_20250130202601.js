import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

export class SpaceshipControls {
    constructor(camera) {
        this.camera = camera;
        this.movementSpeed = 50;
        this.rotationSpeed = 0.002;
        this.velocity = new THREE.Vector3();
        this.spaceshipMode = false;

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

        switch (event.key) {
            case "w": this.velocity.z = -this.movementSpeed; break;
            case "s": this.velocity.z = this.movementSpeed; break;
            case "a": this.velocity.x = -this.movementSpeed; break;
            case "d": this.velocity.x = this.movementSpeed; break;
            case " ": this.velocity.y = this.movementSpeed; break;
            case "Shift": this.velocity.y = -this.movementSpeed; break;
        }
    }

    onKeyUp(event) {
        if (!this.spaceshipMode) return;
        if (["w", "s", "a", "d", " ", "Shift"].includes(event.key)) {
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


