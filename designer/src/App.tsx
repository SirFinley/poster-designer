import React from 'react';
import Canvas from './components/Canvas';
import Settings from './components/Settings';

function App() {

  return (
    <div className="flex min-h-full p-8 gap-2">
      <Canvas></Canvas>
      <Settings></Settings>
    </div>
  );
}

export default App;
