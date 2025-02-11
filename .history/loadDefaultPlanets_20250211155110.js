import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import gsap from "https://cdn.skypack.dev/gsap";
import { loadPlanets, planetData } from "./loadPlanets.js";

export async function loadDefaultPlanets(scene, camera, controls) {
  // --- Reset Orbit Mode flag ---
  // This ensures that update loops and tweens that depend on orbit mode will run normally.
  window.orbitModeEnabled = false;

  // ----- Remove Orbit Mode Elements -----
  const orbitModeGroup = scene.getObjectByName("orbitModeGroup");
  if (orbitModeGroup) {
    scene.remove(orbitModeGroup);
    console.log("Removed orbit mode group.");
  }

  scene.traverse((child) => {
    if (
      (child.type === "Line" ||
       child.type === "LineSegments" ||
       child.type === "LineLoop") &&
      child.name &&
      child.name.includes("orbit")
    ) {
      scene.remove(child);
      console.log(`Removed orbit line: ${child.name}`);
    }
  });

  // Remove all existing planet objects to prevent duplicates.
  const planetNames = [
    "sun",
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "moon"
  ];
  planetNames.forEach((name) => {
    const objectsToRemove = [];
    scene.traverse((child) => {
      if (child.name === name) {
        objectsToRemove.push(child);
      }
    });
    objectsToRemove.forEach((obj) => {
      scene.remove(obj);
      console.log(`Removed ${obj.name} from scene.`);
    });
  });

  // Cancel any GSAP animations that might be affecting the camera/controls.
  gsap.killTweensOf(camera.position);
  gsap.killTweensOf(controls.target);

  // Show the loading UI before starting to load planets.
  const loadingContainer = document.getElementById("loadingContainer");
  if (loadingContainer) {
    loadingContainer.style.display = "block";
  }

  // Reload planets (which re-adds them to the scene).
  await loadPlanets(scene);
  console.log("Default planets reloaded.");

  // --- Set Realistic Planet Rotation Speeds ---
  // In reality the planets rotate very slowly. For visualization purposes,
  // we multiply the realistic radian-per-second value by a factor.
  // The following rotation periods (in hours) are approximate and include the sign
  // to indicate retrograde rotation (negative means retrograde).
  // (Note: these values are for demonstration and can be tweaked.)
  //
  //   Mercury: ~1407.6 hours
  //   Venus: ~-5832.5 hours (retrograde)
  //   Earth: ~24 hours
  //   Mars: ~24.6 hours
  //   Jupiter: ~9.9 hours
  //   Saturn: ~10.7 hours
  //   Uranus: ~-17.2 hours (retrograde)
  //   Neptune: ~16.1 hours
  //   Sun: ~600 hours (rough average)
  //
  // The formula for rotation speed in rad/s is:
  //    speed = 2π / (rotationPeriodInSeconds)
  //
  // Multiply the computed speed by the factor below to get a visually noticeable rotation.
  const rotationSpeedFactor = 1000; // Adjust this factor as desired.
  scene.traverse((child) => {
    if (child.userData && child.userData.isPlanet) {
      let rotationPeriodHours;
      switch (child.name.toLowerCase()) {
        case "mercury":
          rotationPeriodHours = 1407.6;
          break;
        case "venus":
          rotationPeriodHours = -5832.5;
          break;
        case "earth":
          rotationPeriodHours = 24;
          break;
        case "mars":
          rotationPeriodHours = 24.6;
          break;
        case "jupiter":
          rotationPeriodHours = 9.9;
          break;
        case "saturn":
          rotationPeriodHours = 10.7;
          break;
        case "uranus":
          rotationPeriodHours = -17.2;
          break;
        case "neptune":
          rotationPeriodHours = 16.1;
          break;
        case "sun":
          rotationPeriodHours = 600;
          break;
        default:
          rotationPeriodHours = 24;
          break;
      }
      // Convert the rotation period from hours to seconds.
      const periodSeconds = Math.abs(rotationPeriodHours * 3600);
      const baseRotationSpeed = (2 * Math.PI) / periodSeconds; // in rad/s
      // Apply retrograde sign if necessary.
      child.userData.rotationSpeed = rotationPeriodHours < 0
        ? -baseRotationSpeed * rotationSpeedFactor
        : baseRotationSpeed * rotationSpeedFactor;
      console.log(`Set rotation speed for ${child.name}: ${child.userData.rotationSpeed.toFixed(6)} rad/s`);
    }
  });

  // ----- Reset Earth's Transformation -----
  // Ensure Earth is at its default position and scale.
  const earth = scene.getObjectByName("earth");
  if (earth) {
    // Set Earth’s position using your configuration data.
    earth.position.set(planetData.earth.distance, 0, 0);
    
    // Reset rotation (if needed).
    earth.rotation.set(0, 0, 0);
    
    // Increase Earth's scale (e.g., 10x its default size)
    const scaleFactor = 10; // Adjust this value to make Earth larger
    earth.scale.set(
      planetData.earth.scale * scaleFactor, 
      planetData.earth.scale * scaleFactor, 
      planetData.earth.scale * scaleFactor
    );

    earth.updateMatrixWorld(true);
    console.log("Earth reset and resized:", earth.position, earth.scale);
  } else {
    console.warn("Earth not found in scene.");
  }

  // ----- Set Camera to Default View -----
  // Use planetData.earth.distance for Earth's position.
  const earthPosition = new THREE.Vector3(planetData.earth.distance, 0, 0);
  // These offset values match your initScene defaults.
  camera.position.set(earthPosition.x + 5000, 3000, earthPosition.z + 5000);
  camera.lookAt(earthPosition);
  console.log("Camera set to default view:", camera.position);

  if (controls) {
    controls.target.copy(earthPosition);
    // ----- Set Zoom In/Out Limits -----
    // Set the minimum distance (zoom in limit) and maximum distance (zoom out limit)
    controls.minDistance = 3000;  // Adjust as needed
    controls.maxDistance = 50000; // Adjust as needed
    controls.update();
  }

  // Hide the loading UI.
  if (loadingContainer) {
    loadingContainer.style.display = "none";
  }
}
