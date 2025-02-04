import React, { useState } from 'react';
import { loadOrbitPlanets } from './loadOrbitPlanets.js';
import { loadDefaultPlanets } from './loadDefaultPlanets.js';

export default function ModeToggle({ scene, camera, controls }) {
    const [orbitModeActive, setOrbitModeActive] = useState(false);

    // 🛸 Spaceship Mode (for future use if needed)
    function handleSpaceshipMode() {
        console.log('Spaceship Mode activated!');
        // Add spaceship mode functionality here if needed
    }

    // 🔄 Orbit Mode / Default Mode Toggle
    function handleOrbitModeToggle() {
        if (!orbitModeActive) {
            // 🌌 Switch to Orbit Mode
            setOrbitModeActive(true);
            loadOrbitPlanets(scene, camera, controls);
        } else {
            // 🌍 Switch back to Default Mode
            setOrbitModeActive(false);
            loadDefaultPlanets(scene, camera, controls);
        }
    }

    return (
        <div className="mode-buttons">
            <button
                onClick={handleSpaceshipMode}
                id="toggleSpaceshipMode"
                className="mode-button"
            >
                Spaceship Mode
            </button>
            <button
                onClick={handleOrbitModeToggle}
                id="toggleOrbitMode"
                className="mode-button"
            >
                {orbitModeActive ? 'Original Mode' : 'Orbit Mode'}
            </button>
        </div>
    );
}
