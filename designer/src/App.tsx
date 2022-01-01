import React from 'react';
import Canvas from './components/Canvas';
import IntroModal from './components/IntroModal';
import Settings from './components/Settings';

function App() {

  return (
    <div className="flex min-h-full p-8 gap-2">
      <IntroModal></IntroModal>
      <Canvas></Canvas>
      <Settings></Settings>
    </div>
  );
}

export default App;
