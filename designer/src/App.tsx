import Canvas from './components/Canvas';
import IntroModal from './components/IntroModal';
import Settings from './components/Settings';
import { poster, PosterContext, SettingsContext } from './util/Context';

function App() {
  const style: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
  }

  return (
    <div className="min-h-full p-2 gap-2" style={style}>

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
