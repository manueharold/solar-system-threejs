import { loadPlanets } from "./loadPlanets.js";

export async function loadDefaultPlanets(scene, camera, controls) {
  // Remove Orbit Mode Group
  const orbitModeGroup = scene.getObjectByName("orbitModeGroup");
  if (orbitModeGroup) {
    scene.remove(orbitModeGroup);
    console.log("Removed orbit mode group.");
  }

  // Remove all existing planets to prevent duplicates
  const planetNames = ["sun", "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"];
  planetNames.forEach(name => {
    const obj = scene.getObjectByName(name);
    if (obj) {
      scene.remove(obj);
      console.log(`Removed ${name} from scene.`);
    }
  });

  // Load default planets using the existing logic from loadPlanets.js
  await loadPlanets(scene);
  console.log("Default planets reloaded.");

  // Animate camera to focus on Earth again
  camera.position.set(0, 1000, 3000);
  camera.lookAt(0, 0, 0);
  if (controls) {
    controls.target.set(0, 0, 0);
    controls.update();
  }
}
