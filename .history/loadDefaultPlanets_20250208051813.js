import { loadPlanets } from "./loadPlanets.js";

export async function loadDefaultPlanets(scene, camera, controls) {
  // Remove Orbit Mode Group if it exists.
  const orbitModeGroup = scene.getObjectByName("orbitModeGroup");
  if (orbitModeGroup) {
    scene.remove(orbitModeGroup);
    console.log("Removed orbit mode group.");
  }

  // Remove any orbit lines from the scene.
  // This assumes that orbit lines are added as THREE.Line objects with names containing "orbit".
  scene.traverse((child) => {
    if (child.type === "Line" && child.name && child.name.includes("orbit")) {
      scene.remove(child);
      console.log(`Removed orbit line: ${child.name}`);
    }
  });

  // Remove all existing planet objects (and the Moon) to prevent duplicates.
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
    const obj = scene.getObjectByName(name);
    if (obj) {
      scene.remove(obj);
      console.log(`Removed ${name} from scene.`);
    }
  });

  // Load the default planets using the logic from loadPlanets.js.
  await loadPlanets(scene);
  console.log("Default planets reloaded.");

  // Focus the camera on Earth rather than the Sun.
  const earth = scene.getObjectByName("earth");
  if (earth) {
    // Clone Earth’s position since the loaded model is positioned based on planetData.
    const earthPosition = earth.position.clone();

    // Make the camera more zoomed out by positioning it further away from Earth.
    // Adjust the offset values as needed to get your desired view.
    camera.position.set(
      earthPosition.x,
      earthPosition.y + 5000,
      earthPosition.z + 8000
    );

    // Have the camera look at Earth's position.
    camera.lookAt(earthPosition);

    // Update OrbitControls to use Earth as the target.
    if (controls) {
      controls.target.copy(earthPosition);
      controls.update();
    }
    console.log("Camera focused on Earth with a zoomed out view.");
  } else {
    console.warn("Earth not found in the scene.");
  }
}
