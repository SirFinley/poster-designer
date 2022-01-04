import poster from './class/poster';
import Canvas from './components/Canvas';
import IntroModal from './components/IntroModal';
import Settings from './components/Settings';
import { PosterContext, SettingsContext } from './util/Context';

function App() {

  return (
    <div className="flex min-h-full p-8 gap-2">

      <PosterContext.Provider value={poster}>
        <SettingsContext.Provider value={poster.settings}>
          <IntroModal></IntroModal>
          <Canvas></Canvas>
          <Settings></Settings>
        </SettingsContext.Provider>
      </PosterContext.Provider>
    </div>
  );
}

export default App;
