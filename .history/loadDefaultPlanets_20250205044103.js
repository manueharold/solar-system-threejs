// loadDefaultPlanets.js
import { loadPlanets } from './loadPlanets.js';
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

/**
 * Preloads the default planets (including the Sun) into the scene.
 * The group is set to invisible so that it does not appear until needed.
 */
export function preloadDefaultPlanets(scene) {
  let defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
  if (!defaultPlanetsGroup) {
    defaultPlanetsGroup = new THREE.Group();
    defaultPlanetsGroup.name = "defaultPlanetsGroup";
    scene.add(defaultPlanetsGroup);
    loadPlanets(defaultPlanetsGroup);
    defaultPlanetsGroup.visible = false;
    console.log("Preloaded default planets (hidden).);
  }
}

/**
 * Loads and displays the default planets, ensuring they are visible.
 */
export function loadDefaultPlanets(scene, camera) {
  let defaultPlanetsGroup = scene.getObjectByName("defaultPlanetsGroup");
  if (!defaultPlanetsGroup) {
    defaultPlanetsGroup = new THREE.Group();
    defaultPlanetsGroup.name = "defaultPlanetsGroup";
    scene.add(defaultPlanetsGroup);
    loadPlanets(defaultPlanetsGroup);
    console.log("Loaded default planets into group.");
  }
  
  defaultPlanetsGroup.visible = true;
  console.log("Default planets group is now visible.");

  // Adjust camera to avoid being too close to the Sun
  camera.position.set(50000, 20000, 50000);
  camera.lookAt(0, 0, 0);
}