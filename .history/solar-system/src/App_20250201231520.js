import React from 'react';
import ModeToggle from './ModeToggle';

function App() {
    // Pass scene, camera, and controls as props
    return (
        <div className="App">
            <ModeToggle scene={scene} camera={camera} controls={controls} />
            {/* Other components and content */}
        </div>
    );
}

export default App;
